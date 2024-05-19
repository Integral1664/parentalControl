const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const app = express();
const sharp = require('sharp');

const PORT = 3201;

// Set the ffmpeg path to the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

// Destination folder for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        // Generate a unique identifier for the file name
        const uniqueName = crypto.randomBytes(16).toString('hex') + String(path.extname(file.originalname)).toLowerCase();
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/', 'index.html'));
});


// Route for file upload
app.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFilePath = req.file.path;
    const outputDir = path.join('uploads', 'frames', path.parse(req.file.filename).name);

    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });
;
    // Extract and process frames
    await extractAndProcessFrames(inputFilePath, outputDir, res);

    // Delete the uploaded video after extraction
    fs.unlink(inputFilePath, (err) => {
        if (err) {
            console.error('Failed to delete video file:', inputFilePath);
        } else {
            console.log('Video file deleted:', inputFilePath);
        }
    });

    res.json({ message: 'Processing started, check updates' });
});


const clients = [];
// SSE endpoint
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);

    req.on('close', () => {
        clients.splice(clients.indexOf(res), 1);
    });
});

// Handle upload abortion
app.use((req, res, next) => {
    req.on('aborted', () => {
        console.log('Upload aborted by the client.');
        if (req.file) {
            // Delete the incomplete file
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Failed to delete incomplete file:', req.file.path);
                } else {
                    console.log('Incomplete file deleted:', req.file.path);
                }
            });
        }
    });
    next();
});

// Function to extract frames at 1-second intervals and process them
async function extractAndProcessFrames(inputFilePath, outputDir, res) {
    const duration = await getVideoDuration(inputFilePath);
    for (let seconds = 0; seconds < duration; seconds++) {
        const jpegFramePath = await extractAndProcessFrameAtTime(inputFilePath, outputDir, seconds);
        const result = await handleFrame(jpegFramePath);
        result.duration = Math.ceil(duration);
        result.current = seconds;
        sendUpdateToClients(result);
    }
    fs.rm(outputDir, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error(`Error deleting directory ${outputDir}:`, err.message);
        } else {
            console.log(`Directory ${outputDir} deleted successfully`);
        }
    });

    sendEndToClients();
}
function sendUpdateToClients(data) {
    clients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
}
function sendEndToClients() {
    clients.forEach(client => client.write('event: end\ndata: end\n\n'));
}
// Function to get the duration of the video
function getVideoDuration(inputFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputFilePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration);
            }
        });
    });
}

// Function to extract and process a frame at a specific time point
async function extractAndProcessFrameAtTime(inputFilePath, outputDir, time) {
    const framePath = path.join(outputDir, `frame-${String(time).padStart(4, '0')}.png`);
    await extractFrameAtTime(inputFilePath, framePath, time);
    const jpegFramePath = await convertAndCompressFrame(framePath);
    fs.unlink(framePath, (err) => {
        if (err) {
            console.error('Error deleting intermediate frame:', err.message);
        }
    });
    return jpegFramePath;
}

// Function to extract a frame at a specific time point
function extractFrameAtTime(inputFilePath, framePath, time) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .seekInput(time)
            .outputOptions(['-frames:v 1'])
            .output(framePath)
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                console.error('Error extracting frame:', err.message);
                reject(err);
            })
            .run();
    });
}

// Function to convert frame to JPEG and compress
function convertAndCompressFrame(framePath) {
    return new Promise((resolve, reject) => {
        const jpegFramePath = framePath.replace('.png', '.jpg');
        sharp(framePath)
            .jpeg({ quality: 75 }) // JPEG compression quality
            .toFile(jpegFramePath, (err) => {
                if (err) {
                    console.error('Error converting and compressing frame:', err.message);
                    reject(err);
                } else {
                    resolve(jpegFramePath);
                }
            });
    });
}

// Function to handle the extracted frame
async function handleFrame(framePath) {
    // Perform your processing on the frame here
    // Example: Read the frame and perform some analysis
    // For demonstration, let's just return the frame path
    return { current: framePath.current, duration: framePath.duration, message: 'Frame processed' };
}

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
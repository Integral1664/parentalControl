const http = require('http')
const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const crypto = require('crypto')
const mysql = require('mysql')
const app = express();
// const mimeTypes = {
//     'a'      : 'application/octet-stream',
//     'ai'     : 'application/postscript',
//     'aif'    : 'audio/x-aiff',
//     'aifc'   : 'audio/x-aiff',
//     'aiff'   : 'audio/x-aiff',
//     'au'     : 'audio/basic',
//     'avi'    : 'video/x-msvideo',
//     'bat'    : 'text/plain',
//     'bin'    : 'application/octet-stream',
//     'bmp'    : 'image/x-ms-bmp',
//     'c'      : 'text/plain',
//     'cdf'    : 'application/x-cdf',
//     'csh'    : 'application/x-csh',
//     'css'    : 'text/css',
//     'dll'    : 'application/octet-stream',
//     'doc'    : 'application/msword',
//     'dot'    : 'application/msword',
//     'dvi'    : 'application/x-dvi',
//     'eml'    : 'message/rfc822',
//     'eps'    : 'application/postscript',
//     'etx'    : 'text/x-setext',
//     'exe'    : 'application/octet-stream',
//     'gif'    : 'image/gif',
//     'gtar'   : 'application/x-gtar',
//     'ico'    : 'image/vnd',
//     'h'      : 'text/plain',
//     'hdf'    : 'application/x-hdf',
//     'htm'    : 'text/html',
//     'html'   : 'text/html',
//     'jpe'    : 'image/jpeg',
//     'jpeg'   : 'image/jpeg',
//     'jpg'    : 'image/jpeg',
//     'js'     : 'application/x-javascript',
//     'ksh'    : 'text/plain',
//     'latex'  : 'application/x-latex',
//     'm1v'    : 'video/mpeg',
//     'man'    : 'application/x-troff-man',
//     'me'     : 'application/x-troff-me',
//     'mht'    : 'message/rfc822',
//     'mhtml'  : 'message/rfc822',
//     'mif'    : 'application/x-mif',
//     'mov'    : 'video/quicktime',
//     'movie'  : 'video/x-sgi-movie',
//     'mp2'    : 'audio/mpeg',
//     'mp3'    : 'audio/mpeg',
//     'mp4'    : 'video/mp4',
//     'mpa'    : 'video/mpeg',
//     'mpe'    : 'video/mpeg',
//     'mpeg'   : 'video/mpeg',
//     'mpg'    : 'video/mpeg',
//     'ms'     : 'application/x-troff-ms',
//     'nc'     : 'application/x-netcdf',
//     'nws'    : 'message/rfc822',
//     'o'      : 'application/octet-stream',
//     'obj'    : 'application/octet-stream',
//     'oda'    : 'application/oda',
//     'pbm'    : 'image/x-portable-bitmap',
//     'pdf'    : 'application/pdf',
//     'pfx'    : 'application/x-pkcs12',
//     'pgm'    : 'image/x-portable-graymap',
//     'png'    : 'image/png',
//     'pnm'    : 'image/x-portable-anymap',
//     'pot'    : 'application/vnd.ms-powerpoint',
//     'ppa'    : 'application/vnd.ms-powerpoint',
//     'ppm'    : 'image/x-portable-pixmap',
//     'pps'    : 'application/vnd.ms-powerpoint',
//     'ppt'    : 'application/vnd.ms-powerpoint',
//     'pptx'    : 'application/vnd.ms-powerpoint',
//     'ps'     : 'application/postscript',
//     'pwz'    : 'application/vnd.ms-powerpoint',
//     'py'     : 'text/x-python',
//     'pyc'    : 'application/x-python-code',
//     'pyo'    : 'application/x-python-code',
//     'qt'     : 'video/quicktime',
//     'ra'     : 'audio/x-pn-realaudio',
//     'ram'    : 'application/x-pn-realaudio',
//     'ras'    : 'image/x-cmu-raster',
//     'rdf'    : 'application/xml',
//     'rgb'    : 'image/x-rgb',
//     'roff'   : 'application/x-troff',
//     'rtx'    : 'text/richtext',
//     'sgm'    : 'text/x-sgml',
//     'sgml'   : 'text/x-sgml',
//     'sh'     : 'application/x-sh',
//     'shar'   : 'application/x-shar',
//     'snd'    : 'audio/basic',
//     'so'     : 'application/octet-stream',
//     'src'    : 'application/x-wais-source',
//     'swf'    : 'application/x-shockwave-flash',
//     't'      : 'application/x-troff',
//     'tar'    : 'application/x-tar',
//     'tcl'    : 'application/x-tcl',
//     'tex'    : 'application/x-tex',
//     'texi'   : 'application/x-texinfo',
//     'texinfo': 'application/x-texinfo',
//     'tif'    : 'image/tiff',
//     'tiff'   : 'image/tiff',
//     'tr'     : 'application/x-troff',
//     'tsv'    : 'text/tab-separated-values',
//     'txt'    : 'text/plain',
//     'ustar'  : 'application/x-ustar',
//     'vcf'    : 'text/x-vcard',
//     'wav'    : 'audio/x-wav',
//     'wiz'    : 'application/msword',
//     'webmanifest' : 'application/manifest+json',
//     'wsdl'   : 'application/xml',
//     'xbm'    : 'image/x-xbitmap',
//     'xlb'    : 'application/vnd.ms-excel',
//     'xls'    : 'application/vnd.ms-excel',
//     'xlsx'    : 'application/vnd.ms-excel',
//     'xml'    : 'text/xml',
//     'xpdl'   : 'application/xml',
//     'xpm'    : 'image/x-xpixmap',
//     'xsl'    : 'application/xml',
//     'xwd'    : 'image/x-xwindowdump',
//     'zip'    : 'application/zip'
// }


const PORT = 3201;


// MySQL connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '251281.,weak!', // Replace with your MySQL password
    database: 'videos'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('MySQL connected...');
});
// Destination folder for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        // Generate a unique identifier for the file name
        const uniqueName = crypto.randomBytes(16).toString('hex') + String(path.extname(file.originalname)).toLowerCase();


        let newVideo = { name: uniqueName, originalname: file.originalname, description: 'Unic' }
        let sql = 'INSERT INTO videoinfo SET ?';
        db.query(sql, newVideo, (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).send('Server error');
                return;
            }
        });

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

// Route for uploading videos
app.post('/upload', upload.single('video'), (req, res) => {
    if (req.file) {
        res.json({ message: 'File uploaded successfully', file: req.file });
    } else {
        console.log(req.url)
        res.status(400).json({ error: 'No file uploaded' });
    }
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

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
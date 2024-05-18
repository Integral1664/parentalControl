const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)
    if (classes.length > 0) {
        node.classList.add(...classes);
    }
    node.textContent = content;

    return node
}

function noop() { }

function upload(selector, infoSelector, dropZoneEl, options = {}) {

    let files = [];
    let dropped = false
    const dropZone = document.querySelector(dropZoneEl)
    const onUpload = options.onUpload ?? noop
    const input = document.querySelector(selector)

    const open = element('button', ['classic-btn'], 'Выбрать видео')
    open.disabled = false;
    open.style.display = 'block';

    const clear = element('button', ['classic-btn', 'clear'], 'Очистить')
    clear.disabled = true;
    clear.style.display = 'none';

    const toServer = element('button', ['classic-btn', 'upload'], 'Проверить видео')
    toServer.disabled = true;
    toServer.style.display = 'none';

    const videoInfo = document.querySelector(infoSelector)
    const progressBar = document.getElementById('progressBar')
    const status = document.getElementById('status')

    input.setAttribute('multiple', false)
    if (options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','))
    }


    input.insertAdjacentElement('afterend', open)
    input.insertAdjacentElement('afterend', clear)
    input.insertAdjacentElement('afterend', toServer)

    const triggerInput = () => input.click()

    const changeHandler = e => {
        if (!e.target.files.length) {
            return
        }

        files = Array.from(e.target.files)
        files.forEach(file => {
            if (!file.type.match('video/mp4')) {
                return
            }
            videoInfo.innerHTML = `${file.name} <b>${Math.round(file.size * 10 / 1024 / 1024) / 10}MB</b>`;
            open.disabled = true;
            open.style.display = 'none';
            clear.disabled = false;
            clear.style.display = 'block';
            toServer.disabled = false;
            toServer.style.display = 'block';
        })
    }

    const removeHandler = e => {
        files = [];
        dropped = false;
        videoInfo.innerHTML = 'Для проверки видео (необходим формат MP4) на наличие опасного контента перетащите его сюда или воспользуйтесь кнопкой ниже'
        clear.disabled = true;
        clear.style.display = 'none';
        toServer.disabled = true;
        toServer.style.display = 'none';
        open.disabled = false;
        open.style.display = 'block';
        input.value = '';
        status.classList.remove('abort')
        status.innerText = '';
    }

    const uploadHandler = () => {
        status.classList.remove('abort');
        status.innerText = '';
        progressBar.closest('.progress__container').classList.remove('abort')   
        clear.disabled = true
        clear.style.display = 'none';

        const formData = new FormData();
        formData.append('video', files[0]);

        // Use XMLHttpRequest to monitor upload progress
        const xhr = new XMLHttpRequest();


        xhr.upload.addEventListener('progress', function (event) {
            if (event.lengthComputable) {
                if (progressBar.classList.contains('abort')) {
                    progressBar.classList.remove('abort')
                }
                const percentComplete = (event.loaded / event.total) * 100;
                progressBar.style.width = percentComplete + '%';
                status.innerText = `Загрузка: ${Math.round(percentComplete)}%`;
                toServer.disabled = true;
            }
        });

        xhr.addEventListener('load', function () {
            status.innerText = 'Загрузка завершена!'
            status.classList.remove('abort')
            toServer.disabled = true
        });

        xhr.addEventListener('error', function () {
            progressBar.style.width = 0 + '%';
            progressBar.closest('.progress__container').classList.add('abort')
            status.classList.add('abort');
            status.innerText = 'Ошибка: попробуйте снова';
            clear.disabled = false
            toServer.disabled = false
            clear.style.display = 'block'
        });

        xhr.addEventListener('abort', function () {
            progressBar.style.width = 0 + '%';
            progressBar.closest('.progress__container').classList.add('abort')
            status.classList.add('abort');
            status.innerText = 'Ошибка: попробуйте снова';
            clear.disabled = false
            toServer.disabled = false
            clear.style.display = 'block';
        });

        xhr.open('POST', 'http://localhost:3201/upload');
        xhr.send(formData);

    }

    dropZone.addEventListener("dragenter", function (e) {
        e.preventDefault();
        if (!dropped && e.target.closest(dropZoneEl)) {
            dropZone.classList.add('dropping');
            videoInfo.textContent = 'Перетаскиваем...'
        }

    });

    dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (!dropped && e.target.closest(dropZoneEl)) {
            dropZone.classList.add('dropping');
            videoInfo.textContent = 'Перетаскиваем...'
        }

    });

    document.addEventListener("dragleave", function (e) {
        e.preventDefault();
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('dropping')
            videoInfo.innerHTML = 'Для проверки видео (необходим формат MP4) на наличие опасного контента перетащите его сюда или воспользуйтесь кнопкой ниже'
        }
    });

    dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        if (!dropped) {
            dropZone.classList.remove('dropping');
            if (!e.dataTransfer.files.length) {
                return
            }

            files = Array.from(e.dataTransfer.files);

            files.forEach(file => {
                if (!file.type.match('video/mp4')) {
                    return
                }
                dropped = true;
                videoInfo.innerHTML = `${file.name} <b>${Math.round(file.size * 10 / 1024 / 1024) / 10}MB</b>`;
                open.disabled = true;
                open.style.display = 'none';
                clear.disabled = false;
                clear.style.display = 'block';
                toServer.disabled = false;
                toServer.style.display = 'block';
            })
        }
        return
    });

    open.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    clear.addEventListener('click', removeHandler)
    toServer.addEventListener('click', uploadHandler)
    document.querySelector('#main-form').addEventListener('submit', (e) => e.preventDefault());
}
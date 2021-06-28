var dropRegion = document.getElementById("drop-region"),
    imagePreviewRegion = document.getElementById("image-preview");

var fakeInput = document.createElement("input");
fakeInput.type = "file";
fakeInput.accept = "image/*";
fakeInput.multiple = true;
dropRegion.addEventListener('click', function() {
    fakeInput.click();
});
fakeInput.addEventListener("change", function() {
    var files = fakeInput.files;
    handleFiles(files);
});

function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}
dropRegion.addEventListener('dragenter', preventDefault, false)
dropRegion.addEventListener('dragleave', preventDefault, false)
dropRegion.addEventListener('dragover', preventDefault, false)
dropRegion.addEventListener('drop', preventDefault, false)

function handleDrop(e) {
    var dt = e.dataTransfer,
        files = dt.files;
    if (files.length) {
        handleFiles(files);
    } else {
        var html = dt.getData('text/html'),
            match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html),
            url = match && match[1];
        if (url) {
            uploadImageFromURL(url);
            return;
        }
    }

    function uploadImageFromURL(url) {
        var img = new Image;
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");
        img.onload = function() {
            c.width = this.naturalWidth;
            c.height = this.naturalHeight;
            ctx.drawImage(this, 0, 0);
            c.toBlob(function(blob) {
                handleFiles( [blob] );
            }, "image/png");
        };
        img.onerror = function() {
            alert("Ошибка загрузки");
        }
        img.crossOrigin = "";
        img.src = url;
    }
}
dropRegion.addEventListener('drop', handleDrop, false);

function handleFiles(files) {
    for (var i = 0, len = files.length; i < len; i++) {
        if (validateImage(files[i]))
            if (i > 0) {
                alert("Максимум 1 файл");
                return false;}
            previewAnduploadImage(files[i]);

    }
}
function validateImage(image) {
    var validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (validTypes.indexOf( image.type ) === -1) {
        alert("Неверный формат файла");
        return false;
    }

    var maxSizeInBytes = 10e6; // 10MB
    if (image.size > maxSizeInBytes) {
        alert("Файл больше 10мб");
        return false;
    }
    return true;
}

function previewAnduploadImage(image) {

    var imgView = document.createElement("div");
    imgView.className = "image-view";
    imagePreviewRegion.appendChild(imgView);

    var img = document.createElement("img");
    imgView.appendChild(img);

    var overlay = document.createElement("div");
    overlay.className = "overlay";
    imgView.appendChild(overlay);


    var overlay2 = document.createElement("div");
    overlay2.className = "overlay2";
    overlay2.innerHTML = '<p>Загружено</p>';
    imgView.appendChild(overlay2);



    var reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    }
    reader.readAsDataURL(image);

    var formData = new FormData();
    formData.append('files[]', image);


    // upload the image to api

    var uploadLocation = 'http://127.0.0.1/upload';

    var ajax = new XMLHttpRequest();
    ajax.open("POST", uploadLocation, true);

    ajax.onreadystatechange = function(e) {
        if (ajax.readyState === 4) {
            if (ajax.status === 201) {
            } else {
            }
        }
    }

    ajax.upload.onprogress = function(e) {

        var perc = (e.loaded / e.total * 100) || 100,
            width = 100 - perc;
        overlay.style.width = width;

        if (width === 0) {overlay2.style.opacity = 1;}
    }
    ajax.send(formData);
}
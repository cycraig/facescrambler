let imgElement = document.getElementById('srcImage')
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener("change", (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
let faceCascade;
let lastImage;
let beerSlider;
let indexArr;
let n = 4;

function opencvIsReady() {
  initialise()
}

function initialise() {
    // Load the OpenCV face detector model
    faceCascade = new cv.CascadeClassifier();
    eyeCascade = new cv.CascadeClassifier();
    let utils = new Utils('errorMessage');
    let faceCascadeFile = 'data/haarcascade_frontalface_default.xml'// https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml
    let eyeCascadeFile = 'data/haarcascade_eye_tree_eyeglasses.xml'// https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_eye_tree_eyeglasses.xml
    utils.createFileFromUrl('haarcascade_frontalface_default.xml', faceCascadeFile, () => {
        let result1 = faceCascade.load('haarcascade_frontalface_default.xml');
        console.log(result1);
        document.getElementById('status').innerHTML = 'OpenCV.js (WebAssembly) is ready.'
        imgElement.onload = processImage;
        beerSlider = new BeerSlider(document.getElementById('slider'));
        
        // create shuffle array
        indexArr = new Array(n*n);
        for(let l = 0; l < indexArr.length; l++){
          indexArr[l] = l;
        }
        
        // process initial image
        processImage()
        
        enable();
    });
}

function disable() {
    inputElement.setAttribute("disabled", "true")
    document.getElementById('submit').setAttribute("disabled", "true")
    document.getElementById('scramble').setAttribute("disabled", "true")
}

function enable() {
    inputElement.removeAttribute("disabled")
    document.getElementById('submit').removeAttribute("disabled")
    document.getElementById('scramble').removeAttribute("disabled")
}

function processImage() {
    disable();
    let src = cv.imread(imgElement);
    cv.imshow('outputCanvas', src);
    let dst = new cv.Mat();
    src.copyTo(dst);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    let faces = new cv.RectVector();
    let eyes = new cv.RectVector();
    let minSize = new cv.Size(80,80)
    
    // Detect face/s
    faceCascade.detectMultiScale(gray, faces, 1.1, 7, 0, minSize);
    for (let i = 0; i < faces.size(); ++i) {
        let roiGray = gray.roi(faces.get(i));
        let roiSrc = src.roi(faces.get(i));
        //let pointTopLeft = new cv.Point(faces.get(i).x, faces.get(i).y);
        //let pointBotRight = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);
        //cv.rectangle(src, pointTopLeft, pointBotRight, [255, 0, 0, 255]);
        
        // Scramble the detected face ROI
        shuffleFisherYates(indexArr, false);
        let s = Math.min(faces.get(i).width, faces.get(i).height)
        let reg = new cv.Rect(faces.get(i).x, faces.get(i).y, s, s)
        let ss = Math.floor(s / n)
        let subroi = src.roi(reg)
        for(let j = 0; j < n; j++) {
            for(let k = 0; k < n; k++) {
                let subreg = new cv.Rect(ss*j, ss*k, ss, ss)
                y = Math.floor(indexArr[j*n+k] / n)
                x = indexArr[j*n+k]%n
                let dstreg = new cv.Rect(faces.get(i).x+ss*x, faces.get(i).y+ss*y, ss, ss)
                subroi.roi(subreg).copyTo(dst.roi(dstreg))
            }
        }
        roiGray.delete(); roiSrc.delete();
    }
    cv.imshow('outputCanvas', dst);
    
    
    var canvas = document.getElementById('outputCanvas');
    canvas.style.width = "auto";  // otherwise it gets a set width that persists between images

    resetSlider();
    
    src.delete(); gray.delete(); dst.delete(); faces.delete(); eyes.delete();
    enable();
}

function resetSlider() {
    // reset the image comparison slider position to the end
    const beerRange = document.getElementsByClassName('beer-range')[0]
    if(beerRange.value != 100) {
        beerRange.value = 100
        beerSlider.move()
    }
}

function shuffleFisherYates(arr) {
    var j, x, i;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
}

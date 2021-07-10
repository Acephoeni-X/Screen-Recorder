let videoElem = document.querySelector("#video");
let videoDwn = document.getElementById("video-dwn");
let startButton = document.getElementById("start");
let stopButton = document.querySelector("#stop");
let downloadButton = document.querySelector("#download");
let sometext = document.querySelector("#sometext");

function log(msg) {
    sometext.innerHTML += msg + "\n";
}

function startRecording(stream, lengthInMS) {
    let recorder = new MediaRecorder(stream);
    let data = [];
  
    recorder.ondataavailable = event => data.push(event.data);
    recorder.start();
    log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
  
    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = event => reject(event.name);
    });
  
    let recorded = () => recorder.state == "recording" && recorder.stop();
  
    return Promise.all([
      stopped,
      recorded
    ])
    .then(() => data);
}

function stop(stream) {
    stream.getTracks().forEach(track => track.stop());
}

if(startButton){
    startButton.onclick = () => {
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    }).then(stream => {
      videoElem.srcObject = stream;
      downloadButton.href = stream;
      videoElem.captureStream = videoElem.captureStream || videoElem.mozCaptureStream;
      return new Promise(resolve => videoElem.onplaying = resolve);
    }).then(() => startRecording(videoElem.captureStream(), recordingTimeMS))
    .then (recordedChunks => {
      let recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
      videoDwn.src = URL.createObjectURL(recordedBlob);
      downloadButton.href = videoDwn.src;
      downloadButton.download = "RecordedVideo.mp4";
  
      log("Successfully recorded " + recordedBlob.size + " bytes of " +
          recordedBlob.type + " media.");
    })
    .catch(log);
  }
}

if(stopButton){
      stopButton.onclick = () => {
        stop(videoElem.srcObject);
  }
}
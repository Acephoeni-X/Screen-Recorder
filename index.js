class screenRecorder{
    constructor(){
        this.videoElem = document.querySelector("#video");
        this.videoDwn = document.getElementById("video-dwn");
        this.startButton = document.getElementById("start");
        this.stopButton = document.querySelector("#stop");
        this.downloadButton = document.querySelector("#download");       

    function log(msg){
        let sometext = document.querySelector("#sometext");
        if (typeof msg == 'undefined'){
            sometext.innerHTML = ""
        }
        else{sometext.innerHTML = "<span style='color: #54f780;'>Status: </span>" + msg;}
    }

    async function startRecording(stream){
        let recorder = new MediaRecorder(stream);
        let data = [];

        recorder.ondataavailable = event => data.push(event.data);
        recorder.start();
        log(recorder.state);

        let stopped = new Promise((resolve, reject)=>{
            recorder.onstop = resolve;
            recorder.onerror = event => reject(event.name);
        });

        let recorded = () => recorder.state == "recording" && recorder.stop();

        return Promise.all([ stopped, recorded]).then(()=>data);
    }

    async function stop(stream){
        stream.getTracks().forEach(track=>track.stop());
    }

    this.startButton.onclick = () => navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        }).then(stream => {
            this.videoElem.srcObject = stream;
            this.downloadButton.href = stream;
            this.videoElem.captureStream = this.videoElem.captureStream || this.videoElem.mozCaptureStream;
            return new Promise(resolve => this.videoElem.onplaying = resolve);
        }).then(() => startRecording(this.videoElem.captureStream()))
        .then(recordedChunks => {
            this.recordedBlob = new Blob(recordedChunks, {type:"video/mp4"});
            this.videoDwn.src = URL.createObjectURL(this.recordedBlob);
            this.downloadButton.href = this.videoDwn.src;
            this.downloadButton.download = "RecordedVideo.mp4";
            let kilobyte = this.recordedBlob.size/1000;
            let mb = (kilobyte / 1024).toFixed(2);
            log("Successfully Recorded "+ mb + " mb of " + this.recordedBlob.type + " media.");
        }).catch(log());
      

    this.stopButton.onclick = () =>{
            stop(this.videoElem.srcObject);
        }
    }
}

let r = new screenRecorder();


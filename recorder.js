const { ipcRenderer } = require("electron");
var fs = require("fs");

var videoElement = document.querySelector("video");
var listElement = document.querySelector("ul");
var outputElement = document.querySelector("#output");

const desktopCapturer = {
  getSources: (opts) =>
    ipcRenderer.invoke("DESKTOP_CAPTURER_GET_SOURCES", opts),
};

var Rec = {
  recorder: null,
  blobs: [],

  start() {
    if (this.recorder === null && ScreenManager.selectedSource) {
      outputElement.innerHTML = "Recording";
      var video = navigator.webkitGetUserMedia(
        {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: ScreenManager.selectedSource.id,
              minWidth: 800,
              maxWidth: 1280,
              minHeight: 600,
              maxHeight: 720,
            },
          },
        },
        this.handleStream(video),
        this.handleUserMediaError
      );
    }
  },

  stop() {
    if (Rec.recorder.state !== null) {
      Rec.recorder.onstop = function () {
        videoElement.src = "";
        Rec.toArrayBuffer(
          new Blob(Rec.blobs, { type: "video/webm" }),
          function (arrayBuffer) {
            var buffer = Rec.toBuffer(arrayBuffer);
            var fileName = "./my-video.webm";
            fs.writeFile(fileName, buffer, function (err) {
              if (err) {
                outputElement.innerHTML = "ERROR";
              } else {
                outputElement.innerHTML = "Saved Video: " + fileName;
                videoElement.src = fileName;
                video.play();
                videoElement.controls = true;
              }
            });
          }
        );
        Rec.recorder = null;
      };

      Rec.recorder.stop();
    }
  },

  handleStream(stream) {
    Rec.recorder = new MediaRecorder(stream);
    Rec.blobs = [];
    videoElement.poster = "";
    videoElement.src = URL.createObjectURL(stream);
    Rec.recorder.ondataavailable = function (event) {
      Rec.blobs.push(event.data);
    };
    Rec.recorder.start();
  },
  handleUserMediaError(e) {
    console.log("handleUserMediaError", e);
  },

  toArrayBuffer(blob, callback) {
    let fileReader = new FileReader();
    fileReader.onload = function () {
      let arrayBuffer = this.result;
      callback(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(blob);
  },

  toBuffer(arrayBuffer) {
    let buffer = new Buffer.from(arrayBuffer.byteLength);
    let array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < array.byteLength; i++) {
      buffer[i] = array[i];
    }

    return buffer;
  },
};

var ScreenManager = {
  sources: [],
  selectedSource: null,

  listScreens() {
    desktopCapturer
      .getSources({ types: ["window", "screen"] })
      .then(async (sources, error) => {
        var template = "";
        ScreenManager.sources = sources;
        sources.forEach((source) => {
          template += `<li onclick="ScreenManager.setScreen('${source.id}')" >
								<img src="${source.thumbnail.toDataURL()}" />
								<h3>${source.name}</h3>
							</li>`;
        });
        listElement.innerHTML = template;
      });
  },

  setScreen(sourceId) {
    this.selectedSource = this.sources.find((source) => source.id === sourceId);
    videoElement.poster = this.selectedSource.thumbnail.toDataURL();
    videoElement.src = "";
    videoElement.controls = false;
  },
};
ScreenManager.listScreens();

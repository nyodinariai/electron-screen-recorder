const { ipcRenderer } = require("electron");
console.log("Are you here");

var videoElement = document.querySelector("video");
var listElement = document.querySelector("ul");
var outputElement = document.querySelector("#output");

const desktopCapturer = {
  getSources: (opts) =>
    ipcRenderer.invoke("DESKTOP_CAPTURER_GET_SOURCES", opts),
};

console.log(desktopCapturer.getSources({ types: ["window", "screen"] }));

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

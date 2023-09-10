const { createContent } = require("../createContent");
const currentWeather = require("../currentWeather");
const fs = require("fs");

let currentRundownIndex = 0;

let playlist = [
  {
    title: "Sweet Child O Mine",
    artist: "Guns N Roses",
    album: "test",
    duration: 356,
  },
  {
    title: "Welcome to the Jungle",
    artist: "Guns N Roses",
    album: "test",
    duration: 275,
  },
  {
    title: "Paradise City",
    artist: "Guns N Roses",
    album: "test",
    duration: 408,
  },
  { title: "Patience", artist: "Guns N Roses", album: "test", duration: 409 },
  {
    title: "November Rain",
    artist: "Guns N Roses",
    album: "test",
    duration: 537,
  },
  { title: "Don't Cry", artist: "Guns N Roses", album: "test", duration: 284 },
];

let previousRundown = null;
let nextElement = null;

async function next(showWithSongs) {
  if (currentRundownIndex >= showWithSongs.rundown.length) {
    console.log("End of rundown reached. Starting over...");
    currentRundownIndex = 0;
  }

  const content = await getContent(showWithSongs);

  // if (showWithSongs.rundown[currentRundownIndex].type !== "song") {
  //   currentRundownIndex += 2;

  return content;
}

function reset() {
  currentRundownIndex = 0;
}
// {curTrack: {uri: 'spotify:track:2SiXAy7TuUkycRVbbWDEpo', name: 'You Shook Me All Night Long', artist: 'AC/DC'}
// nextTrack: {uri: 'spotify:track:6QnVsqsS9W3E7HIc28vxpL', name: 'Feels Like the First Time', artist: 'Foreigner'}}
//addPlaylistToRundown]

function addPlaylistToRundown(playlist) {
  let show = createDefaultShow();
  if (currentRundownIndex >= show.rundown.length - 1) {
    reset();
  }
  let songsPopulated = 0;

  for (let i = currentRundownIndex; i < show.rundown.length; i++) {
    if (show.rundown[i].type === "song" && songsPopulated === 0) {
      show.rundown[i].songName = playlist.curTrack.name;
      show.rundown[i].bandName = playlist.curTrack.artist;
      songsPopulated++;
    } else if (show.rundown[i].type === "song" && songsPopulated === 1) {
      show.rundown[i].songName = playlist.nextTrack.name;
      show.rundown[i].bandName = playlist.nextTrack.artist;
      songsPopulated++;
    }

    if (songsPopulated === 2) {
      break; // Both songs have been populated
    }
  }

  return show;
}

function createDefaultShow() {
  return {
    radioStation: "WYOU",
    showName: "Rock Retrospectives with DJ Spike",
    date: "2023-09-01",
    timeSlot: "7:00 AM - 8:00 AM",
    rundown: [
      // {
      //   type: "song",
      //   songName: null,
      //   bandName: null,
      //   albumName: null,
      //   duration: null,
      // },
      // {
      //   type: "song",
      //   songName: null,
      //   bandName: null,
      //   albumName: null,
      //   duration: null,
      // },
      // {
      //   type: "song",
      //   songName: null,
      //   bandName: null,
      //   albumName: null,
      //   duration: null,
      // },
      // { type: "weather" },
      // {
      //   type: "song",
      //   songName: null,
      //   bandName: null,
      //   albumName: null,
      //   duration: null,
      // },
      {
        type: "song",
        songName: null,
        bandName: null,
        albumName: null,
        duration: null,
      },
      {
        type: "song",
        songName: null,
        bandName: null,
        albumName: null,
        duration: null,
      },
    ],
  };
}

async function convertMP3FileToDataURI(filePath) {
  try {
    const mp3Data = await fs.promises.readFile(filePath);
    const base64Data = mp3Data.toString("base64");
    const dataURI = `data:audio/mpeg;base64, ${base64Data}`;
    // console.log("Data URI:", dataURI);
    return dataURI;
  } catch (error) {
    console.error("Error:", error.message);
  }
}
async function getContent(showWithSongs) {
  if (showWithSongs.rundown[currentRundownIndex + 1]) {
    console.log(
      "rundown :",
      showWithSongs.rundown,
      "currentRundownIndex:",
      currentRundownIndex,
      "type:",
      showWithSongs.rundown[currentRundownIndex].type
    );
    let weatherSong = "";

    //IF THE CURRENT Rundown INDEX IS A SONG, THEN set nextElement to the next element in the rundown and increment the currentRundownIndex of the rundown by 1. Then check if the segment after next is a weather segment. If it is, then set weatherSong to the song after the weather segment.

    //ELSE IF THE CURRENT Rundown INDEX IS A SONG, THEN set nextElement to the next element in the rundown and increment the currentRundownIndex of the rundown by 2 to reach the element after next because the weather segment will queue up the song after. Then increment the currentRundownIndex of the rundown by 2.

    if (showWithSongs.rundown[currentRundownIndex].type === "song") {
      nextElement = showWithSongs.rundown[currentRundownIndex + 1];
      if (showWithSongs.rundown[currentRundownIndex + 1].type === "weather") {
        weatherSong = showWithSongs.rundown[currentRundownIndex + 2];
      }
      if (currentRundownIndex >= showWithSongs.rundown.length) {
        currentRundownIndex = 0;
      } else {
        currentRundownIndex++;
      }
    } else {
      nextElement = showWithSongs.rundown[currentRundownIndex + 2];
      if (currentRundownIndex >= showWithSongs.rundown.length) {
        currentRundownIndex = 0;
      } else {
        currentRundownIndex = currentRundownIndex + 2;
      }
    }

    if (!previousRundown || previousRundown) {
      if (nextElement.type === "weather") {
        let weatherReport = await currentWeather();
        let fileName = await createContent(
          null,
          null,
          null,
          null,
          null,
          null,
          `Summarize this weather, be brief. Weather: ${weatherReport}. End the weather report by announcing this song by ${weatherSong.bandName} called ${weatherSong.songName}. Be very brief.`
        );
        let audioURI = await convertMP3FileToDataURI(fileName);
        return audioURI;
      } else if (
        nextElement.type === undefined ||
        nextElement.type === "song"
      ) {
        console.log(nextElement.songName);
        let fileName = await createContent(
          showWithSongs.radioStation,
          showWithSongs.showName,
          nextElement.songName,
          nextElement.bandName,
          showWithSongs.date,
          showWithSongs.timeSlot
        );
        let audioURI = await convertMP3FileToDataURI(fileName);
        return audioURI;
      } else if (nextElement.type === "talk_show") {
        // this.content = createTalk();
        return null;
      } else if (nextElement.type === "news") {
        // this.content = createNews();
        return null;
      } else {
        console.warn(`Invalid content type: ${element.type}`);
        return null;
      }
    }
  }
  return null;
}

module.exports = {
  next,
  reset,
  addPlaylistToRundown,
};

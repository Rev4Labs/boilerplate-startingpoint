const {
  addPlaylistToRundown,
} = require("./rundownUtlities/addPlaylistToRundown");
const {
  getCurrentRundownIndex,
  updateCurrentRundownIndex,
} = require("./rundownUtlities/rundownIndex");
const { saveToDb, reset } = require("../rundown/rundownUtlities/dbUtilities");

const { convertFileToDataURI } = require("../utl/convertMP3FileToDataURI");
const { createContent } = require("../createContent");

async function showRunner(
  userEmail,
  jamSessionId,
  display_name,
  djId,
  station
) {
  let content = {};
  let { show, nextTrackURI, tempSongName, tempBandName } =
    await addPlaylistToRundown(userEmail, jamSessionId);
  const currentRundownIndex = await getCurrentRundownIndex(userEmail);

  if (show.rundown[currentRundownIndex + 1].type === "song") {
    let nextElement = show.rundown[currentRundownIndex + 1];

    await updateCurrentRundownIndex(userEmail, currentRundownIndex + 1);

    content = await createContent(
      show.radioStation,
      show.showName,
      nextElement.songName,
      nextElement.bandName,
      show.date,
      show.timeSlot,
      display_name,
      djId,
      station,
      show.rundown[currentRundownIndex + 1].type
    );

    let audioURI = await convertFileToDataURI(content.fileName, "mp3");

    //  saves the next track dj auido and transcript to the database
    await saveToDb(
      jamSessionId,
      currentRundownIndex + 1,
      nextTrackURI,
      tempSongName,
      tempBandName,
      content.audioURI,
      content.transcript
    );

    return audioURI;
  } else if (show.rundown[currentRundownIndex + 1].type === "weather") {
    let songAfterWeather = show.rundown[currentRundownIndex + 2];

    await updateCurrentRundownIndex(userEmail, currentRundownIndex + 2);

    content = await createContent(
      null,
      null,
      null,
      null,
      null,
      null,
      display_name,
      djId,
      station,
      show.rundown[currentRundownIndex + 1].type,
      songAfterWeather
    );

    let audioURI = await convertFileToDataURI(content.fileName, "mp3");

    await saveToDb(
      jamSessionId,
      currentRundownIndex + 2,
      nextTrackURI,
      tempSongName,
      tempBandName,
      content.audioURI,
      content.transcript
    );

    return audioURI;
  } else if (show.rundown[currentRundownIndex + 1].type === "talkShow") {
    let songAfterTalkShow = show.rundown[currentRundownIndex + 2];

    await updateCurrentRundownIndex(userEmail, currentRundownIndex + 2);

    // let talkShow = await currentWeather();
    content = await createContent(
      show.radioStation,
      show.showName,
      null,
      null,
      show.date,
      show.timeSlot,
      display_name,
      djId,
      station,
      show.rundown[currentRundownIndex + 1].type,
      songAfterTalkShow
    );

    let audioURI = await convertFileToDataURI(content.fileName, "mp3");

    await saveToDb(
      jamSessionId,
      currentRundownIndex + 2,
      nextTrackURI,
      tempSongName,
      tempBandName,
      content.audioURI,
      content.transcript
    );

    return audioURI;
  }
}

module.exports = { showRunner };

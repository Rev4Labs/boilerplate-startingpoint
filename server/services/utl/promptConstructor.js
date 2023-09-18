const { getRandomElement } = require("../utl/randomElement");
const {
  constructPromptListWithCounts,
} = require("../utl/promptListConstructor");

async function songPrompts(
  radioStation,
  showName,
  songName,
  bandName,
  date,
  timeSlot,
  name,
  djId,
  station
) {
  const details = {
    radioStation,
    showName,
    songName,
    bandName,
    date,
    timeSlot,
    name,
    djId,
    station,
  };

  function createPromptsArray(promptListWithCounts) {
    let promptsArray = [];
    for (const type in promptListWithCounts) {
      for (let i = 0; i < promptListWithCounts[type].frequency; i++) {
        promptsArray.push(promptListWithCounts[type].prompt);
      }
    }
    return promptsArray;
  }

  const promptListWithCounts = await constructPromptListWithCounts(details);

  const resultArray = createPromptsArray(promptListWithCounts);
  console.log(resultArray);

  return getRandomElement(resultArray);
}

async function talkShowPrompts(
  radioStation,
  showName,
  songName,
  bandName,
  date,
  timeSlot,
  name,
  djId,
  station
) {
  const details = {
    radioStation,
    showName,
    songName,
    bandName,
    date,
    timeSlot,
    name,
    djId,
    station,
  };

  return `Create a script that depicts an interview between a radio show DJ and the band Promotor for ${bandName}. Structure the dialogue as a JavaScript object with keys "DJ" and "Promotor", each containing an array of dialogues in the order they are spoken. The conversation should touch upon the band's early work, influences, and upcoming projects. At the end of the interview, have the DJ thank the artist for the interview and queue up the song ${songName} as the next song to play.`;
}

module.exports = { songPrompts, talkShowPrompts };

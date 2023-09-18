const { fetchSpeech } = require("./audioService");
const { ConversationChain } = require("langchain/chains");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} = require("langchain/prompts");
const { BufferMemory } = require("langchain/memory");
const { songPrompts, talkShowPrompts } = require("./utl/promptConstructor");
const { djCharacters } = require("./djCharacters");
const currentWeather = require("../services/currentWeather");

async function createContent(
  radioStation,
  showName,
  songName,
  bandName,
  date,
  timeSlot,
  name,
  djId,
  station,
  type,
  songAfterWeather
) {
  try {
    const { details } = await djCharacters(djId);
    const { voiceID } = details;

    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4",
      temperature: 1,
    });

    const template = `The following is a transcript of everything said by you, a disk jockey. The Human is prompting you on what to say and how.`;

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(template),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);
    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
    });

    //////////////////////////////////////////////////////////////////////////////
    const chatPromptTalkShow = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(template),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);
    const memoryTalkShow = new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
    });

    const talkShowChain = new ConversationChain({
      memory: memoryTalkShow,
      prompt: chatPromptTalkShow,
      llm: chat,
      verbose: true,
    });

    ///////////////////////////////////////////////////////////////////////////////
    const chain = new ConversationChain({
      memory: memory,
      prompt: chatPrompt,
      llm: chat,
      verbose: true,
    });

    const debugTracker = [];

    //TODO: Need to set this up to create Weather, News, etc. Also need to construct chat history.

    debugTracker.push({ memory: await memory.chatHistory.getMessages() });
    let result;
    let weatherReport = await currentWeather();
    if (type === "weather") {
      result = await chain.call({
        input: `Summarize this weather, be brief. Weather: ${weatherReport}. End the weather report by announcing this song by ${songAfterWeather.bandName} called ${songAfterWeather.songName}. Be very brief.`,
      });
    } else if (type === "talkShow") {
      //TODO: NEEDS TO TAKE IN SOME DATA STRUCTURE OF THE DIALOGUE AND SEPERATE THE VOICE AUDIO CREATION BY SEGMENT AND SPEAKER. ALSO NEEDS TO RETURN ONE AUDIO THAT COMBINES THE ALTERNATING DIAGLOGUE.
      let input = await talkShowPrompts(
        radioStation,
        showName,
        songName,
        bandName,
        date,
        timeSlot,
        name,
        djId,
        station
      );
      result = await chain.call({
        input: input,
      });
    } else {
      let input = await songPrompts(
        radioStation,
        showName,
        songName,
        bandName,
        date,
        timeSlot,
        name,
        djId,
        station
      );
      result = await talkShowChain.call({
        input: input,
      });
      console.log(result);
    }

    //TODO: The result will need to call fetchSpeech for each array item for two voice IDs. The the results will need to be merged into a single audio file. Would there be a way to overlap the audio as though it was a real conversaion?

    const timestamp = Date.now();

    const response = await fetchSpeech(
      voiceID,
      result.response,
      `${songName}_${bandName}_${timestamp}`
    );
    if (response === "error") {
      console.log(response);
      return;
    } else return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { createContent };

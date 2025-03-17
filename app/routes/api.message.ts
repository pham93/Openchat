import { ActionFunction } from "@remix-run/node";
import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechSynthesisOutputFormat,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { config } from "~/utils/config";
import logger from "~/utils/logger";
import { readFileSync } from "node:fs";
import { ILipSync } from "~/types/chat.type";
import { sendChatMessage } from "~/services/chat.service";

export const action: ActionFunction = async ({ request }) => {
  logger.info("Requesting message");
  const messages = await request.json();

  const response = await sendChatMessage({
    messages,
  });

  messages.push({
    content: response.choices[0].message.content,
    role: response.choices[0].message.role,
  });

  const { audio, lipsync } = await generateSpeech(
    response.choices[0].message.content ?? "[]"
  );

  const ret = {
    history: messages,
    audio,
    lipsync,
  };

  return new Response(JSON.stringify(ret), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

function parseMessage(messageStr: string) {
  let messages = [];
  try {
    messages = JSON.parse(messageStr);
  } catch (e) {
    logger.error(`Failed to parse ${messageStr} ${e}`);
    messages = [];
  }

  let emotionStr = "";
  for (const message of messages) {
    emotionStr += `<emotion type="${message.emotion}">${message.message}</emotion>`;
  }

  return `
    <speak xml:lang="en-US" version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
      <voice name="en-US-SaraNeural">
          ${emotionStr}
      </voice>
  </speak>
  `;
}

async function generateSpeech(messages: string) {
  const text = parseMessage(messages);

  const speechConfig = SpeechConfig.fromSubscription(
    config.SPEECH_API,
    config.AZURE_REGION
  );
  speechConfig.speechSynthesisOutputFormat =
    SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;

  const audioConfig = AudioConfig.fromAudioFileOutput("data/temp.mp3");

  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

  const lipsync: ILipSync = {
    metadata: {
      duration: 0,
      soundFile: "",
    },
    mouthCues: [],
  };

  return new Promise<{ lipsync: ILipSync; audio: string }>((res, rej) => {
    let start = 0;
    synthesizer.visemeReceived = (_, event) => {
      const offset = event.audioOffset / 10_000_000;
      lipsync.mouthCues.push({
        start,
        end: offset,
        value: `${event.visemeId}`,
        animation: event.animation,
      });
      start = offset;
    };
    synthesizer.speakSsmlAsync(text, (result) => {
      if (result.reason === ResultReason.SynthesizingAudioCompleted) {
        lipsync.metadata.duration = result.audioDuration / 10_000_000;
      }
    });

    synthesizer.synthesisCompleted = (sender, { result }) => {
      if (result.reason === ResultReason.SynthesizingAudioCompleted) {
        res({
          lipsync,
          audio: `data:audio/mp3;base64,${convertMp3ToBase64()}`,
        });
      } else {
        rej(`Failed to synthesize ${result.errorDetails}`);
      }
    };
  });
}

function convertMp3ToBase64() {
  return readFileSync("data/temp.mp3").toString("base64");
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as fs from 'fs/promises';
import path from 'node:path';
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri
} from '@google/genai';
import { getLanguageByCode } from './agent.constants.js';
import { StorageService } from '../storage/storage.service.js';
import { GoogleGenerativeAI, } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { getWhisperOutputFormat } from '../../commans/constants/outputType.constatns.js';

@Injectable()
export class AgentService {

  private readonly ai: GoogleGenAI;
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINAI_API_KEY,
    });
  }

  async TranslateTranscribtionFile(
    subtitleLocalPath: string,
    targetLanguage: string,
    workDir: string,
  ): Promise<{
    localPath: string;
    filename: string;
  }> {
    const filedata = await fs.readFile(subtitleLocalPath, 'utf-8');

    const languageCode = getLanguageByCode(targetLanguage || 'en');

    const prompt = `
    Translate current given "Target_FileData" data , analys that data , and translate it into the "Target_Language" language.

    Rule:-
    1.the timing of data should match to original data 
    2.give output fomrate striclty followed as input formate
    3.do not change the timing of data
    4.translation must be meaning full and not rendom
    5.maintain tone as original formate given
    6.genrated charecter of words must not be random and must be presise
    7.given lenguage code must be follow and translated to that lenguage 
    8.the charecter of target lenguage must be correct and not random
    9.in lenguages like hindi and other , do not use pure lenguage , keep lenguage modest

    files:-
    Target_Language: ${languageCode}
    Target_FileData: ${filedata}`;

    const TranslationResult = await this.AgentEngine(prompt);

    if (!TranslationResult) {
      throw new Error('Agent did not return any translation.');
    }

    const extension = path.extname(subtitleLocalPath) || '.srt';
    const baseName = path.basename(subtitleLocalPath, extension);
    const languageSuffix = (targetLanguage || 'en').replace(/[^a-zA-Z0-9-_]/g, '-');
    const translatedFilename = `${baseName}-${languageSuffix}-${Date.now()}${extension}`;
    const translatedPath = path.join(workDir, translatedFilename);

    await fs.writeFile(translatedPath, TranslationResult, 'utf-8');

    return {
      localPath: translatedPath,
      filename: translatedFilename,
    };
  }


  async AgentEngine(input: string) {

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINAI_API_KEY || '',
    })

    try {

      const result = await ai.interactions.create({
        model: 'gemini-3.5-flash-lite',
        input: input
      })
      return result.output_text
    } catch (error) {
      console.error('Error processing input with GoogleGenAI:', error);
      throw new Error(`Failed to process the input with GoogleGenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }



  }


  async transcriptAudioGemini(
    audioPath: string,
    videoId: string,
    options: any,
    workDir: string,
  ): Promise<{
    localPath: string;
    filename: string;
    mimeType: string;
    size: number;
    duration: number;
    subtitleFormat: string;
    languageCode: string;
  }> {
    let uploadedFile: any = null;

    try {
      // ---------------------------------------------
      // Application options
      // ---------------------------------------------

      const subtitleFormat = getWhisperOutputFormat(
        options.formate,
      );

      // "leng" = source/video language
      // "auto" = Gemini detects the spoken language
      const languageCode = options?.leng || 'auto';

      const isWordLevel =
        options.wordLevelTiming === true ||
        options.wordLevelTiming === 'true';

      const shouldTranslate =
        options.autoTranslate === true ||
        options.autoTranslate === 'true';

      // Target subtitle language
      // Only required when translation is enabled.
      const translateLanguage =
        options.leng || null;
        console.log("_________________________________",options.leng,translateLanguage)

      // if (shouldTranslate && !translateLanguage) {
      //   throw new Error(
      //     'translateLanguage is required when autoTranslate is enabled',
      //   );
      // }

      // ---------------------------------------------
      // Dynamic prompt
      // ---------------------------------------------
let prompt = `
You are a professional speech transcription and subtitle generation engine.

TASK:
- Transcribe all spoken content from the provided audio accurately.
- Do not add, remove, summarize, or invent spoken content.
- Do not add explanations, comments, introductions, markdown, or any text outside the requested output format.
- Preserve the original meaning, context, tone, and order of speech.
- Use natural and correct punctuation.
- Do not describe non-speech sounds unless they are explicitly spoken.
-all point provided bellow shoud be followed strictly

SOURCE LANGUAGE:
- Automatically detect the language actually spoken in the audio.
- Do not assume the source language.
- First understand the original spoken content before performing any translation.

`;


// =====================================================
// TRANSLATION
// =====================================================

if (shouldTranslate) {
  prompt += `
TRANSLATION:
- Translation is enabled.
- Target language: ${getLanguageByCode(translateLanguage)}
- First transcribe and understand the original spoken content.
- Then translate the complete transcription into the specified target language.
- The final subtitle text MUST be written only in the target language.
- Do NOT output the original-language transcription as the final subtitle text.
- Do NOT mix the original language with the translated language.
- Preserve the original meaning, context, tone, intent, and order of speech.
- Do not summarize or shorten the translation.
`;
} else {
  prompt += `
TRANSLATION:
- Translation is disabled.
- Keep the subtitle text in the original spoken language.
- Do not translate the spoken content.
`;
}


// =====================================================
// TIMING
// =====================================================

if (isWordLevel) {
  prompt += `
TIMING:
- Word-level timing is required.
- Every subtitle segment MUST contain start and end timestamps.
- Every subtitle segment MUST also contain timing information for each spoken word.
- Word timestamps must be ordered chronologically.
- Word timestamps must remain within the segment start and end timestamps.
- Do not invent word timestamps.
`;
} else {
  prompt += `
TIMING:
- Word-level timing is disabled.
- Provide only subtitle segment-level start and end timestamps.
`;
}


// =====================================================
// SPEAKER LABELS
// =====================================================

if (options.lables === true || options.lables === 'true') {
  prompt += `
SPEAKER LABELS:
- Identify different speakers when they can be distinguished from the audio.
- Add the speaker label at the beginning of every subtitle segment.
- Keep the speaker label consistent throughout the entire transcription.
- Do not invent speaker names.
- If a person's name is not known, use a neutral label such as "Speaker 1", "Speaker 2", etc.
`;
} else {
  prompt += `
SPEAKER LABELS:
- Speaker labels are disabled.
- Do not add speaker labels.
`;
}


// =====================================================
// OUTPUT FORMAT
// =====================================================

switch (subtitleFormat.extension) {

  case '.srt':
    prompt += `
OUTPUT FORMAT:
- Return ONLY valid SRT content.
- Do not return JSON.
- Do not return WebVTT.
- Do not return Markdown.
- Do not add explanations or comments.
- Do not wrap the output in code fences.

Each subtitle block MUST contain:

1. Subtitle sequence number
2. Start timestamp
3. End timestamp
4. Subtitle text

Timestamp format:
HH:MM:SS,mmm

CORRECT SRT FORMAT:

1
00:00:01,005 --> 00:00:03,635
Screen conversions, these things practice.

2
00:00:03,795 --> 00:00:05,335
Naturally, I was like this.

3
00:00:05,865 --> 00:00:08,225
Then Coton is the monitor that comes out.

IMPORTANT SRT RULES:
- The subtitle number MUST be on its own line.
- The timestamp MUST be on the line immediately after the subtitle number.
- The subtitle text MUST be on the line immediately after the timestamp.
- Each subtitle block MUST be separated by one empty line.
- Subtitle numbers MUST start at 1 and increase sequentially.
- Timestamp hours MUST always be included.
- Use a comma before milliseconds: HH:MM:SS,mmm
- Do NOT put timestamps inside the subtitle text.
- Do NOT put word-level timestamps inside the subtitle text.
- Do NOT put square brackets containing timestamps inside the subtitle text.
- Do NOT put speaker labels before the subtitle number.

If speaker labels are enabled, the speaker label MUST be part of the subtitle text.

CORRECT SPEAKER LABEL EXAMPLE:

1
00:00:01,005 --> 00:00:03,635
[SPEAKER_1] Screen conversions, these things practice.

2
00:00:03,795 --> 00:00:05,335
[SPEAKER_1] Naturally, I was like this.

you should provide exect formate not single thing should be diffrent
`;
    break;


  case '.vtt':
    prompt += `
OUTPUT FORMAT:
- Return ONLY valid WebVTT content.
- Do not return SRT.
- Do not return JSON.
- Do not return Markdown.
- Do not add explanations or comments.
- Do not wrap the output in code fences.

The output MUST begin with:

WEBVTT

Timestamp format:
HH:MM:SS.mmm --> HH:MM:SS.mmm

Example structure:

WEBVTT

00:00:01.000 --> 00:00:03.500
Subtitle text

Rules:
- Every cue must have a valid start and end timestamp.
- Return ONLY the WebVTT content.
`;
    break;


  case '.txt':
    prompt += `
OUTPUT FORMAT:
- Return ONLY plain text transcription.
- Do not include timestamps.
- Do not include subtitle numbers.
- Do not include speaker labels unless speaker labels were explicitly enabled.
- Do not return JSON.
- Do not return SRT.
- Do not return WebVTT.
- Do not add explanations or comments.
- Return ONLY the final subtitle/transcription text.
`;
    break;


  case '.json':
    prompt += `
OUTPUT FORMAT:
- Return ONLY valid JSON.
- Do not use Markdown code fences.
- Do not add explanations or comments.
- Do not return SRT.
- Do not return WebVTT.
- The response MUST be valid JSON that can be parsed directly using JSON.parse().

Required structure:

{
  "segments": [
    {
      "start": 0,
      "end": 3,
      "text": "subtitle text"
    }
  ]
}

Rules:
- "start" and "end" MUST be numbers representing seconds.
- "start" MUST be smaller than "end".
- Segments MUST be ordered chronologically.
- "text" MUST contain the final subtitle text.
- Do not add fields that are not requested.
`;

    if (isWordLevel) {
      prompt += `
Because word-level timing is enabled, each segment MUST also contain:

"words": [
  {
    "start": 0,
    "end": 0.5,
    "text": "word"
  }
]

Word rules:
- "start" and "end" MUST be numbers representing seconds.
- Word timestamps MUST be inside their parent segment timestamps.
- Words MUST be in spoken order.
- Do not invent words or timestamps.
`;
    }

    break;


  default:
    prompt += `
OUTPUT FORMAT:
- Return ONLY the transcription with subtitle segment timestamps.
- Do not add explanations or comments.
- Do not use Markdown.
- Do not use code fences.
- Do not return an unsupported format.
`;
    break;
}

      // ---------------------------------------------
      // Upload audio to Gemini
      // ---------------------------------------------

      console.log('Uploading audio to Gemini...');

      uploadedFile = await this.ai.files.upload({
        file: audioPath,
        config: {
          mimeType: 'audio/mp3',
        },
      });

      console.log(
        'Gemini uploaded file:',
        uploadedFile.name,
      );

      // ---------------------------------------------
      // Wait for Gemini file processing
      // ---------------------------------------------

      let fileState = uploadedFile;

      while (
        fileState.state &&
        String(fileState.state) !== 'ACTIVE'
      ) {
        if (String(fileState.state) === 'FAILED') {
          throw new Error(
            'Gemini audio processing failed',
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 2000),
        );

        fileState = await this.ai.files.get({
          name: uploadedFile.name,
        });
      }

      // ---------------------------------------------
      // Generate transcription
      // ---------------------------------------------

      console.log(
        'Generating Gemini transcription...',
      );

      console.log(prompt);

      const result =
        await this.ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',

          contents: createUserContent([
            createPartFromUri(
              fileState.uri,
              fileState.mimeType || 'audio/mp3',
            ),
            prompt,
          ]),
        });

      // ---------------------------------------------
      // Get response
      // ---------------------------------------------

      const transcript = result.text?.trim();

      console.log(transcript)

      if (!transcript) {
        throw new Error(
          'Gemini returned an empty transcript',
        );
      }

      // ---------------------------------------------
      // Remove accidental markdown fences
      // ---------------------------------------------

      const cleanedTranscript = transcript
        .replace(
          /^```(?:srt|vtt|json|txt|ass|ssa)?\s*/i,
          '',
        )
        .replace(/\s*```$/i, '')
        .trim();

      // ---------------------------------------------
      // Save output
      // ---------------------------------------------

      const extension = subtitleFormat.extension;

      const filename = `${videoId}${extension}`;

      const outputPath = path.join(
        workDir,
        filename,
      );

      await fs.writeFile(
        outputPath,
        cleanedTranscript,
        'utf8',
      );

      // ---------------------------------------------
      // File information
      // ---------------------------------------------

      const fileStats = await fs.stat(outputPath);

      return {
        localPath: outputPath,
        filename,
        mimeType: subtitleFormat.mimeType,
        size: fileStats.size,
        duration: 0,

        subtitleFormat: extension,

        // If auto detection was used, this remains "auto".
        // The actual detected language is determined by Gemini.
        languageCode,
      };
    } catch (error: any) {
      console.error(
        `Gemini transcription failed: ${error?.message || error
        }`,
      );

      throw error;
    } finally {
      // ---------------------------------------------
      // Delete Gemini uploaded file
      // ---------------------------------------------

      if (uploadedFile?.name) {
        try {
          await this.ai.files.delete({
            name: uploadedFile.name,
          });
        } catch (error: any) {
          console.warn(
            `Failed to delete Gemini file: ${error?.message || error
            }`,
          );
        }
      }
    }
  }

}

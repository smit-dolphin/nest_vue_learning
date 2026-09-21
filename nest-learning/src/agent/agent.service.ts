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

Transcribe the provided audio accurately.

Rules:
- Transcribe only spoken content.
- Do not add explanations.
- Do not add markdown.
- Do not add introductory text.
- Do not invent words.
- Do not omit spoken content.
- Preserve the meaning and context.
- Use correct punctuation.


SOURCE LANGUAGE:
- Automatically detect the language spoken in the audio.
- First understand the spoken language.
`;

      // ---------------------------------------------
      // Source language
      // ---------------------------------------------

//       if (languageCode === "auto") {
//         prompt += `
// SOURCE LANGUAGE:
// - Automatically detect the language spoken in the audio.
// - First understand the spoken language.
// `;
//       } else {
//         prompt += `
// SOURCE LANGUAGE:
// - The spoken language is ${getLanguageByCode(languageCode)}.
// - Treat this as the source language.
// `;
//       }

      // ---------------------------------------------
      // Translation
      // ---------------------------------------------

      if (shouldTranslate) {
        prompt += `
TRANSLATION:
- Translation is enabled.
- First transcribe and understand the original spoken content.
- Then translate the transcription into ${getLanguageByCode(
          translateLanguage,
        )}.
- The final subtitle text MUST be in the target language.
- Do not output the original language as the final subtitle text.
- Preserve the original meaning, tone and context.
`;
      } else {
        prompt += `
TRANSLATION:
- Translation is disabled.
- Keep the subtitles in the original spoken language.
`;
      }

      // ---------------------------------------------
      // Word timing
      // ---------------------------------------------

      if (isWordLevel) {
        prompt += `
TIMING:
- Word-level timing is required.
- Provide timestamps for individual words.
`;
      } else {
        prompt += `
TIMING:
- Word-level timing is not required.
- Use normal subtitle segment-level timestamps.
`;
      }

      if(options.lables){
      prompt += `
SPEAKER LABLE:
- identyfy speakers (charecters,names,gender).
- append speakers lable in front of every sagment .
`;
      }

      // ---------------------------------------------
      // Output format
      // ---------------------------------------------

      switch (subtitleFormat.extension) {
        case '.srt':
          prompt += `
OUTPUT FORMAT:
- Return valid SRT only.
- Do not use markdown.
- Do not add explanations.

Every subtitle block must contain:
1. Subtitle number
2. Start timestamp
3. End timestamp
4. Subtitle text

Timestamp format:
HH:MM:SS,mmm

Return only the SRT content.
`;
          break;

        case '.vtt':
          prompt += `
OUTPUT FORMAT:
- Return valid WebVTT only.
- Do not use markdown.
- Do not add explanations.
- Start with WEBVTT.

Timestamp format:
HH:MM:SS.mmm

Return only the WebVTT content.
`;
          break;

        case '.txt':
          prompt += `
OUTPUT FORMAT:
- Return plain text transcription only.
- Do not include timestamps.
- Do not include subtitle numbering.
`;
          break;

        case '.json':
          prompt += `
OUTPUT FORMAT:
- Return valid JSON only.
- Do not use markdown.
- Do not add explanations.

Use this structure:

{
  "segments": [
    {
      "start": 0,
      "end": 3,
      "text": "spoken text"
    }
  ]
}

Rules:
- start and end must be numbers representing seconds.
- text must contain the final subtitle text.
`;
          break;

        default:
          prompt += `
OUTPUT FORMAT:
- Return the transcription with timestamps.
- Do not add explanations.
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
          model: 'gemini-3.1-flash-lite',

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

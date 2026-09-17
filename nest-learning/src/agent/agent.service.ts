import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as fs from 'fs/promises';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { getLanguageByCode } from './agent.constants.js';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class AgentService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService
    ) { }

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

    private resolveStoredPath(storedPath: string): string {
        const root = process.cwd();

        if (storedPath.startsWith('/uploads/')) {
            return path.join(root, storedPath.slice(1));
        }

        return path.isAbsolute(storedPath)
            ? storedPath
            : path.resolve(root, storedPath);
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
}

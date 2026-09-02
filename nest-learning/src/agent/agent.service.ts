import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AgentService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async TranslateTranscribtionFile(FileId: string, targetLanguage: string) {
        //fetch the transcription file and get it from db
        const transcriptionFile = await this.prisma.subtitle.findUnique({
            where: {
                id: FileId
            }
        });

        if (!transcriptionFile) {
            throw new Error(`Transcription file with ID ${FileId} not found.`);
        }

        //read file and create the prompt for translation       
        const filedata = await fs.readFile(transcriptionFile.path, 'utf-8');


        const prompt = `Translate the given text file data in destination lenguage translation,manage same tone and same style as the original text no ,and alway return file in same formate as given formate .only return valid output formate as input
        Rule:-give output fomrate striclty as input formate 
        target Language: ${targetLanguage}
        \n\n
        target FileData: ${filedata}`;


        const TranslationResult = await this.AgentEngine(prompt);

        if (!TranslationResult) {
            throw new Error('Agent did not return any translation.');
        }

        await fs.writeFile(
            transcriptionFile.path,
            TranslationResult,
            'utf-8'
        );


        return transcriptionFile
    }


    async AgentEngine(input: string) {

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINAI_API_KEY || '',
        })

        const result = await ai.interactions.create({
            model: 'gemini-2.5-flash',
            input: input
        })

        return result.output_text

    }
}

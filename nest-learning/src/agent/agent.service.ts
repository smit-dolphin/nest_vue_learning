import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as fs from 'fs/promises';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { getLanguageByCode } from './agent.constants.js';

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
        const filePath = this.resolveStoredPath(transcriptionFile.path);
        const filedata = await fs.readFile(filePath, 'utf-8');


        console.log(filedata)

        const lenguageCode=getLanguageByCode(targetLanguage || 'en');

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

        files:-
        Target_Language: ${lenguageCode}
        Target_FileData: ${filedata}`;


        const TranslationResult = await this.AgentEngine(prompt);
        console.log("TranslationResult",TranslationResult)
        if (!TranslationResult) {
            throw new Error('Agent did not return any translation.');
        }

        console.log("lenguageCode", lenguageCode)

        await fs.writeFile(
            filePath,
            TranslationResult,
            'utf-8'
        );

        return this.prisma.subtitle.update({
            where: {
                id: FileId,
            },
            data: {
                languageCode: targetLanguage || 'en',
            },
        });
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

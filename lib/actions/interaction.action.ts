"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "./interaction.model";

export async function viewQuestion(params: ViewQuestionParams) {
    try {
        await connectToDatabase();

        const { questionId, userId } = params;

        // update the view count for the question

        await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } })
        
        if (userId) {
            const existingInteraction = await Interaction.findOne(
                {
                    user: userId,
                    action: 'view',
                    question:questionId
                }) 
           
            if (existingInteraction) {
                return console.log("user has already viewed")
            }

            await Interaction.create({
                user: userId,
                action: 'view',
                question:questionId
            })
    
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}
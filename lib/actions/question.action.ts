"use server";
import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import {
  GetQuestionsParams,
  CreateQuestionParams,
  GetQuestionByIdParams,
  QuestionVoteParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });
    // -1 used for sorting in descending order

    // mongodb stores only the references or the ids by default
    // so inorder to get the actual data we have to populate it

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // creating the question

    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // create the tags or get them if they already exist

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        // search
        {
          $setOnInsert: { name: tag },
          $push: { questions: question._id },
          // update
        },
        // additional filters
        { upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }

    // finds the particular question and then pushes all its connected tags there
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // first -> mapping each tag to its associated question, then mapping each question to its associated tag

    // create an interaction record for the user's ask_question action

    // increment author's reputation by +5 creating a question

    revalidatePath(path);
    // caches data and prevents reloading of the whole page
    // just the updated cached data is rendered now instead of rendering the whole page
  } catch (error) {}
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    console.log("question id is :", questionId);

    const question = await Question.findById(questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params:QuestionVoteParams){

  try {
    connectToDatabase();

    const {questionId,userId,hasupVoted,hasdownVoted,path}=params;
 
    let updateQuery={};
    // just toggling b/w upvotes and downvotes in the database
    if(hasupVoted){
      updateQuery={$pull :{upvotes:userId}}
    }
    else if (hasdownVoted){
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId }
      }
      
    }
    else{
      updateQuery={$addToSet:{upvotes:userId}}
    }

    const  question= await Question.findByIdAndUpdate(
    questionId,updateQuery,{new:true})

    if(!question){
      throw new Error("Question not found");
    }

    // increment author's reputation by +10 

    revalidatePath(path);
     
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteQuestion(params:QuestionVoteParams){

  try {
    connectToDatabase();

    const {questionId,userId,hasupVoted,hasdownVoted,path}=params;
 
    let updateQuery={};
   
    if(hasdownVoted){
      updateQuery={$pull :{downvotes:userId}}
    }
    else if (hasupVoted){
      updateQuery={$pull:{upvotes:userId}
    ,$push:{downvotes:userId}}
      
    }
    else{
      updateQuery={$addToSet:{downvotes:userId}}
    }

    const  question= await Question.findByIdAndUpdate(
    questionId,updateQuery,{new:true})

    if(!question){
      throw new Error("Question not found");
    }

    // increment author's reputation by +10 

    revalidatePath(path);
     
  } catch (error) {
    console.log(error);
    throw  error;
  }
}

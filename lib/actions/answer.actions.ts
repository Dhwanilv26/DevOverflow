'use server';

import Answer from '@/database/answer.model';
import { connectToDatabase } from '../mongoose';
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from './shared.types';
import Question from '@/database/question.model';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import Interaction from './interaction.model';

export async function createAnswer(params: CreateAnswerParams) {
  try {
    await connectToDatabase(); // Use await to ensure DB connection before proceeding
    const { content, author, question, path } = params;
    const newAnswer = await Answer.create({
      content,
      author,
      question,
    });

    // add the answer to the question's answers array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    await connectToDatabase();
    const { questionId, sortBy, page = 1, pageSize = 10 } = params;
    
    const skipAmount = (page - 1) * pageSize;
    
    let sortOptions = {};

    switch (sortBy) {
      
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate('author', '_id clerkId name picture')
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);
    
    const totalAnswers = await Answer.countDocuments({ question: questionId })
    
    const isNextAnswers = totalAnswers > skipAmount + answers.length;

    return { answers ,isNextAnswers};
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    // Convert userId to a mongoose ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId); // Use ObjectId for MongoDB compatibility

    let updateQuery = {};
    // just toggling b/w upvotes and downvotes in the database
    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userObjectId } }; // Updated to use userObjectId
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userObjectId },
        $push: { upvotes: userObjectId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userObjectId } }; // Updated to use userObjectId
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error('Answer not found');
    }

    console.log(answer);

    // Increment author's reputation by +10 if needed here
    revalidatePath(path);

    return answer;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    // Convert userId to a mongoose ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId); // Use ObjectId for MongoDB compatibility

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userObjectId } }; // Updated to use userObjectId
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userObjectId },
        $push: { downvotes: userObjectId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userObjectId } }; // Updated to use userObjectId
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error('Answer not found');
    }

    // Increment author's reputation by -10 if needed here
    revalidatePath(path);

    return answer;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    connectToDatabase();

    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error('Answer not found');
    }

    await answer.deleteOne({ _id: answerId });

    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );

    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

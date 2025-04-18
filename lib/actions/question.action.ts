'use server';
import Question from '@/database/question.model';
import { connectToDatabase } from '../mongoose';
import Tag from '@/database/tag.model';
import {
  GetQuestionsParams,
  CreateQuestionParams,
  GetQuestionByIdParams,
  QuestionVoteParams,
  DeleteQuestionParams,
  EditQuestionParams,
} from './shared.types';
import User from '@/database/user.model';
import { revalidatePath } from 'next/cache';
import Answer from '@/database/answer.model';
import Interaction from './interaction.model';
import { FilterQuery } from 'mongoose';
export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 4 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = {};

    if (searchQuery) {
      const escapedSearchQuery = searchQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      query.$or = [
        { title: { $regex: new RegExp(escapedSearchQuery, 'i') } },
        { content: { $regex: new RegExp(escapedSearchQuery, 'i') } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'frequent':
        sortOptions = { views: -1 };
        break;
      case 'unanswered':
        query.answers = { $size: 0 };
        break;

      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const questions = await Question.find(query)
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await Question.countDocuments(query);

    const isNext = totalQuestions > skipAmount + questions.length;

    // questions.length -> questions to be shown in the current page
    // skipamount is the questions skipped untill now (depends on pageSize)

    // mongodb stores only the references or the ids by default
    // so inorder to get the actual data we have to populate it

    return { questions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function createQuestion(params: CreateQuestionParams) {
  try {
    await connectToDatabase();

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
        { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
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

    await Interaction.create({
      user: author,
      action: 'ask-question',
      question: question._id,
      tags: tagDocuments,
    });

    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

    revalidatePath(path);
    // caches data and prevents reloading of the whole page
    // just the updated cached data is rendered now instead of rendering the whole page
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    await connectToDatabase();

    const { questionId } = params;

    console.log('question id is :', questionId);

    const question = await Question.findById(questionId)
      .populate({ path: 'tags', model: Tag, select: '_id name' })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      });

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    await connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};
    // just toggling b/w upvotes and downvotes in the database
    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // increment author's reputation by +1 or -1
    // for upvoting/revoking an upvote to the question

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -1 : 1 },
    });

    // increment author's reputation by +10/-10 for reviewing an upvote/downvote

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasupVoted ? -10 : 10 },
    });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    await connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // increment author's reputation by +10

     await User.findByIdAndUpdate(userId, {
       $inc: { reputation: hasdownVoted ? -2 : 2 },
     });

     await User.findByIdAndUpdate(question.author, {
       $inc: { reputation: hasdownVoted ? -10 : 10 },
     }); 

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, path } = params;

    await Question.deleteOne({ _id: questionId });
    // also delete all answers and interactions associated with that question

    await Answer.deleteMany({ question: questionId });

    await Interaction.deleteMany({ question: questionId });

    await Tag.updateMany(
      { questions: questionId },
      {
        $pull: { questions: questionId },
      }
    );
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, title, content, path } = params;

    const question = await Question.findById(questionId).populate('tags');

    if (!question) {
      throw new Error('Question not found');
    }

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getHotQuestions() {
  try {
    connectToDatabase();

    const hotQuestions = await Question.find({})
      .sort({
        views: -1,
        upvotes: -1,
      })
      .limit(5);

    return hotQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

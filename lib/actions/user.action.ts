'use server';

import User from '@/database/user.model';
import { connectToDatabase } from '../mongoose';
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from './shared.types';
import { revalidatePath } from 'next/cache';
import Question from '@/database/question.model';
import mongoose from 'mongoose';
export async function getUserById({ userId }: { userId: string }) {
  try {
    connectToDatabase();

    // const { userId } = params;

    // const user = await User.findOne({ clerkId: userId });

    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error('User not Found');
    }
    // delete user from database
    // questions answers and comments from the app too!! interesting part

    // get user question id

    // const userQuestionIds = await Question.find({ author: user._id }).distinct(
    //   "_id"
    // );

    // delete user questions

    await Question.deleteMany({ author: user._id });

    // TODO: delete user answers,comments,etc

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    // const {page=1 ,pageSize=20 ,filter,searchQuery}=params;

    const users = await User.find({}).sort({ createdAt: -1 });

    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params:any) {
  try {
    connectToDatabase();

    const { userId, questionId, path } = params;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const questionObjectId = new mongoose.Types.ObjectId(questionId);

    const user = await User.findById(userObjectId);
    if (!user) {
      throw new Error('User not found');
    }

    const isQuestionSaved = user.saved.includes(questionObjectId);

    const updatedUser = await User.findByIdAndUpdate(
      userObjectId,
      isQuestionSaved
        ? { $pull: { saved: questionObjectId } }
        : { $addToSet: { saved: questionObjectId } },
      { new: true } 
    );
    
    revalidatePath(path);
  } catch (error) {
    console.error('Error in toggleSaveQuestion:', error);
    throw error;
  }
}
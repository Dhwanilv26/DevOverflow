'use server';

import Question from '@/database/question.model';
import { connectToDatabase } from '../mongoose';
import { SearchParams } from './shared.types';
import User from '@/database/user.model';
import Answer from '@/database/answer.model';
import Tag from '@/database/tag.model';

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();

    const { query, type } = params;

    const regexQuery = { $regex: query, $options: 'i' };

    let results = [];

    const SearchableTypes = ['question', 'answer', 'user', 'tag'];

    const modelsAndTypes = [
      { model: Question, searchField: 'title', type: 'question' },
      { model: User, searchField: 'name', type: 'user' },
      { model: Answer, searchField: 'content', type: 'answer' },
      { model: Tag, searchField: 'name', type: 'tag' },
    ];

    const typeLower = type?.toLowerCase();

    // no selected tag so scan the entire database!!
    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      //  for each loop cant be used with async await .. use for of loop instead
      // we are now awaiting them , we are throwing them.. and same with .map

      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);

        results.push(
          ...queryResults.map((item) => ({
            title:
              type === 'answer'
                ? `Answers containing ${query}`
                : item[searchField],
            type,
            id:
              type === 'user'
                ? item.clerkId
                : type === 'answer'
                  ? item.question
                  : item._id,
          }))
        );
      }
    }
    // search for a specific type
    else {
      const modelInfo = modelsAndTypes.find((item) => item.type === type);

      if (!modelInfo) {
        throw new Error('Invalid search type');
      }
      // modelInfo.model -> all models ek mai hi aa gaye

      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      results = queryResults.map((item) => ({
        title:
          type === 'answer'
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type,
        id:
          type === 'user'
            ? item.clerkId
            : type === 'answer'
              ? item.question
              : item._id,
      }));

      return JSON.stringify(results);
    }
  } catch (error) {
    console.log(error);
    throw new Error('error fetching global results');
  }
}

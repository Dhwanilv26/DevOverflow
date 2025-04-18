import Question from '@/components/forms/Question'
import { getQuestionById } from '@/lib/actions/question.action';
import { getUserById } from '@/lib/actions/user.action';
import { ParamsProps } from '@/types';
import React from 'react'
const Page = async({params}:ParamsProps) => {
    const userId = "clerk123456";

    if (!userId) {
        return null;
    }
    const mongoUser = await getUserById({ userId })
    const result=await getQuestionById({questionId:params.id})
    
  return (
      <>
          <h1 className='h1-bold text-dark100_light900'>Edit Question</h1>

          <div className='mt-9'>
              <Question
                  type="Edit"
                  mongoUserId={mongoUser._id}
                  questionDetails={JSON.stringify(result)}
              />
          </div>
      </>
  )
}

export default Page
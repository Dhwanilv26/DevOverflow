import { getUsersAnswers } from '@/lib/actions/user.action';
import { SearchParamsProps } from '@/types';
import AnswerCard from '../cards/AnswerCard';
interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswersTab = async ({ searchParams, userId, clerkId }: Props) => {

    const result = await getUsersAnswers({
        userId, page:1
    })
    // answers is returning null so will delete the db and then do the remanining stuff next for this part
    console.log(result);
    return (
      
        <>
            {result.answers.map((item) => (
                <AnswerCard
                    key={item._id}
                    clerkId={clerkId}
                    _id={item._id}
                    question={item.question}
                    author={item.author}
                    upvotes={item.upvotes.length}
                    createdAt={item.createdAt}


                />
            ))}
        </>
  )
};

export default AnswersTab;

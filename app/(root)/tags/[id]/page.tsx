import QuestionCard from '@/components/cards/QuestionCard';
import NoResult from '@/components/shared/NoResult';
import Pagination from '@/components/shared/Pagination';
import LocalSearchBar from '@/components/shared/search/LocalSearchBar';
import { getQuestionsByTagId } from '@/lib/actions/tag.actions'
import { URLProps } from '@/types';
import React from 'react'

const Page = async({ params, searchParams }: URLProps) => {
    
    const result = await getQuestionsByTagId({
        tagId: params.id,
        page: searchParams.page? +searchParams :1,
        searchQuery: searchParams.q
        // searching based upon the query
        // for eg q=javascript
        // tag would be javascript here
    })

  return (
    <>
          <h1 className="h1-bold text-dark100_light900">{result.tagTitle}</h1>

      <div className="mt-11 w-full">
        <LocalSearchBar
          route={`/tags/${params.id}`}
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search tag questions"
          otherClasses="flex-1"
        />
        
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question: any) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There is no tag question to show"
            description="Be the first to break the silence! 🚀Ask a Question and kickstart the
        discussion, your query could be the next big thing others learn from! Get
        involved 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

      <div className='mt-10'>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  );
}

export default Page
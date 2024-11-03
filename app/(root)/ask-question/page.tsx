// this is a server component-> looks impossible as its a form ..
"use server";
import Question from "@/components/forms/Question";
// import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.action";
const Page = async () => {
  const userId = '64d8f9beeb15d19a4b4a103b';

  // console.log("clerk Id", userId);

  if (!userId) redirect("/sign-in");

  const mongoUser = await getUserById({ userId });

  // console.log("Mongo User id", mongoUser);
  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>
      <div className="mt-9">
        <Question mongoUserId={JSON.stringify(mongoUser?._id)} />
      </div>
    </div>
  );
};

export default Page;

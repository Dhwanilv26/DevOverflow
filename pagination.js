const { searchQuery, filter, page = 1, pageSize = 4 } = params;

const skipAmount = (page - 1) * pageSize;
skip(skipAmount).limit(pageSize);
const totalQuestions = await Question.countDocuments(query);

const isNext = totalQuestions > skipAmount + questions.length;

import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    return console.log("Missing MONGODB_URL");
  }

  if (isConnected) {
    return console.log("Mongodb is connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL as string);

    isConnected = true;
    console.log("MongoDB is Connected");
  } catch (error) {
    console.log("THE ERROR IS \n\n\n\n\n", error);
  }
};

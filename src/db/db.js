import mongoose from "mongoose";

async function connectDb() {
    try {
        let connectionInstance = await mongoose.connect(process.env.MONGO_DB_URL)
        console.log("connected successfully to the db");
    } catch (error) {
        console.log("error connecting to the DB!!!");
    }
}

export { connectDb }
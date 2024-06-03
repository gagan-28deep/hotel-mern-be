import { app } from "./app.js";
import { connectDb } from "./db/db.js";
// import "dotenv/config"
import dotenv from "dotenv"

dotenv.config({
    // path : (process.cwd() , ".env")
    path :"../.env"
})

connectDb().then(()=>{
    app.listen(process.env.PORT , function(){
        console.log(`Server in running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("Error while connecting to the db" , err);
})
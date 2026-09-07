
import "dotenv/config";

import { app } from "./app.js";


import { connectDB,disconnectDB} from "./configs/db.js";



await connectDB();





const port=process.env.PORT||5001;
const server=app.listen(port,()=>{console.log(`server is listening on ${port}`)});



process.on("uncaughtException",(err)=>{
    console.error("uncaught exception: ",err);
    process.exit(1);
});


process.on("unhandledRejection",(err)=>{
    console.error('unhandled rejection: ',err);
    server.close(async()=>{
        
        try{
            await disconnectDB();
        }finally{
            process.exit(1);
        }
    })
});

process.on("SIGTERM",async (signal)=>{
    console.log("sigterm received,shutting down gracefully");

    server.close(async () => {
        try{
            await disconnectDB();
        }finally{
            process.exit(0);
        }
    });
})


process.on("SIGINT", async () => {
    console.log("SIGINT received (Ctrl+C), shutting down gracefully");
    server.close(async()=>{
        try{
            await disconnectDB();
        }finally{
            process.exit(0);
        }
    })
    
    
});



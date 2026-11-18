
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { env } from './env.js'


export const pool = new Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool, { disposeExternalPool: true })

export const prisma = new PrismaClient({ adapter,
    log:env.NODE_ENV==="development"
    ? ["query","error","warn"]
    : ["error"]
  })


export const connectDB=async()=>{
    try{
        await prisma.$connect();
        console.log("DB connected via prisma");
    }catch(error){
        console.error(`database connection error:${error.message}`);
        process.exit(1);
    }
}


export const disconnectDB=async()=>{
    try{
        await prisma.$disconnect();
        console.log("DB disconnected with prisma")
    }catch(error){
        console.error(`database connection error:${error.message}`);
    }
}

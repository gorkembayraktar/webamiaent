import dotenv from 'dotenv'
dotenv.config();
dotenv.config({ path: `.env.local`, override: true});
dotenv.config({ path: `.env.production`, override: true});
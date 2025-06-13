import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import { connectDB } from './db/db.js';
import { authRouter } from './Routes/userRoute.js';

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

connectDB();

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cors())
  .use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

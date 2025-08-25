import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/db.js';
import { authRouter } from './Routes/userRoute.js';
import { adminRouter } from './Routes/adminRoute.js';
import { pmRouter } from './Routes/projectManagerRoute.js';

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

connectDB();
app.use('/uploads', express.static('uploads'));

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  // .use(cors())
   app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://http://199.192.25.165',
  ],
  credentials: true
}))
app
  .use("/api", res => {
    res.send("hello");
  })
  .use("/api/auth", authRouter)
  .use("/api/admin", adminRouter)
  .use("/api/pm", pmRouter)
  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

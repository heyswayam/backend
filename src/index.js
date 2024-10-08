// require('dotenv').config({path:'./env'});
import connectDB from './db/index.js';
import { app } from './app.js';
import dotenv from 'dotenv';
dotenv.config({ path: '/.env' });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
      app.on("error",(err)=>{
        console.log(`Encountered some error in the index: ${err}`);
      })
    });
    
  })
  .catch((e) => {
    console.log('MONGODB connection failed', e);
  });

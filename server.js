import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';



// app config

const app = express();
const PORT = process.env.PORT || 4001;  
connectDB();

// middleware
app.use(cors());    
app.use(express.json()); // for parsing application/json

// Api end points
app.get('/', (req, res) => {
  res.send('Hello World api is running');
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


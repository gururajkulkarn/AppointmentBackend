import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';


// app config

const app = express();
const PORT = process.env.PORT || 4001;  
connectDB();
connectCloudinary();

// middleware
app.use(cors());    
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
  console.log('🧪 Incoming body:', req.body);
  next();
});

// Api end points
app.use('/api/admin',adminRouter)



app.get('/', (req, res) => {
  res.send('Hello World api is running');
});



// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


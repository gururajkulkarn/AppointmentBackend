import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';


// app config

const app = express();
const PORT = process.env.PORT || 4001;  
connectDB();
connectCloudinary();

// middleware

const allowedOrigins = [
  'https://docmeetgk.netlify.app',
  'https://docmeetadmin.netlify.app'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
  // credentials: true
}));


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


app.use((req, res, next) => {
  console.log('🧪 Incoming body:', req.body);
  next();
});

// Api end points
app.use('/api/admin',adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user',userRouter)



app.get('/', (req, res) => {
  res.send('Hello World api is running');
});



// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


import validator from 'validator';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';

import 'dotenv/config';
import jwt from 'jsonwebtoken';

const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    console.log("🟢 Incoming request with:", req.body, req.file);

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: 'doctors',
      resource_type: 'image',
    });

    console.log("✅ Cloudinary upload success:", imageUpload.secure_url);

    const doctorData = {
      name,
      email,
      image: imageUpload.secure_url,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      date: Date.now()
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    console.log("✅ Doctor saved to DB");
    res.status(201).json({ success: 'true', message: 'Doctor added successfully' });

  } catch (error) {
    console.error("❌ Final Catch Error:", error.message);
    res.status(500).json({ success: 'false', message: 'Failed to save doctor', error: error.message });
  }
};




const loginAdmin = async (req, res) => {
    console.log("🟡 req.body at start:", req.body);
  try {
    console.log("🧪 Raw body:", req.body);

    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body missing" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    console.log("🟢 Login attempt with:", email, password);

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};


// const loginAdmin = async (req,res) => {
//   try {
        
//     console.log("🧪 Raw body:", req.body); // ✅ Add this
// if (!req.body) {
//   return res.status(400).json({ success: false, message: "Request body missing" });
// }
//     const { email,password } = req.body // 🔥 This will crash if body is undefined


//     console.log("🟢 Login attempt with:", email, password);

//     if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//       const token = jwt.sign(email+password,process.env.JWT_SECRET);
//       res.json({ success:true,token });
//     } else {
//        res.json({ success: 'false', message: 'Invalid email or password' });
//     }

//   } catch (error) {
//     console.error("❌ Login Error:", error.message);
//     return res.status(500).json({ success: 'false', message: 'Login failed', error: error.message });
//   }
// };




export  {addDoctor, loginAdmin}

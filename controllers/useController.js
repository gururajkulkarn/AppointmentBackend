import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from "cloudinary";
import userModel from "../models/userModel.js"; // Make sure this path is correct
import doctorModel from "../models/doctorModel.js"; // Make sure this path is correct
import appointmentModel from "../models/appointmentModel.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// API FOR user Login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// API to get user profile data

const getProfile = async (req, res) => {
  try {

       const userId = req.user.id;

    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, user: userData, });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return res.json({ message: "Internal server error" });
  }
};


// API TO Update user profile data

const updateProfile = async (req, res) => {
  try {

    // const {userId, name, phone,address,dob,gender } = req.user.id;
   
    const userId = req.user.id;
    const { name, phone, address, dob, gender,email } = req.body;
    const imageFile = req.file;

      console.log("Received file:", imageFile);

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

 await userModel.findByIdAndUpdate(userId, {name,phone,address,dob,gender,email})
  
 if(imageFile) {
  const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type: "image"})
  const imageURL = imageUpload.secure_url;
  await userModel.findByIdAndUpdate(userId, { image: imageURL });
 }

res.json({ success: true, message: "profile updated successfully" });

  } catch (error) {
    return res.json({ message: "Internal server error" });
  }
};


// // Api fro apponitment data
// const bookAppointment = async (req, res) => {
//   try {

//     const {  docId, slotDate, slotTime } = req.body;
//     const userId = req.user.id;

//     const docData = await doctorModel.findById(docId).select("-password");

//     if(!docData){
//       return res.json({success: false, message: "Doctor not found"});
//     }

//     let slots_booked = docData.slots_booked || {};
//     // checking for slot availability
//     if(slots_booked [slotDate]){
//       if(slots_booked[slotDate].includes(slotTime)){
//         return res.json({success: false, message: "Slot already booked"});
//       }
//       else{
//         slots_booked[slotDate].push(slotTime);
//       }

//       const userData = await userModel.findById(userId).select("-password");
//       delete docData.slots_booked;

//       const appointmentData = {
//         userId,
//         docId,
//         userData,
//         docData,
//         slotTime,
//         slotDate,
//         amount: docData.fees,
//         date: Date.now(),
//       };
// const newAppointment = new appointmentModel(appointmentData);
// await newAppointment.save();

// // save new slots in doc data
// await doctorModel.findByIdAndUpdate(docId, { slots_booked });

// res.json({success: true, message: "Appointment booked successfully"});

//     }
// else{
//   slots_booked[slotDate] = [];
//   slots_booked[slotDate].push(slotTime);

// }


//   }
//   catch (error) {
//     console.error("Error in bookAppointment:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }


// }


const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.id;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    let slots_booked = docData.slots_booked || {};

    // Check and update the booked slots
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    } else if (slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot already booked" });
    }

    // Book the slot
    slots_booked[slotDate].push(slotTime);

    // Get user data
    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    // Create appointment
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      slotTime,
      slotDate,
      amount: docData.fees,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save updated slots in doctor
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    return res.json({ success: true, message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error in bookAppointment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};




export { registerUser, loginUser, getProfile, updateProfile, bookAppointment };

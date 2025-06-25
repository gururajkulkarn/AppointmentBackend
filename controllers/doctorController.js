import doctorModel from "../models/doctorModel.js";


const changeAvailability = async (req, res) => {   
 
    try{
     
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available });
        res.json({ message: "Doctor availability changed successfully" });
    }

    catch (error) {
        console.error("Error changing availability:", error);
       res.json({ error: "Internal server error" });
    }
}


const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password','-email'])
        res.json({ success: true, doctors });
    }  
    catch (error) {
        console.error("Error fetching doctors:", error);
        res.json({ success: false, message: "Failed to fetch doctors" });
    }
}



export { changeAvailability, doctorList };
import {Feedback,User,Provider,Appointment} from "../models/association.js";

export const postFeedback=async(req,res)=>{
    try {
        const id=req.user.id;
        const {rating,comment}=req.body;
        const {appointment_id} = req.params;
        if(!rating  || !appointment_id){
            return res.status(429).json({success:false,message:"all fields are required"});
        }
        const feedback=await Feedback.findOne({where:{appointment_id}});
        if(feedback){
            return res.status(404).json({success:false,message:"feedback already post"});
        }
        const customer=await User.findOne({where:{id}});
        if(!customer){
            return res.status(404).json({success:false,message:"customer not found"});
        }
        const appointment=await Appointment.findOne({where:{id:appointment_id}});
        if(!appointment){
            return res.status(404).json({success:false,message:"appointment not found"});
        }
        const appointDetailsDetails=JSON.parse(JSON.stringify(appointment));
        
        await Feedback.create({customer_id:id,appointment_id:appointDetailsDetails.id,provider_id:appointDetailsDetails.provider_id,rating:parseInt(rating),comment});
        res.status(200).json({success:true,message:"comment post successfull"});
    } catch (error) {
       console.log(error);
       res.status(500).json({success:false,message:"something went wrong"}) ;
    }
}

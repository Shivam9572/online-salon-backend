
import {Admin,ProviderCategory,Category,Service} from "../models/association.js";
export const createService = async (req, res) => {
      const adminId=req.user.id;
      const {category_id,name,description,default_price,default_duration}=req.body;
      try {
        if(category_id == null && name ==null && name.length<1 && description ==null && description.length<1 && default_duration==null &&
            parseInt(default_duration) <1 && default_price == null && parseInt(default_price)<1
        ){
            return res.status(404).json({success:false,message:"fields must be valid && required"});
        }
         const admin = await Admin.findOne({ where: { id: adminId } });
        if (!admin) {
            return res.status(401).json({success:false, message: "admin not found" });
        }
        const category=await Category.findByPk(category_id);
        if(!category){
            return res.status(404).json({success:false,message:"category id not found"});
        }
        const service=await Service.create({category_id,name,description,default_duration,default_price});
        res.status(200).json({success:true,message:service});
      } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:error.message});
      }
};
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll({ include: Category });  
        return res.status(200).json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const editService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, categoryId ,duration} = req.body;
        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        service.name = name || service.name;
        service.description = description || service.description;
        service.price = price || service.price; 
        service.categoryId = categoryId || service.categoryId;
        service.duration = duration || service.duration;
        await service.save();
        return res.status(200).json(service);
    } catch (error) {
        console.error("Error updating service:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        await service.destroy();
        return res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Error deleting service:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const {categoryId} = req.body;
        const category = await Category.findOne({ where: { id:categoryId } });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        
        const service = await Service.findOne({ where: { id },exclude: ['createdAt', 'updatedAt'] });
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json(service);
    } catch (error) {
        console.error("Error fetching service by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

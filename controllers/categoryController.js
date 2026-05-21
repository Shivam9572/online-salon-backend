
import {Category,Provider,Service,Admin} from "../models/association.js";


import { Model } from "sequelize";




export const removeCategory = async (req, res) => {
    const adminId = req.user.id;
    const { categoryId } = req.params;
    try {
        const admin = await Admin.findOne({ where: { id: adminId } });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const category = await Category.findOne({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        await category.destroy();
        return res.status(200).json({ message: "Category removed successfully" });
    } catch (error) {
         console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getServicesByCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const category = await Category.findOne({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const services = await Service.findAll({
            where: { category_id: categoryId }, exclude: ['createdAt', 'updatedAt']
        });
        return res.status(200).json({ services });
    } catch (error) {
        console.error("Error fetching services by category:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const categoryList = async (req, res) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).json({ categories });
    } catch (error) {
        console.error("Error fetching category list:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const categoryListByAdmin = async (req, res) => {
    const adminId = req.user.id;
    try {
        const admin = await Admin.findOne({ where: { id: adminId } });
        if (!admin) {
            return res.status(401).json({ message: "admin not found" });
        }
        const categoryList = await Category.findAll({
            attributes: ["id","name", "description", "image"],
            include: [
                {
                    model: Service,
                    attributes: [
                        "name",
                        "description",
                        "default_price",
                        "default_duration",
                    ],
                },
            ],
        });
        res.status(200).json({ message: categoryList });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

export const createList=async(req,res)=>{
    const adminId = req.user.id;
    const {name,description}=req.body;
    try {
         const admin = await Admin.findOne({ where: { id: adminId } });
        if (!admin) {
            return res.status(401).json({success:false, message: "admin not found" });
        }
        let fields={};
        if(name==null && name.length<1){
             return res.status(404).json({success:false, message: "name must be required" });
        }else{
            fields={name};
        }
        if(description!=null && description.length>0){
            fields={...fields,description};
        }
        let category=await Category.create(fields);
         return res.status(200).json({success:true,message:category});
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:error.message});
    }
}



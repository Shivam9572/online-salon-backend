

import Sequelize from "sequelize";
import sequelize from "../config/DB.js";

import {Staff,ProviderService,StaffSkill,Provider} from "../models/association.js";


export const addStaff= async (req, res) => {
    const providerId = req.user.id;
    const { name, phone } = req.body;
    try {
        const provider = await Provider.findOne({ where: { id: providerId } });
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        const existingStaff = await Staff.findOne({ where: { phone } });
        if (existingStaff) {
            return res.status(400).json({ message: "Staff member with this phone number already exists" });
        }
        if(!name || !phone) {
            return res.status(400).json({ message: "Name and phone number are required" });
         }
        const newStaff = await Staff.create({ name, phone,provider_id: providerId });
        return res.status(201).json({ message: "Staff added successfully", staff: newStaff });
    } catch (error) {
        console.error("Error adding staff:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getStaffList = async (req, res) => {
    const providerId = req.user.id;
    try {
        const provider = await Provider.findOne({ where: { id: providerId } });
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        const staffList = await Staff.findAll({ where: { provider_id: providerId } });
        return res.status(200).json({ staff: staffList });
    } catch (error) {
        console.error("Error fetching staff list:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteStaff = async (req, res) => {
    const providerId = req.user.id;
    const staffId = req.params.staffId;
    const t=await sequelize.transaction();
    try {
        const provider = await Provider.findOne({ where: { id: providerId } });
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        const staffMember = await Staff.findOne({ where: { id: staffId, provider_id: providerId } });
        if (!staffMember) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        
        await StaffSkill.destroy({where:{staff_id:staffId},transaction:t});
        await ProviderService.destroy({where:{staff_id:staffId},transaction:t});
        await staffMember.destroy({transaction:t});
        
        await t.commit();
        return res.status(200).json({ message: "Staff member deleted successfully" });
    } catch (error) {
        await t.rollback();
        console.error("Error deleting staff member:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const editStaff = async (req, res) => {
    const providerId = req.user.id;
    const staffId = req.params.staffId;
    const { name, phone } = req.body;
    try {
        const provider = await Provider.findOne({ where: { id: providerId } });
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        const staffMember = await Staff.findOne({ where: { id: staffId, provider_id: providerId } });
        if (!staffMember) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        const existingPhone = await Staff.findOne({ where: { phone, id: { [Sequelize.Op.ne]: staffId } } });
        if (existingPhone) {
            return res.status(400).json({ message: "Another staff member with this phone number already exists" });
        }
        staffMember.name = name || staffMember.name;
        staffMember.phone = phone || staffMember.phone;
        await staffMember.save();
        return res.status(200).json({ message: "Staff member updated successfully", staff: staffMember });
    } catch (error) {
        console.error("Error updating staff member:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


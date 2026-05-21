import db from "../config/DB.js";
import NewProvider from "../models/newProvider.js";

import { User,Provider } from "../models/association.js";
import { Admin } from "../models/association.js";

export const approveProvider = async (req, res) => {
    const adminId = req.user.id;
    const { status } = req.body;
    const { email } = req.params;
    const t = await db.transaction();
    try {
        const admin = await Admin.findOne({ where: { id: adminId } });
        if (!admin) {
            return res.status(401).json({ message: "admin not found" });
        }
        const pendingProvider = await NewProvider.findOne({ where: { email } });
        if (!pendingProvider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        const providerData = await Provider.findOne({ where: { email: pendingProvider.email } });
        if (!providerData) {
            return res.status(404).json({ message: "Provider data not found" });
        }
        if (status === "approved") {
            providerData.status = "approved";
            await providerData.save({ transaction: t });
            await pendingProvider.destroy({ transaction: t });
            await t.commit();
            return res.status(200).json({ message: "Provider approved successfully" });
        } else if (status === "rejected") {
            providerData.status = "rejected";
            await providerData.save({ transaction: t });
            await pendingProvider.destroy({ transaction: t });
            await t.commit();
            return res.status(200).json({ message: "Provider rejected successfully" });
        } else {
            return res.status(400).json({ message: "Invalid status value" });
        }

    } catch (error) {
        await t.rollback();
        console.error("Error approving/rejecting provider:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllProvider = async (req, res) => {
    const adminId = req.user.id;
    const page = req.body.page || 1;
    const status = req.params.status;

    try {
        if (status === "approved" || status === "pending" || status === "rejected" || "all") {
            const admin = await Admin.findOne({ where: { id: adminId } });
            if (!admin) {
                return res.status(401).json({ message: "admin not found" });
            }
            let provider;
            if(status==="all"){
                 provider = await Provider.findAll({  offset: ((page - 1) * 10), limit: 10, exclude: ["createdAt", "updatedAt", "password", "otp", "otpExpiry", "isVerified"] });
        
            }else{
               provider = await Provider.findAll({ where: { status }, offset: ((page - 1) * 10), limit: 10, exclude: ["createdAt", "updatedAt", "password", "otp", "otpExpiry", "isVerified"] });

            }
            res.status(200).json(provider);

        } else {
            return res.status("404").json({ message: "status invalid" });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ messgae: error.message });
    }
}




export const getAllUser = async (req, res) => {
    const adminId = req.user.id;
    const page = req.body.page || 1;
    try {
        const admin = await Admin.findOne({ where: { id: adminId } });
        if (!admin) {
            return res.status(401).json({ message: "admin not found" });
        }
        const user = await User.findAll({ offset: ((page - 1) * 10), limit: 10, attributes: { exclude: ["otp", "otpExpiry", "isVerified", "isActivate", "password", "createdAt", "updatedAt"] } });
        res.status(200).json(user);

    } catch (error) {
        console.log(error);
        res.status(500).json({ messgae: error.message });
    }
}

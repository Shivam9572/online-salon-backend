import jwt from "jsonwebtoken";
import Provider from "../models/provider.js";

export const validAdmin = (req, res, next) => {
    
    const token = req.cookies?.token;
    
    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({message:"token exprired"});
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const validUser = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "customer") {
            return res.status(403).json({ message: "Access denied" });
        }
        req.user = decoded;
       
        
        next();
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({message:"token exprired"});
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const validProvider = async(req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "provider") {
            return res.status(403).json({ message: "Access denied" });
        }
        const provider= await Provider.findByPk(decoded.id);
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        if(provider.status !== "approved"){
            return res.status(403).json({ message: "Provider not approved yet" });
        }
        req.user = decoded;
        next();
    }
        catch (error) {
            if(error.name === 'TokenExpiredError'){
            return res.status(401).json({message:"token exprired"});
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};
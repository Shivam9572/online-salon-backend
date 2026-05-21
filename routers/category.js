import {  removeCategory, getServicesByCategory, categoryList,createList } from "../controllers/categoryController.js";
import {validAdmin, validProvider} from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

router.get("/",categoryList);
router.post("/",validAdmin,createList);
router.get("/services/:categoryId", getServicesByCategory);
router.delete("/remove/:categoryId", validAdmin, removeCategory);

export default router;
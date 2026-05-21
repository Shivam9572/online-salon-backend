import { validProvider } from "../middleware/authMiddleware.js";
import { addStaff, deleteStaff, getStaffList, editStaff} from "../controllers/staffController.js";
import express from "express";
const router = express.Router();

router.post("/", validProvider, addStaff);
router.get("/", validProvider, getStaffList);
router.delete("/:staffId", validProvider, deleteStaff);
router.put("/:staffId", validProvider, editStaff);
export default router;
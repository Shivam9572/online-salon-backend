import { approveProvider , getAllProvider,getAllUser} from "../controllers/adminController.js";
import {categoryListByAdmin} from "../controllers/categoryController.js";
import { validAdmin} from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

router.put("/approve/:email", validAdmin, approveProvider);
router.get("/category",validAdmin,categoryListByAdmin);
router.post("/provider/:status",validAdmin,getAllProvider);
router.post("/users",validAdmin,getAllUser);

export default router;
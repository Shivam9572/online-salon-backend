import { validUser } from "../middleware/authMiddleware.js";
import {getUserProfile} from "../controllers/userController.js";
import express from "express";



// routes/user.routes.js


import {
  getNearbyProviders,
  getProviderServices,
  searchProviders,
  getTopProviders,
  updateProfile
} from "../controllers/userController.js";


const router = express.Router();

router.get("/providers/nearby", getNearbyProviders);
router.get("/providers/top", getTopProviders);
router.get("/providers/search", searchProviders);

router.get("/providers/:providerId/services", getProviderServices);
router.get("/profile", validUser, getUserProfile);
router.put("/profile",validUser,updateProfile);

export default router;
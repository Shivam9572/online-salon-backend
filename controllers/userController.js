
import { Sequelize } from "sequelize";
// controllers/user.controller.js

import { Op, fn, col, literal, where } from "sequelize";
import { Provider, Feedback,User,ProviderService,ProviderCategory,Category,Service,Staff } from "../models/association.js";



// =============================
// GET TOP PROVIDERS
// =============================
export const getTopProviders = async (req, res) => {
  try {
    const providers = await Provider.findAll({
      where: {
        status: "approved",

      },
      attributes: [
        "id",
        "salonName",
        "salonAddress",
        "salonContact",
        "opening_time",
        "closing_time",
        "latitude",
        "longitude",
        "available",
        "image",
        [
          Sequelize.literal("ROUND(COALESCE(AVG(`allFeedback`.`rating`), 0), 1)"),
          "rating",
        ],
      ],
      include: [
        {
          model: Feedback,
          attributes: [],
          required: false,
          as: "allFeedback"
        },
      ],

      group: ["Provider.id"],
      
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
    });
  }
};


// =============================
// SEARCH PROVIDERS
// =============================
export const searchProviders = async (req, res) => {
  try {
    const { keyword, location } = req.query;

    // Empty string ko undefined treat karo
    const trimmedKeyword = keyword?.trim() || null;
    const trimmedLocation = location?.trim() || null;
    
    // Dono empty hain toh search karna hi nahi
    if (!trimmedKeyword && !trimmedLocation) {
      return res.status(400).json({
        success: false,
        message: "keyword or location require",
      });
    }

    // Sirf wahi conditions add karo jo empty nahi hain
    const orConditions = [];

    if (trimmedKeyword) {
      
      orConditions.push({
        salonName: { [Op.like]: `%${trimmedKeyword}%`},
      });
    }

    if (trimmedLocation) {
      
      orConditions.push({
        salonAddress: { [Op.like]: `%${trimmedLocation}%` },
      });
    }

    const providers = await Provider.findAll({
      where: {
        status: "approved",
        [Op.and]: orConditions,
      },
      attributes: [
       "id",
        "salonName",
        "salonAddress",
        "salonContact",
        "opening_time",
        "closing_time",
        "latitude",
        "longitude",
        "available",
        "image",
      [
          Sequelize.literal("ROUND(COALESCE(AVG(`allFeedback`.`rating`), 0), 1)"),
          "rating",
        ],
      ],
      include: [
        {
          model: Feedback,
          attributes: [],
          required: false,
          as: "allFeedback"
        },
      ],

      group: ["Provider.id"],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};


// =============================
// GET PROVIDER DETAILS
// =============================



// =============================
// GET PROVIDER SERVICES
// =============================
export const getProviderServices = async (req, res) => {
  try {
    const { providerId } = req.params;

    const services = await ProviderService.findAll({
      where: {
        provider_id: providerId,
      },

      attributes: [
        "id",
        "custom_price",
        "custom_duration",
        "custom_description",
      ],

      include: [
        {
          model: Service,
          attributes: [
            "id",
            "name",
          ],
        },

        {
          model: Category,
          attributes: [
            "id",
            "name",
          ],
        },

        {
          model: Staff,
          attributes: [
            "id",
            "name",
            "phone",
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};


// =============================
// GET NEARBY PROVIDERS
// =============================


export const getNearbyProviders = async (req, res) => {
  try {
    const { latitude, longitude, categoryName } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude required",
      });
    }

    const includeClause = [];
  
    if (categoryName !=null && categoryName.length > 0) {
      includeClause.push({
        model: ProviderService,
        attributes: [],       // junction table ka data response mein nahi chahiye
        required: true,       // INNER JOIN
        include: [
          {
            model: Category,
            attributes: [],   // category ka data bhi nahi chahiye
            where: {
              name: { [Op.like]: `%${categoryName}%` },
            },
            required: true,
          },
        ],
      });
    }
 
    const providers = await Provider.findAll({
      where: { status: "approved" },
      attributes: [
        "id",
        "salonName",
        "salonAddress",
        "salonContact",
        "opening_time",
        "closing_time",
        "available",
        "latitude",
        "longitude",
        "image",
        [
          literal(`
            (
              6371 * acos(
                cos(radians(${parseFloat(latitude)}))
                * cos(radians(latitude))
                * cos(radians(longitude) - radians(${parseFloat(longitude)}))
                + sin(radians(${parseFloat(latitude)}))
                * sin(radians(latitude))
              )
            )
          `),
          "distance",
        ],
      ],
      include: includeClause,
      order: [[literal("distance"), "ASC"]],
      limit: 20,
      subQuery: false,   // literal() + limit ke saath zaroori
      distinct: true,    // ek provider multiple ProviderService rows mein ho sakta hai
    });

    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby providers",
    });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findOne({ where: { id: userId, role: "customer" }, attributes: { exclude: ["id", "password", "createdAt", "updatedAt", "otp", "otpExpiry", "isVerified",] } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = user.toJSON();
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpiry;

    delete userData.isVerified;
    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

};

export const updateProfile = async (req, res) => {
  const id = req.user.id;
  const { name, address, mobile, currentPassword, newPassword } = req.body;
  try {
    const customer = await User.findOne({ where: { id } });
    if (!customer) {
      return res.status(401).json({ message: "user not found" });
    }
    if (name) customer.name = name;
    if (address !== undefined) customer.address = address;
    if (mobile !== undefined) customer.mobile = mobile;
    await customer.save();
    let userData = customer.toJSON();
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpiry;
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}
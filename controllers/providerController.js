import { Appointment, Feedback, Provider, User ,Category,ProviderCategory,StaffSkill,ProviderService,Staff,Service} from "../models/association.js";
import cloudinary from "../config/cloudinary.js";
import DB from "../config/DB.js";
import { Sequelize, where } from "sequelize";
import sequlize from "../config/DB.js";
import { Chair } from "../models/association.js";
import { raw } from "express";

export const getProviderProfile = async (req, res) => {
  const providerId = req.user.id;
  try {
    const provider = await Provider.findOne({
      where: { id: providerId }, attributes: { exclude: ["id", "password", "createdAt", "updatedAt", "otp", "otpExpiry", "isVerified"] }, include: {
        model: Chair,
        attributes: ["number"]
      }
    });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    return res.status(200).json(provider);
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProviderProfile = async (req, res) => {
  const providerId = req.user.id;
  const data = req.body;
  console.log(data);
  try {
    const provider = await Provider.findOne({ where: { id: providerId } });
    if (!provider)
      return res.status(401).json({ message: "unauthorized" });
    await provider.update(data);
    return res.status(200).json({ message: "successful updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ messsage: error.message });
  }
}

export const addService = async (req, res) => {
  const providerId = req.user.id;
  const { description, price, serviceId, duration, categoryId, staffId } = req.body;

  const t = await DB.transaction();

  try {
    if (!description || !price || !serviceId || !duration || !categoryId || !staffId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const provider = await Provider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // ✅ get single staff
    const staff = await Staff.findOne({ where: { id: staffId, provider_id: providerId } });


    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // ✅ get single category
    const category = await Category.findOne({ where: { id: categoryId } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const service = await Service.findOne({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }


    const providerCategory = await ProviderCategory.findOne({
      where: {
        provider_id: providerId,
        category_id: categoryId
      }
    });
    if (!providerCategory) {
      return res.status(400).json({ message: "Provider does not offer this category" });
    }

    // ✅ check skill
    const skills = await StaffSkill.findOne({
      where: { service_id: serviceId, staff_id: staffId }
    });


    if (skills) {
      return res.status(400).json({
        message: "Staff already has this skill"
      });
    }

    // ✅ create provider service
    const newService = await ProviderService.create({
      custom_description: description,
      custom_price: price,
      service_id: serviceId,
      custom_duration: duration,
      category_id: categoryId,
      staff_id: staffId,
      provider_id: providerId
    }, { transaction: t });

    // ✅ create staff skill
    await StaffSkill.create({
      service_id: serviceId,
      staff_id: staffId
    }, { transaction: t });
  await t.commit();

    const data = {
      id: newService.id,
      categoryName: category.name,
      serviceName: service.name,
      price: newService.custom_price,
      duration: newService.custom_duration,
      description: newService.custom_description,
      staffName: staff.name,
      staffPhone: staff.phone
    };
    res.status(201).json({
      message: "Service added successfully",
      service: data
    });
    
    

  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addCategory = async (req, res) => {
  const providerId = req.user.id;
  const { categoryId } = req.params;


  try {
    const provider = await Provider.findByPk(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const category = await Category.findOne({ where: { id: categoryId } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const existingCategories = await ProviderCategory.findOne({
      where: {
        provider_id: providerId,
        category_id: categoryId
      }
    });

    if (existingCategories) {
      return res.status(400).json({ message: "Category already added to provider" });
    }
    await ProviderCategory.create({
      provider_id: providerId,
      category_id: categoryId
    });
    return res.status(200).json({ message: "Category added to provider successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const categoryList = async (req, res) => {
  const providerId = req.user.id;
  try {
    const provider = await Provider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    const categories = await ProviderCategory.findAll({
      where: { provider_id: providerId },
      include: [{
        model: Category,
        attributes: ["id", "name"]
      }]
    });
    return res.status(200).json({ categories });
  } catch (error) {

    return res.status(500).json({ message: "Internal server error" });
  }
};
export const providerServices = async (req, res) => {
  const providerId = req.user.id;
  try {
    const provider = await Provider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    const services = await ProviderService.findAll({
      where: { provider_id: providerId },
      include: [
        {
          model: Service,
          attribute: ["name"]
        },
        {
          model: Staff,
          attribute: ["name", "phone"]
        },
        {
          model: Category,
          attribute: ["name"]
        }

      ]
    });
    let data = services.map(service => {
      return {
        id: service.id,
        categoryName: service.Category.name,
        serviceName: service.Service.name,
        price: service.custom_price,
        duration: service.custom_duration,
        description: service.custom_description,
        staffName: service.Staff.name,
        staffPhone: service.Staff.phone
      }
    });
    return res.status(200).json({ services: data });
  } catch (error) {
    console.error("Error fetching provider services:", error);
    return res.status(500).json({ message: "Internal server error" });
  };
}

export const deleteService = async (req, res) => {
  const providerId = req.user.id;
  const id = req.params.id;
  const t = await sequlize.transaction();
  try {
    const provider = await Provider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const providerService = await ProviderService.findOne({ where: { id: id, provider_id: providerId } });

    if (!providerService) {
      return res.status(404).json({ message: "not found you sevrice" })
    }
    const data = JSON.parse(JSON.stringify(providerService));

    const skill = await StaffSkill.findOne({ where: { staff_id: data.staff_id, service_id: data.service_id } });
    if (!skill) {
      return res.status(404).json({ message: "this staff have not this skill" });
    }
    await providerService.destroy({ transaction: t });
    await skill.destroy({ transaction: t });
    await t.commit();
    return res.status(200).json({ message: "successfull deleted your service" });

  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).json({ message: error.message });
  }

}

export const chairUpdate = async (req, res) => {
  const providerId = req.user.id;
  const number = Number(req.body.number);
  try {
    const provider = await Provider.findOne({ where: { id: providerId } });

    if (!provider) {
      return res.status(404).json({ message: "not found you sevrice" })
    }
    const chair = await Chair.findOne({ where: { provider_id: providerId } });
    if (!chair) {
      return res.status(404).json({ message: "chair not found" });
    }

    await chair.update({ number });
    res.status(200).json({ messsage: "succesfull updated chair number" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

export const getProviderDetails = async (req, res) => {
  try {
    const { providerId } = req.params;

    // 1. Provider basic details
    let provider = await Provider.findOne({
      where: {
        id: providerId,
        status: "approved",
      },
      attributes: {
        exclude: ["password", "otp", "otpExpiry", "createdAt", "updatedAt"],

      },
      include: [{
        model: Feedback,
        attributes: ["rating", "comment"],
        include: [{
          model: Appointment,
          attributes: ["service_id"],
          include: [{
            model: Service,
            attributes: ["name"],
            as: "service"
          }, {
            model: Staff,
            attributes: ["name"],
            as: "staff"
          }], as: "appointment"
        }, {
          model: User,
          attributes: ["name"],
          as: "customer"
        }],
        as: "allFeedback"
      }]
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
  
    // 2. ProviderService se services + staff alag query
    let averageRating = await Feedback.findAll({
      where: {
        provider_id: providerId
      },
      attributes: [[
        Sequelize.fn(
          "AVG",
          Sequelize.col("rating")
        ),
        "averageRating",
      ]], raw: true
    });
    provider = provider.toJSON();
    provider = { ...provider, averageRating: averageRating[0].averageRating }
    // 3. JS mein group karo service_id ke basis pe
    const providerServices = await ProviderService.findAll({
      where: { provider_id: providerId },
      attributes: ["id", "custom_price", "custom_duration", "custom_description", "service_id"],
      include: [
        { model: Service, attributes: ["id", "name"] },
        { model: Category, attributes: ["id", "name"] },
        { model: Staff, attributes: ["id", "name", "phone", "available"] },
      ],
    });

    // Group karo service_id ke basis pe
    const servicesMap = {};

    providerServices.forEach((row) => {
      const plain = row.toJSON();
      const serviceId = plain.Service.id;

      if (!servicesMap[serviceId]) {
        servicesMap[serviceId] = {
          service_id: plain.Service.id,
          service_name: plain.Service.name,
          category: plain.Category,
          custom_price: plain.custom_price,
          custom_duration: plain.custom_duration,
          custom_description: plain.custom_description,
          staff: [],
        };
      }

      // Har row ka staff push karo
      if (plain.Staff) {
        servicesMap[serviceId].staff.push(plain.Staff);
      }
    });

    return res.status(200).json({
      success: true,
      provider,
      services: Object.values(servicesMap),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider",
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  const id = req.user.id;
  try {

    const provider = await Provider.findOne({ where: { id }, raw: true });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const base64String = req.file.buffer.toString("base64");

    const dataUri = `data:${req.file.mimetype};base64,${base64String}`;

    // Make unique clean filename from email
    const cleanPublicId = provider.email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "_");

    // 👈 Debug

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "provider-profiles",
      public_id: cleanPublicId,
      overwrite: true,
      unique_filename: false,
      use_filename: false,
      invalidate: true,
      resource_type: "image",
    });



    // Validate result
    if (!result || !result.secure_url) {
      console.error("Invalid Cloudinary result:", result);
      return res.status(500).json({
        success: false,
        message: "Upload failed - invalid response from Cloudinary"
      });
    }
    
    // Update provider with new image

    await Provider.update({ image: result.secure_url }, { where: { id } });

    // Send success response
    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      type: result.resource_type,
      size: req.file.size,
      format: result.format,
      width: result.width,
      height: result.height,
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }

}
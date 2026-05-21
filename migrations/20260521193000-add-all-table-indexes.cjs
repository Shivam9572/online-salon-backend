"use strict";

async function addIndexSafe(queryInterface, table, fields, name, unique = false) {
  try {
    await queryInterface.addIndex(table, {
      fields,
      name,
      unique,
    });
    console.log(`Added index: ${name}`);
  } catch (error) {
    console.log(`Skipped index ${name}: ${error.message}`);
  }
}

async function removeIndexSafe(queryInterface, table, name) {
  try {
    await queryInterface.removeIndex(table, name);
    console.log(`Removed index: ${name}`);
  } catch (error) {
    console.log(`Skipped remove ${name}: ${error.message}`);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // ProviderCategories
    await addIndexSafe(queryInterface, "ProviderCategories", ["provider_id"], "idx_provider_categories_provider_id");
    await addIndexSafe(queryInterface, "ProviderCategories", ["category_id"], "idx_provider_categories_category_id");
    await addIndexSafe(
      queryInterface,
      "ProviderCategories",
      ["provider_id", "category_id"],
      "unique_provider_category",
      true
    );

    // ProviderServices
    await removeIndexSafe(queryInterface, "ProviderServices", "provider_id");
    await removeIndexSafe(queryInterface, "ProviderServices", "service_id");

    await addIndexSafe(queryInterface, "ProviderServices", ["provider_id"], "idx_provider_services_provider_id");
    await addIndexSafe(queryInterface, "ProviderServices", ["service_id"], "idx_provider_services_service_id");
    await addIndexSafe(queryInterface, "ProviderServices", ["category_id"], "idx_provider_services_category_id");
    await addIndexSafe(queryInterface, "ProviderServices", ["staff_id"], "idx_provider_services_staff_id");

    await addIndexSafe(
      queryInterface,
      "ProviderServices",
      ["provider_id", "staff_id", "service_id"],
      "unique_provider_staff_service",
      true
    );

    // StaffSkills
    await addIndexSafe(queryInterface, "StaffSkills", ["staff_id"], "idx_staff_skills_staff_id");
    await addIndexSafe(queryInterface, "StaffSkills", ["service_id"], "idx_staff_skills_service_id");
    await addIndexSafe(
      queryInterface,
      "StaffSkills",
      ["staff_id", "service_id"],
      "unique_staff_service",
      true
    );

    // Staffs
    await addIndexSafe(queryInterface, "Staffs", ["provider_id"], "idx_staffs_provider_id");

    // Services
    await addIndexSafe(queryInterface, "Services", ["category_id"], "idx_services_category_id");

    // Chairs
    await addIndexSafe(queryInterface, "Chairs", ["provider_id"], "idx_chairs_provider_id");

    // Appointments
    await addIndexSafe(queryInterface, "Appointments", ["customer_id"], "idx_appointments_customer_id");
    await addIndexSafe(queryInterface, "Appointments", ["provider_id"], "idx_appointments_provider_id");
    await addIndexSafe(queryInterface, "Appointments", ["staff_id"], "idx_appointments_staff_id");
    await addIndexSafe(queryInterface, "Appointments", ["service_id"], "idx_appointments_service_id");
    await addIndexSafe(queryInterface, "Appointments", ["chair_id"], "idx_appointments_chair_id");
    await addIndexSafe(queryInterface, "Appointments", ["start_time"], "idx_appointments_start_time");

    // Feedbacks
    await addIndexSafe(queryInterface, "Feedbacks", ["appointment_id"], "idx_feedbacks_appointment_id");
    await addIndexSafe(queryInterface, "Feedbacks", ["customer_id"], "idx_feedbacks_customer_id");
    await addIndexSafe(queryInterface, "Feedbacks", ["provider_id"], "idx_feedbacks_provider_id");
  },

  async down(queryInterface, Sequelize) {
    await removeIndexSafe(queryInterface, "Feedbacks", "idx_feedbacks_provider_id");
    await removeIndexSafe(queryInterface, "Feedbacks", "idx_feedbacks_customer_id");
    await removeIndexSafe(queryInterface, "Feedbacks", "idx_feedbacks_appointment_id");

    await removeIndexSafe(queryInterface, "Appointments", "idx_appointments_start_time");
    await removeIndexSafe(queryInterface, "Appointments", "idx_appointments_chair_id");
    await removeIndexSafe(queryInterface, "Appointments", "idx_appointments_service_id");
    await removeIndexSafe(queryInterface, "Appointments", "idx_appointments_staff_id");
    await removeIndexSafe(queryInterface, "Appointments", "idx_appointments_provider_id");
    await removeIndexSafe(queryInterface, "Appointments", "idx_appointments_customer_id");

    await removeIndexSafe(queryInterface, "Chairs", "idx_chairs_provider_id");
    await removeIndexSafe(queryInterface, "Services", "idx_services_category_id");
    await removeIndexSafe(queryInterface, "Staffs", "idx_staffs_provider_id");

    await removeIndexSafe(queryInterface, "StaffSkills", "unique_staff_service");
    await removeIndexSafe(queryInterface, "StaffSkills", "idx_staff_skills_service_id");
    await removeIndexSafe(queryInterface, "StaffSkills", "idx_staff_skills_staff_id");

    await removeIndexSafe(queryInterface, "ProviderServices", "unique_provider_staff_service");
    await removeIndexSafe(queryInterface, "ProviderServices", "idx_provider_services_staff_id");
    await removeIndexSafe(queryInterface, "ProviderServices", "idx_provider_services_category_id");
    await removeIndexSafe(queryInterface, "ProviderServices", "idx_provider_services_service_id");
    await removeIndexSafe(queryInterface, "ProviderServices", "idx_provider_services_provider_id");

    await removeIndexSafe(queryInterface, "ProviderCategories", "unique_provider_category");
    await removeIndexSafe(queryInterface, "ProviderCategories", "idx_provider_categories_category_id");
    await removeIndexSafe(queryInterface, "ProviderCategories", "idx_provider_categories_provider_id");
  },
};
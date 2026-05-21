"use strict";

async function removeIndexSafe(queryInterface, table, indexName) {
  try {
    await queryInterface.removeIndex(table, indexName);
    console.log(`Removed index: ${indexName}`);
  } catch (error) {
    console.log(`Skip remove ${indexName}: ${error.message}`);
  }
}

async function addIndexSafe(queryInterface, table, fields, name, unique = false) {
  try {
    await queryInterface.addIndex(table, {
      fields,
      name,
      unique,
    });
    console.log(`Added index: ${name}`);
  } catch (error) {
    console.log(`Skip add ${name}: ${error.message}`);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // old wrong indexes
    await removeIndexSafe(
      queryInterface,
      "ProviderServices",
      "ProviderServices_service_id_provider_id_unique"
    );

    await removeIndexSafe(queryInterface, "ProviderServices", "provider_id");
    await removeIndexSafe(queryInterface, "ProviderServices", "service_id");

    // correct unique index
    await addIndexSafe(
      queryInterface,
      "ProviderServices",
      ["provider_id", "staff_id", "service_id"],
      "unique_provider_staff_service",
      true
    );
  },

  async down(queryInterface, Sequelize) {
    await removeIndexSafe(
      queryInterface,
      "ProviderServices",
      "unique_provider_staff_service"
    );
  },
};
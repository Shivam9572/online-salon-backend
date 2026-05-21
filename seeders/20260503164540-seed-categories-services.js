import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("12345", salt);

  await queryInterface.bulkInsert("Admins", [
    {
      id: "8db2670e-1317-48f5-936d-d1123924f2b1",
      name: "Shivam Kumar",
      email: "shivamroy9572@gmail.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const categories = [
    {
      id: Sequelize.literal("UUID()"),
      name: "Hair Services",
      description: "Hair cutting, styling, coloring and treatments",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: Sequelize.literal("UUID()"),
      name: "Nail Services",
      description: "Manicure, pedicure and nail art services",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await queryInterface.bulkInsert("Categories", categories);

  const insertedCategories = await queryInterface.sequelize.query(
    `SELECT id, name FROM Categories;`,
    { type: Sequelize.QueryTypes.SELECT }
  );

  const getId = (name) => insertedCategories.find(c => c.name === name)?.id;

  await queryInterface.bulkInsert("Services", [
    {
      id: Sequelize.literal("UUID()"),
      category_id: getId("Hair Services"),
      name: "Haircut & Styling",
      description: "Professional haircut and styling",
      default_price: 500,
      default_duration: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("Services", null, {});
  await queryInterface.bulkDelete("Categories", null, {});
  await queryInterface.bulkDelete("Admins", {
    email: "shivamroy957@gmail.com"
  });
}
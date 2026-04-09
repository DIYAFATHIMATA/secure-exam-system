const User = require("../models/User");

const ensureDefaultAdmin = async () => {
  const name = process.env.ADMIN_NAME || "Admin User";
  const email = process.env.ADMIN_EMAIL || "admin@exam.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    return { created: false, email: existingAdmin.email };
  }

  const existingByEmail = await User.findOne({ email });
  if (existingByEmail) {
    existingByEmail.name = name;
    existingByEmail.role = "admin";
    existingByEmail.password = password;
    await existingByEmail.save();

    return {
      created: true,
      name,
      email,
      password,
      updatedExisting: true,
    };
  }

  await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  return {
    created: true,
    name,
    email,
    password,
    updatedExisting: false,
  };
};

module.exports = { ensureDefaultAdmin };

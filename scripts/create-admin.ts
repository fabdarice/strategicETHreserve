import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/api/auth";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
      console.error("Usage: npm run create-admin <username> <password>");
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      console.error(`Admin with username "${username}" already exists`);
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the admin
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        status: "ACTIVE",
      },
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`Username: ${admin.username}`);
    console.log(`ID: ${admin.id}`);
    console.log(`Status: ${admin.status}`);
    console.log(`Created at: ${admin.createdAt}`);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();


import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { z } from "zod";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PrismaClient } from "../generated/prisma/client";

const adminSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password cannot exceed 72 characters.")
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password cannot exceed 72 bytes."
    ),
});

async function main() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  let prisma: PrismaClient | undefined;

  try {
    console.log("\n======================================");
    console.log("       LINKLEDGER ADMIN CREATION");
    console.log("======================================\n");

    const adminNameInput = await rl.question("Admin name: ");
    const adminEmailInput = await rl.question("Admin email: ");

    const passwordInput = await new Promise<string>((resolve) => {
      stdout.write("Admin password (16-72 characters): ");

      let password = "";

      if (stdin.isTTY) {
        stdin.setRawMode(true);
      }

      const onData = (key: Buffer) => {
        const char = key.toString();

        if (char === "\u0003") {
          stdin.off("data", onData);

          if (stdin.isTTY) stdin.setRawMode(false);

          stdout.write("\n");
          process.exit(130);
        }

        if (char === "\r" || char === "\n") {
          stdin.off("data", onData);

          if (stdin.isTTY) stdin.setRawMode(false);

          stdout.write("\n");
          resolve(password);
          return;
        }

        if (char === "\u007f" || char === "\b") {
          password = password.slice(0, -1);
          return;
        }

        if (char.length === 1 && char >= " ") {
          password += char;
        }
      };

      stdin.on("data", onData);
    });

    const validation = adminSchema.safeParse({
      name: adminNameInput,
      email: adminEmailInput,
      password: passwordInput,
    });

    if (!validation.success) {
      console.error("\nValidation failed:");

      validation.error.issues.forEach((issue) => {
        console.error(`- ${issue.message}`);
      });

      process.exitCode = 1;
      return;
    }

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is missing from .env.");
    }

    const parsedUrl = new URL(databaseUrl);

    if (parsedUrl.protocol !== "mysql:") {
      throw new Error("Only MySQL DATABASE_URL is supported.");
    }

    prisma = new PrismaClient({
      adapter: new PrismaMariaDb({
        host: parsedUrl.hostname,
        port: Number(parsedUrl.port || 3306),
        user: decodeURIComponent(parsedUrl.username),
        password: decodeURIComponent(parsedUrl.password),
        database: decodeURIComponent(parsedUrl.pathname.slice(1)),
        connectionLimit: 2,
      }),
    });

    const {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
    } = validation.data;

    console.log("\nConnecting to database...");

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        role: true,
      },
    });

    if (existingUser) {
      throw new Error(
        existingUser.role === "ADMIN"
          ? "An admin account with this email already exists."
          : "This email belongs to a non-admin user. Role conversion is not allowed."
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        fullName: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        country: "Not specified",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log("\n======================================");
    console.log("       ADMIN CREATED SUCCESSFULLY");
    console.log("======================================");
    console.log(`Admin ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log("\nYou can now log in using your admin credentials.");
  } finally {
    rl.close();
    await prisma?.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    "\nAdmin creation failed:",
    error instanceof Error ? error.message : error
  );

  process.exitCode = 1;
});

"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: unknown) {
  const result = registerSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues?.[0]?.message || "Invalid input data",
    };
  }

  const { name, email, password } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return {
      success: true,
      message: "Account created successfully! Please sign in.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Something went wrong creating your account. Please try again.",
    };
  }
}

export async function loginUser(formData: unknown) {
  const result = loginSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues?.[0]?.message || "Invalid email or password",
    };
  }

  const { email, password } = result.data;

  try {
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Authentication failed. Please try again." };
      }
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

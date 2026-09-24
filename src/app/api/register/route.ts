import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return NextResponse.json(
      { success: true, message: "Account created successfully!" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("API Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error during registration.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

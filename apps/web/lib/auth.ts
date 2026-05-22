import type { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
  nativeLanguage: z.enum(["ko", "en", "zh"])
});

type RegisterInput = z.infer<typeof registerSchema>;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function registerUser(prisma: PrismaClient, input: RegisterInput) {
  const data = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    throw new Error("Email is already registered");
  }

  return prisma.user.create({
    data: {
      email: data.email,
      password_hash: await hashPassword(data.password),
      profile: { create: { display_name: data.displayName, native_language: data.nativeLanguage } },
      roles: { create: { role: "user" } },
      settings: {
        create: {
          target_language: data.nativeLanguage,
          level: "beginner",
          goal: "Everyday conversation",
          default_speed: 1,
          theme: "system"
        }
      }
    }
  });
}

export async function authenticateUser(prisma: PrismaClient, email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email, deleted_at: null },
    include: { roles: true }
  });

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: resolveRole(user.roles.map((role) => role.role))
  };
}

export type SessionLike = {
  user?: {
    id?: string;
    email?: string | null;
    role?: UserRole | string;
  };
} | null;

export async function requireAdminApi(session: SessionLike) {
  if (session?.user?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response("OK", { status: 200 });
}

export function maskSecret(secret: string | null | undefined) {
  if (!secret) {
    return "";
  }

  const prefix = secret.startsWith("sk-") ? "sk-" : "";
  return `${prefix}•••••${secret.slice(-4)}`;
}

function resolveRole(roles: UserRole[]): UserRole {
  return roles.includes("admin") ? "admin" : "user";
}

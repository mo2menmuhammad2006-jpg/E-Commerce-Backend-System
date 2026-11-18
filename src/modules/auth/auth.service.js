import { prisma } from "../../configs/db.js";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/appError.js";

export class AuthService {
  #prisma;

  constructor({ prisma: prismaClient = prisma } = {}) {
    this.#prisma = prismaClient;
  }

  static async revokeAllUserSessions(userId) {
    await prisma.$executeRaw`
      DELETE FROM "session" WHERE (sess->>'userId') = ${userId}
    `;
  }

  async register({ first_name, last_name, phone, email, password }) {
    const userExists = await this.#prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new AppError(409, "user with this email already exists", "CONFLICT");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.#prisma.user.create({
      data: {
        first_name,
        last_name,
        phone,
        email,
        password_hash: hashedPassword,
      },
      select: { id: true, email: true, role: true },
    });
  }

  async login({ email, password }) {
    const user = await this.#prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, password_hash: true, is_active: true },
    });

    if (!user) {
      throw new AppError(401, "invalid email or password", "UNAUTHORIZED");
    }

    if (!user.is_active) throw new AppError(401, "your account isn't activated", "UNAUTHORIZED");

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(401, "invalid email or password", "UNAUTHORIZED");
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await this.#prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(401, "user does not exist", "UNAUTHORIZED");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(401, "current password is incorrect", "UNAUTHORIZED");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.#prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });

    await AuthService.revokeAllUserSessions(userId);
  }

  async getProfile(userId) {
    const user = await this.#prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, first_name: true, last_name: true, phone: true },
    });
    if (!user) {
      throw new AppError(404, "user not found", "NOT_FOUND");
    }

    return user;
  }

  async updateProfile(userId, { first_name, last_name, phone }) {
    const user = await this.#prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, "user not found", "NOT_FOUND");
    }

    return this.#prisma.user.update({
      where: { id: userId },
      data: { first_name, last_name, phone },
      select: { id: true, email: true, role: true, first_name: true, last_name: true, phone: true },
    });
  }
}

export const authService = new AuthService();

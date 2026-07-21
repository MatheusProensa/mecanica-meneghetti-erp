import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 15;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const emailRaw = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!emailRaw || !password) return null;
        const email = emailRaw.trim().toLowerCase();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const agora = new Date();
        if (user.lockedUntil && user.lockedUntil > agora) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          const tentativas = user.failedLoginAttempts + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: tentativas,
              lockedUntil:
                tentativas >= MAX_TENTATIVAS
                  ? new Date(agora.getTime() + BLOQUEIO_MINUTOS * 60 * 1000)
                  : null,
            },
          });
          return null;
        }

        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});

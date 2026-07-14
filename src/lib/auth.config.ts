import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;

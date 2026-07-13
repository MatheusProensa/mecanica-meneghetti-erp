import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
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

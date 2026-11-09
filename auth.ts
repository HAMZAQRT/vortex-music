import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "./lib/db/prisma";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId:
        process.env.AUTH_GITHUB_ID,
      clientSecret:
        process.env.AUTH_GITHUB_SECRET,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({
      token,
    }) {
      const roleToken =
        token as typeof token & {
          role?: string;
        };

      if (!roleToken.role) {
        roleToken.role = "USER";
      }

      return roleToken;
    },

    async session({
      session,
      token,
    }) {
      if (
        session.user &&
        token.sub
      ) {
        session.user.id =
          token.sub;
      }

      const sessionUser =
        session.user as typeof session.user & {
          role: "USER" | "CREATOR" | "ARTIST" | "MODERATOR" | "ADMIN";
        };

      const roleToken =
        token as typeof token & {
          role?: "USER" | "CREATOR" | "ARTIST" | "MODERATOR" | "ADMIN";
        };

      sessionUser.role =
        roleToken.role ?? "USER";

      return session;
    },
  },
});

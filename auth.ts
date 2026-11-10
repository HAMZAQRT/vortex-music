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
      user,
    }) {
      const roleToken =
        token as typeof token & {
          role?: "USER" | "CREATOR" | "ARTIST" | "MODERATOR" | "ADMIN";
        };

      const userId =
        user?.id ??
        token.sub;

      if (userId) {
        const databaseUser =
          await prisma.user.findUnique({
            where: {
              id: userId,
            },
            select: {
              role: true,
            },
          });

        roleToken.role =
          databaseUser?.role ??
          "USER";
      } else {
        roleToken.role =
          roleToken.role ??
          "USER";
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

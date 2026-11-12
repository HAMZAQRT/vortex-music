import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "./lib/db/prisma";

type VortexRole =
  | "USER"
  | "CREATOR"
  | "ARTIST"
  | "MODERATOR"
  | "ADMIN";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),

    Credentials({
      id: "credentials",
      name: "Email and Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials.password === "string"
            ? credentials.password
            : "";

        if (
          !email ||
          !password ||
          Buffer.byteLength(password, "utf8") > 72
        ) {
          return null;
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email,
            },
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
              passwordHash: true,
              role: true,
            },
          });

        if (!user?.passwordHash) {
          return null;
        }

        const valid =
          await bcrypt.compare(
            password,
            user.passwordHash,
          );

        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          name:
            user.name ??
            user.username ??
            "Vortex User",
          email: user.email,
          image: user.image,
        };
      },
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
          role?: VortexRole;
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
          role: VortexRole;
        };

      const roleToken =
        token as typeof token & {
          role?: VortexRole;
        };

      sessionUser.role =
        roleToken.role ??
        "USER";

      return session;
    },
  },
});

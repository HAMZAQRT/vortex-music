import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
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

      return session;
    },
  },
});

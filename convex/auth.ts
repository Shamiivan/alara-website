import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async redirect({ redirectTo }) {
      // get the base URL of the site from the env
      const baseUrl = process.env.SITE_URL || "http://localhost:3000";
      return `${baseUrl}${redirectTo}`;
    }
  }
});
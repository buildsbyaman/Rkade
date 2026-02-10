import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { authenticateUser, getUserByEmail, createUser } from "@/lib/auth";
import { signInSchema } from "@/lib/schemas";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const validatedCredentials = signInSchema.parse(credentials);
          const user = await authenticateUser(
            validatedCredentials.email,
            validatedCredentials.password,
          );

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
            };
          }
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered", {
        provider: account?.provider,
        email: user.email,
      });

      if (account?.provider === "google") {
        try {
          const existingUser = await getUserByEmail(user.email!);

          if (!existingUser) {
            // Create a new user for Google sign-in
            const names = user.name?.split(" ") || ["", ""];
            const firstName = names[0] || "";
            const lastName = names.slice(1).join(" ") || "";

            console.log("Creating new Google user:", user.email);

            const newUser = await createUser({
              email: user.email!,
              password: "", // Empty password for OAuth users (won't be hashed)
              firstName,
              lastName,
              countryCode: "+1",
              phoneNumber: "",
              country: "",
              currentCity: "",
              profilePictureUrl: user.image || undefined,
            });

            if (!newUser) {
              console.error(
                "Failed to create user for Google sign-in:",
                user.email,
              );
              return false;
            }

            console.log("Successfully created Google user:", user.email);
          } else {
            console.log("Existing Google user found:", user.email);
          }
          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
      }
      
      // For Google OAuth users, fetch role from database on every token refresh
      // This ensures staff role is picked up even if user existed before assignment
      if (account?.provider === "google" || !token.role) {
        try {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error fetching user role in JWT callback:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        if (url === "/") return `${baseUrl}/events`;
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        if (url === baseUrl || url === baseUrl + "/")
          return `${baseUrl}/events`;
        return url;
      }
      return `${baseUrl}/events`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutes for OAuth state
      },
    },
  },
  // Enable debug only when NEXTAUTH_DEBUG is explicitly set to the string "true".
  // This prevents NextAuth from logging the DEBUG_ENABLED warning when NODE_ENV
  // is development on some hosts where you don't want NextAuth debug output.
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, metadata) => {
      console.error("NextAuth Error:", code, metadata);
    },
    warn: (code) => {
      console.warn("NextAuth Warning:", code);
    },
    debug: (code, metadata) => {
      console.log("NextAuth Debug:", code, metadata);
    },
  },
};

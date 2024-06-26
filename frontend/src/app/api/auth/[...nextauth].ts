

// import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions }
  from 'next-auth';


// Next-Auth configuration; Define Authentication logic here. The Google Provider has been already defined
export const authConfig: NextAuthOptions = {
  providers: [
    // IF WRITING CUSTOM CREDENTIALS PROVIDER UNCOMMENT CODE AND USE AS A BASIS

    /*CredentialsProvider({
      name: "Sign In",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password)
          return null;

        const dbUser = await {}.user.findFirst({
          where: { email: credentials.email },
        });
        
        // USE BCRYPT
        if (dbUser && dbUser.password === credentials.password) {
          const { password, createdAt, id, ...dbUserWithoutPassword } = dbUser;
          return dbUserWithoutPassword as User;
        }

        return null;
      },
    }),*/

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (user?.email?.endsWith("@tamu.edu")) return true;

      return "/login";
    }
  },
};
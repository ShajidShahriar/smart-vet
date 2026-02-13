import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-client";

const clientId = process.env.GOOGLE_CLIENT_ID;
console.log("DEBUG: GOOGLE_CLIENT_ID loaded:", clientId ? clientId.substring(0, 15) + "..." : "undefined");

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        async session({ session, user }) {
            if (session.user) {
                // Add custom fields to the session user object if needed
                // For example, if we extended the user model with jobTitle
                // session.user.jobTitle = user.jobTitle; // Logic depends on how adapter populates session
                // However, with database sessions, `user` object comes from DB.
                // Let's ensure we can access the ID at least.
                session.user.id = user.id;

                // standard user object from adapter already has name, email, image
            }
            return session;
        },
    },
    pages: {
        signIn: "/", // Redirect to home if sign in page is accessed directly, we use modal/button
    },
});

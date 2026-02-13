# Deployment Guide

This project is built with Next.js and is optimized for deployment on Vercel.

## Prerequisites

- A [Vercel Account](https://vercel.com)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database
- A [Google Cloud Console](https://console.cloud.google.com/) project for OAuth
- A [Google AI Studio](https://aistudio.google.com/) API Key for Gemini

## Environment Variables

The following environment variables are required for the application to function correctly. You must add these in the Vercel project settings under **Settings > Environment Variables**.

| Variable Name           | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `MONGODB_URI`           | Connection string for your MongoDB database.                                |
| `GEMINI_API_KEY`        | API Key for Google's Gemini AI.                                             |
| `GOOGLE_CLIENT_ID`      | OAuth Client ID from Google Cloud Console.                                  |
| `GOOGLE_CLIENT_SECRET`  | OAuth Client Secret from Google Cloud Console.                              |
| `NEXTAUTH_SECRET`       | A strong random string for NextAuth.js encryption. You can generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL`          | The canonical URL of your site (e.g., `https://your-project.vercel.app`). Auto-detected on Vercel but good to set for production. |

## Deployment Steps

1.  **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2.  **Import to Vercel**:
    - Go to your Vercel Dashboard.
    - Click **Add New...** -> **Project**.
    - Import the `smart-vet` repository.
3.  **Configure Project**:
    - Framework Preset: **Next.js** (Default)
    - Root Directory: `./` (Default)
    - **Environment Variables**: Add all the variables listed above.
4.  **Deploy**: Click **Deploy**. Vercel will build and deploy your application.

## Troubleshooting

-   **Build Failures**: Check the build logs in Vercel. Ensure all dependencies are installed and there are no type errors locally using `npm run build`.
-   **Database Connection**: Ensure your MongoDB Atlas cluster allows connections from all IPs (`0.0.0.0/0`) or whitelist Vercel's IP addresses (advanced).
-   **OAuth Errors**: Ensure your Google Cloud Console "Authorized redirect URIs" includes your Vercel deployment URL (e.g., `https://your-project.vercel.app/api/auth/callback/google`).

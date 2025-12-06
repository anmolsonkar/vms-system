/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable TypeScript and ESLint checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add fetch timeouts
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // Increase serverless function timeout
  serverRuntimeConfig: {
    timeout: 60, // seconds
  },

  // Environment variables
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,
    TWILIO_APPROVAL_TEMPLATE_SID: process.env.TWILIO_APPROVAL_TEMPLATE_SID,
    FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY,
  },
};

export default nextConfig;

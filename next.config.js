/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_ENABLE_GPT5: process.env.NEXT_PUBLIC_ENABLE_GPT5 || 'true',
  },
}
module.exports = nextConfig
// Developed by: Kalidas KJ
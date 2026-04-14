/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable middleware and server features
  // Use 'npm run build' for production builds
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

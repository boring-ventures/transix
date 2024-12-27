const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.plugins = config.plugins || []
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig) 
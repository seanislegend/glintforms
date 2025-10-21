import {withSentryConfig} from '@sentry/nextjs';

const securityHeaders = [
    {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
    {key: 'X-Content-Type-Options', value: 'nosniff'},
    {key: 'X-Frame-Options', value: 'DENY'},
    {key: 'X-XSS-Protection', value: '1; mode=block'},
    {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com https://*.sentry.io; worker-src 'self' blob:; frame-src 'self' https://*.sentry.io;"
    }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [{source: '/:path*', headers: securityHeaders}];
    },
    experimental: {
        optimizePackageImports: ['@phosphor-icons/react'],
        serverComponentsHmrCache: true,
        turbopackFileSystemCacheForDev: true
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000
    },
    onDemandEntries: {
        maxInactiveAge: 15 * 60 * 1000,
        pagesBufferLength: 6
    },
    reactCompiler: true,
    reactStrictMode: true,
    transpilePackages: ['@glint/database', '@glint/form', '@glint/ui']
};

export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options
    org: process.env.SENTRY_ORG,
    project: 'javascript-nextjs',
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true
});

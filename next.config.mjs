import { DefaultChain } from './.cache/chains.mjs'

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  productionBrowserSourceMaps: true,
  async rewrites() {
    return [
      {
        source: '/:chain/asset/:assetId/buy',
        destination: '/:chain/asset/:assetId',
      },
      {
        source: '/:chain/collection/:contract/sweep',
        destination: '/:chain/collection/:contract',
      },
      {
        source: '/:chain/collection/:contract/mint',
        destination: '/:chain/collection/:contract',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: `/${DefaultChain.routePrefix}`,
        permanent: false,
      },
      {
        source: '/collection/:chain/:collection',
        destination: '/:chain/collection/:collection',
        permanent: true,
      },
      {
        source: '/collection/:chain/:collection/:tokenId',
        destination: '/:chain/asset/:collection%3A:tokenId',
        permanent: true,
      },
      {
        source: '/collection-rankings',
        destination: `/${DefaultChain.routePrefix}/collection-rankings`,
        permanent: true,
      },

      {
        source: '/:chain/collection-rankings',
        destination: `/:chain/collections/trending`,
        permanent: false,
      },
    ]
  },
}

export default nextConfig

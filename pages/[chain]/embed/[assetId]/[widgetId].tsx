import {
  TokenMedia,
  useAttributes,
  useBids,
  useCollections,
  useDynamicTokens,
  useListings,
  useUserTokens,
} from '@reservoir0x/reservoir-kit-ui'
import { paths } from '@reservoir0x/reservoir-sdk'
import { OpenSeaVerified } from 'components/common/OpenSeaVerified'
import { Box, Flex, Text } from 'components/primitives'
import FullscreenMedia from 'components/token/FullscreenMedia'
import { PriceData } from 'components/token/PriceData'
import { TokenActions } from 'components/token/TokenActions'
import { ToastContext } from 'context/ToastContextProvider'
import { useENSResolver, useMounted } from 'hooks'
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { useRouter } from 'next/router'
import { NORMALIZE_ROYALTIES } from 'pages/_app'
import { useContext, useEffect, useState } from 'react';
import { jsNumberForAddress } from 'react-jazzicon'
import Jazzicon from 'react-jazzicon/dist/Jazzicon'
import { useMediaQuery } from 'react-responsive'
import supportedChains, { DefaultChain } from 'utils/chains'
import fetcher from 'utils/fetcher'
import { useAccount } from 'wagmi'
import { Head } from 'components/Head'
import { getCurrentTab } from '../../../../utils/router';
import { xata } from '../../../../utils/db';
import _omit from 'lodash/omit';
import { AssetWidget } from '../../../../types/widget';

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const containerStyles = {
  flexDirection: 'row',
  gap: 40,
  alignItems: 'flex-start',
};

const IndexPage: NextPage<Props> = ({ assetId, widget, feesOnTopBps, ssr }) => {
  const assetIdPieces = assetId ? assetId.toString().split(':') : []
  let collectionId = assetIdPieces[0]
  const id = assetIdPieces[1]
  const router = useRouter()
  const { addToast } = useContext(ToastContext)
  const account = useAccount()
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 900 }) && isMounted
  const isDefaultVerticalLayout = widget?.defaultLayout === 'vertical';
  const [tabValue, setTabValue] = useState(getCurrentTab() ?? 'info')

  const contract = collectionId ? collectionId?.split(':')[0] : undefined

  const { data: tokens, mutate } = useDynamicTokens(
    {
      tokens: [`${contract}:${id}`],
      includeAttributes: true,
      includeTopBid: true,
      includeQuantity: true,
    },
    {
      fallbackData: [ssr.tokens],
    }
  )

  const token = tokens && tokens[0] ? tokens[0] : undefined
  const is1155 = token?.token?.kind === 'erc1155'

  const { data: collections } = useCollections(
    {
      id: token?.token?.collection?.id,
    },
    {
      fallbackData: [ssr.collection],
    }
  )
  const collection = collections && collections[0] ? collections[0] : null

  const { data: userTokens } = useUserTokens(
    is1155 ? account.address : undefined,
    {
      tokens: [`${contract}:${id}`],
    }
  )

  const { data: offers } = useBids({
    token: `${token?.token?.collection?.id}:${token?.token?.tokenId}`,
    includeRawData: true,
    sortBy: 'price',
    limit: 1,
  })

  const { data: listings } = useListings({
    token: `${token?.token?.collection?.id}:${token?.token?.tokenId}`,
    includeRawData: true,
    sortBy: 'price',
    limit: 1,
  })

  const offer = offers && offers[0] ? offers[0] : undefined
  const listing = listings && listings[0] ? listings[0] : undefined

  const attributesData = useAttributes(collectionId)

  let countOwned = 0
  if (is1155) {
    countOwned = Number(userTokens?.[0]?.ownership?.tokenCount || 0)
  } else {
    countOwned =
      token?.token?.owner?.toLowerCase() === account?.address?.toLowerCase()
        ? 1
        : 0
  }

  const isOwner = countOwned > 0
  const owner = isOwner ? account?.address : token?.token?.owner
  const { displayName: ownerFormatted } = useENSResolver(token?.token?.owner)

  const tokenName = `${token?.token?.collection?.name} ${token?.token?.name || `#${token?.token?.tokenId}`}`

  useEffect(() => {
    const updatedUrl = new URL(`${window.location.origin}${router.asPath}`)
    updatedUrl.searchParams.set('tab', tabValue)
    router.replace(updatedUrl, undefined, {
      shallow: true,
    })
  }, [tabValue])

  const pageTitle = token?.token?.name
    ? token.token.name
    : `${token?.token?.tokenId} - ${token?.token?.collection?.name}`

  return (
    <Box
      css={{
        height: '100%',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <Box css={{ maxWidth: 400, mx: 'auto' }}>
        <main>
          <Head
            ogImage={token?.token?.image || collection?.banner}
            title={pageTitle}
            description={collection?.description as string}
          />

          <Flex
            justify="center"
            css={{
              marginLeft: 'auto',
              marginRight: 'auto',
              gap: 20,
              flexDirection: 'column',
              alignItems: 'center',
              pt: "$2",
              ...(isDefaultVerticalLayout ? {} : { "@md": containerStyles }),
            }}
          >
            <Flex
              direction="column"
              css={{
                flex: 1,
                width: '100%',
                position: 'relative',
                '@sm': {
                  '>button': {
                    height: 0,
                    opacity: 0,
                    transition: 'opacity .3s',
                  },
                },
                ':hover >button': {
                  opacity: 1,
                  transition: 'opacity .3s',
                },
              }}
            >
              <Box
                css={{
                  backgroundColor: '$gray3',
                  '@sm': {
                    button: {
                      height: 0,
                      opacity: 0,
                      transition: 'opacity .3s',
                    },
                  },
                  maxHeight: "50vh",
                  '@md': {
                    maxHeight: "initial",
                  },
                  ':hover button': {
                    opacity: 1,
                    transition: 'opacity .3s',
                  },
                }}
              >
                <TokenMedia
                  token={token?.token}
                  videoOptions={{ autoPlay: true, muted: true }}
                  style={{
                    width: 'auto',
                    height: 'auto',
                    overflow: 'hidden',
                    maxHeight: "50vh",
                    margin: 'auto',
                  }}
                  onRefreshToken={() => {
                    mutate?.()
                    addToast?.({
                      title: 'Refresh token',
                      description: 'Request to refresh this token was accepted.',
                    })
                  }}
                />
                <FullscreenMedia token={token} />
              </Box>
            </Flex>


            <Flex
              direction="column"
              css={{
                flex: 1,
                px: '$3',
                width: '100%',
                '@md': {
                  px: 0,
                  overflow: 'hidden',
                },
              }}
            >
              <Flex align="center" css={{ gap: '$2' }}>
                <Text style="h4" css={{ wordBreak: 'break-all' }}>
                  {tokenName}
                </Text>
                <OpenSeaVerified
                  openseaVerificationStatus={
                    collection?.openseaVerificationStatus
                  }
                />
              </Flex>

              {token && (
                <>
                  {!is1155 && (
                    <Flex align="center" css={{ mt: '$2' }}>
                      <Text style="subtitle3" color="subtle" css={{ mr: '$2' }}>
                        Owner
                      </Text>
                      <Jazzicon
                        diameter={16}
                        seed={jsNumberForAddress(owner || '')}
                      />
                      <Text style="subtitle3" color="subtle" css={{ ml: '$1' }}>
                        {isMounted ? ownerFormatted : ''}
                      </Text>
                    </Flex>
                  )}
                  <PriceData token={token} />

                  {isMounted && (
                    <TokenActions
                      feesOnTopBps={feesOnTopBps}
                      addToCartEnabled={false}
                      resellEnabled={false}
                      biddingEnabled={false}
                      onResellClick={() => {
                        setTabValue('resell');
                      }}
                      token={token}
                      offer={offer}
                      listing={listing}
                      isOwner={isOwner}
                      mutate={mutate}
                      account={account}
                    />
                  )}
                </>
              )}
            </Flex>
          </Flex>
        </main>
      </Box>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps<{
  assetId?: string
  widget: AssetWidget | null
  feesOnTopBps: string[]
  ssr: {
    collection: paths['/collections/v6']['get']['responses']['200']['schema']
    tokens: paths['/tokens/v6']['get']['responses']['200']['schema']
  }
}> = async ({ params }) => {
  const assetId = params?.assetId ? params.assetId.toString().split(':') : []
  let collectionId = assetId[0]
  const id = assetId[1]
  const { reservoirBaseUrl, apiKey } =
  supportedChains.find((chain) => params?.chain === chain.routePrefix) ||
  DefaultChain

  const contract = collectionId ? collectionId?.split(':')[0] : undefined

  const headers = {
    headers: {
      'x-api-key': apiKey || '',
    },
  }

  let tokensQuery: paths['/tokens/v6']['get']['parameters']['query'] = {
    tokens: [`${contract}:${id}`],
    includeAttributes: true,
    includeTopBid: true,
    normalizeRoyalties: NORMALIZE_ROYALTIES,
    includeDynamicPricing: true,
  }

  const tokensPromise = fetcher(
    `${reservoirBaseUrl}/tokens/v6`,
    tokensQuery,
    headers
  )

  const tokensResponse = await tokensPromise
  const tokens = tokensResponse.data
    ? (tokensResponse.data as Props['ssr']['tokens'])
    : {}

  let collectionQuery: paths['/collections/v6']['get']['parameters']['query'] =
    {
      id: tokens?.tokens?.[0]?.token?.collection?.id,
      // includeTopBid: true,
      normalizeRoyalties: NORMALIZE_ROYALTIES,
    }

  const collectionsPromise = fetcher(
    `${reservoirBaseUrl}/collections/v6`,
    collectionQuery,
    headers
  )

  const collectionsResponse = await collectionsPromise
  const collection = collectionsResponse.data
    ? (collectionsResponse.data as Props['ssr']['collection'])
    : {}

  let widget = await xata.db.assetEmbedding
    .select(['sendFeeToWalletAddress', 'resellingFeePercentage', 'defaultLayout'])
    .filter({
      id: params?.widgetId as string,
    })
    .getFirst() as AssetWidget;


  if (widget) {
    // the xata fields are not serializable, and we don't need them here
    widget = _omit(widget, 'xata') as AssetWidget;
  }

  const platformPercentage = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE as string);
  const platformWalletAddress = process.env.NEXT_PUBLIC_SEND_PLATFORM_FEES_TO_WALLET_ADDRESS;

  const platformFeePercentage = !isNaN(platformPercentage)
    ? platformPercentage * 100
    : 0;
  const platformFeeOnTop = platformFeePercentage > 0 ? `${platformWalletAddress}:${platformFeePercentage}` : ""

  const resellingFeePercentage = typeof widget.resellingFeePercentage === 'number' && !isNaN(widget.resellingFeePercentage)
    ? widget.resellingFeePercentage * 100
    : 0;
  const resellingFeeOnTop = resellingFeePercentage > 0 && widget.sendFeeToWalletAddress ? `${widget.sendFeeToWalletAddress}:${resellingFeePercentage}` : "";

  return {
    props: {
      assetId: params?.assetId as string,
      widget,
      feesOnTopBps: [platformFeeOnTop, resellingFeeOnTop].filter(Boolean),
      ssr: { collection, tokens },
    },
  }
}

export default IndexPage

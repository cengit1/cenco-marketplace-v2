import {
  useDynamicTokens,
} from '@reservoir0x/reservoir-kit-ui';
import React, { FC, useMemo } from 'react'
import dayjs from 'dayjs'
import {
  Text,
  Flex,
  TableCell,
  TableRow,
  Button, Tooltip,
} from '../primitives';
import { useENSResolver } from 'hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import Img from 'components/primitives/Img'
import optimizeImage from 'utils/optimizeImage'
import { FullAssetWidget } from '../../types/widget';
import { useRouter } from 'next/router';

type TableClientProps = {
  items?: (
    FullAssetWidget & {
    xata: {
      createdAt: string,
      updatedAt: string,
      version: number
    }
  }
    )[];
}

export const ResellingItemsTable: FC<TableClientProps> = ({ items }) => {
  return (
    <>
      {items?.length === 0 ? (
        <Flex direction="column" align="center" css={{ py: '$6', gap: '$4' }}>
          <img src="/icons/activity-icon.svg" width={40} height={40} />
          <Text>No items yet</Text>
        </Flex>
      ) : (
        <Flex direction="column" css={{ width: '100%', pb: '$2' }}>
          {items?.map((resellingItem, i) => {

            return (
              <ActivityTableRow
                key={resellingItem.id}
                resellingItem={resellingItem}
              />
            )
          })}
        </Flex>
      )}
    </>
  )
}

type ActivityTableRowProps = {
  resellingItem: (
    FullAssetWidget & {
    xata: {
      createdAt: string,
      updatedAt: string,
      version: number
    }
  }
    )
}

const ActivityTableRow: FC<ActivityTableRowProps> = ({ resellingItem }) => {
  const router = useRouter()
  const { data: tokenData} = useDynamicTokens(
    {
      tokens: [`${resellingItem.assetAddress}:${resellingItem.assetTokenId}`],
      includeAttributes: true,
      includeTopBid: false,
      includeQuantity: false,
    },
  )

  const token = tokenData && tokenData[0] ? tokenData[0] : undefined

  const imageSrc = useMemo(() => {
    return optimizeImage(
      token?.token?.tokenId
        ? token.token.image || token.token.collection?.image
        : token?.token?.collection?.image,
      150
    )
  }, [
    token
  ])

  function goToItemPage() {
    const url = `/${resellingItem.chain}/asset/${resellingItem.assetAddress}:${resellingItem.assetTokenId}?tab=resell`
    router.push(url);
  }

  const { displayName: sendFeeToWalletAddress } = useENSResolver(resellingItem?.sendFeeToWalletAddress)
  return (
    <TableRow
      key={resellingItem.id}
      css={{ gridTemplateColumns: '1.5fr 1fr .9fr .9fr .9fr .5fr' }}
    >
      <TableCell css={{ minWidth: 0 }}>
        <Flex align="center">
          {imageSrc && (
            <Img
              style={{ borderRadius: '4px', objectFit: 'cover' }}
              loader={({ src }) => src}
              src={imageSrc}
              alt="reselling Token Image"
              width={48}
              height={48}
            />
          )}
          <Flex
            align="start"
            direction="column"
            css={{ ml: '$2' }}
            style={{ maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}
          >
            <Text ellipsify css={{ fontSize: '14px' }}>
              {token?.token?.collection?.name} {token?.token?.name ||
              token?.token?.tokenId}
            </Text>
          </Flex>
        </Flex>
      </TableCell>

      <TableCell css={{ color: '$gray11', minWidth: 0 }}>
        <Flex align="center" title={resellingItem.id}>
          <Text
            style="subtitle1"
            ellipsify
            css={{
              ml: '$2',
              color: '$gray11',
              fontSize: '14px',
              cursor: 'default',
            }}
          >
            {`${resellingItem.assetAddress}:${resellingItem.assetTokenId}`}
          </Text>
        </Flex>
      </TableCell>

      <TableCell>
        {resellingItem.resellingFeePercentage ? (
          <Text style="subtitle3" color="subtle">
            Added fee: ${resellingItem.resellingFeePercentage}%
          </Text>
        ) : (
          <span>-</span>
        )}
      </TableCell>

      <TableCell css={{ minWidth: 0 }}>
        {sendFeeToWalletAddress ? (
          <Flex direction="column" align="start">
            <Text style="subtitle3" color="subtle">
              Fees to wallet:
            </Text>
            <Text
              style="subtitle1"
              ellipsify
              css={{
                color: '$gray11',
                fontSize: '12px',
                cursor: 'default',
              }}
            >
              {sendFeeToWalletAddress}
            </Text>
          </Flex>
        ) : (
          <span>-</span>
        )}
      </TableCell>

      <TableCell css={{ minWidth: 0 }}>
        <Flex align="center" justify="end" css={{ gap: '$3' }}>
          <Text style="subtitle3" color="subtle" ellipsify>
            Created: {dayjs(resellingItem?.xata.createdAt).format("MM-DD-YYYY")}
          </Text>
        </Flex>
      </TableCell>
      <TableCell css={{ minWidth: 0 }}>
        <Flex align="center" justify="end" css={{ gap: '$3' }}>
          <Tooltip
            content={
              <Text style="body3" css={{ display: 'block' }}>
                Go to item page
              </Text>
            }
          >
            <Button
              onClick={goToItemPage}
              color="gray3"
              size="xs"
              css={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faArrowRight} width={10} height={10} />
            </Button>
          </Tooltip>
        </Flex>
      </TableCell>
    </TableRow>
  )
}

"use client";

import React from 'react';
import { Avatar } from './primitives/Avatar';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import { jsNumberForAddress } from 'react-jazzicon';
import CopyText from './common/CopyText';
import { Flex, Text } from './primitives';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { useENSResolver } from '../hooks';
import { useAccount } from 'wagmi';
export function EnsAvatar() {
  const { address } = useAccount()
  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(address)
  return (
    <>
      {ensAvatar && (
        <Avatar size="medium" src={ensAvatar} />
      )}
      {!ensAvatar && address && (
        <Jazzicon
          diameter={44}
          seed={jsNumberForAddress(address as string)}
        />
      )}
      <CopyText
        text={address || ''}
        css={{ width: 'max-content' }}
      >
        <Flex direction="column">
          <Flex
            align="center"
            css={{
              gap: 10,
              color: '$gray11',
              cursor: 'pointer',
            }}
          >
            <Text style="body1">
              {shortEnsName ? shortEnsName : shortAddress}
            </Text>
            {!shortEnsName ? (
              <FontAwesomeIcon
                icon={faCopy}
                width={16}
                height={16}
              />
            ) : null}
          </Flex>
          {shortEnsName ? (
            <Flex
              align="center"
              css={{
                gap: 10,
                color: '$gray11',
                cursor: 'pointer',
              }}
            >
              <Text style="body2" color="subtle">
                {shortAddress}
              </Text>
              <FontAwesomeIcon
                icon={faCopy}
                width={16}
                height={16}
              />
            </Flex>
          ) : null}
        </Flex>
      </CopyText>
    </>
  );
}

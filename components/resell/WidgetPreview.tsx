import React from 'react';
import { Box, Button, Flex, Text, Tooltip } from '../primitives';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

type Props = {
  code: string
  url: string
  onCopyWidget: () => void
  onCopyUrl: () => void
};

export function WidgetPreview({ code, url, onCopyWidget, onCopyUrl }: Props) {
  return (
    <>
      <Flex css={{ background: '$gray2', borderRadius: 10, padding: "0 $5", paddingBottom: "$5", paddingTop: "$4",  wordBreak: "break-all", position: 'relative', flexDirection: "column", marginTop: "$5" }}>
        <Text style="h4" css={{ marginBottom: "$3" }}>
          Embed widget
        </Text>
        <Tooltip
          content={
            <Text style="body3" as="p">
              Copy widget embeddable code.
            </Text>
          }
        >
          <Button
            onClick={onCopyWidget}
            color="gray3"
            size="xs"
            css={{ cursor: 'pointer', position: "absolute", "top": 0, right: 0 }}
          >
            Copy <FontAwesomeIcon icon={faCopy} width={10} height={10} />
          </Button>
        </Tooltip>
        <Box>
          {code}
        </Box>
      </Flex>


      <Flex css={{ background: '$gray2', borderRadius: 10, padding: "0 $5", paddingBottom: "$5", paddingTop: "$4",  wordBreak: "break-all", position: 'relative', flexDirection: "column", marginTop: "$5" }}>
        <Text style="h4" css={{ marginBottom: "$3" }}>
          Embed link
        </Text>
        <Tooltip
          content={
            <Text style="body3" as="p">
              Copy widget shareable url.
            </Text>
          }
        >
          <Button
            onClick={onCopyUrl}
            color="gray3"
            size="xs"
            css={{ cursor: 'pointer', position: "absolute", "top": 0, right: 0 }}
          >
            Copy <FontAwesomeIcon icon={faCopy} width={10} height={10} />
          </Button>
        </Tooltip>
        <Box>
          {url}
        </Box>
      </Flex>
    </>
  );
}

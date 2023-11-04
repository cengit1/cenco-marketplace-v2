import React, { ComponentProps, FC } from 'react'
import { Button, Text, Tooltip } from 'components/primitives';
import { CSS } from '@stitches/react'
type Props = {
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
}
const Resell: FC<Props> = ({
                             buttonCss,
                             buttonProps,
                           }) => {
  return (
    <Tooltip
      content={
        <Text style="body3" css={{ display: 'block' }}>
          Resell NFT
        </Text>
      }
    >
      <Button
        css={buttonCss}
        color="primary"
        {...buttonProps}
      >
        <img width={22} src="/icons/resell.svg" alt="resell icon" />
      </Button>
    </Tooltip>
  )
}
export default Resell

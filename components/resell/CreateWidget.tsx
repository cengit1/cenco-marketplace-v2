import React, { useContext, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useDynamicTokens } from '@reservoir0x/reservoir-kit-ui';

import { ConnectWalletButton } from '../ConnectWalletButton';
import { Box,  Text } from '../primitives';
import { CreateWidgetForm } from './CreateWidgetForm';
import { AssetPageProps } from '../../pages/[chain]/asset/[assetId]';
import { WidgetPreview } from './WidgetPreview';
import { ISchemaCreateWidgetForm } from '../../validation/createWidgetForm';
import { useRouter } from 'next/router';
import { useCopyToClipboard } from 'usehooks-ts';
import { ToastContext } from '../../context/ToastContextProvider';
import { useAuth } from '@clerk/nextjs';

export type CreateWidgetProps = {
  existingWidget: AssetPageProps['existingWidget']
  contractAddress?: string;
  token: ReturnType<typeof useDynamicTokens>["data"][0];
};

export function CreateWidget({ contractAddress, token, existingWidget }: CreateWidgetProps) {
  const [widget, setWidget] = useState<AssetPageProps['existingWidget'] | null>(existingWidget)
  const { isSignedIn } = useAuth();
  const { isConnected } = useAccount()
  const router = useRouter();
  const [, copy] = useCopyToClipboard();
  const { addToast } = useContext(ToastContext)

  const isListed = token ? token?.market?.floorAsk?.id !== null : false

  const defaultEmbeddingData = useMemo(() => {
    if (existingWidget) {
      return {
        sendFeeToWalletAddress: existingWidget.sendFeeToWalletAddress,
        resellingFeePercentage: existingWidget.resellingFeePercentage,
        defaultVerticalLayout: existingWidget.defaultLayout === 'vertical',
      } satisfies ISchemaCreateWidgetForm;
    }
    return {} as ISchemaCreateWidgetForm;
  }, [setWidget, existingWidget])

  if (!isConnected) {
    return <>
      <Text style="body1" as="p">Connect your wallet and sign-in with MetaMask and create a widget to embed it on other websites and <Text as="strong" css={{ fontWeight: "bold" }}>resell this asset</Text>.</Text>
      <Box css={{ display: "inline-flex", mt: "$4" }}>
        <ConnectWalletButton />
      </Box>
    </>
  }

  if (!isListed) {
    return <Text style="body1" as="p">Asset not listed for sale. Cannot resell this asset.</Text>
  }

  if (!contractAddress) {
    return <Text style="body1" as="p">Missing contract address. Cannot resell this asset.</Text>
  }

  // optional chaining is to tell typescript we know what we're doing
  // the widget is not null since we check it before rendering <WidgetPreview />, but typescript doesn't know that
  const url = `${window.location.origin}/${(router.query.chain as string).toLowerCase()}/embed/${contractAddress}:${token?.token?.tokenId}/${widget?.id}`
  const code= `<div style="position:relative;overflow:hidden;width:450px;min-height:570px;"><iframe style="position:absolute;top:0;left:0;bottom:0;right:0;width:100%;height:100%;" src="${url}"></iframe></div>`;

  function handleWidgetCreatedOrUpdated(embedding: AssetPageProps['existingWidget']) {
    setWidget(embedding)
    copyCode()
  }

  function copyCode() {
    void copy(code);
    addToast?.({
      title: 'Code copied to clipboard',
    });
  }

  function copyUrl() {
    void copy(url);
    addToast?.({
      title: 'Link copied to clipboard',
    });
  }

  return <>
    <CreateWidgetForm
      token={token}
      contractAddress={contractAddress}
      defaultEmbeddingData={defaultEmbeddingData}
      onWidgetCreated={handleWidgetCreatedOrUpdated}
    />

    {isSignedIn && widget && (
      <WidgetPreview code={code} url={url} onCopyWidget={copyCode} onCopyUrl={copyUrl} />
    )}
  </>
}

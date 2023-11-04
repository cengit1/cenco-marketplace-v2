import React, { useState } from 'react';
import { Button, Flex, Text } from '../primitives';
import Input from '../primitives/Input';
import {
  createWidgetFormValidation,
  DEFAULT_MAX_FEE_PERCENTAGE,
  ISchemaCreateWidgetForm,
} from '../../validation/createWidgetForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDynamicTokens } from '@reservoir0x/reservoir-kit-ui';
import { AssetEmbedding, User } from '../../utils/xata';
import { useMarketplaceChain } from '../../hooks';
import { useRouter } from 'next/router';
import { SignInButton } from '@clerk/nextjs';
import { useLoggedInUser } from '../../utils/auth';

type Props = {
  contractAddress?: string;
  token: ReturnType<typeof useDynamicTokens>["data"][0];
  defaultEmbeddingData?: ISchemaCreateWidgetForm
  onWidgetCreated: (widget: AssetEmbedding) => void;
};

export function CreateWidgetForm({ token, contractAddress, defaultEmbeddingData, onWidgetCreated }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isFirstTimeCreation = !defaultEmbeddingData || Object.keys(defaultEmbeddingData).length === 0;
  const chain = useMarketplaceChain()

  const { user, isLoading: isLoadingUser } = useLoggedInUser();

  const defaultValues = defaultEmbeddingData || {
    defaultVerticalLayout: true,
  }
  const { handleSubmit,  register, formState } =
    useForm<ISchemaCreateWidgetForm>({
      resolver: zodResolver(createWidgetFormValidation),
      mode: "onChange",
      shouldUseNativeValidation: false,
      defaultValues,
    });
  const { errors } = formState;

  const tokenId = token?.token?.tokenId;

  async function onSubmit(data: ISchemaCreateWidgetForm) {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/createWidget",
        {
          method: "POST",
          body: JSON.stringify({
            ...data,

            chain: chain.name,
            tokenId: tokenId,

            // rule out the undefined values since we validate them below in rendering
            contractAddress: contractAddress as string,
          }),
        }
      ).then((res) => res.json())
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.widget) {
        throw new Error("Could not create a widget!");
      }

      const widget = response.widget;
      onWidgetCreated(widget);
    } catch (err) {
      console.log('err', err);
    } finally {
      setIsLoading(false);
    }
  }


  if (!user) {
    return (
      <SignInButton
        mode="modal"
        redirectUrl={router.asPath}
        // the type for the className prop is wrong in clerk's types, so ignore it for now
        // @ts-ignore
        disabled={isLoadingUser}
      >
        <span className="signin-w-metamask-btn">
          {isLoadingUser && "Authenticating..."}
          {!isLoadingUser && "Authenticate to create widget"}
        </span>
      </SignInButton>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Text style="body1">Where should the fee be sent to?</Text>
      <Input
        {...register('sendFeeToWalletAddress')}
        placeholder="Enter wallet address"
      />
      {errors.sendFeeToWalletAddress?.message && (
        <Text style="body1" css={{ color: "red" }}>{errors.sendFeeToWalletAddress.message}</Text>
      )}

      <Flex css={{ mt: "$5" }}>
        <Text style="body1">
          Reselling fee percentage (max {DEFAULT_MAX_FEE_PERCENTAGE}%)
        </Text>
      </Flex>
      <Input
        {...register('resellingFeePercentage', {
          valueAsNumber: true,
        })}
        placeholder="Enter number"
        type="number"
        step="0.1"
      />
      {errors.resellingFeePercentage?.message && (
        <Text style="body1" css={{ color: "red" }}>{errors.resellingFeePercentage.message}</Text>
      )}

      <Flex css={{
        mt: "$5"
      }}>
        <Button
          type="submit"
          disabled={isLoading}
        >
          <>
            {isLoading ? "Saving" : isFirstTimeCreation ? "Create" : " Update"} widget{isLoading && "..."}
          </>
        </Button>
      </Flex>
    </form>
  );
}

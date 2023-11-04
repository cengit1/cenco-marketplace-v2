import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from 'next';

import { xata } from '../../utils/db';
import { ISchemaCreateWidgetForm } from '../../validation/createWidgetForm';

type Data = ISchemaCreateWidgetForm & {
  chain: string,
  contractAddress: string,
  tokenId?: string
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, session, debug, sessionClaims , } = getAuth(req);


  console.log('debug', debug())
  console.log('session', session);
  console.log('sessionClaims', sessionClaims);

  if (!userId) {
    return res.status(401).json({ widget: null, error: "Unauthorized", message: "You must be logged in to create a widget" })
  }
  if (req.method !== "POST") {
    return res.status(405).json({ widget: null, error: "Method not allowed" })
  }

  if (!req.body) {
    return res.status(400).json({ widget: null, error: "Bad request", message: "No body provided" })
  }

  let data: Data | null = null;
  try {
    // type is string here, not ReadableStream
    const body = req.body as unknown as string;

    data = JSON.parse(body) as Data;
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ widget: null, error: "Bad request", message: error.message })
  }

  let embeddingData = null;

  try {
    embeddingData = await xata.db.assetEmbedding
      .filter({
        assetAddress: data.contractAddress,
        assetTokenId: data.tokenId,
        "user.username": userId
      })
      .getFirst();

    // if widget exists, update it
    if (embeddingData) {
      embeddingData = await xata.db.assetEmbedding.update({
        id: embeddingData.id,
        sendFeeToWalletAddress: data.sendFeeToWalletAddress,
        defaultLayout: data.defaultVerticalLayout ? "vertical" : "horizontal",
        resellingFeePercentage: data.resellingFeePercentage,
        chain: data.chain.toLowerCase(),
      });

      return res.status(200).json({ widget: embeddingData, error: "", message: "Widget updated" })
    }
  } catch (err) {
    // do nothing, attempt to create the widget
  }

  try {
    const user = await xata.db.user
      .filter({ username: userId })
      .getFirstOrThrow();

    embeddingData = await xata.db.assetEmbedding.create({
      sendFeeToWalletAddress: data.sendFeeToWalletAddress,
      defaultLayout: data.defaultVerticalLayout ? "vertical" : "horizontal",
      resellingFeePercentage: data.resellingFeePercentage,
      assetAddress: data.contractAddress,
      assetTokenId: data.tokenId,
      chain: data.chain.toLowerCase(),
      user: {
        id: user.id
      }
    });
    return res.status(200).json({ widget: embeddingData, error: "", message: "Widget created" })
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ widget: null, error: "Could not create widget", message: error.message })
  }
}

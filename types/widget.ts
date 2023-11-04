import { AssetEmbedding } from '../utils/xata';

export type AssetWidget = Pick<AssetEmbedding, 'sendFeeToWalletAddress' | 'resellingFeePercentage' | 'id' | "defaultLayout">;
export type FullAssetWidget = Pick<AssetEmbedding, 'sendFeeToWalletAddress' | 'resellingFeePercentage' | 'id' | "chain" | "defaultLayout" | "assetTokenId" | "assetAddress">;

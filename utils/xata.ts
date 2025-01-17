// Generated by Xata Codegen 0.26.5. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "user",
    columns: [{ name: "username", type: "string", unique: true }],
    revLinks: [{ column: "user", table: "assetEmbedding" }],
  },
  {
    name: "assetEmbedding",
    columns: [
      {
        name: "assetAddress",
        type: "string",
        notNull: true,
        defaultValue: "null",
      },
      { name: "assetTokenId", type: "string" },
      {
        name: "defaultLayout",
        type: "string",
        notNull: true,
        defaultValue: "horizontal",
      },
      { name: "user", type: "link", link: { table: "user" } },
      {
        name: "resellingFeePercentage",
        type: "float",
        notNull: true,
        defaultValue: "3",
      },
      {
        name: "sendFeeToWalletAddress",
        type: "string",
        notNull: true,
        defaultValue: '""',
      },
      { name: "chain", type: "string", notNull: true, defaultValue: '""' },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type User = InferredTypes["user"];
export type UserRecord = User & XataRecord;

export type AssetEmbedding = InferredTypes["assetEmbedding"];
export type AssetEmbeddingRecord = AssetEmbedding & XataRecord;

export type DatabaseSchema = {
  user: UserRecord;
  assetEmbedding: AssetEmbeddingRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL: "https://biz-s-workspace-15t2jp.us-east-1.xata.sh/db/platform",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};

import { z } from "zod";
import { isAddress } from 'viem';

export const DEFAULT_MAX_FEE_PERCENTAGE = 5;
export const createWidgetFormValidation = z.object({
  sendFeeToWalletAddress: z.string()
    .refine((value) => isAddress(value), {
      message: "Provided address is invalid. Please insure you have typed correctly.",
    }),
  resellingFeePercentage: z.number({
    errorMap: (error) => {
      return {
        message: "Fee percentage must be a number between 0.1 and 5.",
      }
    }
  }).min(0.1).max(DEFAULT_MAX_FEE_PERCENTAGE),
  defaultVerticalLayout: z.boolean().default(true)
});

export type ISchemaCreateWidgetForm = z.infer<
  typeof createWidgetFormValidation
>;

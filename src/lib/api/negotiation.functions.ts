import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { formalizeAgreement, getAgreementDetails, lookupNegotiations } from "../server/negotiation.service";

export const searchNegotiations = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      document: z.string().min(11),
    }),
  )
  .handler(async ({ data }) => lookupNegotiations(data.document));

export const generateAgreementPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      negotiationId: z.string().min(1),
      document: z.string().min(11),
      optionKey: z.enum(["avista", "2x", "3x", "4x"]),
    }),
  )
  .handler(async ({ data }) => formalizeAgreement(data));

export const getAgreement = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      agreementId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => getAgreementDetails(data.agreementId));

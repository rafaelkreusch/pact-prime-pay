import { getServerConfig, assertAsaasConfigured } from "../config.server";
import { getRequestHost, getRequestHeader } from "@tanstack/react-start/server";
import { getOfferByKey, mapAgreementOptionKey } from "../domain/negotiation";
import { isValidDocument, normalizeDocument } from "../domain/document";
import { createAsaasPayment, ensureAsaasCustomer } from "./asaas.server";
import {
  createAgreement,
  createIntegrationLog,
  findAgreementById,
  findNegotiationById,
  findNegotiationsByDocument,
  updateAgreement,
} from "./supabase.server";

export async function lookupNegotiations(document: string) {
  const normalized = normalizeDocument(document);
  if (!isValidDocument(normalized)) {
    throw new Error("Informe um CPF ou CNPJ válido.");
  }

  let negotiations;
  try {
    negotiations = await findNegotiationsByDocument(normalized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (/Missing required environment variable/i.test(message)) {
      throw new Error(
        "O backend ainda não está configurado para consultar a base. Verifique as credenciais do Supabase.",
      );
    }
    throw new Error("Não conseguimos consultar suas ofertas agora. Tente novamente em instantes.");
  }

  await createIntegrationLog({
    origin: "negociacao_busca",
    event: "NEGOTIATIONS_FETCHED",
    status: "success",
    payload: {
      document: normalized,
      count: negotiations.length,
    },
  });

  return negotiations;
}

export async function formalizeAgreement(input: {
  negotiationId: string;
  document: string;
  optionKey: string;
}) {
  const normalizedDocument = normalizeDocument(input.document);
  if (!isValidDocument(normalizedDocument)) {
    throw new Error("Documento inválido.");
  }

  const negotiation = await findNegotiationById(input.negotiationId);
  if (!negotiation) {
    throw new Error("Negociação não encontrada.");
  }

  if (normalizeDocument(negotiation.document) !== normalizedDocument) {
    throw new Error("O documento informado não corresponde à negociação selecionada.");
  }

  const optionKey = mapAgreementOptionKey(input.optionKey);
  const offer = getOfferByKey(negotiation, optionKey);
  if (!offer) {
    throw new Error("A proposta selecionada não está disponível.");
  }

  assertAsaasConfigured();

  const agreementRow = await createAgreement({
    negotiationId: negotiation.id,
    debtorName: negotiation.debtorName,
    document: normalizedDocument,
    creditor: negotiation.creditor,
    optionKey,
    installmentCount: offer.installmentCount,
    installmentValue: offer.installmentValue,
    totalValue: offer.totalValue,
    status: "processing_payment",
  });

  const agreementId = String(agreementRow.id);
  const config = getServerConfig();
  const appUrl = resolveAppUrlFromRequest() ?? config.appUrl;

  try {
    const customer = await ensureAsaasCustomer({
      debtorName: negotiation.debtorName,
      document: normalizedDocument,
    });

    await createIntegrationLog({
      origin: "asaas_customer",
      event: "ASAAS_CUSTOMER_READY",
      status: "success",
      payload: {
        agreementId,
        asaasCustomerId: customer.id,
        document: normalizedDocument,
      },
    });

    const payment = await createAsaasPayment({
      agreementId,
      customerId: customer.id,
      debtorName: negotiation.debtorName,
      document: normalizedDocument,
      creditor: negotiation.creditor,
      installmentCount: offer.installmentCount,
      installmentValue: offer.installmentValue,
      totalValue: offer.totalValue,
      callbackSuccessUrl: `${appUrl}/sucesso?agreementId=${agreementId}`,
    });

    const updatedAgreement = await updateAgreement(agreementId, {
      status: "payment_created",
      asaas_customer_id: customer.id,
      asaas_payment_id: payment.id,
      invoice_url: payment.invoiceUrl ?? null,
      bank_slip_url: payment.bankSlipUrl ?? null,
      due_date: payment.dueDate ?? null,
      raw_asaas_response: payment,
    });

    await createIntegrationLog({
      origin: "asaas_payment",
      event: "ASAAS_PAYMENT_CREATED",
      status: "success",
      payload: {
        agreementId,
        asaasPaymentId: payment.id,
        installmentCount: offer.installmentCount,
        installmentValue: offer.installmentValue,
        totalValue: offer.totalValue,
      },
    });

    return {
      agreementId,
      invoiceUrl: payment.invoiceUrl ?? null,
      status: String(updatedAgreement.status ?? "payment_created"),
    };
  } catch (error) {
    await updateAgreement(agreementId, {
      status: "payment_error",
      raw_asaas_response: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });

    await createIntegrationLog({
      origin: "asaas_payment",
      event: "ASAAS_PAYMENT_FAILED",
      status: "error",
      payload: {
        agreementId,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

export async function getAgreementDetails(agreementId: string) {
  const agreement = await findAgreementById(agreementId);
  if (!agreement) {
    throw new Error("Acordo não encontrado.");
  }

  return agreement;
}

function resolveAppUrlFromRequest(): string | null {
  try {
    const host = getRequestHost();
    if (!host) return null;
    const proto = getRequestHeader("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return null;
  }
}

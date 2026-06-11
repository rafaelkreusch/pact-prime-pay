import { getServerConfig } from "../config.server";
import { normalizeDocument } from "../domain/document";
import { fetchJson } from "./http.server";

type AsaasCustomer = {
  id: string;
  name: string;
  cpfCnpj?: string;
};

type AsaasListResponse<T> = {
  data: T[];
};

type CreateAsaasPaymentInput = {
  agreementId: string;
  customerId: string;
  debtorName: string;
  document: string;
  creditor: string;
  installmentCount: number;
  installmentValue: number;
  totalValue: number;
  callbackSuccessUrl: string;
};

type AsaasPaymentResponse = {
  id: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  dueDate?: string;
  installment?: string;
};

function getAsaasHeaders() {
  const config = getServerConfig();

  return {
    access_token: config.asaas.apiKey,
  };
}

function getAsaasUrl(path: string) {
  const config = getServerConfig();
  return `${config.asaas.baseUrl}${path}`;
}

export async function findAsaasCustomerByDocument(document: string) {
  const normalized = normalizeDocument(document);
  const query = new URLSearchParams({ cpfCnpj: normalized, limit: "1" });

  const response = await fetchJson<AsaasListResponse<AsaasCustomer>>(
    `${getAsaasUrl("/customers")}?${query.toString()}`,
    { headers: getAsaasHeaders() },
  );

  return response.data[0] ?? null;
}

export async function ensureAsaasCustomer(input: { debtorName: string; document: string }) {
  const existing = await findAsaasCustomerByDocument(input.document);
  if (existing) return existing;

  return fetchJson<AsaasCustomer>(getAsaasUrl("/customers"), {
    method: "POST",
    headers: getAsaasHeaders(),
    body: {
      name: input.debtorName,
      cpfCnpj: normalizeDocument(input.document),
      externalReference: `debtor:${normalizeDocument(input.document)}`,
    },
  });
}

export async function createAsaasPayment(input: CreateAsaasPaymentInput) {
  const body =
    input.installmentCount === 1
      ? {
          customer: input.customerId,
          billingType: "UNDEFINED",
          value: input.totalValue,
          dueDate: buildDueDate(),
          description: `Acordo ${input.creditor} - ${input.debtorName}`,
          externalReference: input.agreementId,
          callback: {
            successUrl: input.callbackSuccessUrl,
            autoRedirect: false,
          },
        }
      : {
          customer: input.customerId,
          billingType: "UNDEFINED",
          installmentCount: input.installmentCount,
          installmentValue: input.installmentValue,
          dueDate: buildDueDate(),
          description: `Acordo parcelado ${input.creditor} - ${input.debtorName}`,
          externalReference: input.agreementId,
          callback: {
            successUrl: input.callbackSuccessUrl,
            autoRedirect: false,
          },
        };

  return fetchJson<AsaasPaymentResponse>(getAsaasUrl("/payments"), {
    method: "POST",
    headers: getAsaasHeaders(),
    body,
  });
}

function buildDueDate() {
  const config = getServerConfig();
  const now = new Date();
  now.setDate(now.getDate() + config.paymentDueDays);
  return now.toISOString().slice(0, 10);
}

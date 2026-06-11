import { getServerConfig } from "../config.server";
import { coerceNegotiationValue, type AgreementSummary, type NegotiationRecord, type OfferOptionKey } from "../domain/negotiation";
import { normalizeDocument } from "../domain/document";
import { fetchJson } from "./http.server";

type SupabaseInsertResponse<T> = T[];

type CreateAgreementInput = {
  negotiationId: string;
  debtorName: string;
  document: string;
  creditor: string;
  optionKey: string;
  installmentCount: number;
  installmentValue: number;
  totalValue: number;
  status: string;
};

type UpdateAgreementInput = Partial<{
  status: string;
  asaas_customer_id: string | null;
  asaas_payment_id: string | null;
  invoice_url: string | null;
  bank_slip_url: string | null;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  due_date: string | null;
  raw_asaas_response: unknown;
  updated_at: string;
}>;

type IntegrationLogInput = {
  origin: string;
  event: string;
  status: string;
  payload: unknown;
};

function getSupabaseHeaders() {
  const config = getServerConfig();

  return {
    apikey: config.supabase.serviceRoleKey,
    Authorization: `Bearer ${config.supabase.serviceRoleKey}`,
  };
}

function getRestUrl(path: string) {
  const config = getServerConfig();
  return `${config.supabase.url}/rest/v1/${path}`;
}

function mapNegotiationRow(row: Record<string, unknown>): NegotiationRecord {
  const config = getServerConfig();

  return {
    id: String(row.id),
    debtorName: String(row[config.supabase.debtorNameColumn] ?? ""),
    document: normalizeDocument(String(row[config.supabase.documentColumn] ?? "")),
    creditor: String(row[config.supabase.creditorColumn] ?? ""),
    valueUpfront: coerceNegotiationValue(row[config.supabase.upfrontColumn]),
    installment2x: coerceNegotiationValue(row[config.supabase.installment2xColumn]),
    installment3x: coerceNegotiationValue(row[config.supabase.installment3xColumn]),
    installment4x: coerceNegotiationValue(row[config.supabase.installment4xColumn]),
  };
}

export async function findNegotiationsByDocument(document: string) {
  const config = getServerConfig();
  const normalized = normalizeDocument(document);
  const documentColumn = config.supabase.documentColumn;
  const query = new URLSearchParams({
    select: "*",
    [documentColumn]: `eq.${normalized}`,
    order: "created_at.desc",
  });

  const rows = await fetchJson<Record<string, unknown>[]>(
    `${getRestUrl(config.supabase.negotiationsTable)}?${query.toString()}`,
    {
      headers: getSupabaseHeaders(),
    },
  );

  return rows.map(mapNegotiationRow);
}

export async function findNegotiationById(id: string) {
  const config = getServerConfig();
  const query = new URLSearchParams({
    select: "*",
    id: `eq.${id}`,
    limit: "1",
  });

  const rows = await fetchJson<Record<string, unknown>[]>(
    `${getRestUrl(config.supabase.negotiationsTable)}?${query.toString()}`,
    {
      headers: getSupabaseHeaders(),
    },
  );

  const [row] = rows;
  return row ? mapNegotiationRow(row) : null;
}

export async function createAgreement(input: CreateAgreementInput) {
  const config = getServerConfig();
  const payload = {
    negotiation_id: input.negotiationId,
    devedor: input.debtorName,
    cnpj: input.document,
    credor: input.creditor,
    tipo_acordo: input.optionKey,
    quantidade_parcelas: input.installmentCount,
    valor_parcela: input.installmentValue,
    valor_total: input.totalValue,
    status: input.status,
  };

  const rows = await fetchJson<SupabaseInsertResponse<Record<string, unknown>>>(
    getRestUrl(config.supabase.agreementsTable),
    {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "return=representation",
      },
      body: payload,
    },
  );

  return rows[0];
}

export async function updateAgreement(id: string, input: UpdateAgreementInput) {
  const config = getServerConfig();
  const query = new URLSearchParams({ id: `eq.${id}`, select: "*" });

  const rows = await fetchJson<SupabaseInsertResponse<Record<string, unknown>>>(
    `${getRestUrl(config.supabase.agreementsTable)}?${query.toString()}`,
    {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "return=representation",
      },
      body: {
        ...input,
        updated_at: input.updated_at ?? new Date().toISOString(),
      },
    },
  );

  return rows[0];
}

function mapAgreementRow(row: Record<string, unknown>): AgreementSummary {
  return {
    id: String(row.id),
    negotiationId: String(row.negotiation_id ?? ""),
    debtorName: String(row.devedor ?? ""),
    document: normalizeDocument(String(row.cnpj ?? "")),
    creditor: String(row.credor ?? ""),
    optionKey: String(row.tipo_acordo ?? "avista") as OfferOptionKey,
    installmentCount: Number(row.quantidade_parcelas ?? 1),
    installmentValue: Number(row.valor_parcela ?? 0),
    totalValue: Number(row.valor_total ?? 0),
    status: String(row.status ?? "pending"),
    asaasCustomerId: row.asaas_customer_id ? String(row.asaas_customer_id) : null,
    asaasPaymentId: row.asaas_payment_id ? String(row.asaas_payment_id) : null,
    invoiceUrl: row.invoice_url ? String(row.invoice_url) : null,
    bankSlipUrl: row.bank_slip_url ? String(row.bank_slip_url) : null,
    pixQrCode: row.pix_qr_code ? String(row.pix_qr_code) : null,
    pixCopyPaste: row.pix_copy_paste ? String(row.pix_copy_paste) : null,
    dueDate: row.due_date ? String(row.due_date) : null,
    createdAt: row.created_at ? String(row.created_at) : null,
  };
}

export async function findAgreementById(id: string) {
  const config = getServerConfig();
  const query = new URLSearchParams({
    select: "*",
    id: `eq.${id}`,
    limit: "1",
  });

  const rows = await fetchJson<Record<string, unknown>[]>(
    `${getRestUrl(config.supabase.agreementsTable)}?${query.toString()}`,
    {
      headers: getSupabaseHeaders(),
    },
  );

  const [row] = rows;
  return row ? mapAgreementRow(row) : null;
}

export async function createIntegrationLog(input: IntegrationLogInput) {
  const config = getServerConfig();

  try {
    await fetchJson(getRestUrl(config.supabase.logsTable), {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "return=minimal",
      },
      body: {
        origem: input.origin,
        evento: input.event,
        status: input.status,
        payload: input.payload,
      },
    });
  } catch (error) {
    console.error("Failed to persist integration log", error);
  }
}

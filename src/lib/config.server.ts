import process from "node:process";

type AppConfig = {
  nodeEnv: string;
  appUrl: string;
  paymentDueDays: number;
  supabase: {
    url: string;
    serviceRoleKey: string;
    negotiationsTable: string;
    agreementsTable: string;
    logsTable: string;
    debtorNameColumn: string;
    documentColumn: string;
    creditorColumn: string;
    upfrontColumn: string;
    installment2xColumn: string;
    installment3xColumn: string;
    installment4xColumn: string;
  };
  asaas: {
    apiKey: string;
    baseUrl: string;
  };
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(name: string, fallback: string) {
  return process.env[name] ?? fallback;
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer.`);
  }

  return parsed;
}

export function getServerConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    appUrl: getRequiredEnv("APP_URL"),
    paymentDueDays: getPositiveIntegerEnv("PAYMENT_DUE_DAYS", 3),
    supabase: {
      url: getRequiredEnv("SUPABASE_URL"),
      serviceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      negotiationsTable: getOptionalEnv("SUPABASE_NEGOTIATIONS_TABLE", "negociacoes"),
      agreementsTable: getOptionalEnv("SUPABASE_AGREEMENTS_TABLE", "acordos"),
      logsTable: getOptionalEnv("SUPABASE_LOGS_TABLE", "logs_integracao"),
      debtorNameColumn: getOptionalEnv("SUPABASE_DEBTOR_NAME_COLUMN", "devedor"),
      documentColumn: getOptionalEnv("SUPABASE_DOCUMENT_COLUMN", "cnpj"),
      creditorColumn: getOptionalEnv("SUPABASE_CREDITOR_COLUMN", "credor"),
      upfrontColumn: getOptionalEnv("SUPABASE_UPFRONT_COLUMN", "valor_avista"),
      installment2xColumn: getOptionalEnv("SUPABASE_INSTALLMENT_2X_COLUMN", "parcela_2x"),
      installment3xColumn: getOptionalEnv("SUPABASE_INSTALLMENT_3X_COLUMN", "parcela_3x"),
      installment4xColumn: getOptionalEnv("SUPABASE_INSTALLMENT_4X_COLUMN", "parcela_4x"),
    },
    asaas: {
      apiKey: getRequiredEnv("ASAAS_API_KEY"),
      baseUrl: getOptionalEnv("ASAAS_BASE_URL", "https://api-sandbox.asaas.com/v3"),
    },
  };
}

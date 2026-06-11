import { formatCurrency, parseMoney } from "./currency";

export type OfferOptionKey = "avista" | "2x" | "3x" | "4x";

export type NegotiationRecord = {
  id: string;
  debtorName: string;
  document: string;
  creditor: string;
  valueUpfront: number | null;
  installment2x: number | null;
  installment3x: number | null;
  installment4x: number | null;
};

export type NegotiationOffer = {
  key: OfferOptionKey;
  installmentCount: number;
  installmentValue: number;
  totalValue: number;
  title: string;
  description: string;
  badge: string;
};

export type AgreementSummary = {
  id: string;
  negotiationId: string;
  debtorName: string;
  document: string;
  creditor: string;
  optionKey: OfferOptionKey;
  installmentCount: number;
  installmentValue: number;
  totalValue: number;
  status: string;
  asaasCustomerId: string | null;
  asaasPaymentId: string | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
  pixQrCode: string | null;
  pixCopyPaste: string | null;
  dueDate: string | null;
  createdAt: string | null;
};

export function buildOfferOptions(negotiation: NegotiationRecord): NegotiationOffer[] {
  const offers: NegotiationOffer[] = [];

  if (negotiation.valueUpfront && negotiation.valueUpfront > 0) {
    offers.push({
      key: "avista",
      installmentCount: 1,
      installmentValue: negotiation.valueUpfront,
      totalValue: negotiation.valueUpfront,
      title: "À vista",
      description: `${formatCurrency(negotiation.valueUpfront)} em pagamento único`,
      badge: "Melhor custo",
    });
  }

  const installments = [
    { key: "2x" as const, count: 2, value: negotiation.installment2x },
    { key: "3x" as const, count: 3, value: negotiation.installment3x },
    { key: "4x" as const, count: 4, value: negotiation.installment4x },
  ];

  for (const installment of installments) {
    if (!installment.value || installment.value <= 0) continue;

    offers.push({
      key: installment.key,
      installmentCount: installment.count,
      installmentValue: installment.value,
      totalValue: installment.value * installment.count,
      title: `${installment.count} parcelas`,
      description: `${installment.count}x de ${formatCurrency(installment.value)}`,
      badge: installment.count === 2 ? "Equilíbrio" : "Mais flexível",
    });
  }

  return offers;
}

export function getOfferByKey(negotiation: NegotiationRecord, key: OfferOptionKey) {
  return buildOfferOptions(negotiation).find((offer) => offer.key === key) ?? null;
}

export function mapAgreementOptionKey(value: string): OfferOptionKey {
  if (value === "avista" || value === "2x" || value === "3x" || value === "4x") {
    return value;
  }

  throw new Error("Tipo de acordo inválido.");
}

export function coerceNegotiationValue(value: unknown) {
  return parseMoney(value);
}

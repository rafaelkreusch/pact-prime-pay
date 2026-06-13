import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ExternalLink, LoaderCircle } from "lucide-react";

import { getAgreement } from "@/lib/api/negotiation.functions";
import { formatCurrency } from "@/lib/domain/currency";

type SuccessSearch = {
  agreementId?: string;
};

export const Route = createFileRoute("/sucesso")({
  validateSearch: (search: Record<string, unknown>): SuccessSearch => ({
    agreementId: typeof search.agreementId === "string" ? search.agreementId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Cobrança gerada - Devalor Cobranças" },
      { name: "description", content: "Seu acordo foi registrado e a cobrança foi criada com sucesso." },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { agreementId } = Route.useSearch();

  const agreementQuery = useQuery({
    queryKey: ["agreement", agreementId],
    enabled: Boolean(agreementId),
    queryFn: async () => getAgreement({ data: { agreementId: agreementId ?? "" } }),
  });

  const agreement = agreementQuery.data;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl border border-neutral-100 p-8 max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900">Cobrança gerada</h1>
          <p className="text-sm text-neutral-500">
            O acordo foi registrado no sistema e a cobrança já está pronta para pagamento de forma segura.
          </p>
        </div>

        {!agreementId && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Nenhum acordo foi informado para consulta.
          </div>
        )}

        {agreementQuery.isLoading && (
          <div className="bg-neutral-50 rounded-xl p-6 space-y-3">
            <LoaderCircle className="w-6 h-6 mx-auto animate-spin text-neutral-400" />
            <p className="text-sm text-neutral-500">Carregando dados da cobrança...</p>
          </div>
        )}

        {agreementQuery.isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {agreementQuery.error instanceof Error
              ? agreementQuery.error.message
              : "Não foi possível carregar os dados da cobrança."}
          </div>
        )}

        {agreement && (
          <>
            <div className="bg-green-50 rounded-lg p-4 text-left space-y-3">
              <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Resumo do acordo</p>
              <SummaryRow label="Cliente" value={agreement.debtorName} />
              <SummaryRow label="Credor" value={agreement.creditor} />
              <SummaryRow label="Forma" value={agreement.installmentCount === 1 ? "À vista" : `${agreement.installmentCount}x`} />
              <SummaryRow label="Total" value={formatCurrency(agreement.totalValue)} />
              {agreement.dueDate && <SummaryRow label="Vencimento" value={agreement.dueDate} />}
              {agreement.asaasPaymentId && <SummaryRow label="ID da cobrança" value={agreement.asaasPaymentId} />}
            </div>

            {agreement.invoiceUrl && (
              <a
                href={agreement.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 bg-neutral-900 text-white text-sm font-semibold rounded-xl py-3.5 hover:bg-neutral-800 transition-colors"
              >
                Visualizar cobrança
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {!agreement.invoiceUrl && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                A cobrança foi registrada, mas não foi gerado um link de fatura.
              </div>
            )}
          </>
        )}

        <Link
          to="/"
          className="inline-block w-full border border-neutral-200 text-neutral-900 text-sm font-semibold rounded-xl py-3.5 hover:bg-neutral-50 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className="font-semibold text-neutral-900 text-right">{value}</span>
    </div>
  );
}

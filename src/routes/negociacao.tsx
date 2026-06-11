import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";

import { generateAgreementPayment, searchNegotiations } from "@/lib/api/negotiation.functions";
import { formatCurrency } from "@/lib/domain/currency";
import { buildOfferOptions, type OfferOptionKey } from "@/lib/domain/negotiation";
import { maskDocument } from "@/lib/domain/document";

type NegotiationSearch = {
  document?: string;
};

export const Route = createFileRoute("/negociacao")({
  validateSearch: (search: Record<string, unknown>): NegotiationSearch => ({
    document: typeof search.document === "string" ? search.document : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Negociação - Devalor Cobranças" },
      {
        name: "description",
        content: "Escolha a proposta disponível e gere sua cobrança automaticamente pelo Asaas.",
      },
    ],
  }),
  component: NegotiationPage,
});

function NegotiationPage() {
  const navigate = useNavigate();
  const { document } = Route.useSearch();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const negotiationsQuery = useQuery({
    queryKey: ["negotiations", document],
    enabled: Boolean(document),
    queryFn: async () => searchNegotiations({ data: { document: document ?? "" } }),
  });

  const agreementsMutation = useMutation({
    mutationFn: async (input: { negotiationId: string; optionKey: OfferOptionKey }) =>
      generateAgreementPayment({
        data: {
          negotiationId: input.negotiationId,
          optionKey: input.optionKey,
          document: document ?? "",
        },
      }),
    onSuccess: (result) => {
      navigate({
        to: "/sucesso",
        search: {
          agreementId: result.agreementId,
        },
      });
    },
  });

  const negotiations = negotiationsQuery.data ?? [];

  const selectedOffer = useMemo(() => {
    if (!selectedValue) return null;

    const [negotiationId, optionKey] = selectedValue.split(":");
    const negotiation = negotiations.find((item) => item.id === negotiationId);
    if (!negotiation) return null;

    const offer = buildOfferOptions(negotiation).find((item) => item.key === optionKey);
    if (!offer) return null;

    return {
      negotiation,
      offer,
    };
  }, [negotiations, selectedValue]);

  const isSubmitting = agreementsMutation.isPending;

  const handleCreatePayment = () => {
    if (!selectedOffer || !acceptedTerms) return;

    agreementsMutation.mutate({
      negotiationId: selectedOffer.negotiation.id,
      optionKey: selectedOffer.offer.key,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Negociação</p>
            <h1 className="text-lg font-bold text-neutral-900">Escolha sua proposta</h1>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Documento consultado</p>
              <p className="text-sm font-semibold text-neutral-900">{document ? maskDocument(document) : "-"}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Consulta segura com dados vindos do Supabase
            </div>
          </div>
        </section>

        {negotiationsQuery.isLoading && (
          <section className="bg-white rounded-2xl border border-neutral-100 p-10 text-center space-y-3">
            <LoaderCircle className="w-8 h-8 mx-auto animate-spin text-neutral-400" />
            <p className="text-sm text-neutral-600">Buscando ofertas cadastradas para este documento...</p>
          </section>
        )}

        {negotiationsQuery.isError && (
          <section className="bg-white rounded-2xl border border-red-100 p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-red-700">Não foi possível consultar as ofertas agora.</p>
            <p className="text-sm text-red-600">
              {negotiationsQuery.error instanceof Error
                ? negotiationsQuery.error.message
                : "Tente novamente em alguns instantes."}
            </p>
          </section>
        )}

        {!negotiationsQuery.isLoading && !negotiationsQuery.isError && negotiations.length === 0 && (
          <section className="bg-white rounded-2xl border border-neutral-100 p-8 text-center space-y-3">
            <p className="text-base font-semibold text-neutral-900">Nenhuma proposta encontrada.</p>
            <p className="text-sm text-neutral-500">
              Verifique o documento informado ou confirme se a oferta já foi cadastrada no Supabase.
            </p>
          </section>
        )}

        {negotiations.map((negotiation) => {
          const offers = buildOfferOptions(negotiation);

          return (
            <section key={negotiation.id} className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Devedor</p>
                  <p className="text-base font-bold text-neutral-900">{negotiation.debtorName}</p>
                  <p className="text-sm text-neutral-500">{maskDocument(negotiation.document)}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                  <Building2 className="w-3.5 h-3.5" />
                  {negotiation.creditor}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {offers.map((offer) => {
                  const choiceId = `${negotiation.id}:${offer.key}`;
                  const isSelected = selectedValue === choiceId;

                  return (
                    <button
                      key={choiceId}
                      type="button"
                      onClick={() => setSelectedValue(choiceId)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-900">{offer.title}</span>
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-600">
                              {offer.badge}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-neutral-900">{formatCurrency(offer.totalValue)}</p>
                          <p className="text-xs text-neutral-500">{offer.description}</p>
                        </div>
                        <div
                          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-green-600 bg-green-600" : "border-neutral-300"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {negotiations.length > 0 && (
          <section className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-neutral-900">Confirmação do acordo</p>
              <p className="text-sm text-neutral-500">
                Ao confirmar, o sistema registra o acordo no Supabase e cria a cobrança automaticamente no Asaas.
              </p>
            </div>

            {selectedOffer && (
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Resumo selecionado</p>
                <p className="text-sm font-semibold text-neutral-900">{selectedOffer.negotiation.creditor}</p>
                <p className="text-sm text-neutral-600">{selectedOffer.offer.description}</p>
                <p className="text-lg font-bold text-neutral-900">{formatCurrency(selectedOffer.offer.totalValue)}</p>
              </div>
            )}

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-600"
              />
              <span className="text-sm text-neutral-600">
                Li e concordo com a formalização deste acordo e com a geração automática da cobrança.
              </span>
            </label>

            {agreementsMutation.isError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {agreementsMutation.error instanceof Error
                  ? agreementsMutation.error.message
                  : "Não foi possível gerar a cobrança no momento."}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreatePayment}
              disabled={!selectedOffer || !acceptedTerms || isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Gerando cobrança...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Formalizar acordo e gerar cobrança
                </>
              )}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

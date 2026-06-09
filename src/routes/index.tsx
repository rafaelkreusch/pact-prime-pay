import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { HandCoins, ShieldCheck, Timer, CreditCard } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Negociar dívida - Devalor Cobranças" },
      { name: "description", content: "Negocie sua dívida de forma rápida e segura com a Devalor Cobranças." },
    ],
  }),
  component: Index,
});

const OFFER_DURATION = 10 * 60; // 10 minutos em segundos

function useCountdown(duration: number) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [expired, setExpired] = useState(false);
  const endRef = useRef<number>(Date.now() + duration * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setExpired(true);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return { formatted: `${mm}:${ss}`, expired, secondsLeft };
}

const propostas = [
  {
    id: "a-vista",
    titulo: "Pagamento à vista",
    valor: "R$ 1.250,00",
    descricao: "75% de desconto",
    tag: "Melhor oferta",
    tagColor: "bg-green-100 text-green-800",
  },
  {
    id: "12x",
    titulo: "12 parcelas",
    valor: "12x R$ 135,00",
    descricao: "Total: R$ 1.620,00",
    tag: "Flexível",
    tagColor: "bg-blue-100 text-blue-800",
  },
  {
    id: "24x",
    titulo: "24 parcelas",
    valor: "24x R$ 78,00",
    descricao: "Total: R$ 1.872,00",
    tag: "Mais leve",
    tagColor: "bg-orange-100 text-orange-800",
  },
];

function Index() {
  const navigate = useNavigate();
  const { formatted, expired } = useCountdown(OFFER_DURATION);
  const [aceito, setAceito] = useState(false);
  const [selecionada, setSelecionada] = useState<string>("a-vista");
  const [pagando, setPagando] = useState(false);

  const handlePagar = () => {
    if (!aceito || expired) return;
    setPagando(true);
    setTimeout(() => {
      navigate({ to: "/sucesso" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-tight text-neutral-900 uppercase">
            Devalor Cobranças
          </h1>
          <span className="text-xs font-medium text-neutral-400">Negociação</span>
        </div>
      </header>

      {/* Contador flutuante */}
      <div className="bg-red-600 text-white">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Timer className="w-3.5 h-3.5" />
            <span>Oferta exclusiva:</span>
          </div>
          <div className={`text-sm font-mono font-bold tabular-nums ${expired ? "opacity-50" : ""}`}>
            {expired ? "00:00" : formatted}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-6">
        {/* Resumo da dívida */}
        <section className="bg-white rounded-xl border border-neutral-100 p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Devedor</p>
            <p className="text-sm font-semibold text-neutral-900">João da Silva</p>
            <p className="text-xs text-neutral-500">CPF: ***.***,789-00</p>
          </div>

          <div className="h-px bg-neutral-100" />

          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Credor</p>
            <p className="text-sm font-medium text-neutral-800">Banco Financeira S.A.</p>
          </div>

          <div className="h-px bg-neutral-100" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400">Valor original</p>
              <p className="text-sm font-semibold text-neutral-500 line-through">R$ 5.000,00</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400">Valor atualizado</p>
              <p className="text-lg font-bold text-neutral-900">R$ 5.000,00</p>
            </div>
          </div>
        </section>

        {/* Propostas */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-800">Escolha sua proposta</h2>

          {propostas.map((p) => {
            const ativa = selecionada === p.id && !expired;
            const desativada = expired;
            return (
              <button
                key={p.id}
                onClick={() => !desativada && setSelecionada(p.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                  ativa
                    ? "border-green-600 bg-green-50/50 ring-1 ring-green-600"
                    : desativada
                    ? "border-neutral-200 bg-neutral-50 opacity-50 cursor-not-allowed"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">{p.titulo}</span>
                      {!desativada && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.tagColor}`}>
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-neutral-900">{p.valor}</p>
                    <p className="text-xs text-neutral-500">{p.descricao}</p>
                  </div>
                  <div
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      ativa
                        ? "border-green-600 bg-green-600"
                        : "border-neutral-300"
                    }`}
                  >
                    {ativa && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            );
          })}

          {expired && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-amber-800">
                Esta oferta expirou.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Recarregue a página para consultar as condições atualizadas.
              </p>
            </div>
          )}
        </section>

        {/* Termos */}
        {!expired && (
          <section className="flex items-start gap-3">
            <button
              onClick={() => setAceito((v) => !v)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                aceito
                  ? "border-green-600 bg-green-600"
                  : "border-neutral-300 bg-white"
              }`}
            >
              {aceito && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Li e concordo com os{" "}
              <a href="#" className="underline text-neutral-700 hover:text-neutral-900">
                termos do acordo
              </a>{" "}
              e autorizo a formalização desta negociação.
            </p>
          </section>
        )}

        {/* Botão */}
        {!expired && (
          <button
            onClick={handlePagar}
            disabled={!aceito || pagando}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all ${
              aceito && !pagando
                ? "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {pagando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gerando pagamento...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Gerar pagamento
              </>
            )}
          </button>
        )}

        {/* Segurança */}
        <div className="flex items-center justify-center gap-4 text-xs text-neutral-400 pt-2">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            SSL seguro
          </span>
          <span className="flex items-center gap-1">
            <HandCoins className="w-3.5 h-3.5" />
            Asaas
          </span>
        </div>
      </main>
    </div>
  );
}

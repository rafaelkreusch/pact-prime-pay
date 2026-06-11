import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock, ArrowRight, Search, CheckCircle2, Clock, BadgePercent } from "lucide-react";

import logoAsset from "@/assets/devalor-logo.png.asset.json";
import { getDocumentType, isValidDocument, maskDocument, normalizeDocument } from "@/lib/domain/document";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Consultar débitos - Devalor Cobranças" },
      {
        name: "description",
        content:
          "Consulte suas ofertas de negociação com segurança e gere a cobrança automaticamente.",
      },
    ],
  }),
  component: IdentificationPage,
});

function IdentificationPage() {
  const navigate = useNavigate();
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = normalizeDocument(document);
  const isReady = normalized.length >= 11;
  const isValid = isValidDocument(normalized);
  const documentType = getDocumentType(normalized);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValid) {
      setError("Informe um CPF ou CNPJ válido para consultar as ofertas.");
      return;
    }

    setError(null);
    setLoading(true);

    navigate({
      to: "/negociacao",
      search: {
        document: normalized,
      },
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white" style={{ background: "var(--gradient-brand)" }}>
      <div className="absolute inset-0 -z-0 pointer-events-none" style={{ background: "var(--gradient-spot)" }} />
      <div
        className="absolute inset-0 -z-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <header className="relative z-10 px-5 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src={logoAsset.url} alt="Devalor - Soluções diferenciadas" className="h-12 sm:h-14 w-auto drop-shadow-lg" />
          <div className="hidden sm:flex items-center gap-2 text-white/75 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5" />
            Ambiente seguro
          </div>
        </div>
      </header>

      <main className="relative z-10 px-5 sm:px-8 pb-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center pt-6 lg:pt-12">
          <div className="space-y-6 text-center lg:text-left">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--brand-gold)" }}
            >
              <BadgePercent className="w-3.5 h-3.5" />
              Negociação digital e rápida
            </div>
            <h1 className="font-display font-bold leading-[1.05] tracking-tight text-[2.4rem] sm:text-5xl lg:text-[3.5rem]">
              Consulte sua proposta
              <br />
              <span style={{ color: "var(--brand-gold)" }}>e regularize sua pendência em poucos cliques.</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Informe seu CPF ou CNPJ para localizar as condições cadastradas no sistema
              e seguir direto para a cobrança no Asaas.
            </p>

            <ul className="grid sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0">
              {[
                { icon: CheckCircle2, label: "Consulta imediata" },
                { icon: Clock, label: "Fluxo em poucos passos" },
                { icon: ShieldCheck, label: "Cobrança segura" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-white/85">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--brand-gold)" }} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 space-y-5 relative"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="absolute -top-3 left-6 right-6 h-3 rounded-t-3xl opacity-60 blur-md" style={{ background: "var(--brand-gold)" }} />
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--brand-deep)" }}>
                Comece agora
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight">Consultar ofertas</h2>
              <p className="text-sm text-muted-foreground">Localizamos seus dados direto na base do Supabase.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="document" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                CPF ou CNPJ
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="document"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="00.000.000/0000-00"
                  value={document}
                  onChange={(event) => {
                    setDocument(maskDocument(event.target.value));
                    if (error) setError(null);
                  }}
                  className="w-full h-14 pl-11 pr-20 rounded-xl border-2 border-border bg-secondary/40 text-foreground text-base font-medium tabular-nums tracking-wide focus:outline-none focus:border-ring focus:bg-white transition-all"
                />
                {isReady && (
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                    style={{
                      color: "var(--brand-deep)",
                      background: "color-mix(in oklab, var(--brand-deep) 10%, transparent)",
                    }}
                  >
                    {documentType}
                  </span>
                )}
              </div>
              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full h-14 rounded-xl text-white font-display font-semibold text-sm uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "0 10px 30px -10px color-mix(in oklab, var(--brand-deep) 60%, transparent)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  Ver propostas
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-2" />
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-2">
                Seus dados são tratados com segurança e o pagamento é gerado somente após o aceite do acordo.
              </p>
            </div>
          </form>
        </div>
      </main>

      <footer className="relative z-10 text-center pb-6 text-white/45 text-[11px]">
        © {new Date().getFullYear()} Devalor Cobranças · Todos os direitos reservados
      </footer>
    </div>
  );
}

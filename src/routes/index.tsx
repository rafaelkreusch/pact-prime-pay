import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock, ArrowRight, Search, CheckCircle2, Clock, BadgePercent } from "lucide-react";
import logoAsset from "@/assets/devalor-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Consultar débitos - Devalor Cobranças" },
      {
        name: "description",
        content:
          "Consulte seus débitos com CPF ou CNPJ e negocie de forma segura, 100% online, com a Devalor Cobranças.",
      },
    ],
  }),
  component: IdentificacaoPage,
});

function maskCpfCnpj(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    // CPF 000.000.000-00
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  // CNPJ 00.000.000/0000-00
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function IdentificacaoPage() {
  const navigate = useNavigate();
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const digits = doc.replace(/\D/g, "");
  const valido = digits.length === 11 || digits.length === 14;
  const tipo = digits.length <= 11 ? "CPF" : "CNPJ";

  const handleConsultar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valido) {
      setErro("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }
    setErro(null);
    setLoading(true);
    setTimeout(() => navigate({ to: "/negociacao" }), 700);
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white" style={{ background: "var(--gradient-brand)" }}>
      {/* Spotlights */}
      <div className="absolute inset-0 -z-0 pointer-events-none" style={{ background: "var(--gradient-spot)" }} />
      {/* Grain / noise overlay using SVG */}
      <div className="absolute inset-0 -z-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}
      />

      {/* Header */}
      <header className="relative z-10 px-5 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src={logoAsset.url} alt="Devalor — Soluções diferenciadas" className="h-12 sm:h-14 w-auto drop-shadow-lg" />
          <div className="hidden sm:flex items-center gap-2 text-white/75 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5" />
            Ambiente 100% seguro
          </div>
        </div>
      </header>

      <main className="relative z-10 px-5 sm:px-8 pb-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center pt-6 lg:pt-12">
          {/* Hero text */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--brand-gold)" }}
            >
              <BadgePercent className="w-3.5 h-3.5" />
              Descontos exclusivos por tempo limitado
            </div>
            <h1 className="font-display font-bold leading-[1.05] tracking-tight text-[2.4rem] sm:text-5xl lg:text-[3.5rem]">
              Regularize sua pendência<br />
              <span style={{ color: "var(--brand-gold)" }}>e recupere sua tranquilidade financeira.</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Informe seu CPF ou CNPJ e descubra, em segundos, propostas personalizadas
              com até <strong className="text-white">80% de desconto</strong>. Sem fila, sem ligação, sem burocracia.
            </p>

            <ul className="grid sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0">
              {[
                { icon: CheckCircle2, label: "Acordo 100% online" },
                { icon: Clock, label: "Aprovação imediata" },
                { icon: ShieldCheck, label: "Pagamento seguro" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-white/85">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--brand-gold)" }} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Card */}
          <form
            onSubmit={handleConsultar}
            className="bg-white rounded-3xl p-6 sm:p-8 space-y-5 relative"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="absolute -top-3 left-6 right-6 h-3 rounded-t-3xl opacity-60 blur-md" style={{ background: "var(--brand-gold)" }} />
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--brand-deep)" }}>
                Comece agora
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                Consulte seus débitos
              </h2>
              <p className="text-sm text-muted-foreground">
                Leva menos de 30 segundos.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="doc" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                CPF ou CNPJ
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="doc"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={doc}
                  onChange={(e) => {
                    setDoc(maskCpfCnpj(e.target.value));
                    if (erro) setErro(null);
                  }}
                  className="w-full h-14 pl-11 pr-20 rounded-xl border-2 border-border bg-secondary/40 text-foreground text-base font-medium tabular-nums tracking-wide focus:outline-none focus:border-ring focus:bg-white transition-all"
                />
                {digits.length > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                    style={{ color: "var(--brand-deep)", background: "color-mix(in oklab, var(--brand-deep) 10%, transparent)" }}
                  >
                    {tipo}
                  </span>
                )}
              </div>
              {erro && (
                <p className="text-xs text-destructive font-medium">{erro}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!valido || loading}
              className="w-full h-14 rounded-xl text-white font-display font-semibold text-sm uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 10px 30px -10px color-mix(in oklab, var(--brand-deep) 60%, transparent)" }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  Consultar débitos
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-2" />
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-2">
                Seus dados são criptografados e tratados conforme a LGPD.
                A Devalor não compartilha suas informações.
              </p>
            </div>
          </form>
        </div>

        {/* Trust badges */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-3 gap-3 sm:gap-4 text-center">
          {[
            { label: "+150 mil", sub: "acordos firmados" },
            { label: "98%", sub: "satisfação" },
            { label: "24/7", sub: "disponível" },
          ].map((b) => (
            <div key={b.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl py-4 px-2">
              <p className="font-display font-bold text-white text-xl sm:text-2xl leading-none">{b.label}</p>
              <p className="text-[10px] sm:text-xs text-white/60 mt-1.5 uppercase tracking-wider">{b.sub}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 text-center pb-6 text-white/45 text-[11px]">
        © {new Date().getFullYear()} Devalor Cobranças · Todos os direitos reservados
      </footer>
    </div>
  );
}
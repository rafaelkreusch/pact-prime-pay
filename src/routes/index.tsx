import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock, ArrowRight, Search, Sparkles } from "lucide-react";

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
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background gradient + blobs */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -z-10 opacity-30"
        style={{ background: "var(--brand-light)" }}
      />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl -z-10 opacity-20"
        style={{ background: "var(--brand-light)" }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">D</span>
            </div>
            <div className="text-white">
              <p className="font-display font-bold text-sm tracking-tight leading-none">DEVALOR</p>
              <p className="text-[10px] text-white/60 uppercase tracking-widest leading-none mt-1">Cobranças</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/70 text-xs">
            <Lock className="w-3.5 h-3.5" />
            Ambiente seguro
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-16">
        <div className="max-w-md mx-auto pt-8 sm:pt-12">
          {/* Hero text */}
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-[11px] font-medium">
              <Sparkles className="w-3 h-3" />
              Negociação 100% digital
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight tracking-tight">
              Quite sua dívida<br />
              <span className="text-white/70">com até 80% de desconto</span>
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
              Informe seu CPF ou CNPJ para consultar débitos e ver propostas exclusivas.
            </p>
          </div>

          {/* Card */}
          <form
            onSubmit={handleConsultar}
            className="bg-white rounded-2xl p-6 sm:p-7 space-y-5"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
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
                  className="w-full h-14 pl-11 pr-20 rounded-xl border-2 border-border bg-secondary/40 text-foreground text-base font-medium tabular-nums tracking-wide focus:outline-none focus:border-accent focus:bg-white transition-all"
                />
                {digits.length > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-md uppercase">
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
              className="w-full h-14 rounded-xl text-primary-foreground font-display font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: valido && !loading ? "var(--gradient-brand)" : "var(--brand-deep)" }}
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

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "+150 mil", sub: "acordos firmados" },
              { label: "98%", sub: "satisfação" },
              { label: "24/7", sub: "disponível" },
            ].map((b) => (
              <div key={b.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3">
                <p className="font-display font-bold text-white text-base leading-none">{b.label}</p>
                <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center pb-6 text-white/40 text-[11px]">
        © {new Date().getFullYear()} Devalor Cobranças · Todos os direitos reservados
      </footer>
    </div>
  );
}
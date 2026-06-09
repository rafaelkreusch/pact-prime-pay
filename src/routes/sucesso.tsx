import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/sucesso")({
  head: () => ({
    meta: [
      { title: "Acordo realizado - Devalor Cobranças" },
      { name: "description", content: "Seu acordo foi formalizado com sucesso." },
    ],
  }),
  component: Sucesso,
});

function Sucesso() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-neutral-100 p-8 max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-neutral-900">Acordo formalizado</h1>
          <p className="text-sm text-neutral-500">
            Seu pagamento foi gerado com sucesso. Você receberá os dados por e-mail e SMS.
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-left space-y-2">
          <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Resumo</p>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Valor negociado</span>
            <span className="font-semibold text-neutral-900">R$ 1.250,00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Forma</span>
            <span className="font-semibold text-neutral-900">À vista</span>
          </div>
          <div className="h-px bg-green-200" />
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Economia</span>
            <span className="font-semibold text-green-700">R$ 3.750,00</span>
          </div>
        </div>
        <Link
          to="/"
          className="inline-block w-full bg-neutral-900 text-white text-sm font-semibold rounded-xl py-3.5 hover:bg-neutral-800 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

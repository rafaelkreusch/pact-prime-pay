# Pact Prime Pay

Fluxo de negociação de dívidas com consulta no `Supabase` e geração automática de cobrança no `Asaas`.

## Variáveis de ambiente

Copie `.env.example` e preencha:

- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ASAAS_API_KEY`

## Banco de dados

Crie as tabelas no `Supabase` executando o SQL em `supabase/schema.sql`.

Tabela principal para cadastro manual das ofertas:

- `devedor`
- `cnpj`
- `credor`
- `valor_avista`
- `parcela_2x`
- `parcela_3x`
- `parcela_4x`

## Fluxo implementado

1. O usuário informa o documento.
2. O sistema consulta o `Supabase`.
3. As propostas são exibidas com base na linha cadastrada.
4. Ao aceitar uma proposta, o sistema:
   - registra o acordo no `Supabase`
   - localiza ou cria o cliente no `Asaas`
   - cria a cobrança automaticamente
   - salva os identificadores e links retornados
5. A tela final exibe o resumo e o link da cobrança.

## Observações

- A integração usa `billingType: UNDEFINED` no `Asaas`, permitindo que o devedor escolha a forma disponível na fatura.
- O ambiente local atual não possui `node`, `npm` ou `bun`, então a validação de build depende do seu ambiente ou do Lovable.

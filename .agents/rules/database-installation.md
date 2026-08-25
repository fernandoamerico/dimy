# Diretrizes de Instalação e Banco de Dados (Dimy CMS)

Esta regra documenta como o Dimy gerencia sua instalação inicial e como IAs e desenvolvedores devem proceder para alterar o banco de dados principal (ex: migrar de SQLite para PostgreSQL/Supabase).

## 1. Fluxo de Instalação Inicial (Setup Wizard)

O Dimy não requer que o banco de dados seja populado manualmente antes da primeira execução. Ele possui um sistema de "Onboarding" automático:

1. **Middleware (`src/middleware.ts`)**: Bloqueia rotas protegidas se o usuário não tiver uma sessão JWT válida, e o redireciona para `/login`.
2. **Página de Login (`src/app/login/page.tsx`)**: Executa uma query simples `db.user.count()`. Se o retorno for `0` (nenhum usuário no banco), ele entende que é uma instalação nova e redireciona para `/setup`.
3. **Página de Setup (`src/app/setup/page.tsx`)**: Permite a criação da conta Administrativa e definição do Nome do Projeto. Após salvar, inicia a sessão e libera o acesso ao painel.

**Como IA, NUNCA crie seeds para popular o administrador.** Deixe o usuário passar pelo fluxo de `/setup`.

## 2. Mudando de SQLite para PostgreSQL (Supabase, Neon, AWS, etc)

O Dimy vem configurado por padrão com o SQLite (`provider = "sqlite"`) por ser um arquivo local (`dev.db`), facilitando testes rápidos.
Para instalar o Dimy em servidores escaláveis usando PostgreSQL (ex: Supabase), siga estes passos:

### Passo 1: Atualizar o Schema
No arquivo `prisma/schema.prisma`, altere o provider:
```prisma
datasource db {
  provider = "postgresql" // Mudado de sqlite para postgresql
  url      = env("DATABASE_URL")
}
```

### Passo 2: Configurar a Variável de Ambiente
Crie ou atualize o arquivo `.env` na raiz do projeto:
```env
# Exemplo para Supabase:
DATABASE_URL="postgresql://postgres.[SEU-PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Segredo para assinatura dos Cookies (JWT)
SESSION_SECRET="uma-chave-longa-e-aleatoria-aqui"
```

### Passo 3: Sincronizar o Banco de Dados
Sempre que o provedor for alterado, o banco de dados remoto precisa ser criado. Use:
```bash
npx prisma db push
```
*(Nota: não use `npx prisma migrate dev` a menos que esteja criando um histórico estrito de migrações em um banco já em produção, `db push` é preferível na fase inicial de configuração).*

### Passo 4: Regenerar o Cliente
```bash
npx prisma generate
```

Feito isso, ao rodar `npm run dev` ou `npm run start`, o Dimy se conectará ao Postgres e o fluxo de `/setup` (Criar primeiro admin) começará automaticamente na interface Web.

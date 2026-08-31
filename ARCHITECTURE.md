# ARQUITETURA DO SISTEMA: DIMY CMS (Motor GO)

Atue como Arquiteto de Software Sênior especializado em Go (Golang), SQLite e Sistemas Modulares.
Esta é a documentação definitiva da Arquitetura atual do Dimy CMS. **Sempre respeite este guia para não desviar do modelo estabelecido.**

---

## 1. Visão Geral do Sistema
* **Nome do Projeto:** Dimy CMS
* **Objetivo:** Um CMS distribuível em binário único, extremamente leve, auto-hospedável, com atualizações em 1 clique e arquitetura modular (conceito de "tudo é extensão" como no WordPress e PocketBase).
* **Público-alvo:** Usuários comuns e agentes de IA que precisam instalar e operar o CMS sem precisar entender de Docker, Node.js ou Bancos de Dados remotos.

---

## 2. Stack Tecnológica Definitiva (Não usar Node.js/Prisma no Backend)

1. **Core Backend:** Construído inteiramente em Go (`main.go`, `api/`, `handlers/`). Compilado como arquivo executável único.
2. **Banco de Dados Embutido (Híbrido):** 
   - Arquivo local SQLite (`dev.db?_journal=WAL`) utilizado por padrão para facilidade de instalação.
   - Suporte nativo a PostgreSQL para produção. A alternância é feita automaticamente lendo a env `DATABASE_URL` no pacote `db/db.go`. Sem uso de Prisma ORM.
3. **Engine de Extensões / Plugins:** JavaScript Sandbox (`sandbox/sandbox.go`). Plugins são escritos em JS/TS, lidos, transpilados pelo `esbuild` em runtime e rodados em uma VM isolada `Goja`.
4. **Painel Administrativo (Frontend):** Construído com Next.js 15 configurado como SPA estático (`output: 'export'`). Fica na pasta `frontend/`. 
   - **Crucial:** O build gerado em `frontend/out` é sugado para dentro do executável compilado do Go através da diretiva `//go:embed`. Não existem "Server Actions" no frontend. Toda ação bate na API REST do Go via `fetch`.
5. **Atualizações:** Mecanismo de auto-update integrado em `updater/updater.go` com GitHub Releases.

---

## 3. Estrutura de Diretórios

```text
dimy-root/
├── main.go                 # Entrypoint Go. Inicia BD e API Web
├── api/                    # Configurações do Router (Servidor Web) e embed estático
├── handlers/               # Endpoints REST, Middlewares (`RequireAuth`) e Lógicas Auxiliares (ex: `checkCollectionAccess`)
├── models/                 # Tipagem e Mapeamento de entidades (ex: User, Document, ApiKey)
├── db/                     # Conexão híbrida DB e Auto-Migrações SQL Raw
├── sandbox/                # Integração Goja/esbuild para Plugins Customizados
├── updater/                # Auto-update conectando via API do GitHub
├── frontend/               # Código Next.js. Isolado de backends
│   └── src/core/api.ts     # Cliente Fetch que conversa com os handlers de Go
├── extensions/             # (Gerado em Runtime) Plugins do usuário
├── uploads/                # (Gerado em Runtime) Mídias anexadas
└── dimy.db                 # (Gerado em Runtime) Se SQLite
```

## 4. Regras Absolutas para Agentes de IA

1. **Sem Node.js no Backend:** Nunca instale bibliotecas `npm` ou crie rotas de servidor Next.js (`route.ts` ou `"use server"` actions) para interagir com o Banco de Dados. A API agora mora estritamente no pacote Go (`handlers/`).
2. **Banco SQL Seguro:** Sempre faça uso das queries parametrizadas (ex: `WHERE email = $1`) no módulo de banco do Go para evitar injeções e falhas na mudança entre drivers PostgreSQL/SQLite.
3. **Single Binary:** Não crie arquivos soltos ou templates HTML espalhados pelo backend. Tudo que é visual deve estar no `frontend/` para ser processado no build do Next e incorporado (Embedded) no Go.
4. **Autenticação Headless Híbrida:** O backend suporta duas formas de autenticação: Cookie `dimy_session` (para o painel interno) e `Authorization: Bearer <Token>` da tabela `api_keys` (para clientes externos). O `handlers/middleware.go` gerencia isso globalmente para escritas, e `handlers/content.go` cuida da leitura pública/privada granular.
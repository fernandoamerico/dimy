# ESPECIFICAÇÃO DE ARQUITETURA E MIGRAÇÃO DO PROJETO: DIMY CMS

Atue como Arquiteto de Software Sênior especializado em Go (Golang), SQLite e Sistemas Modulares. 
Estou migrando o meu CMS (chamado **Dimy**) de uma stack antiga (Node.js/Next.js) para uma nova arquitetura moderna, leve e auto-hospedável baseada em **Go**, inspirada no modelo do PocketBase e WordPress (conceito de "tudo é extensão"), com foco total em facilidade de instalação por usuários iniciantes e automação por IA.

---

## 1. Visão Geral do Sistema
* **Nome do Projeto:** Dimy CMS
* **Objetivo:** Um CMS distribuível em binário único, extremamente leve (consumo de RAM em repouso < 35 MB), auto-hospedável, com atualizações em 1 clique e arquitetura modular onde páginas, posts, integrações e plugins são tratados uniformemente como **Extensões**.
* **Público-alvo:** Usuários comuns e agentes de IA que precisam instalar e operar o CMS via scripts simples (ex: `curl | bash` e `./dimy serve`).

---

## 2. Stack Tecnológica Definida

1. **Core Backend:** Go (Golang) compilado como binário único auto-contido para Linux (x86/ARM), Windows e macOS.
2. **Banco de Dados Embutido:** SQLite com modo WAL (Write-Ahead Logging) habilitado para alta performance e concorrência (com suporte futuro a PostgreSQL via drivers).
3. **Engine de Extensões / Plugins:** JavaScript Sandbox embutido no Go (usando `Goja` ou `QuickJS/v8go`). As extensões são escritas em JS/TS simples, mas rodam isoladas dentro do runtime Go.
4. **Painel Administrativo (Frontend):** SPA moderna (SvelteKit ou React/Vite com Tailwind CSS), cujos arquivos estáticos de build são embutidos diretamente no binário Go via `//go:embed`.
5. **API & Interface de IA:** REST API padronizada (OpenAPI/Swagger) e suporte nativo a servidor MCP (Model Context Protocol) para interação autônoma com agentes de IA.

---

## 3. Estrutura de Diretórios e Isolamento

```text
dimy-root/
├── dimy                    # Binário único executável (Core)
├── dimy.db                 # Banco de dados SQLite local
├── dimy.config.json        # Configurações gerais da instância
├── uploads/                # Mídias e uploads dos usuários
└── extensions/             # Pasta isolada de extensões (Core nunca sobrescreve)
    ├── core-users/         # Extensão padrão de gestão de usuários
    └── stripe-payments/    # Extensão de terceiros/usuário
        ├── manifest.json   # Metadados e campos de configuração da UI
        ├── index.js        # Lógica backend executada no Sandbox JS
        └── ui/             # (Opcional) Telas customizadas injetadas no painel
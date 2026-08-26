<div align="center">
  <h1>Dimy CMS</h1>
  <p><strong>Um CMS Moderno, Rápido, Auto-hospedável e Distribuído em um Único Binário</strong></p>
</div>

O **Dimy** é um Sistema de Gerenciamento de Conteúdo focado em performance extrema, design moderno e arquitetura distribuída. Abandonamos dependências complexas (como Node.js, `node_modules` e ORMs pesados em produção) para entregar o CMS inteiro em um **único arquivo executável Go**.

## 🚀 Principais Tecnologias
- **Core (Backend):** [Go 1.22+](https://go.dev/) (Roteamento nativo super rápido).
- **Frontend (Painel Administrativo):** SPA feita em [Next.js 15](https://nextjs.org/) estático embutida diretamente no binário via `//go:embed`.
- **Banco de Dados Híbrido:** Suporte nativo e automático para **SQLite** (dev/local) ou **PostgreSQL** (produção/Supabase) usando drivers nativos do Go (`pgx` e `go-sqlite3`).
- **Sistema de Plugins (Sandbox):** Extensões de usuário escritas em JavaScript moderno (ES6+/TS) executadas de forma isolada dentro do Go via **Goja** e transpiladas em runtime pelo **esbuild**.
- **Autenticação:** Stateless JWT seguro (`HS256`) com cookies `HttpOnly` e senhas protegidas com `Bcrypt`.
- **Auto-Update:** Sistema de atualização via 1 clique conectado diretamente ao GitHub Releases.

---

## 🛠️ Como Desenvolver e Rodar Localmente

O código fonte é dividido em duas partes: o motor Go e o painel Next.js.

### Pré-requisitos
- [Go](https://go.dev/dl/) (1.22 ou superior)
- [Node.js](https://nodejs.org/) (Versão 20+ apenas para compilar a UI)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/fernandoamerico/dimy.git
   cd dimy
   ```

2. **Gere a Interface de Usuário (Painel):**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
   *Isso criará a pasta `frontend/out` que será embutida no Go.*

3. **Inicie o Servidor Localmente:**
   Na raiz do projeto, instale as dependências do Go e rode o projeto:
   ```bash
   go mod tidy
   go run main.go
   ```
   
4. **Pronto!** Acesse `http://localhost:8080`. Se for o primeiro acesso, o banco SQLite `dev.db` será criado automaticamente e você entrará na tela de setup.

---

## ☁️ Como Compilar e Colocar em Produção

O Dimy usa **GoReleaser** para gerar builds multiplataforma facilmente. Se você for rodar no servidor, não precisa instalar Node nem NPM. Basta pegar o executável!

1. **Baixar a Release Oficial:** 
   Vá na aba "Releases" do GitHub e baixe o binário para o seu servidor (Linux, Windows ou Mac).
2. **Rodar o Executável:**
   ```bash
   ./dimy
   ```
3. **Mudar de SQLite para PostgreSQL:**
   Para usar um banco robusto em produção (como Supabase), basta exportar a URL do Postgres antes de iniciar o servidor:
   ```bash
   export DATABASE_URL="postgres://usuario:senha@servidor.com:5432/dimy"
   export SESSION_SECRET="sua-chave-secreta-muito-forte"
   ./dimy
   ```
   O Dimy fará as *migrations* (criação de tabelas) de forma 100% automática ao iniciar!

Veja as diretrizes completas de banco na documentação: `/.agents/rules/database-installation.md`

## 🤝 Contribuindo
Toda ajuda para tornar o Dimy o CMS em Go mais rápido e extensível do mercado é bem-vinda!

## 📄 Licença
Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.

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
- **Autenticação:** Stateless JWT seguro (`HS256`) com cookies `HttpOnly` para o painel, e suporte robusto a **API Keys (Bearer Tokens)** para consumo Headless.
- **Coleções Públicas e Privadas:** Controle de granularidade de acesso (Totalmente Público ou Bloqueado por Token) configurado diretamente na Coleção.
- **Deploy Profissional:** Fluxo de distribuição otimizado via GitHub Actions (Docker/Bare Metal) sem atualizações automáticas inseguras.

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

## 📡 Integração Headless (Consumindo a API)

O Dimy CMS foi desenhado para funcionar como um backend independente para qualquer frontend (Next.js, Vue, Mobile, etc.).

### 1. Coleções Públicas
Se você marcar uma coleção como "Pública" no painel, os dados estarão acessíveis abertamente:
```bash
curl http://localhost:8080/api/content/collections/sua-colecao
```

### 2. Coleções Privadas (API Keys)
Coleções privadas exigem autorização. Gere um token no painel administrativo e envie via cabeçalho `Authorization`:
```bash
curl -H "Authorization: Bearer <SEU_TOKEN>" http://localhost:8080/api/content/documents?collectionId=<ID>
```

---

## ☁️ Como Instalar e Atualizar em Produção (Para Clientes)

O Dimy utiliza o GitHub Actions para compilar automaticamente toda a aplicação em executáveis fechados a cada nova versão (Tag) lançada.

### Opção 1: Via Docker (Recomendado)
A forma mais segura e fácil de rodar e manter o sistema. O banco de dados e os binários ficam isolados.
- **Instalação:** Basta criar um arquivo `docker-compose.yml` (disponível na nossa documentação oficial) apontando para a nossa imagem hospedada no Docker Hub / GHCR e rodar `docker compose up -d`.
- **Como Atualizar:** Quando houver uma nova versão, o painel apenas notificará a disponibilidade. Para aplicar, entre na VPS e rode:
  ```bash
  docker compose pull && docker compose up -d
  ```

### Opção 2: Binário Puro (Bare Metal Linux)
Para ambientes que não usam Docker, fornecemos binários pré-compilados e autossuficientes na aba **Releases**.
- **Instalação:** 
  Vá na aba "Releases" do GitHub e baixe o binário para o seu servidor (Linux, Windows ou Mac).
- **Como Atualizar:**
  Baixe o arquivo `.zip` ou `.tar.gz` mais recente na página de Releases, descompacte-o e substitua o executável `dimy` antigo pelo novo no seu servidor. Recomendamos o uso de um gerenciador de processos (como **Systemd** ou **PM2**) para reiniciar o sistema instantaneamente após a substituição.

> **💡 Sobre Banco de Dados (Produção e Supabase):**
> O Dimy cria bancos SQLite locais por padrão. Para ambientes de produção, atualmente o CMS possui suporte nativo focado no **Supabase (PostgreSQL)**. 
> 
> Para conectar, exporte as variáveis no ambiente/Docker apontando para a sua string de conexão do Supabase antes de iniciar:
> ```bash
> export DATABASE_URL="postgres://postgres:[SUA_SENHA]@[SEU_HOST].pooler.supabase.com:6543/postgres"
> export SESSION_SECRET="sua-chave-secreta-muito-forte"
> ./dimy
> ```
> **⚠️ Aviso:** O suporte oficial out-of-the-box (pronto para uso) atualmente cobre apenas essa configuração via Supabase (e o SQLite para dev). Caso deseje utilizar outros provedores ou tipos de bancos de dados, a adaptação da infraestrutura deverá ser feita de forma independente.
> 
> O sistema roda as *migrations* automaticamente na inicialização.

Veja as diretrizes completas de banco na documentação: `/.agents/rules/database-installation.md`

## 🤝 Contribuindo
Toda ajuda para tornar o Dimy o CMS em Go mais rápido e extensível do mercado é bem-vinda!

## 📄 Licença
Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.

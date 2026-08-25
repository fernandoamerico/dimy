<div align="center">
  <h1>Adimy</h1>
  <p><strong>Um CMS Moderno, Rápido e Descomplicado</strong></p>
</div>

O **Adimy** é um Sistema de Gerenciamento de Conteúdo (CMS) focado em performance, design moderno e facilidade de configuração inicial. Inspirado em soluções como Payload CMS, ele foi projetado para rodar onde você quiser — desde uma VPS modesta até arquiteturas Serverless/Edge na Vercel — graças à sua base construída sobre as tecnologias web mais modernas.

## 🚀 Principais Tecnologias
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI/UX**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Banco de Dados**: [Prisma ORM](https://www.prisma.io/) (Configurado com SQLite por padrão, pronto para migrar para PostgreSQL/Supabase)
- **Autenticação**: Stateless JWT via [jose](https://github.com/panva/jose) (Edge-ready e super seguro)
- **Design**: Glassmorphism moderno com sistema de temas nativo (Claro / Assistente Dark Mode)

---

## ✨ Funcionalidades em Destaque
- **Instalação Descomplicada (Wizard):** Assim que você roda o projeto pela primeira vez e acessa o sistema, uma tela guiada maravilhosa (Wizard) ajuda a criar a sua primeira conta de administrador e definir o nome do projeto. Sem a necessidade de rodar comandos de seeds complicados.
- **Autenticação Stateless (Zero Banco de Dados para Sessões):** Usamos JWT via cookies HttpOnly. Isso significa que as verificações de sessão não sobrecarregam o seu banco de dados, deixando o Adimy extremamente rápido.
- **Sistema de Temas Avançado:** Suporte imediato a modo claro e escuro, com transições fluídas graças à integração nativa com o `next-themes` e Tailwind v4.

---

## 🛠️ Como Instalar e Rodar Localmente

Siga os passos abaixo para testar ou desenvolver usando o **Adimy** na sua máquina.

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (Versão 18.17 ou superior)
- NPM, Yarn ou pnpm (Usamos npm como padrão)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/adimy.git
   cd adimy
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo (ou use o `.env.example` se houver):
   ```env
   # URL de Conexão com o Banco de Dados (Por padrão SQLite para facilidade)
   DATABASE_URL="file:./dev.db"
   
   # Segredo forte para criptografia dos Cookies e JWT (Gere uma chave complexa!)
   SESSION_SECRET="uma-senha-secreta-de-pelo-menos-32-caracteres-muito-segura"
   ```

4. **Prepare o Banco de Dados:**
   Como estamos usando o Prisma com SQLite por padrão, basta rodar o comando abaixo para criar as tabelas e o arquivo local do banco:
   ```bash
   npx prisma db push
   ```

5. **Inicie o Servidor:**
   ```bash
   npm run dev
   ```

6. **Inicie a Configuração:**
   Abra seu navegador em [http://localhost:3000](http://localhost:3000). 
   Você será redirecionado para a tela de `/setup`. Preencha os dados do formulário para criar seu superusuário e aproveitar o Adimy!

---

## ☁️ Colocando em Produção e Mudando de Banco (PostgreSQL / Supabase)

O Adimy usa o `SQLite` para facilitar a vida de quem está testando ou construindo um projeto simples localmente. Porém, para produção, recomendamos usar um banco de dados robusto como **PostgreSQL**, hospedado em serviços como [Supabase](https://supabase.com/), Neon ou Railway.

Para realizar a mudança, leia o guia de arquitetura e documentação para migração que preparamos em: 
📄 `/.agents/rules/database-installation.md`

## 🤝 Contribuindo
Sinta-se livre para abrir issues e enviar Pull Requests! Toda ajuda para tornar o Adimy ainda mais rápido, seguro e modular é bem-vinda.

## 📄 Licença
Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.

# Diretrizes de Instalação e Banco de Dados (Dimy CMS - Arquitetura Go)

Esta regra documenta como o motor Go do Dimy gerencia sua inicialização e como IAs e desenvolvedores devem proceder para alterar o banco de dados (SQLite e PostgreSQL/Supabase).

**O Dimy NÃO usa Prisma ORM, Node.js e `npm` em Produção.** O sistema foi migrado para um binário executável Go único com SQL cru.

## 1. Fluxo de Instalação Inicial Automático

O Dimy não requer execução manual de migrações (`prisma migrate`) ou seeds antes da primeira execução. Ele possui um sistema de Onboarding autônomo baseado no código em Go:

1. **Auto-Migração (`db/migrations.go`)**: Ao rodar o binário `dimy`, o servidor automaticamente executa os comandos `CREATE TABLE IF NOT EXISTS` adequados para o banco de dados ativo no momento (SQLite ou Postgres).
2. **Página de Login (`frontend/src/app/login`)**: Caso não haja configuração ativa, uma checagem pela API `/api/system/config` informará ao Frontend. Se houver 0 usuários na tabela `users` do banco SQL, o sistema direciona o administrador para o fluxo `/setup`.
3. **Página de Setup (`/api/auth/setup`)**: Cria a conta do superusuário usando Hashing **Bcrypt**, gera o Token JWT seguro e libera a entrada.

**Como IA, NUNCA crie queries manuais de seed para o banco de dados.** Deixe o usuário (ou você mesmo testando) passar pelo fluxo HTTP de configuração do Dimy.

## 2. Mudando de SQLite para PostgreSQL (Supabase, Neon, AWS, etc)

O arquivo `db/db.go` do Dimy implementa **"Smart Connection"**. Ele detecta o tipo de banco automaticamente e altera a sintaxe SQL e drivers (entre `github.com/mattn/go-sqlite3` e `github.com/jackc/pgx/v5`).

O Dimy usa **SQLite por padrão** no ambiente de desenvolvimento se nenhuma URL for passada (criando o arquivo local `dev.db?_journal=WAL`).

### Como usar o PostgreSQL em Produção

Você não precisa tocar no código ou rodar comandos de regeneração de ORM! Basta exportar a Variável de Ambiente `DATABASE_URL` no servidor antes de iniciar o executável do Go:

```bash
# Exportar a URL padrão do Supabase ou Postgres (Deve começar com postgres://)
export DATABASE_URL="postgres://postgres:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

# Rodar o binário
./dimy
```

Ao iniciar o binário `dimy`, a engine `db/db.go` fará o seguinte:
1. Detectará `postgres://` na string.
2. Trocará do driver `sqlite3` para o driver PostgreSQL `pgx`.
3. Executará os `CREATE TABLE` com os tipos compatíveis (ex: `JSONB` em vez de texto plano do SQLite).
4. O servidor iniciará conectado ao Postgres remoto, 100% pronto para uso!

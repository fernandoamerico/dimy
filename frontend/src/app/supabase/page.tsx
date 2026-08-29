'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Database, CheckCircle2, Terminal, ExternalLink, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 dark:bg-neutral-950 text-emerald-400 text-xs rounded-xl px-4 py-3 overflow-x-auto font-mono">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="Copiar"
      >
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center">
        {number}
      </div>
      <div className="flex-1 space-y-2 pb-6 border-b border-gray-100 dark:border-neutral-800 last:border-0 last:pb-0">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="text-sm text-gray-600 dark:text-neutral-400 space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function SupabasePage() {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    const loadingToast = toast.loading('Testando conexão com o banco de dados...');
    try {
      const res = await fetch('/api/system/test-database');
      if (res.ok) {
        toast.success('Conexão estabelecida com sucesso!', { id: loadingToast });
      } else {
        const errData = await res.text();
        toast.error(errData || 'Erro ao conectar.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Erro de rede ao testar conexão.', { id: loadingToast });
    }
    setIsTesting(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Configurar Supabase</h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-1 text-sm">
              Conecte o Dimy ao Supabase (PostgreSQL) para garantir que seus dados fiquem seguros e persistentes.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-orange-800 dark:text-orange-300">Sem essa configuração, seus dados estão em risco.</p>
            <p className="text-orange-700 dark:text-orange-400 mt-0.5">
              Enquanto a variável <code className="bg-orange-100 dark:bg-orange-900/50 px-1 rounded">DATABASE_URL</code> não estiver configurada, o Dimy usa SQLite local, que é apagado a cada redeploy do container.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-400" /> Passo a Passo
          </h2>

          <div className="space-y-6">

            <Step number={1} title="Crie uma conta no Supabase">
              <p>Acesse <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-emerald-400 underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> e crie uma conta gratuita.</p>
            </Step>

            <Step number={2} title="Crie um novo projeto">
              <p>No painel do Supabase, clique em <strong>New Project</strong>, escolha um nome, defina a senha do banco e selecione a região mais próxima de você.</p>
            </Step>

            <Step number={3} title="Copie a connection string">
              <p>Dentro do projeto, vá em:</p>
              <p className="font-mono bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-xs">
                Project Settings → Database → Connection String → URI
              </p>
              <p>Selecione o modo <strong>Session</strong> e copie a URI. Ela tem este formato:</p>
              <CodeBlock code={`postgresql://postgres:[SUA-SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres`} />
            </Step>

            <Step number={4} title="Configure a variável de ambiente">
              <p>Se estiver usando <strong>Docker / docker-compose</strong>, adicione no seu <code className="bg-gray-100 dark:bg-neutral-800 px-1 rounded">docker-compose.yml</code>:</p>
              <CodeBlock code={`services:\n  dimy:\n    image: fernandoamerico/dimy:latest\n    environment:\n      - DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[REF].supabase.co:5432/postgres\n    ports:\n      - "8080:8080"`} />
              <p>Se estiver rodando localmente, crie um arquivo <code className="bg-gray-100 dark:bg-neutral-800 px-1 rounded">.env</code> na raiz do projeto:</p>
              <CodeBlock code={`DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[REF].supabase.co:5432/postgres`} />
            </Step>

            <Step number={5} title="Reinicie o servidor">
              <p>Após definir a variável, reinicie o Dimy. Na próxima inicialização, o sistema detecta automaticamente o Supabase e cria todas as tabelas necessárias.</p>
              <CodeBlock code={`# Docker Compose\ndocker compose down && docker compose up -d\n\n# Ou local\ngo run main.go`} />
            </Step>

            <Step number={6} title="Verifique a conexão">
              <p>Na tela de <strong>Configurações → Atualizações do Sistema</strong>, o aviso laranja sobre SQLite vai desaparecer, confirmando que a conexão com o Supabase está ativa.</p>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Você verá: <em>"Banco de dados: Supabase (PostgreSQL)"</em>
              </div>
            </Step>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 text-sm font-medium rounded-xl transition-colors"
          >
            {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Testar Conexão'}
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Painel do Supabase
          </a>
        </div>

      </div>
    </DashboardLayout>
  );
}

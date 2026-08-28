'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Briefcase, Save, Loader2, CheckCircle2, Building2, Phone, Mail, Globe, AtSign, Link as LinkIcon, Hash, Server, Download } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useDatabaseWarning } from '@/components/ui/DatabaseWarningProvider';
import { toast } from 'sonner';

const CONFIG_KEYS = [
  'business_name',
  'business_cnpj',
  'business_logo',
  'business_phone',
  'business_email',
  'business_website',
  'business_address',
  'business_instagram',
  'business_facebook',
];

export default function MeuNegocioPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { guardedSubmit } = useDatabaseWarning();

  useEffect(() => {
    async function load() {
      const results: Record<string, string> = {};
      await Promise.all(
        CONFIG_KEYS.map(async (key) => {
          try {
            const res = await fetch(`/api/system/config?key=${key}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.value) results[key] = data.value;
            }
          } catch {}
        })
      );
      setForm(results);
      setLogo(results['business_logo'] || '');
    }
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    guardedSubmit(async () => {
      setIsSaving(true);
      setSaved(false);
      const payload = { ...form, business_logo: logo };
      try {
        await Promise.all(
          Object.entries(payload).map(([key, value]) =>
            fetch('/api/system/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key, value }),
            })
          )
        );
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch {
        toast.error('Erro ao salvar as informações.');
      }
      setIsSaving(false);
    });
  };

  const input = (key: string, placeholder: string, type = 'text') => (
    <input
      type={type}
      value={form[key] || ''}
      onChange={(e) => handleChange(key, e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all"
    />
  );

  const handleDownloadJSON = async () => {
    try {
      const res = await fetch('/api/business');
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business_info.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('JSON baixado com sucesso!');
    } catch {
      toast.error('Erro ao baixar o JSON da API. (O backend está rodando?)');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Meu Negócio</h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-1 text-sm">
              Configure as informações centrais da sua empresa para uso em todo o site.
            </p>
          </div>
        </div>

        {/* API Info */}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-xl h-fit">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">Integração API (Pública)</h3>
              <p className="text-emerald-700 dark:text-emerald-400/80 text-xs mt-0.5">
                Esses dados estão disponíveis no endpoint <code className="bg-emerald-200/50 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded font-mono font-bold">GET /api/business</code>
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadJSON}
            type="button"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Baixar Estrutura JSON
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Identidade */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" /> Identidade
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Negócio</label>
                {input('business_name', 'Ex: Acme Corp')}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> CNPJ
                </label>
                {input('business_cnpj', 'Ex: 00.000.000/0001-00')}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
              <ImageUploader value={logo} onChange={setLogo} placeholder="URL ou Upload da Logo" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
              {input('business_address', 'Ex: Rua das Flores, 123 – São Paulo, SP')}
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> Contato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Telefone / WhatsApp
                </label>
                {input('business_phone', 'Ex: +55 (11) 99999-9999')}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> E-mail Comercial
                </label>
                {input('business_email', 'Ex: contato@acme.com', 'email')}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                {input('business_website', 'Ex: https://acme.com', 'url')}
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-gray-400" /> Redes Sociais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5" /> Instagram
                </label>
                {input('business_instagram', 'Ex: https://instagram.com/acme', 'url')}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Facebook
                </label>
                {input('business_facebook', 'Ex: https://facebook.com/acme', 'url')}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Informações'}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}

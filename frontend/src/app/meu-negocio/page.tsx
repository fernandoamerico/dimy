'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Briefcase, Save, Loader2, CheckCircle2, Building2, Phone, Mail, Globe, AtSign, Server, Download, Plus, Trash2, Link as LinkIcon, Camera, Users, Video, MessageCircle } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useDatabaseWarning } from '@/components/ui/DatabaseWarningProvider';
import { toast } from 'sonner';
import { countryCodes } from '@/core/countries';

const CONFIG_KEYS = [
  'business_name',
  'business_cnpj',
  'business_logo',
  'business_phones', // New Array JSON
  'business_phone',  // Legacy migration
  'business_emails', // New Array JSON
  'business_email',  // Legacy migration
  'business_website',
  'business_address',
  'business_instagram',
  'business_facebook',
  'business_linkedin',
  'business_youtube',
  'business_twitter',
  'business_tiktok',
  'business_social_custom' // New Array JSON
];

interface PhoneInfo {
  countryCode: string;
  number: string;
}

interface CustomSocial {
  title: string;
  url: string;
}

export default function MeuNegocioPage() {
  // Scalar fields (name, cnpj, single strings)
  const [form, setForm] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState('');
  
  // Dynamic Arrays
  const [phones, setPhones] = useState<PhoneInfo[]>([{ countryCode: '55', number: '' }]);
  const [emails, setEmails] = useState<string[]>(['']);
  const [customSocials, setCustomSocials] = useState<CustomSocial[]>([]);

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
              if (data && data.value) results[key] = data.value;
            }
          } catch {}
        })
      );
      
      // Parse Phones (with legacy fallback)
      let parsedPhones: PhoneInfo[] = [];
      try {
        if (results.business_phones) {
          parsedPhones = JSON.parse(results.business_phones);
        } else if (results.business_phone) {
          parsedPhones = [{ countryCode: '55', number: results.business_phone }];
        }
      } catch {}
      setPhones(parsedPhones.length > 0 ? parsedPhones : [{ countryCode: '55', number: '' }]);

      // Parse Emails (with legacy fallback)
      let parsedEmails: string[] = [];
      try {
        if (results.business_emails) {
          parsedEmails = JSON.parse(results.business_emails);
        } else if (results.business_email) {
          parsedEmails = [results.business_email];
        }
      } catch {}
      setEmails(parsedEmails.length > 0 ? parsedEmails : ['']);

      // Parse Custom Socials
      let parsedCustomSocials: CustomSocial[] = [];
      try {
        if (results.business_social_custom) {
          parsedCustomSocials = JSON.parse(results.business_social_custom);
        }
      } catch {}
      setCustomSocials(parsedCustomSocials);

      // Set Scalar Form Fields
      setForm({
        business_name: results.business_name || '',
        business_cnpj: results.business_cnpj || '',
        business_website: results.business_website || '',
        business_address: results.business_address || '',
        business_instagram: results.business_instagram || '',
        business_facebook: results.business_facebook || '',
        business_linkedin: results.business_linkedin || '',
        business_youtube: results.business_youtube || '',
        business_twitter: results.business_twitter || '',
        business_tiktok: results.business_tiktok || '',
      });
      setLogo(results.business_logo || '');
    }
    load();
  }, []);

  const handleScalarChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    guardedSubmit(async () => {
      setIsSaving(true);
      setSaved(false);
      
      const payload = { 
        ...form, 
        business_logo: logo,
        business_phones: JSON.stringify(phones.filter(p => p.number.trim() !== '')),
        business_emails: JSON.stringify(emails.filter(e => e.trim() !== '')),
        business_social_custom: JSON.stringify(customSocials.filter(c => c.title.trim() !== '' && c.url.trim() !== ''))
      };

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

  const scalarInput = (key: string, placeholder: string, type = 'text', icon?: React.ReactNode) => (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        type={type}
        value={form[key] || ''}
        onChange={(e) => handleScalarChange(key, e.target.value)}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 bg-gray-50/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`}
        placeholder={placeholder}
      />
    </div>
  );

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
                {scalarInput('business_name', 'Ex: Acme Corp')}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ / Documento</label>
                {scalarInput('business_cnpj', '00.000.000/0000-00')}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-neutral-800/50">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo Principal</label>
              <ImageUploader 
                value={logo} 
                onChange={setLogo} 
                placeholder="Clique ou arraste a logo aqui" 
              />
            </div>
          </div>

          {/* Contato (Dinâmico) */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
            
            {/* Telefones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Telefones
                </h2>
                <button
                  type="button"
                  onClick={() => setPhones([...phones, { countryCode: '55', number: '' }])}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Telefone
                </button>
              </div>

              <div className="space-y-3">
                {phones.map((phone, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex w-full gap-2 relative">
                      <select
                        value={phone.countryCode}
                        onChange={(e) => {
                          const newPhones = [...phones];
                          newPhones[index].countryCode = e.target.value;
                          setPhones(newPhones);
                        }}
                        className="w-[120px] shrink-0 pl-2 pr-6 py-2.5 bg-gray-50/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                      >
                        {countryCodes.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={phone.number}
                        onChange={(e) => {
                          const newPhones = [...phones];
                          newPhones[index].number = e.target.value;
                          setPhones(newPhones);
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    {phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPhones(phones.filter((_, i) => i !== index))}
                        className="shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-50 dark:border-neutral-800/50" />

            {/* Emails */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" /> E-mails
                </h2>
                <button
                  type="button"
                  onClick={() => setEmails([...emails, ''])}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar E-mail
                </button>
              </div>

              <div className="space-y-3">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="w-full relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...emails];
                          newEmails[index] = e.target.value;
                          setEmails(newEmails);
                        }}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="contato@empresa.com.br"
                      />
                    </div>
                    {emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                        className="shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-50 dark:border-neutral-800/50" />

            {/* Endereço & Site */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                  {scalarInput('business_website', 'https://www.site.com', 'url', <Globe className="w-4 h-4" />)}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço Completo</label>
                  {scalarInput('business_address', 'Av. Paulista, 1000 - SP')}
                </div>
              </div>
            </div>

          </div>

          {/* Redes Sociais */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AtSign className="w-4 h-4 text-gray-400" /> Redes Sociais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instagram</label>
                {scalarInput('business_instagram', '@nomedoperfil', 'text', <Camera className="w-4 h-4" />)}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</label>
                {scalarInput('business_facebook', '/pagina', 'text', <Users className="w-4 h-4" />)}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</label>
                {scalarInput('business_linkedin', '/in/perfil', 'text', <Briefcase className="w-4 h-4" />)}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">YouTube</label>
                {scalarInput('business_youtube', 'youtube.com/canal', 'text', <Video className="w-4 h-4" />)}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">X (Twitter)</label>
                {scalarInput('business_twitter', '@perfil', 'text', <MessageCircle className="w-4 h-4" />)}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">TikTok</label>
                {scalarInput('business_tiktok', '@perfil', 'text', <span className="font-bold text-[10px]">TK</span>)}
              </div>
            </div>

            <div className="border-t border-gray-50 dark:border-neutral-800/50 pt-6" />

            {/* Outras Redes Sociais (Dinâmico) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" /> Outras Redes / Links
                </h3>
                <button
                  type="button"
                  onClick={() => setCustomSocials([...customSocials, { title: '', url: '' }])}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Link
                </button>
              </div>

              <div className="space-y-3">
                {customSocials.length === 0 && (
                  <div className="text-xs text-gray-500 dark:text-neutral-500 italic bg-gray-50 dark:bg-neutral-800/30 p-3 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800">
                    Nenhum link adicional configurado.
                  </div>
                )}
                {customSocials.map((social, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex flex-col sm:flex-row w-full gap-2">
                      <input
                        type="text"
                        value={social.title}
                        onChange={(e) => {
                          const newSocials = [...customSocials];
                          newSocials[index].title = e.target.value;
                          setCustomSocials(newSocials);
                        }}
                        className="w-full sm:w-1/3 px-3 py-2.5 bg-gray-50/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="Título (ex: Pinterest)"
                      />
                      <input
                        type="url"
                        value={social.url}
                        onChange={(e) => {
                          const newSocials = [...customSocials];
                          newSocials[index].url = e.target.value;
                          setCustomSocials(newSocials);
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50/50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="URL (ex: https://pinterest.com/...)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomSocials(customSocials.filter((_, i) => i !== index))}
                      className="shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm
                ${saved 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
              ) : (
                <><Save className="w-4 h-4" /> Salvar Alterações</>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

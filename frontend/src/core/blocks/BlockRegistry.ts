import { 
  Type, List, LayoutTemplate, Image as ImageIcon, 
  Link2, Table, MousePointerClick, ListChecks, 
  CheckSquare, ToggleLeft, Hash, Minus, Share2
} from 'lucide-react';

export const BLOCK_TYPES = [
  { type: 'text', label: 'Texto Curto', icon: Type, color: 'blue', description: 'Campo de texto simples em uma linha' },
  { type: 'richText', label: 'Texto Longo', icon: List, color: 'emerald', description: 'Área de texto para múltiplos parágrafos' },
  { type: 'wysiwyg', label: 'Editor Visual', icon: LayoutTemplate, color: 'violet', description: 'Editor de texto com formatação (Negrito, Listas)' },
  { type: 'image', label: 'Imagem', icon: ImageIcon, color: 'amber', description: 'Uma única imagem via URL' },
  { type: 'gallery', label: 'Galeria', icon: ImageIcon, color: 'orange', description: 'Múltiplas imagens em grade' },
  { type: 'url', label: 'URL / Link', icon: Link2, color: 'sky', description: 'Um link externo ou interno' },
  { type: 'table', label: 'Tabela', icon: Table, color: 'rose', description: 'Tabela de dados simples' },
  { type: 'button', label: 'Botão', icon: MousePointerClick, color: 'indigo', description: 'Botão com texto e link de destino' },
  { type: 'select', label: 'Seleção Única', icon: ListChecks, color: 'cyan', description: 'Lista suspensa com uma opção' },
  { type: 'multiselect', label: 'Multi Seleção', icon: CheckSquare, color: 'teal', description: 'Lista com múltiplas escolhas' },
  { type: 'toggle', label: 'Liga/Desliga', icon: ToggleLeft, color: 'lime', description: 'Interruptor verdadeiro ou falso' },
  { type: 'number', label: 'Número', icon: Hash, color: 'blue', description: 'Campo de valor numérico' },
  { type: 'divider', label: 'Divisor', icon: Minus, color: 'slate', description: 'Linha separadora visual' },
  { type: 'social_links', label: 'Redes Sociais', icon: Share2, color: 'indigo', description: 'Lista de ícones com links' },
];

export const COLOR_MAP: Record<string, string> = {
  text: 'text-blue-500', richText: 'text-emerald-500', wysiwyg: 'text-violet-500',
  image: 'text-amber-500', gallery: 'text-orange-500', url: 'text-sky-500',
  table: 'text-rose-500', button: 'text-indigo-500', select: 'text-cyan-500', 
  multiselect: 'text-teal-500', toggle: 'text-lime-500', number: 'text-blue-500',
  divider: 'text-slate-500', social_links: 'text-indigo-500'
};

export const BG_MAP: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  cyan: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
  teal: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
  lime: 'bg-lime-50 dark:bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-500/20',
  slate: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'
};

export const ICON_MAP: Record<string, any> = {
  text: Type, richText: List, wysiwyg: LayoutTemplate,
  image: ImageIcon, gallery: ImageIcon, url: Link2, table: Table, button: MousePointerClick,
  select: ListChecks, multiselect: CheckSquare, toggle: ToggleLeft,
  number: Hash, divider: Minus, social_links: Share2
};

export const BADGE_MAP: Record<string, string> = {
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  richText: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  wysiwyg: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
  image: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  gallery: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  url: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
  table: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  button: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  select: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
  multiselect: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
  toggle: 'bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400',
  number: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  divider: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
  social_links: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
};

import { 
  LayoutDashboard, 
  Settings,
  Database,
  Globe,
  Hash,
  CalendarDays,
  Users,
  Newspaper,
  Key
} from 'lucide-react';

/**
 * DIMY CONFIGURATION FILE
 * AI Agents: Use this file to add new modules, static routes, and integrations.
 * Do not hardcode Navigation Items directly in Sidebar.tsx.
 */

export const dimyConfig = {
  // Static Navigation Items that appear in the sidebar above Dynamic Collections
  navItems: [
    { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
    { name: 'Publicações', href: '/publicacoes', icon: Newspaper },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
    { name: 'Chaves de API', href: '/api-keys', icon: Key },
  ],
  
  // Future integrations configs can be added here...
};

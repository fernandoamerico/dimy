import { 
  LayoutDashboard, 
  Settings,
  Database,
  Globe,
  Hash,
  CalendarDays,
  Users
} from 'lucide-react';

/**
 * ADIMY CONFIGURATION FILE
 * AI Agents: Use this file to add new modules, static routes, and integrations.
 * Do not hardcode Navigation Items directly in Sidebar.tsx.
 */

export const adimyConfig = {
  // Static Navigation Items that appear in the sidebar above Dynamic Collections
  navItems: [
    { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
    { name: 'Módulo 1', href: '/modulo-1', icon: Globe },
    { name: 'Módulo 2', href: '/modulo-2', icon: Hash },
    { name: 'Módulo 3', href: '/modulo-3', icon: CalendarDays },
    { name: 'Construtor', href: '/schema', icon: Database },
    { name: 'Equipe', href: '/equipe', icon: Users },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ],
  
  // Future integrations configs can be added here...
};

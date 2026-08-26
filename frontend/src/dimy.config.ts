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
 * DIMY CONFIGURATION FILE
 * AI Agents: Use this file to add new modules, static routes, and integrations.
 * Do not hardcode Navigation Items directly in Sidebar.tsx.
 */

export const dimyConfig = {
  // Static Navigation Items that appear in the sidebar above Dynamic Collections
  navItems: [
    { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ],
  
  // Future integrations configs can be added here...
};

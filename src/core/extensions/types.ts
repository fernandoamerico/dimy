export type ExtensionType = 'core' | 'schema';

export interface ExtensionNavItem {
  label: string;
  href: string;
  iconName: string; // Stored as string to easily map to Lucide icons dynamically
  requiredPermissions: string[]; // RBAC Readiness (e.g. ['read:dashboard', 'admin:*'])
}

export interface ExtensionField {
  name: string;
  label: string;
  type: 'text' | 'richText' | 'image' | 'number' | 'boolean' | 'relation';
  required: boolean;
  order: number;
}

export interface ExtensionSchemaDef {
  name: string;
  slug: string;
  iconName: string;
  fields: ExtensionField[];
}

export interface ExtensionDef {
  id: string; // Unique identifier, e.g., 'core_dashboard'
  name: string; // Display name
  description: string;
  type: ExtensionType;
  
  // If true, the user CANNOT disable this extension
  isEssential: boolean; 
  
  // Items to add to the sidebar
  navItems?: ExtensionNavItem[];
  
  // If type === 'schema', the database structure it requires
  schema?: ExtensionSchemaDef;
}

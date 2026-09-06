export function resolveTemplateVariables(template: string, data: Record<string, any>, collectionName: string = ''): string {
  if (!template) return '';

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    // Standard system aliases
    if (key === 'title') return data._title || data.title || '';
    if (key === 'slug') return data._slug || data.slug || '';
    if (key === 'author') return data._author || data.author || '';
    if (key === 'summary' || key === 'excerpt') return data._summary || data.summary || '';
    if (key === 'date') return data._publishDate || (data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    if (key === 'site_name') return collectionName || 'Adimy';

    // Custom block ID lookup (e.g. {bloco_rascunho}, {meu_conteudo})
    if (data[key] !== undefined && data[key] !== null) {
      const val = data[key];
      if (typeof val === 'string') {
        // Strip HTML tags if coming from a rich text / wysiwyg block
        return val.replace(/<[^>]*>?/gm, '').trim();
      }
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    }

    return match; // return original placeholder if not found
  });
}

export function validateDocumentData(collection: any, data: any) {
  const validData: Record<string, any> = {};
  
  if (!collection) {
    return { success: false, error: 'Coleção inválida.' };
  }

  const fields = collection.fields || [];

  for (const field of fields) {
    const value = data[field.name];

    // Checa se é required
    if (field.required && (value === undefined || value === null || value === '')) {
      return { success: false, error: `O campo obrigatório "${field.label}" não foi preenchido.` };
    }

    if (value !== undefined && value !== null && value !== '') {
      // Validação de tipo básica
      if (field.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          return { success: false, error: `O campo "${field.label}" precisa ser numérico.` };
        }
        validData[field.name] = num;
      } else if (field.type === 'boolean') {
        validData[field.name] = Boolean(value);
      } else {
        validData[field.name] = typeof value === 'object' ? value : String(value);
      }
    }
  }

  // Keep all system fields (starting with _)
  for (const key in data) {
    if (key.startsWith('_')) {
      validData[key] = data[key];
    }
  }

  return { success: true, validData };
}

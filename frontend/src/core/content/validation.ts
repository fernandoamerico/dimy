export function validateDocumentData(collection: any, data: any) {
  const validData: Record<string, any> = {};
  
  if (!collection || !collection.fields) {
    return { success: false, error: 'Coleção inválida.' };
  }

  for (const field of collection.fields) {
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
        // text, richText, image, relation (treat all as strings mostly)
        validData[field.name] = String(value);
      }
    }
  }

  return { success: true, validData };
}

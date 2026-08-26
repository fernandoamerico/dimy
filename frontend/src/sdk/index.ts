export class DimyClient {
  private baseUrl: string;
  private apiKey?: string | undefined;

  constructor(options: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey as string | undefined;
  }

  private async fetchAPI(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}/api/dimy${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'API Error');
    }

    return response.json();
  }

  // Obter todos os documentos de uma coleção
  async getCollection(collectionSlug: string) {
    return this.fetchAPI(`/${collectionSlug}`);
  }

  // Criar um documento
  async createDocument(collectionSlug: string, data: Record<string, any>) {
    return this.fetchAPI(`/${collectionSlug}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

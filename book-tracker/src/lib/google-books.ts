export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    language?: string;
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBookItem[];
}

export class GoogleBooksService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_BOOKS_API_KEY || '';
  }

  async searchBooks(query: string, maxResults = 10): Promise<GoogleBooksResponse> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('q', query);
      url.searchParams.set('maxResults', maxResults.toString());
      
      if (this.apiKey) {
        url.searchParams.set('key', this.apiKey);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  async getBookById(id: string): Promise<GoogleBookItem> {
    try {
      const url = new URL(`${this.baseUrl}/${id}`);
      
      if (this.apiKey) {
        url.searchParams.set('key', this.apiKey);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting book by ID:', error);
      throw error;
    }
  }

  // Google Books verisini uygulamamızın Book formatına dönüştür
  transformToBookData(item: GoogleBookItem) {
    const { volumeInfo } = item;
    
    return {
      title: volumeInfo.title,
      author: volumeInfo.authors?.join(', ') || 'Bilinmiyor',
      publisher: volumeInfo.publisher,
      publishedYear: volumeInfo.publishedDate ? 
        parseInt(volumeInfo.publishedDate.split('-')[0]) : undefined,
      pageCount: volumeInfo.pageCount,
      isbn: volumeInfo.industryIdentifiers?.find(
        id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier,
      description: volumeInfo.description,
      coverUrl: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
      genre: volumeInfo.categories?.join(', '),
      language: volumeInfo.language || 'tr',
    };
  }
}
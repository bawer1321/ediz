import axios from 'axios';
import type { 
  Movie, 
  Genre, 
  SearchResult, 
  TMDBConfiguration,
  TMDBGenreResponse 
} from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.warn('TMDB API key is not configured');
}

// Create axios instance with default config
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'tr-TR',
  },
  timeout: 10000,
});

export class TMDBService {
  // Get Popular Movies
  static async getPopularMovies(page: number = 1): Promise<SearchResult> {
    try {
      const response = await tmdbApi.get<SearchResult>('/movie/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get popular movies:', error);
      throw new Error('Popüler filmler alınamadı');
    }
  }

  // Get Top Rated Movies
  static async getTopRatedMovies(page: number = 1): Promise<SearchResult> {
    try {
      const response = await tmdbApi.get<SearchResult>('/movie/top_rated', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get top rated movies:', error);
      throw new Error('En iyi filmler alınamadı');
    }
  }

  // Get Trending Movies
  static async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<SearchResult> {
    try {
      const response = await tmdbApi.get<SearchResult>(`/trending/movie/${timeWindow}`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get trending movies:', error);
      throw new Error('Trend filmler alınamadı');
    }
  }

  // Get Upcoming Movies
  static async getUpcomingMovies(page: number = 1): Promise<SearchResult> {
    try {
      const response = await tmdbApi.get<SearchResult>('/movie/upcoming', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get upcoming movies:', error);
      throw new Error('Yakında çıkacak filmler alınamadı');
    }
  }

  // Get Random Movie (using discover with random page)
  static async getRandomMovie(options?: {
    withGenres?: number[];
    minVoteAverage?: number;
    year?: number;
  }): Promise<Movie | null> {
    try {
      // First, get the total number of pages
      const initialResponse = await tmdbApi.get<SearchResult>('/discover/movie', {
        params: {
          ...options,
          page: 1,
        },
      });

      if (initialResponse.data.total_results === 0) {
        return null;
      }

      // Calculate a random page (limit to first 500 pages due to TMDB limitations)
      const maxPage = Math.min(initialResponse.data.total_pages, 500);
      const randomPage = Math.floor(Math.random() * maxPage) + 1;

      // Get movies from random page
      const randomPageResponse = await tmdbApi.get<SearchResult>('/discover/movie', {
        params: {
          ...options,
          page: randomPage,
        },
      });

      if (randomPageResponse.data.results.length === 0) {
        return null;
      }

      // Return random movie from the page
      const randomIndex = Math.floor(Math.random() * randomPageResponse.data.results.length);
      return randomPageResponse.data.results[randomIndex];
    } catch (error) {
      console.error('Failed to get random movie:', error);
      throw new Error('Rastgele film alınamadı');
    }
  }
}

// Export default instance
export default TMDBService;

// Helper functions for image URLs
export const getPosterUrl = (posterPath: string | null, size: 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!posterPath) return '';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

export const getBackdropUrl = (backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!backdropPath) return '';
  return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
};

// Genre mapping for Turkish names
export const GENRE_MAP: Record<number, string> = {
  28: 'Aksiyon',
  12: 'Macera',
  16: 'Animasyon',
  35: 'Komedi',
  80: 'Suç',
  99: 'Belgesel',
  18: 'Drama',
  10751: 'Aile',
  14: 'Fantastik',
  36: 'Tarih',
  27: 'Korku',
  10402: 'Müzik',
  9648: 'Gizem',
  10749: 'Romantik',
  878: 'Bilim Kurgu',
  10770: 'TV Film',
  53: 'Gerilim',
  10752: 'Savaş',
  37: 'Vahşi Batı',
};

export const getGenreName = (genreId: number): string => {
  return GENRE_MAP[genreId] || 'Bilinmeyen';
};
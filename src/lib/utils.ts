import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS class merger utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Movie utilities
export function getMoviePosterUrl(posterPath: string | null, size: string = 'w500'): string {
  if (!posterPath) return '/placeholder-movie.jpg';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export function getMovieBackdropUrl(backdropPath: string | null, size: string = 'w1280'): string {
  if (!backdropPath) return '/placeholder-backdrop.jpg';
  return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
}

export function getProfileImageUrl(profilePath: string | null, size: string = 'w185'): string {
  if (!profilePath) return '/placeholder-profile.jpg';
  return `https://image.tmdb.org/t/p/${size}${profilePath}`;
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes}dk`;
  if (remainingMinutes === 0) return `${hours}sa`;
  return `${hours}sa ${remainingMinutes}dk`;
}

export function formatRating(rating: number, maxRating: number = 10): string {
  if (!rating) return '0';
  return (rating / maxRating * 10).toFixed(1);
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-500';
  if (rating >= 6) return 'text-yellow-500';
  if (rating >= 4) return 'text-orange-500';
  return 'text-red-500';
}

export function getGenreColor(genreId: number): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500',
    'bg-sky-500', 'bg-stone-500', 'bg-neutral-500', 'bg-zinc-500'
  ];
  return colors[genreId % colors.length];
}

// User utilities
export function getUserDisplayName(userId: 'irem' | 'yusuf' | 'both'): string {
  switch (userId) {
    case 'irem': return 'İrem';
    case 'yusuf': return 'Yusuf';
    case 'both': return 'İkimiz';
    default: return '';
  }
}

export function getUserAvatar(userId: 'irem' | 'yusuf' | 'both'): string {
  switch (userId) {
    case 'irem': return '/avatars/irem.jpg';
    case 'yusuf': return '/avatars/yusuf.jpg';
    case 'both': return '/avatars/couple.jpg';
    default: return '/avatars/default.jpg';
  }
}

export function getUserColor(userId: 'irem' | 'yusuf' | 'both'): string {
  switch (userId) {
    case 'irem': return 'text-pink-500';
    case 'yusuf': return 'text-blue-500';
    case 'both': return 'text-purple-500';
    default: return 'text-gray-500';
  }
}

// Statistics utilities
export function calculateCompatibilityScore(
  iremRatings: number[],
  yusufRatings: number[]
): number {
  if (iremRatings.length === 0 || yusufRatings.length === 0) return 0;
  
  const minLength = Math.min(iremRatings.length, yusufRatings.length);
  let totalDifference = 0;
  
  for (let i = 0; i < minLength; i++) {
    totalDifference += Math.abs(iremRatings[i] - yusufRatings[i]);
  }
  
  const averageDifference = totalDifference / minLength;
  const maxDifference = 10; // Maximum possible difference between ratings
  
  return Math.max(0, (1 - averageDifference / maxDifference) * 100);
}

export function getCompatibilityMessage(score: number): string {
  if (score >= 90) return "Mükemmel uyum! 💕";
  if (score >= 80) return "Harika uyum! ❤️";
  if (score >= 70) return "İyi uyum! 💖";
  if (score >= 60) return "Orta uyum 💛";
  if (score >= 50) return "Geliştirilmesi gereken uyum 🧡";
  return "Farklı zevkler 💙";
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function groupByMonth<T>(
  items: T[],
  getDate: (item: T) => string
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = new Date(getDate(item));
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    
    return groups;
  }, {} as Record<string, T[]>);
}

// Search and filter utilities
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

// Array utilities
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidRating(rating: number, min: number = 1, max: number = 10): boolean {
  return rating >= min && rating <= max && Number.isInteger(rating);
}

export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000); // Limit length
}

// Storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

// Number formatting utilities
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
}

// Error handling utilities
export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Bilinmeyen bir hata oluştu';
}

export function logError(error: unknown, context?: string): void {
  const message = createErrorMessage(error);
  console.error(`${context ? `[${context}] ` : ''}${message}`, error);
}

// URL utilities
export function createShareUrl(movieId: number, userId?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const userParam = userId ? `?user=${userId}` : '';
  return `${baseUrl}/movie/${movieId}${userParam}`;
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}
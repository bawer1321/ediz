'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  Plus, 
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatRating, getRatingColor } from '@/lib/utils';
import { getPosterUrl, getGenreName } from '@/lib/tmdb';
import type { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  size = 'md',
  showDetails = true,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-32 h-48',
    md: 'w-40 h-60',
    lg: 'w-48 h-72',
  };

  const posterUrl = getPosterUrl(movie.poster_path);
  const rating = movie.vote_average;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const genres = movie.genre_ids?.slice(0, 2).map(id => getGenreName(id)) || [];

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-transform duration-300 hover:scale-105",
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/movie/${movie.id}`} className="block h-full">
        {/* Movie Poster */}
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-800">
          <Image
            src={posterUrl || '/placeholder-movie.jpg'}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating Badge */}
          {rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className={cn("text-xs font-medium", getRatingColor(rating))}>
                {formatRating(rating)}
              </span>
            </div>
          )}

          {/* Hover Content */}
          {isHovered && showDetails && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
              <div className="space-y-2">
                {/* Title */}
                <h3 className="text-white font-semibold text-sm line-clamp-2">
                  {movie.title}
                </h3>

                {/* Year & Genres */}
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>{year}</span>
                  {genres.length > 0 && (
                    <span className="truncate ml-2">{genres.join(', ')}</span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Play Button */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Play className="w-6 h-6 text-white fill-current ml-1" />
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
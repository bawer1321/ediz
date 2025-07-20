'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Info, 
  TrendingUp, 
  Star, 
  Calendar,
  Shuffle,
  ArrowRight,
  Heart,
  Clock
} from 'lucide-react';
import Header from '@/components/layout/header';
import MovieCard from '@/components/movie/movie-card';
import { Button } from '@/components/ui/button';
import TMDBService, { getBackdropUrl } from '@/lib/tmdb';
import type { Movie, User } from '@/types';

const HomePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>('both');
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMovieData();
  }, []);

  const loadMovieData = async () => {
    try {
      setIsLoading(true);
      
      const [
        popularResponse,
        topRatedResponse,
        trendingResponse,
        upcomingResponse
      ] = await Promise.all([
        TMDBService.getPopularMovies(1),
        TMDBService.getTopRatedMovies(1),
        TMDBService.getTrendingMovies('week', 1),
        TMDBService.getUpcomingMovies(1)
      ]);

      setPopularMovies(popularResponse.results.slice(0, 20));
      setTopRatedMovies(topRatedResponse.results.slice(0, 20));
      setTrendingMovies(trendingResponse.results.slice(0, 20));
      setUpcomingMovies(upcomingResponse.results.slice(0, 20));

      // Set hero movie from popular movies
      if (popularResponse.results.length > 0) {
        setHeroMovie(popularResponse.results[0]);
      }
    } catch (error) {
      console.error('Failed to load movie data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomMovie = async () => {
    try {
      const randomMovie = await TMDBService.getRandomMovie({
        minVoteAverage: 7.0,
      });
      if (randomMovie) {
        setHeroMovie(randomMovie);
      }
    } catch (error) {
      console.error('Failed to get random movie:', error);
    }
  };

  const movieSections = [
    {
      title: 'Popüler Filmler',
      subtitle: 'Şu anda en çok izlenen filmler',
      movies: popularMovies,
      icon: TrendingUp,
    },
    {
      title: 'En İyi Filmler',
      subtitle: 'Yüksek puanlı filmler',
      movies: topRatedMovies,
      icon: Star,
    },
    {
      title: 'Trend Filmler',
      subtitle: 'Bu hafta popüler olan filmler',
      movies: trendingMovies,
      icon: TrendingUp,
    },
    {
      title: 'Yakında Çıkacaklar',
      subtitle: 'Merakla beklenen filmler',
      movies: upcomingMovies,
      icon: Calendar,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header currentUser={currentUser} onUserChange={setCurrentUser} />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Filmler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header currentUser={currentUser} onUserChange={setCurrentUser} />
      
      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-screen flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${getBackdropUrl(heroMovie.backdrop_path, 'original')})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="max-w-2xl">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  {heroMovie.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span>{heroMovie.vote_average.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(heroMovie.release_date).getFullYear()}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{(heroMovie.vote_count / 1000).toFixed(1)}K</span>
                  </span>
                </div>

                <p className="text-lg text-gray-300 leading-relaxed line-clamp-3">
                  {heroMovie.overview}
                </p>

                <div className="flex items-center space-x-4">
                  <Button 
                    size="lg" 
                    variant="netflix"
                    className="text-lg px-8 py-3"
                  >
                    <Play className="w-6 h-6 mr-2 fill-current" />
                    Detayları Gör
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="glass"
                    className="text-lg px-8 py-3"
                  >
                    <Info className="w-6 h-6 mr-2" />
                    Bilgi
                  </Button>

                  <Button 
                    size="lg" 
                    variant="glass"
                    onClick={getRandomMovie}
                    className="text-lg px-8 py-3"
                  >
                    <Shuffle className="w-6 h-6 mr-2" />
                    Rastgele
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Movie Sections */}
      <div className="relative z-10 space-y-12 pb-20 -mt-20">
        {movieSections.map((section, index) => (
          <section
            key={section.title}
            className="px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <section.icon className="w-6 h-6 text-red-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {section.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-600 hover:bg-red-600/10"
                >
                  Tümünü Gör
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Movies Grid */}
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {section.movies.map((movie) => (
                    <div
                      key={movie.id}
                      className="flex-shrink-0"
                    >
                      <MovieCard
                        movie={movie}
                        size="md"
                        showDetails={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Quick Stats Section */}
      <section className="bg-gradient-to-r from-red-600/10 to-orange-500/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Film Evi İstatistikleri
            </h2>
            <p className="text-gray-400">
              İrem & Yusuf'un sinema yolculuğu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'İzlenen Film', value: '247', icon: Play },
              { label: 'Favori Film', value: '89', icon: Heart },
              { label: 'İzlenecek Film', value: '156', icon: Clock },
              { label: 'Uyumluluk Skoru', value: '%87', icon: Star },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
              >
                <stat.icon className="w-8 h-8 text-red-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
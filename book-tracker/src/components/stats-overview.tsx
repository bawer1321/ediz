'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Star, 
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';

interface StatsOverviewProps {
  userId: string;
}

interface Stats {
  overview: {
    totalBooks: number;
    completedBooks: number;
    readingBooks: number;
    toReadBooks: number;
    yearlyCompleted: number;
    totalPages: number;
    averageRating: number;
  };
}

export default function StatsOverview({ userId }: StatsOverviewProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İstatistikler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">İstatistikler yüklenemedi.</p>
        </CardContent>
      </Card>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>İstatistikler</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Genel Özet */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Toplam Kitap</span>
            </div>
            <Badge variant="outline" className="font-semibold">
              {stats.overview.totalBooks}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Okunan</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {stats.overview.completedBooks}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-600">Okunuyor</span>
            </div>
            <Badge variant="default" className="font-semibold">
              {stats.overview.readingBooks}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Okunacak</span>
            </div>
            <Badge variant="outline" className="font-semibold">
              {stats.overview.toReadBooks}
            </Badge>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Bu Yıl */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{currentYear} Yılı</span>
          </h4>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Okunan Kitap</span>
            <Badge variant="secondary" className="font-semibold">
              {stats.overview.yearlyCompleted}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Toplam Sayfa</span>
            <Badge variant="outline" className="font-semibold">
              {stats.overview.totalPages.toLocaleString()}
            </Badge>
          </div>

          {stats.overview.averageRating > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Ort. Puan</span>
              </div>
              <Badge variant="outline" className="font-semibold">
                {stats.overview.averageRating.toFixed(1)}/10
              </Badge>
            </div>
          )}
        </div>

        {/* İlerleme Barı */}
        {stats.overview.yearlyCompleted > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Yıllık İlerleme</span>
              <span>{stats.overview.yearlyCompleted} kitap</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((stats.overview.yearlyCompleted / 50) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              50 kitap hedefine göre
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
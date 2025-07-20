'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  StickyNote,
  Quote,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  status: 'TO_READ' | 'READING' | 'COMPLETED' | 'PAUSED' | 'DNF';
  rating?: number;
  pageCount?: number;
  genre?: string;
  addedDate: string;
  startDate?: string;
  finishDate?: string;
  notes: any[];
  quotes: any[];
  readingSessions: any[];
}

interface BookCardProps {
  book: Book;
  onUpdate: () => void;
}

export default function BookCard({ book, onUpdate }: BookCardProps) {
  const [loading, setLoading] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'READING':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'TO_READ':
        return 'outline';
      case 'PAUSED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TO_READ':
        return 'Okunacak';
      case 'READING':
        return 'Okunuyor';
      case 'COMPLETED':
        return 'Okundu';
      case 'PAUSED':
        return 'Duraklatıldı';
      case 'DNF':
        return 'Yarım Bırakıldı';
      default:
        return status;
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/books/${book.id}?userId=${book.userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadingProgress = () => {
    if (book.status === 'COMPLETED') return 100;
    if (book.status === 'TO_READ') return 0;
    
    // Okuma oturumlarından ilerleme hesapla
    if (book.readingSessions.length > 0) {
      const lastSession = book.readingSessions[0];
      if (book.pageCount && lastSession.endPage) {
        return Math.min((lastSession.endPage / book.pageCount) * 100, 100);
      }
    }
    
    return 0;
  };

  const progress = getReadingProgress();

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <Badge variant={getStatusBadgeVariant(book.status)} className="mb-2">
            {getStatusText(book.status)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex space-x-4">
          {/* Kitap Kapağı */}
          <div className="w-20 h-28 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Kitap Bilgileri */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {book.author}
              </p>
            </div>

            {/* İlerleme Barı */}
            {book.status === 'READING' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>İlerleme</span>
                  <span>%{Math.round(progress)}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Puanlama */}
            {book.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {book.rating}/10
                </span>
              </div>
            )}

            {/* Ek Bilgiler */}
            <div className="space-y-2">
              {book.genre && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Tür:</span> {book.genre}
                </div>
              )}
              
              {book.pageCount && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Sayfa:</span> {book.pageCount}
                </div>
              )}

              {book.finishDate && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(book.finishDate), 'dd MMM yyyy', { locale: tr })}
                </div>
              )}
            </div>

            {/* Alt Bilgiler */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                {book.notes.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <StickyNote className="h-3 w-3 mr-1" />
                    {book.notes.length}
                  </div>
                )}
                {book.quotes.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Quote className="h-3 w-3 mr-1" />
                    {book.quotes.length}
                  </div>
                )}
              </div>

              {book.status === 'READING' && book.readingSessions.length > 0 && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {book.readingSessions.length} oturum
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
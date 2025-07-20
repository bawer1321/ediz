'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Star, 
  Calendar,
  Quote,
  StickyNote,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';
import BookCard from '@/components/book-card';
import AddBookDialog from '@/components/add-book-dialog';
import StatsOverview from '@/components/stats-overview';
import QuickActions from '@/components/quick-actions';

// Geçici kullanıcı ID'si (gerçek uygulamada authentication'dan gelecek)
const TEMP_USER_ID = 'temp-user-123';

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

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [statusFilter, searchQuery]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: TEMP_USER_ID,
      });
      
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/books?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAdded = () => {
    fetchBooks();
    setShowAddBook(false);
  };

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

  const filteredBooks = books.filter(book => {
    if (statusFilter !== 'ALL' && book.status !== statusFilter) {
      return false;
    }
    if (searchQuery) {
      return (
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Kitap Takip Sistemi
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowAddBook(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Kitap Ekle</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sol Sidebar - İstatistikler */}
          <div className="lg:col-span-1">
            <StatsOverview userId={TEMP_USER_ID} />
            <div className="mt-6">
              <QuickActions />
            </div>
          </div>

          {/* Ana İçerik */}
          <div className="lg:col-span-3">
            {/* Arama ve Filtreler */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Kitap veya yazar ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {['ALL', 'TO_READ', 'READING', 'COMPLETED', 'PAUSED'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === 'ALL' ? 'Tümü' : getStatusText(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kitap Listesi */}
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Kart Görünümü</TabsTrigger>
                <TabsTrigger value="list">Liste Görünümü</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid" className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <Card className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Henüz kitap eklenmemiş
                    </h3>
                    <p className="text-gray-600 mb-4">
                      İlk kitabınızı ekleyerek başlayın!
                    </p>
                    <Button onClick={() => setShowAddBook(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Kitap Ekle
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onUpdate={fetchBooks}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="list" className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <Card className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Henüz kitap eklenmemiş
                    </h3>
                    <p className="text-gray-600 mb-4">
                      İlk kitabınızı ekleyerek başlayın!
                    </p>
                    <Button onClick={() => setShowAddBook(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Kitap Ekle
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredBooks.map((book) => (
                      <Card key={book.id} className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                            {book.coverUrl ? (
                              <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {book.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {book.author}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant={getStatusBadgeVariant(book.status)}>
                                {getStatusText(book.status)}
                              </Badge>
                              {book.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-gray-600">
                                    {book.rating}/10
                                  </span>
                                </div>
                              )}
                              {book.pageCount && (
                                <span className="text-sm text-gray-500">
                                  {book.pageCount} sayfa
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {book.notes.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <StickyNote className="h-3 w-3 mr-1" />
                                {book.notes.length}
                              </Badge>
                            )}
                            {book.quotes.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Quote className="h-3 w-3 mr-1" />
                                {book.quotes.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Add Book Dialog */}
      <AddBookDialog
        open={showAddBook}
        onOpenChange={setShowAddBook}
        onBookAdded={handleBookAdded}
        userId={TEMP_USER_ID}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Plus, Loader2 } from 'lucide-react';
import { GoogleBookItem } from '@/lib/google-books';

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: () => void;
  userId: string;
}

interface BookFormData {
  title: string;
  author: string;
  publisher: string;
  publishedYear: string;
  pageCount: string;
  isbn: string;
  description: string;
  coverUrl: string;
  genre: string;
  status: string;
  rating: string;
}

export default function AddBookDialog({
  open,
  onOpenChange,
  onBookAdded,
  userId,
}: AddBookDialogProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    publisher: '',
    publishedYear: '',
    pageCount: '',
    isbn: '',
    description: '',
    coverUrl: '',
    genre: '',
    status: 'TO_READ',
    rating: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      publisher: '',
      publishedYear: '',
      pageCount: '',
      isbn: '',
      description: '',
      coverUrl: '',
      genre: '',
      status: 'TO_READ',
      rating: '',
    });
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('manual');
  };

  const handleInputChange = (field: keyof BookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(searchQuery)}&maxResults=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.items || []);
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectBookFromSearch = (item: any) => {
    const transformedData = item.transformedData;
    
    setFormData({
      title: transformedData.title || '',
      author: transformedData.author || '',
      publisher: transformedData.publisher || '',
      publishedYear: transformedData.publishedYear?.toString() || '',
      pageCount: transformedData.pageCount?.toString() || '',
      isbn: transformedData.isbn || '',
      description: transformedData.description || '',
      coverUrl: transformedData.coverUrl || '',
      genre: transformedData.genre || '',
      status: 'TO_READ',
      rating: '',
    });
    
    setActiveTab('manual');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim()) {
      alert('Kitap adı ve yazar alanları zorunludur.');
      return;
    }

    try {
      setSubmitting(true);
      
      const bookData = {
        ...formData,
        userId,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      };

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        onBookAdded();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Kitap eklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Kitap eklenirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kitap Ekle</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">API'den Ara</TabsTrigger>
            <TabsTrigger value="manual">Manuel Ekle</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Kitap adı, yazar veya ISBN ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
                  />
                </div>
                <Button onClick={searchBooks} disabled={searching || !searchQuery.trim()}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {searchResults.map((item, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                            {item.transformedData.coverUrl ? (
                              <img
                                src={item.transformedData.coverUrl}
                                alt={item.transformedData.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {item.transformedData.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {item.transformedData.author}
                            </p>
                            {item.transformedData.publisher && (
                              <p className="text-xs text-gray-500">
                                {item.transformedData.publisher}
                                {item.transformedData.publishedYear && 
                                  ` • ${item.transformedData.publishedYear}`}
                              </p>
                            )}
                            {item.transformedData.pageCount && (
                              <p className="text-xs text-gray-500">
                                {item.transformedData.pageCount} sayfa
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => selectBookFromSearch(item)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Seç
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Kolon */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Kitap Adı *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Kitap adını girin"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="author">Yazar *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                      placeholder="Yazar adını girin"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="publisher">Yayınevi</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => handleInputChange('publisher', e.target.value)}
                      placeholder="Yayınevi adını girin"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publishedYear">Yayın Yılı</Label>
                      <Input
                        id="publishedYear"
                        type="number"
                        value={formData.publishedYear}
                        onChange={(e) => handleInputChange('publishedYear', e.target.value)}
                        placeholder="2024"
                        min="1000"
                        max="2030"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pageCount">Sayfa Sayısı</Label>
                      <Input
                        id="pageCount"
                        type="number"
                        value={formData.pageCount}
                        onChange={(e) => handleInputChange('pageCount', e.target.value)}
                        placeholder="300"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) => handleInputChange('isbn', e.target.value)}
                      placeholder="978-XXXXXXXXXX"
                    />
                  </div>
                </div>

                {/* Sağ Kolon */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="genre">Tür</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => handleInputChange('genre', e.target.value)}
                      placeholder="Roman, Bilim Kurgu, Tarih..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Okuma Durumu</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TO_READ">Okunacak</SelectItem>
                        <SelectItem value="READING">Okunuyor</SelectItem>
                        <SelectItem value="COMPLETED">Okundu</SelectItem>
                        <SelectItem value="PAUSED">Duraklatıldı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rating">Puanlama (0-10)</Label>
                    <Input
                      id="rating"
                      type="number"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', e.target.value)}
                      placeholder="8.5"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverUrl">Kapak Resmi URL</Label>
                    <Input
                      id="coverUrl"
                      value={formData.coverUrl}
                      onChange={(e) => handleInputChange('coverUrl', e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Kitap hakkında kısa açıklama..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    'Kitap Ekle'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
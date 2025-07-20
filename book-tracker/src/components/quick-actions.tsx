'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  StickyNote, 
  Quote, 
  BarChart3, 
  Target,
  BookOpen
} from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: 'Kitap Ekle',
      description: 'Yeni kitap ekle',
      color: 'text-blue-600',
      onClick: () => {
        // Bu fonksiyon parent component'den gelecek
        console.log('Add book clicked');
      }
    },
    {
      icon: StickyNote,
      label: 'Not Ekle',
      description: 'Hızlı not al',
      color: 'text-green-600',
      onClick: () => {
        console.log('Add note clicked');
      }
    },
    {
      icon: Quote,
      label: 'Alıntı Ekle',
      description: 'Alıntı kaydet',
      color: 'text-purple-600',
      onClick: () => {
        console.log('Add quote clicked');
      }
    },
    {
      icon: Target,
      label: 'Hedef Belirle',
      description: 'Okuma hedefi',
      color: 'text-orange-600',
      onClick: () => {
        console.log('Set goal clicked');
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Hızlı İşlemler</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-gray-50"
            onClick={action.onClick}
          >
            <div className="flex items-center space-x-3">
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <div className="text-left">
                <div className="font-medium text-sm text-gray-900">
                  {action.label}
                </div>
                <div className="text-xs text-gray-500">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
        
        <hr className="my-4 border-gray-200" />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">Son Aktiviteler</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <BookOpen className="h-3 w-3" />
              <span>Henüz aktivite yok</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
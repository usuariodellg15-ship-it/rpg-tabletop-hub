import { Package, Skull, BookOpen, Wand2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';

type HomebrewType = Database['public']['Enums']['homebrew_type'];

interface HomebrewTypeSelectorProps {
  onSelect: (type: HomebrewType) => void;
}

const types: { value: HomebrewType; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'item', 
    label: 'Item', 
    description: 'Armas, equipamentos, poções, itens mágicos e consumíveis.',
    icon: <Package className="h-8 w-8" />
  },
  { 
    value: 'creature', 
    label: 'Criatura', 
    description: 'Monstros, NPCs, bestas e inimigos para combate.',
    icon: <Skull className="h-8 w-8" />
  },
  { 
    value: 'class', 
    label: 'Classe', 
    description: 'Classes de personagem com habilidades e especializações.',
    icon: <BookOpen className="h-8 w-8" />
  },
  { 
    value: 'spell', 
    label: 'Magia', 
    description: 'Feitiços, encantamentos e poderes mágicos.',
    icon: <Wand2 className="h-8 w-8" />
  },
  { 
    value: 'race', 
    label: 'Raça', 
    description: 'Raças e ancestralidades de personagens.',
    icon: <Users className="h-8 w-8" />
  },
];

export function HomebrewTypeSelector({ onSelect }: HomebrewTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Que tipo de homebrew você quer criar?</h2>
        <p className="text-muted-foreground">Escolha o tipo para ver o formulário específico.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((type) => (
          <Card 
            key={type.value}
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => onSelect(type.value)}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary w-fit">
                {type.icon}
              </div>
              <CardTitle className="mt-2">{type.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

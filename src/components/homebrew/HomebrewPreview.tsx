import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Skull, BookOpen, Wand2, Users } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import type { ItemFormData } from './ItemForm';
import type { CreatureFormData } from './CreatureForm';
import type { ClassFormData } from './ClassForm';

type HomebrewType = Database['public']['Enums']['homebrew_type'];

interface HomebrewPreviewProps {
  type: HomebrewType;
  data: ItemFormData | CreatureFormData | ClassFormData;
}

const getSystemName = (system: string) => {
  switch (system) {
    case '5e': return 'D&D 5e (SRD)';
    case 'olho_da_morte': return 'Sistema Olho da Morte';
    case 'horror': return 'Horror Cósmico';
    default: return system;
  }
};

const getTypeIcon = (type: HomebrewType) => {
  switch (type) {
    case 'item': return <Package className="h-5 w-5" />;
    case 'creature': return <Skull className="h-5 w-5" />;
    case 'class': return <BookOpen className="h-5 w-5" />;
    case 'spell': return <Wand2 className="h-5 w-5" />;
    case 'race': return <Users className="h-5 w-5" />;
  }
};

export function HomebrewPreview({ type, data }: HomebrewPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Preview</h2>
        <p className="text-muted-foreground">Confira como sua homebrew ficará antes de salvar.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon(type)}
              <CardTitle>{data.name || 'Sem nome'}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="capitalize">{type}</Badge>
              <Badge variant={data.isPublic ? 'default' : 'outline'}>
                {data.isPublic ? 'Pública' : 'Privada'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {data.description || 'Sem descrição.'}
          </p>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{getSystemName(data.system)}</Badge>
            {'rarity' in data && data.rarity && (
              <Badge variant="outline" className="capitalize">{data.rarity}</Badge>
            )}
          </div>

          {type === 'item' && <ItemPreviewContent data={data as ItemFormData} />}
          {type === 'creature' && <CreaturePreviewContent data={data as CreatureFormData} />}
          {type === 'class' && <ClassPreviewContent data={data as ClassFormData} />}
        </CardContent>
      </Card>
    </div>
  );
}

function ItemPreviewContent({ data }: { data: ItemFormData }) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-2 gap-4 text-sm">
        {data.weight !== null && (
          <div>
            <span className="text-muted-foreground">Peso:</span>{' '}
            <strong>{data.weight} kg</strong>
          </div>
        )}
        {data.diceFormula && (
          <div>
            <span className="text-muted-foreground">Dado:</span>{' '}
            <strong>{data.diceFormula}</strong>
          </div>
        )}
      </div>

      {data.properties.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Propriedades:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {data.properties.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {data.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function CreaturePreviewContent({ data }: { data: CreatureFormData }) {
  const attrLabels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-4 gap-4 text-sm text-center">
        {data.nd !== null && (
          <div className="p-2 bg-muted rounded">
            <p className="text-xs text-muted-foreground">ND</p>
            <p className="font-bold">{data.nd}</p>
          </div>
        )}
        <div className="p-2 bg-muted rounded">
          <p className="text-xs text-muted-foreground">CA</p>
          <p className="font-bold">{data.ac}</p>
        </div>
        <div className="p-2 bg-muted rounded">
          <p className="text-xs text-muted-foreground">PV</p>
          <p className="font-bold">{data.hp}</p>
        </div>
        <div className="p-2 bg-muted rounded">
          <p className="text-xs text-muted-foreground">Desloc.</p>
          <p className="font-bold">{data.speed}</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 text-center text-xs">
        {(Object.keys(attrLabels) as (keyof typeof attrLabels)[]).map((attr) => (
          <div key={attr} className="p-2 border rounded">
            <p className="font-medium">{attrLabels[attr]}</p>
            <p>{data.attributes[attr]} ({Math.floor((data.attributes[attr] - 10) / 2) >= 0 ? '+' : ''}{Math.floor((data.attributes[attr] - 10) / 2)})</p>
          </div>
        ))}
      </div>

      {(data.resistances.length > 0 || data.immunities.length > 0) && (
        <div className="text-sm space-y-1">
          {data.resistances.length > 0 && (
            <p><span className="font-medium">Resistências:</span> {data.resistances.join(', ')}</p>
          )}
          {data.immunities.length > 0 && (
            <p><span className="font-medium">Imunidades:</span> {data.immunities.join(', ')}</p>
          )}
        </div>
      )}

      {data.actions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Ações:</p>
          <ul className="space-y-2">
            {data.actions.map((action, i) => (
              <li key={i} className="text-sm p-2 bg-muted rounded">
                <span className="font-medium">{action.name}.</span>{' '}
                <span className="text-muted-foreground">{action.description}</span>
                {action.damage && <Badge variant="outline" className="ml-2">{action.damage}</Badge>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ClassPreviewContent({ data }: { data: ClassFormData }) {
  return (
    <div className="space-y-4 pt-4 border-t">
      {data.baseAbilities.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Habilidades Base ({data.baseAbilities.length})</p>
          <ul className="space-y-1">
            {data.baseAbilities
              .sort((a, b) => a.level - b.level)
              .map((ability, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">NV {ability.level}</Badge>
                  <span className="font-medium">{ability.name}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {data.specializations.filter(s => s.name).length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Especializações ({data.specializations.filter(s => s.name).length})</p>
          <ul className="space-y-2">
            {data.specializations
              .filter(s => s.name)
              .map((spec, i) => (
                <li key={i} className="text-sm p-2 bg-muted rounded">
                  <p className="font-medium">{spec.name}</p>
                  {spec.description && <p className="text-xs text-muted-foreground">{spec.description}</p>}
                  <p className="text-xs mt-1">{spec.abilities.length} habilidades</p>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

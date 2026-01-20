import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { SystemType } from '@/data/mockData';

interface AttributeData {
  key: string;
  label: string;
  value: number;
}

interface AttributesSectionProps {
  system: SystemType;
  attributes: AttributeData[];
  onAttributeChange: (key: string, value: number) => void;
  isEditable: boolean;
}

const getModifier = (value: number, system: SystemType): number => {
  if (system === 'horror') {
    // Horror uses percentile - no modifier
    return 0;
  }
  // D&D style modifier
  return Math.floor((value - 10) / 2);
};

const formatModifier = (mod: number): string => {
  if (mod >= 0) return `+${mod}`;
  return `${mod}`;
};

export default function AttributesSection({
  system,
  attributes,
  onAttributeChange,
  isEditable
}: AttributesSectionProps) {
  const [localAttrs, setLocalAttrs] = useState<AttributeData[]>(attributes);

  useEffect(() => {
    setLocalAttrs(attributes);
  }, [attributes]);

  const handleChange = (key: string, value: number) => {
    setLocalAttrs(prev => 
      prev.map(attr => attr.key === key ? { ...attr, value } : attr)
    );
    onAttributeChange(key, value);
  };

  const showModifiers = system !== 'horror';
  const gridCols = system === 'horror' ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Atributos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols} gap-3`}>
          {localAttrs.map(attr => {
            const mod = getModifier(attr.value, system);
            return (
              <div key={attr.key} className="text-center">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{attr.label}</p>
                  <Input 
                    type="number"
                    className="h-10 text-center text-xl font-bold mb-1"
                    value={attr.value}
                    onChange={e => handleChange(attr.key, parseInt(e.target.value) || 0)}
                    disabled={!isEditable}
                  />
                  {showModifiers && (
                    <p className={`text-sm font-medium ${mod >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatModifier(mod)}
                    </p>
                  )}
                  {system === 'horror' && (
                    <p className="text-xs text-muted-foreground">%</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

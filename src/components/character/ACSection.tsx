import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface ACSectionProps {
  baseAC?: number;
  attrAC?: number;
  bonusAC?: number;
  onACChange: (base: number, attr: number, bonus: number) => void;
  isEditable: boolean;
  label?: string;
}

export default function ACSection({
  baseAC = 10,
  attrAC = 0,
  bonusAC = 0,
  onACChange,
  isEditable,
  label = 'Classe de Armadura'
}: ACSectionProps) {
  const [base, setBase] = useState(baseAC);
  const [attr, setAttr] = useState(attrAC);
  const [bonus, setBonus] = useState(bonusAC);

  const totalAC = base + attr + bonus;

  // Keep local state in sync if parent updates values (e.g., loading a new character)
  useEffect(() => setBase(baseAC), [baseAC]);
  useEffect(() => setAttr(attrAC), [attrAC]);
  useEffect(() => setBonus(bonusAC), [bonusAC]);

  const update = useCallback(
    (nextBase: number, nextAttr: number, nextBonus: number) => {
      setBase(nextBase);
      setAttr(nextAttr);
      setBonus(nextBonus);
      onACChange(nextBase, nextAttr, nextBonus);
    },
    [onACChange]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Total AC Display */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center transform rotate-45">
              <span className="text-3xl font-bold transform -rotate-45">{totalAC}</span>
            </div>
          </div>
        </div>

        {/* AC Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <Label className="text-xs text-muted-foreground">Base</Label>
            <Input 
              type="number"
              className="h-10 text-center mt-1"
              value={base}
                onChange={e => update(parseInt(e.target.value) || 0, attr, bonus)}
              disabled={!isEditable}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Atributo</Label>
            <Input 
              type="number"
              className="h-10 text-center mt-1"
              value={attr}
                onChange={e => update(base, parseInt(e.target.value) || 0, bonus)}
              disabled={!isEditable}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bônus</Label>
            <Input 
              type="number"
              className="h-10 text-center mt-1"
              value={bonus}
                onChange={e => update(base, attr, parseInt(e.target.value) || 0)}
              disabled={!isEditable}
            />
          </div>
        </div>

        {/* Formula display */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          {base} + {attr} + {bonus} = <strong>{totalAC}</strong>
        </p>
      </CardContent>
    </Card>
  );
}

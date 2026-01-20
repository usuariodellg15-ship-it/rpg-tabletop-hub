import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Heart, Shield } from 'lucide-react';

interface HealthSectionProps {
  hp: number;
  maxHp: number;
  tempHp?: number;
  onHpChange: (hp: number) => void;
  onMaxHpChange: (maxHp: number) => void;
  onTempHpChange: (tempHp: number) => void;
  isEditable: boolean;
}

export default function HealthSection({
  hp,
  maxHp,
  tempHp = 0,
  onHpChange,
  onMaxHpChange,
  onTempHpChange,
  isEditable
}: HealthSectionProps) {
  const [localHp, setLocalHp] = useState(hp);
  const [localMaxHp, setLocalMaxHp] = useState(maxHp);
  const [localTempHp, setLocalTempHp] = useState(tempHp);

  const updateHp = (value: number) => {
    const newHp = Math.max(0, Math.min(value, localMaxHp));
    setLocalHp(newHp);
    onHpChange(newHp);
  };

  const updateMaxHp = (value: number) => {
    const newMaxHp = Math.max(1, value);
    setLocalMaxHp(newMaxHp);
    onMaxHpChange(newMaxHp);
    if (localHp > newMaxHp) {
      setLocalHp(newMaxHp);
      onHpChange(newMaxHp);
    }
  };

  const updateTempHp = (value: number) => {
    const newTempHp = Math.max(0, value);
    setLocalTempHp(newTempHp);
    onTempHpChange(newTempHp);
  };

  // Calculate percentages for the health bar
  const hpPercent = (localHp / localMaxHp) * 100;
  const isAtFullHp = localHp >= localMaxHp;
  const totalWithTemp = localMaxHp + localTempHp;
  const tempHpPercent = isAtFullHp && localTempHp > 0 
    ? (localTempHp / totalWithTemp) * 100 
    : 0;
  const adjustedHpPercent = isAtFullHp && localTempHp > 0 
    ? (localMaxHp / totalWithTemp) * 100 
    : hpPercent;

  // Determine health bar color
  const getHealthColor = () => {
    if (hpPercent > 50) return 'bg-green-500';
    if (hpPercent > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Pontos de Vida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Bar */}
        <div className="relative h-6 bg-muted rounded-full overflow-hidden">
          {/* Main HP bar */}
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-300 ${getHealthColor()}`}
            style={{ width: `${adjustedHpPercent}%` }}
          />
          {/* Temp HP overlay (blue extension) */}
          {tempHpPercent > 0 && (
            <div 
              className="absolute top-0 h-full bg-blue-400 transition-all duration-300"
              style={{ 
                left: `${adjustedHpPercent}%`,
                width: `${tempHpPercent}%` 
              }}
            />
          )}
          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
            <span className="text-white drop-shadow-md">
              {localHp} / {localMaxHp}
              {localTempHp > 0 && <span className="text-blue-200"> (+{localTempHp})</span>}
            </span>
          </div>
        </div>

        {/* HP Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Vida Atual</Label>
            <div className="flex items-center gap-1 mt-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => updateHp(localHp - 1)}
                disabled={!isEditable || localHp <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input 
                type="number" 
                className="h-8 text-center"
                value={localHp}
                onChange={e => updateHp(parseInt(e.target.value) || 0)}
                disabled={!isEditable}
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => updateHp(localHp + 1)}
                disabled={!isEditable || localHp >= localMaxHp}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Vida Máxima</Label>
            <div className="flex items-center gap-1 mt-1">
              <Input 
                type="number" 
                className="h-8 text-center"
                value={localMaxHp}
                onChange={e => updateMaxHp(parseInt(e.target.value) || 1)}
                disabled={!isEditable}
              />
            </div>
          </div>
        </div>

        {/* Temp HP */}
        <div className="pt-2 border-t">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3 text-blue-400" />
            PV Temporário
          </Label>
          <div className="flex items-center gap-1 mt-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => updateTempHp(localTempHp - 1)}
              disabled={!isEditable || localTempHp <= 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input 
              type="number" 
              className="h-8 text-center w-20"
              value={localTempHp}
              onChange={e => updateTempHp(parseInt(e.target.value) || 0)}
              disabled={!isEditable}
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => updateTempHp(localTempHp + 1)}
              disabled={!isEditable}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

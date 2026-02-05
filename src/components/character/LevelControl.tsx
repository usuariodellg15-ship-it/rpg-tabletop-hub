import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';

interface LevelControlProps {
  level: number;
  onLevelChange: (level: number) => void;
  disabled?: boolean;
  maxLevel?: number;
}

export function LevelControl({
  level,
  onLevelChange,
  disabled = false,
  maxLevel = 20,
}: LevelControlProps) {
  const handleChange = (newLevel: number) => {
    const clampedLevel = Math.max(1, Math.min(newLevel, maxLevel));
    onLevelChange(clampedLevel);
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium">Nível</Label>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleChange(level - 1)}
          disabled={disabled || level <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          className="h-8 w-16 text-center"
          value={level}
          onChange={e => handleChange(parseInt(e.target.value) || 1)}
          min={1}
          max={maxLevel}
          disabled={disabled}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleChange(level + 1)}
          disabled={disabled || level >= maxLevel}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

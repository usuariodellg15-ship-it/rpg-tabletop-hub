import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Dices, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomRoll {
  id: string;
  character_id: string;
  name: string;
  roll_type: string;
  formula: string;
  description: string | null;
}

interface CustomRollsSectionProps {
  characterId: string;
  campaignId: string;
  userId: string;
  isEditable: boolean;
  onRoll?: (name: string, formula: string, result: number, rollType: string) => void;
}

function parseAndRoll(formula: string): { total: number; details: string } {
  // Parse formulas like "1d20+5", "2d6", "1d8+2"
  const match = formula.match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/i);
  if (!match) {
    return { total: 0, details: 'Fórmula inválida' };
  }

  const numDice = parseInt(match[1]);
  const dieSize = parseInt(match[2]);
  const operator = match[3] || '+';
  const modifier = match[4] ? parseInt(match[4]) : 0;

  const rolls: number[] = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * dieSize) + 1);
  }

  const rollSum = rolls.reduce((a, b) => a + b, 0);
  const total = operator === '+' ? rollSum + modifier : rollSum - modifier;
  
  let details = `[${rolls.join(', ')}]`;
  if (modifier > 0) {
    details += ` ${operator} ${modifier}`;
  }
  details += ` = ${total}`;

  return { total, details };
}

export function CustomRollsSection({
  characterId,
  campaignId,
  userId,
  isEditable,
  onRoll,
}: CustomRollsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFormula, setNewFormula] = useState('1d20');
  const [newType, setNewType] = useState<string>('test');
  const [newDesc, setNewDesc] = useState('');

  // Fetch custom rolls
  const { data: customRolls = [], isLoading } = useQuery({
    queryKey: ['character-custom-rolls', characterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('character_custom_rolls')
        .select('*')
        .eq('character_id', characterId)
        .order('created_at');
      if (error) throw error;
      return (data || []) as CustomRoll[];
    },
  });

  // Add custom roll mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('character_custom_rolls')
        .insert({
          character_id: characterId,
          name: newName,
          formula: newFormula,
          roll_type: newType,
          description: newDesc || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Rolagem personalizada criada!');
      queryClient.invalidateQueries({ queryKey: ['character-custom-rolls', characterId] });
      setIsAddOpen(false);
      setNewName('');
      setNewFormula('1d20');
      setNewType('test');
      setNewDesc('');
    },
    onError: () => {
      toast.error('Erro ao criar rolagem.');
    },
  });

  // Delete custom roll mutation
  const deleteMutation = useMutation({
    mutationFn: async (rollId: string) => {
      const { error } = await supabase
        .from('character_custom_rolls')
        .delete()
        .eq('id', rollId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Rolagem removida.');
      queryClient.invalidateQueries({ queryKey: ['character-custom-rolls', characterId] });
    },
    onError: () => {
      toast.error('Erro ao remover rolagem.');
    },
  });

  // Execute roll and save to dice_rolls
  const executeRoll = async (roll: CustomRoll) => {
    const { total, details } = parseAndRoll(roll.formula);
    
    // Save to dice_rolls table
    const { error } = await supabase
      .from('dice_rolls')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        character_id: characterId,
        formula: roll.formula,
        result: total,
        details: `${roll.name}: ${details}`,
        roll_type: roll.roll_type,
      });

    if (error) {
      console.error('Error saving roll:', error);
      toast.error('Erro ao salvar rolagem.');
    } else {
      toast.success(`🎲 ${roll.name}: ${roll.formula} → ${total}`);
      onRoll?.(roll.name, roll.formula, total, roll.roll_type);
      // Invalidate dice rolls to refresh the log
      queryClient.invalidateQueries({ queryKey: ['campaign-dice-rolls', campaignId] });
    }
  };

  const getRollTypeLabel = (type: string) => {
    switch (type) {
      case 'attack': return 'Ataque';
      case 'test': return 'Teste';
      case 'damage': return 'Dano';
      default: return 'Outro';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Dices className="h-5 w-5" />
          Dados Personalizados
        </CardTitle>
        {isEditable && (
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : customRolls.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma rolagem personalizada criada.
          </p>
        ) : (
          <div className="space-y-2">
            {customRolls.map(roll => (
              <div
                key={roll.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{roll.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      {getRollTypeLabel(roll.roll_type)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {roll.formula}
                  </p>
                  {roll.description && (
                    <p className="text-xs text-muted-foreground mt-1">{roll.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => executeRoll(roll)}
                  >
                    <Dices className="h-4 w-4 mr-1" />
                    Rolar
                  </Button>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate(roll.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Custom Roll Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Rolagem Personalizada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Ataque Revólver"
              />
            </div>
            <div>
              <Label>Fórmula *</Label>
              <Input
                value={newFormula}
                onChange={e => setNewFormula(e.target.value)}
                placeholder="Ex: 1d20+5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formato: XdY ou XdY+Z (ex: 1d20, 2d6+3, 1d8-1)
              </p>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attack">Ataque</SelectItem>
                  <SelectItem value="test">Teste</SelectItem>
                  <SelectItem value="damage">Dano</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Ex: Revólver .44 com modificador de DES"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!newName.trim() || !newFormula.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

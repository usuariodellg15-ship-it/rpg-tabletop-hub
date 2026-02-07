import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Swords, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function parseAndRoll(formula: string): { total: number; details: string; rolls: number[] } | null {
  const match = formula.match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/i);
  if (!match) return null;

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
  if (modifier > 0) details += ` ${operator} ${modifier}`;
  details += ` = ${total}`;

  return { total, details, rolls };
}

interface CombatEventsSectionProps {
  characterId: string;
  campaignId: string;
  userId: string;
  hp: number;
  maxHp: number;
  onHpChange: (newHp: number) => void;
  isEditable: boolean;
}

export function CombatEventsSection({
  characterId,
  campaignId,
  userId,
  hp,
  maxHp,
  onHpChange,
  isEditable,
}: CombatEventsSectionProps) {
  const queryClient = useQueryClient();

  // Damage state
  const [damageInputType, setDamageInputType] = useState<'fixed' | 'formula'>('fixed');
  const [damageValue, setDamageValue] = useState('');
  const [damageFormula, setDamageFormula] = useState('1d6');
  const [damageType, setDamageType] = useState('');
  const [damageNote, setDamageNote] = useState('');

  // Healing state
  const [healInputType, setHealInputType] = useState<'fixed' | 'formula'>('fixed');
  const [healValue, setHealValue] = useState('');
  const [healFormula, setHealFormula] = useState('1d8');
  const [healNote, setHealNote] = useState('');

  const applyMutation = useMutation({
    mutationFn: async ({
      eventType,
      inputType,
      formula,
      fixedAmount,
      note,
      dmgType,
    }: {
      eventType: 'DAMAGE_TAKEN' | 'HEALING_DONE';
      inputType: 'fixed' | 'formula';
      formula?: string;
      fixedAmount?: number;
      note?: string;
      dmgType?: string;
    }) => {
      let amount: number;
      let details: string;

      if (inputType === 'formula' && formula) {
        const result = parseAndRoll(formula);
        if (!result) throw new Error('Fórmula inválida. Use formato XdY ou XdY+Z');
        amount = result.total;
        details = `${formula}: ${result.details}`;
      } else {
        amount = fixedAmount || 0;
        if (amount <= 0) throw new Error('O valor deve ser maior que 0');
        details = `Valor fixo: ${amount}`;
      }

      if (dmgType) details += ` (${dmgType})`;
      if (note) details += ` — ${note}`;

      // Insert combat stat event
      const { error: statError } = await supabase
        .from('combat_stat_events')
        .insert({
          campaign_id: campaignId,
          character_id: characterId,
          event_type: eventType,
          amount,
        });
      if (statError) throw statError;

      // Also log as a dice roll for the roll log
      const rollType = eventType === 'DAMAGE_TAKEN' ? 'damage_taken' : 'healing';
      const { error: rollError } = await supabase
        .from('dice_rolls')
        .insert({
          campaign_id: campaignId,
          user_id: userId,
          character_id: characterId,
          formula: inputType === 'formula' ? formula! : `${amount}`,
          result: amount,
          details: `${eventType === 'DAMAGE_TAKEN' ? '🛡️ Dano Recebido' : '💚 Cura'}: ${details}`,
          roll_type: rollType,
        });
      if (rollError) throw rollError;

      // Update HP
      let newHp: number;
      if (eventType === 'DAMAGE_TAKEN') {
        newHp = Math.max(0, hp - amount);
      } else {
        newHp = Math.min(maxHp, hp + amount);
      }

      // Update character HP in DB
      const { error: updateError } = await supabase
        .from('characters')
        .update({ hp_current: newHp })
        .eq('id', characterId);
      if (updateError) throw updateError;

      return { amount, newHp, eventType };
    },
    onSuccess: ({ amount, newHp, eventType }) => {
      onHpChange(newHp);
      queryClient.invalidateQueries({ queryKey: ['character', characterId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-dice-rolls', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-stat-events', campaignId] });

      if (eventType === 'DAMAGE_TAKEN') {
        toast.success(`🛡️ Recebeu ${amount} de dano! PV: ${newHp}`);
        setDamageValue('');
        setDamageNote('');
        setDamageType('');
      } else {
        toast.success(`💚 Curado ${amount} PV! PV: ${newHp}`);
        setHealValue('');
        setHealNote('');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao registrar evento.');
    },
  });

  const handleDamage = useCallback(() => {
    applyMutation.mutate({
      eventType: 'DAMAGE_TAKEN',
      inputType: damageInputType,
      formula: damageInputType === 'formula' ? damageFormula : undefined,
      fixedAmount: damageInputType === 'fixed' ? parseInt(damageValue) || 0 : undefined,
      note: damageNote || undefined,
      dmgType: damageType || undefined,
    });
  }, [applyMutation, damageInputType, damageFormula, damageValue, damageNote, damageType]);

  const handleHeal = useCallback(() => {
    applyMutation.mutate({
      eventType: 'HEALING_DONE',
      inputType: healInputType,
      formula: healInputType === 'formula' ? healFormula : undefined,
      fixedAmount: healInputType === 'fixed' ? parseInt(healValue) || 0 : undefined,
      note: healNote || undefined,
    });
  }, [applyMutation, healInputType, healFormula, healValue, healNote]);

  if (!isEditable) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5" />
          Eventos de Combate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="damage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="damage" className="gap-1">
              <Swords className="h-3.5 w-3.5" /> Receber Dano
            </TabsTrigger>
            <TabsTrigger value="heal" className="gap-1">
              <Heart className="h-3.5 w-3.5" /> Receber Cura
            </TabsTrigger>
          </TabsList>

          {/* Damage Tab */}
          <TabsContent value="damage" className="space-y-3">
            <div>
              <Label className="text-xs">Tipo de Entrada</Label>
              <Select value={damageInputType} onValueChange={v => setDamageInputType(v as 'fixed' | 'formula')}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Valor Fixo</SelectItem>
                  <SelectItem value="formula">Rolagem (fórmula)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {damageInputType === 'fixed' ? (
              <div>
                <Label className="text-xs">Quantidade de Dano</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Ex: 12"
                  value={damageValue}
                  onChange={e => setDamageValue(e.target.value)}
                  className="h-9"
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs">Fórmula</Label>
                <Input
                  placeholder="Ex: 2d6+1"
                  value={damageFormula}
                  onChange={e => setDamageFormula(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>
            )}

            <div>
              <Label className="text-xs">Tipo de Dano (opcional)</Label>
              <Input
                placeholder="Ex: cortante, fogo..."
                value={damageType}
                onChange={e => setDamageType(e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs">Observação (opcional)</Label>
              <Input
                placeholder="Ex: queda, armadilha..."
                value={damageNote}
                onChange={e => setDamageNote(e.target.value)}
                className="h-9"
              />
            </div>

            <Button
              onClick={handleDamage}
              disabled={applyMutation.isPending || (damageInputType === 'fixed' && !damageValue)}
              className="w-full"
              variant="destructive"
            >
              {applyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Swords className="h-4 w-4 mr-2" />
              )}
              Aplicar Dano
            </Button>
          </TabsContent>

          {/* Heal Tab */}
          <TabsContent value="heal" className="space-y-3">
            <div>
              <Label className="text-xs">Tipo de Entrada</Label>
              <Select value={healInputType} onValueChange={v => setHealInputType(v as 'fixed' | 'formula')}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Valor Fixo</SelectItem>
                  <SelectItem value="formula">Rolagem (fórmula)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {healInputType === 'fixed' ? (
              <div>
                <Label className="text-xs">Quantidade de Cura</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Ex: 8"
                  value={healValue}
                  onChange={e => setHealValue(e.target.value)}
                  className="h-9"
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs">Fórmula</Label>
                <Input
                  placeholder="Ex: 1d8+3"
                  value={healFormula}
                  onChange={e => setHealFormula(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>
            )}

            <div>
              <Label className="text-xs">Observação (opcional)</Label>
              <Input
                placeholder="Ex: poção, magia..."
                value={healNote}
                onChange={e => setHealNote(e.target.value)}
                className="h-9"
              />
            </div>

            <Button
              onClick={handleHeal}
              disabled={applyMutation.isPending || (healInputType === 'fixed' && !healValue)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {applyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              Aplicar Cura
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

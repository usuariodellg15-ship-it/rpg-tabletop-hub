import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Zap, Heart, Skull, Users, Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export interface CombatStatEvent {
  id: string;
  campaignId: string;
  characterId: string;
  type: 'DAMAGE_DEALT' | 'DAMAGE_TAKEN' | 'HEALING_DONE' | 'OTHER';
  amount: number;
  timestamp: string;
  relatedRollId?: string;
}

// Simplified character interface for dashboard
interface DashboardCharacter {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
}

// Simplified mission interface for dashboard
interface DashboardMission {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
}

interface GMDashboardTabProps {
  characters: DashboardCharacter[];
  missions: DashboardMission[];
  statEvents: CombatStatEvent[];
}

export function GMDashboardTab({ characters, missions, statEvents }: GMDashboardTabProps) {
  const [deathZoneThreshold, setDeathZoneThreshold] = useState(25);

  // Calculate average level
  const avgLevelRaw = useMemo(() => {
    if (characters.length === 0) return 0;
    return characters.reduce((sum, c) => sum + c.level, 0) / characters.length;
  }, [characters]);

  const avgLevelRounded = Math.round(avgLevelRaw);
  const avgLevelDisplay = avgLevelRaw.toFixed(1);

  // Characters in death zone
  const charactersInDeathZone = useMemo(() => {
    return characters.filter(c => {
      const hpPercentage = (c.hp / c.maxHp) * 100;
      return hpPercentage <= deathZoneThreshold;
    });
  }, [characters, deathZoneThreshold]);

  // Calculate stats per character
  const characterStats = useMemo(() => {
    const stats: Record<string, { 
      damageDealt: number; 
      damageTaken: number; 
      healingDone: number;
      damageDealtCount: number;
      damageTakenCount: number;
      healingCount: number;
    }> = {};

    characters.forEach(c => {
      stats[c.id] = { 
        damageDealt: 0, 
        damageTaken: 0, 
        healingDone: 0,
        damageDealtCount: 0,
        damageTakenCount: 0,
        healingCount: 0,
      };
    });

    statEvents.forEach(event => {
      if (stats[event.characterId]) {
        if (event.type === 'DAMAGE_DEALT') {
          stats[event.characterId].damageDealt += event.amount;
          stats[event.characterId].damageDealtCount++;
        } else if (event.type === 'DAMAGE_TAKEN') {
          stats[event.characterId].damageTaken += event.amount;
          stats[event.characterId].damageTakenCount++;
        } else if (event.type === 'HEALING_DONE') {
          stats[event.characterId].healingDone += event.amount;
          stats[event.characterId].healingCount++;
        }
      }
    });

    return stats;
  }, [characters, statEvents]);

  // Rankings
  const topDamageDealer = useMemo(() => {
    let top: { char: DashboardCharacter; total: number } | null = null;
    characters.forEach(c => {
      const total = characterStats[c.id]?.damageDealt || 0;
      if (!top || total > top.total) {
        top = { char: c, total };
      }
    });
    return top;
  }, [characters, characterStats]);

  const topHealer = useMemo(() => {
    let top: { char: DashboardCharacter; total: number } | null = null;
    characters.forEach(c => {
      const total = characterStats[c.id]?.healingDone || 0;
      if (!top || total > top.total) {
        top = { char: c, total };
      }
    });
    return top;
  }, [characters, characterStats]);

  const mostDamageTaken = useMemo(() => {
    let top: { char: DashboardCharacter; total: number } | null = null;
    characters.forEach(c => {
      const total = characterStats[c.id]?.damageTaken || 0;
      if (!top || total > top.total) {
        top = { char: c, total };
      }
    });
    return top;
  }, [characters, characterStats]);

  // Active missions
  const activeMissions = missions.filter(m => m.status === 'active');

  return (
    <div className="space-y-6">
      {/* Primary Stats Row */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nível Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgLevelDisplay}</p>
            <p className="text-xs text-muted-foreground">
              Arredondado: {avgLevelRounded}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Missões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeMissions.length}</p>
            <p className="text-xs text-muted-foreground">
              {missions.filter(m => m.status === 'completed').length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dano Total do Grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Object.values(characterStats).reduce((sum, s) => sum + s.damageDealt, 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              de {statEvents.filter(e => e.type === 'DAMAGE_DEALT').length} ataques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Cura Total do Grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Object.values(characterStats).reduce((sum, s) => sum + s.healingDone, 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              de {statEvents.filter(e => e.type === 'HEALING_DONE').length} curas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Death Zone Section */}
      <Card className="border-destructive/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Zona de Morte (Vida Baixa)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Limite:</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={deathZoneThreshold}
              onChange={(e) => setDeathZoneThreshold(parseInt(e.target.value) || 25)}
              className="w-16 h-7 text-center text-sm"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </CardHeader>
        <CardContent>
          {charactersInDeathZone.length > 0 ? (
            <div className="space-y-2">
              {charactersInDeathZone.map(c => {
                const hpPercent = (c.hp / c.maxHp) * 100;
                return (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-destructive/10">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.class} Nv.{c.level}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={hpPercent} className="w-24 h-2" />
                      <Badge variant="destructive">{c.hp}/{c.maxHp}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Todos os personagens estão saudáveis! ✅</p>
          )}
        </CardContent>
      </Card>

      {/* Rankings Row */}
      <div>
        <h3 className="font-heading font-semibold mb-3">Destaques do Grupo</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-orange-500/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Mais Dano Causado</p>
                <p className="font-semibold">{topDamageDealer?.char.name || '-'}</p>
                <p className="text-sm text-muted-foreground">{topDamageDealer?.total || 0} de dano</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Mais Cura</p>
                <p className="font-semibold">{topHealer?.char.name || '-'}</p>
                <p className="text-sm text-muted-foreground">{topHealer?.total || 0} curado</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Skull className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Mais Dano Recebido</p>
                <p className="font-semibold">{mostDamageTaken?.char.name || '-'}</p>
                <p className="text-sm text-muted-foreground">{mostDamageTaken?.total || 0} recebido</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Per-Character Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Estatísticas por Personagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {characters.map(c => {
              const stats = characterStats[c.id] || { damageDealt: 0, damageTaken: 0, healingDone: 0, damageDealtCount: 0, damageTakenCount: 0, healingCount: 0 };
              const avgDamage = stats.damageDealtCount > 0 ? (stats.damageDealt / stats.damageDealtCount).toFixed(1) : '0';
              const avgTaken = stats.damageTakenCount > 0 ? (stats.damageTaken / stats.damageTakenCount).toFixed(1) : '0';
              const avgHealing = stats.healingCount > 0 ? (stats.healingDone / stats.healingCount).toFixed(1) : '0';
              
              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.class} Nv.{c.level}
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-orange-500">{stats.damageDealt}</p>
                      <p className="text-xs text-muted-foreground">Dano (média: {avgDamage})</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-500">{stats.healingDone}</p>
                      <p className="text-xs text-muted-foreground">Cura (média: {avgHealing})</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-red-500">{stats.damageTaken}</p>
                      <p className="text-xs text-muted-foreground">Recebido (média: {avgTaken})</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Missions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Missões Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeMissions.length > 0 ? (
            <div className="space-y-2">
              {activeMissions.slice(0, 5).map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <span className="text-lg">📜</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{m.title}</p>
                    {m.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary">Em Andamento</Badge>
                </div>
              ))}
              {activeMissions.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  + {activeMissions.length - 5} missões adicionais
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma missão ativa no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

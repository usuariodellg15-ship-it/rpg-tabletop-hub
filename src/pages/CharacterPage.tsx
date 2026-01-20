import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characters, campaigns, users, SystemType } from '@/data/mockData';
import { ArrowLeft, Edit, Download, History, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import HealthSection from '@/components/character/HealthSection';
import ACSection from '@/components/character/ACSection';
import AttributesSection from '@/components/character/AttributesSection';
import SkillsSection, { Skill, getSkillsForSystem } from '@/components/character/SkillsSection';

export default function CharacterPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const char = characters.find(c => c.id === id);
  const campaign = campaigns.find(c => c.id === char?.campaignId);
  const owner = users.find(u => u.id === char?.userId);
  
  const isOwner = char?.userId === user?.id;
  const isGM = campaign?.gmId === user?.id;
  const isEditable = isOwner || isGM;
  const system: SystemType = campaign?.system || '5e';
  const is5e = system === '5e';
  const isHorror = system === 'horror';

  // State for editable values
  const [hp, setHp] = useState(char?.hp || 0);
  const [maxHp, setMaxHp] = useState(char?.maxHp || 1);
  const [tempHp, setTempHp] = useState(0);
  
  // AC breakdown state
  const [acBase, setAcBase] = useState(10);
  const [acAttr, setAcAttr] = useState(char?.ac ? Math.max(0, (char.ac - 10)) : 0);
  const [acBonus, setAcBonus] = useState(0);

  // Attributes state
  const getInitialAttributes = () => {
    if (!char) return [];
    if (is5e) {
      return [
        { key: 'strength', label: 'FOR', value: char.strength || 10 },
        { key: 'dexterity', label: 'DES', value: char.dexterity || 10 },
        { key: 'constitution', label: 'CON', value: char.constitution || 10 },
        { key: 'intelligence', label: 'INT', value: char.intelligence || 10 },
        { key: 'wisdom', label: 'SAB', value: char.wisdom || 10 },
        { key: 'charisma', label: 'CAR', value: char.charisma || 10 },
      ];
    }
    if (isHorror) {
      return [
        { key: 'horrorStr', label: 'FOR', value: char.horrorStr || 50 },
        { key: 'horrorDex', label: 'DES', value: char.horrorDex || 50 },
        { key: 'horrorCon', label: 'CON', value: char.horrorCon || 50 },
        { key: 'horrorInt', label: 'INT', value: char.horrorInt || 50 },
        { key: 'horrorEdu', label: 'EDU', value: char.horrorEdu || 50 },
        { key: 'horrorPow', label: 'POD', value: char.horrorPow || 50 },
        { key: 'horrorApp', label: 'APR', value: char.horrorApp || 50 },
        { key: 'horrorSiz', label: 'TAM', value: char.horrorSiz || 50 },
      ];
    }
    return [
      { key: 'forca', label: 'FOR', value: char.forca || 10 },
      { key: 'agilidade', label: 'AGI', value: char.agilidade || 10 },
      { key: 'vigor', label: 'VIG', value: char.vigor || 10 },
      { key: 'intelecto', label: 'INT', value: char.intelecto || 10 },
      { key: 'vontade', label: 'VON', value: char.vontade || 10 },
      { key: 'presenca', label: 'PRE', value: char.presenca || 10 },
    ];
  };

  const [attributes, setAttributes] = useState(getInitialAttributes());

  // Skills state
  const getInitialSkills = (): Skill[] => {
    const baseSkills = getSkillsForSystem(system);
    const attrMap = new Map(attributes.map(a => [a.label, a.value]));
    
    return baseSkills.map(s => ({
      ...s,
      attributeValue: attrMap.get(s.attribute) || 10,
      isProficient: Math.random() > 0.7, // Mock: random proficiencies
      extraBonus: 0,
    }));
  };

  const [skills, setSkills] = useState<Skill[]>(getInitialSkills());

  // Roll log state
  const [rollLog, setRollLog] = useState<{ skill: string; formula: string; result: number }[]>([]);

  const handleAttributeChange = useCallback((key: string, value: number) => {
    setAttributes(prev => prev.map(a => a.key === key ? { ...a, value } : a));
    // Update skills with new attribute values
    setSkills(prev => prev.map(skill => {
      const attr = attributes.find(a => a.label === skill.attribute);
      if (attr && attr.key === key) {
        return { ...skill, attributeValue: value };
      }
      return skill;
    }));
  }, [attributes]);

  const handleACChange = useCallback((base: number, attr: number, bonus: number) => {
    setAcBase(base);
    setAcAttr(attr);
    setAcBonus(bonus);
  }, []);

  const handleSkillChange = useCallback((skillId: string, field: keyof Skill, value: any) => {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, [field]: value } : s));
  }, []);

  const handleSkillRoll = useCallback((skillName: string, formula: string, result: number) => {
    setRollLog(prev => [{ skill: skillName, formula, result }, ...prev.slice(0, 9)]);
  }, []);

  if (!char) return <MainLayout><div className="container py-8">Personagem não encontrado.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="container py-8 max-w-5xl">
        <Link to={`/campaigns/${char.campaignId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar à Campanha
          </Button>
        </Link>
        
        {/* Header */}
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={char.portrait} />
            <AvatarFallback className="text-2xl">{char.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold">{char.name}</h1>
            <p className="text-lg text-muted-foreground">{char.class} • Nível {char.level}</p>
            <p className="text-sm text-muted-foreground mt-1">Jogador: {owner?.name}</p>
            {char.lastEditedBy && <Badge variant="outline" className="mt-2 text-xs">Editado pelo GM</Badge>}
          </div>
          <div className="flex gap-2">
            {isEditable && <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Editar</Button>}
            <Button variant="ghost"><Download className="h-4 w-4" /></Button>
            <Button variant="ghost"><History className="h-4 w-4" /></Button>
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="skills">Perícias</TabsTrigger>
            <TabsTrigger value="abilities">Habilidades</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Health Section */}
              <HealthSection
                hp={hp}
                maxHp={maxHp}
                tempHp={tempHp}
                onHpChange={setHp}
                onMaxHpChange={setMaxHp}
                onTempHpChange={setTempHp}
                isEditable={isEditable}
              />

              {/* Sanity for Horror */}
              {isHorror && char.sanity !== undefined && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      👁 Sanidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(char.sanity / (char.maxSanity || 100)) * 100} className="h-3 [&>div]:bg-purple-500" />
                    <p className="text-right text-sm mt-2">{char.sanity} / {char.maxSanity}</p>
                  </CardContent>
                </Card>
              )}

              {/* AC Section - Not for Horror */}
              {!isHorror && (
                <ACSection
                  baseAC={acBase}
                  attrAC={acAttr}
                  bonusAC={acBonus}
                  onACChange={handleACChange}
                  isEditable={isEditable}
                  label={is5e ? 'Classe de Armadura' : 'Defesa'}
                />
              )}

              {/* Conditions */}
              {char.conditions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Condições</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1 flex-wrap">
                      {char.conditions.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Attributes Section */}
            <AttributesSection
              system={system}
              attributes={attributes}
              onAttributeChange={handleAttributeChange}
              isEditable={isEditable}
            />

            {/* Quick Rolls - Only for owner */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dices className="h-5 w-5" />Rolagens Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {isHorror ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 100) + 1;
                          toast.success(`🎲 1d100: ${result}`);
                          handleSkillRoll('Teste', '1d100', result);
                        }}>1d100</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 6) + 1;
                          toast.success(`🎲 1d6: ${result}`);
                          handleSkillRoll('Dano', '1d6', result);
                        }}>1d6</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 20) + 1;
                          toast.success(`🎲 1d20: ${result}`);
                          handleSkillRoll('Teste', '1d20', result);
                        }}>1d20</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
                          toast.success(`🎲 2d6: ${result}`);
                          handleSkillRoll('Dano', '2d6', result);
                        }}>2d6</Button>
                      </>
                    )}
                  </div>

                  {/* Recent Rolls */}
                  {rollLog.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Últimas Rolagens:</p>
                      <div className="space-y-1">
                        {rollLog.slice(0, 5).map((roll, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 px-2 bg-muted rounded">
                            <span>{roll.skill}</span>
                            <span className="font-mono">{roll.formula} = <strong>{roll.result}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <SkillsSection
              system={system}
              skills={skills}
              level={char.level}
              onSkillChange={handleSkillChange}
              onRoll={handleSkillRoll}
              isEditable={isEditable}
            />
          </TabsContent>

          {/* Abilities Tab */}
          <TabsContent value="abilities">
            <Card>
              <CardHeader>
                <CardTitle>Habilidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {char.abilities.map(ab => (
                  <div key={ab.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ab.name}</span>
                      {ab.maxUses && <span className="text-sm">{ab.uses}/{ab.maxUses}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{ab.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {char.inventory.map(item => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        {item.quantity > 1 && <Badge variant="secondary">x{item.quantity}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {char.notes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{char.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

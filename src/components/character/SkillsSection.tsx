import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Dices, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SystemType = Database['public']['Enums']['system_type'];

export interface Skill {
  id: string;
  name: string;
  attribute: string;
  attributeValue: number;
  isProficient: boolean;
  extraBonus: number;
}

interface SkillsSectionProps {
  system: SystemType;
  skills: Skill[];
  level: number;
  onSkillChange: (skillId: string, field: keyof Skill, value: any) => void;
  onRoll: (skillName: string, formula: string, result: number) => void;
  isEditable: boolean;
}

// Skills by system
const SKILLS_5E: Omit<Skill, 'attributeValue' | 'isProficient' | 'extraBonus'>[] = [
  { id: 'acrobatics', name: 'Acrobacia', attribute: 'DES' },
  { id: 'arcana', name: 'Arcanismo', attribute: 'INT' },
  { id: 'athletics', name: 'Atletismo', attribute: 'FOR' },
  { id: 'deception', name: 'Enganação', attribute: 'CAR' },
  { id: 'history', name: 'História', attribute: 'INT' },
  { id: 'insight', name: 'Intuição', attribute: 'SAB' },
  { id: 'intimidation', name: 'Intimidação', attribute: 'CAR' },
  { id: 'investigation', name: 'Investigação', attribute: 'INT' },
  { id: 'medicine', name: 'Medicina', attribute: 'SAB' },
  { id: 'nature', name: 'Natureza', attribute: 'INT' },
  { id: 'perception', name: 'Percepção', attribute: 'SAB' },
  { id: 'performance', name: 'Atuação', attribute: 'CAR' },
  { id: 'persuasion', name: 'Persuasão', attribute: 'CAR' },
  { id: 'religion', name: 'Religião', attribute: 'INT' },
  { id: 'sleight_of_hand', name: 'Prestidigitação', attribute: 'DES' },
  { id: 'stealth', name: 'Furtividade', attribute: 'DES' },
  { id: 'survival', name: 'Sobrevivência', attribute: 'SAB' },
  { id: 'animal_handling', name: 'Adestrar Animais', attribute: 'SAB' },
];

const SKILLS_AUTORAL: Omit<Skill, 'attributeValue' | 'isProficient' | 'extraBonus'>[] = [
  { id: 'combate', name: 'Combate', attribute: 'FOR' },
  { id: 'pontaria', name: 'Pontaria', attribute: 'AGI' },
  { id: 'reflexos', name: 'Reflexos', attribute: 'AGI' },
  { id: 'furtividade', name: 'Furtividade', attribute: 'AGI' },
  { id: 'resistencia', name: 'Resistência', attribute: 'VIG' },
  { id: 'percepcao', name: 'Percepção', attribute: 'INT' },
  { id: 'investigacao', name: 'Investigação', attribute: 'INT' },
  { id: 'conhecimento', name: 'Conhecimento', attribute: 'INT' },
  { id: 'sobrevivencia', name: 'Sobrevivência', attribute: 'INT' },
  { id: 'intimidacao', name: 'Intimidação', attribute: 'PRE' },
  { id: 'persuasao', name: 'Persuasão', attribute: 'PRE' },
  { id: 'enganacao', name: 'Enganação', attribute: 'PRE' },
  { id: 'vontade', name: 'Vontade', attribute: 'VON' },
  { id: 'ocultismo', name: 'Ocultismo', attribute: 'VON' },
];

const SKILLS_HORROR: Omit<Skill, 'attributeValue' | 'isProficient' | 'extraBonus'>[] = [
  { id: 'accounting', name: 'Contabilidade', attribute: 'EDU' },
  { id: 'anthropology', name: 'Antropologia', attribute: 'EDU' },
  { id: 'archaeology', name: 'Arqueologia', attribute: 'EDU' },
  { id: 'art', name: 'Arte', attribute: 'POD' },
  { id: 'charm', name: 'Charme', attribute: 'APR' },
  { id: 'climb', name: 'Escalar', attribute: 'FOR' },
  { id: 'cthulhu_mythos', name: 'Mitos de Cthulhu', attribute: 'INT' },
  { id: 'disguise', name: 'Disfarce', attribute: 'APR' },
  { id: 'dodge', name: 'Esquiva', attribute: 'DES' },
  { id: 'drive', name: 'Dirigir', attribute: 'DES' },
  { id: 'first_aid', name: 'Primeiros Socorros', attribute: 'EDU' },
  { id: 'firearms', name: 'Armas de Fogo', attribute: 'DES' },
  { id: 'history', name: 'História', attribute: 'EDU' },
  { id: 'intimidate', name: 'Intimidar', attribute: 'POD' },
  { id: 'jump', name: 'Saltar', attribute: 'FOR' },
  { id: 'language_own', name: 'Língua (Nativa)', attribute: 'EDU' },
  { id: 'law', name: 'Direito', attribute: 'EDU' },
  { id: 'library', name: 'Usar Bibliotecas', attribute: 'EDU' },
  { id: 'listen', name: 'Ouvir', attribute: 'POD' },
  { id: 'locksmith', name: 'Chaveiro', attribute: 'DES' },
  { id: 'medicine', name: 'Medicina', attribute: 'EDU' },
  { id: 'occult', name: 'Ocultismo', attribute: 'EDU' },
  { id: 'persuade', name: 'Persuadir', attribute: 'APR' },
  { id: 'psychology', name: 'Psicologia', attribute: 'INT' },
  { id: 'science', name: 'Ciência', attribute: 'EDU' },
  { id: 'spot_hidden', name: 'Encontrar', attribute: 'INT' },
  { id: 'stealth', name: 'Furtividade', attribute: 'DES' },
  { id: 'swim', name: 'Nadar', attribute: 'CON' },
  { id: 'throw', name: 'Arremessar', attribute: 'DES' },
  { id: 'track', name: 'Rastrear', attribute: 'INT' },
];

const getSkillsForSystem = (system: SystemType) => {
  switch (system) {
    case '5e': return SKILLS_5E;
    case 'olho_da_morte': return SKILLS_AUTORAL;
    case 'horror': return SKILLS_HORROR;
    default: return SKILLS_5E;
  }
};

const getProficiencyBonus = (level: number): number => {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
};

const getModifier = (value: number, system: SystemType): number => {
  if (system === 'horror') return 0; // Horror uses flat values
  return Math.floor((value - 10) / 2);
};

export default function SkillsSection({
  system,
  skills,
  level,
  onSkillChange,
  onRoll,
  isEditable
}: SkillsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const profBonus = getProficiencyBonus(level);

  const handleRoll = useCallback((skill: Skill) => {
    const isHorror = system === 'horror';
    
    if (isHorror) {
      // Percentile roll for Horror system
      const roll = Math.floor(Math.random() * 100) + 1;
      const target = skill.attributeValue + skill.extraBonus;
      const success = roll <= target;
      const formula = `1d100 (alvo: ${target})`;
      toast[success ? 'success' : 'error'](`🎲 ${skill.name}: ${roll} ${success ? '✓ Sucesso!' : '✗ Falha'}`);
      onRoll(skill.name, formula, roll);
    } else {
      // D20 roll for 5e/Autoral
      const roll = Math.floor(Math.random() * 20) + 1;
      const mod = getModifier(skill.attributeValue, system);
      const profMod = skill.isProficient ? profBonus : 0;
      const total = roll + mod + profMod + skill.extraBonus;
      const formula = `1d20${mod >= 0 ? '+' : ''}${mod}${profMod > 0 ? `+${profMod}` : ''}${skill.extraBonus ? (skill.extraBonus >= 0 ? '+' : '') + skill.extraBonus : ''}`;
      toast.success(`🎲 ${skill.name}: ${roll} + bônus = ${total}`);
      onRoll(skill.name, formula, total);
    }
  }, [system, profBonus, onRoll]);

  const formatMod = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Perícias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between mb-4">
              {isOpen ? 'Esconder Lista Completa' : 'Mostrar Lista Completa'}
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b mb-2">
              <div className="col-span-1">Prof</div>
              <div className="col-span-4">Perícia</div>
              <div className="col-span-2">Attr</div>
              <div className="col-span-2">Bônus</div>
              <div className="col-span-2">Extra</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Skills list */}
            {skills.map(skill => {
              const mod = getModifier(skill.attributeValue, system);
              const profMod = skill.isProficient ? profBonus : 0;
              const totalMod = system === 'horror' 
                ? skill.attributeValue + skill.extraBonus 
                : mod + profMod + skill.extraBonus;
              
              return (
                <div key={skill.id} className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 hover:bg-muted/50 rounded">
                  {/* Proficiency */}
                  <div className="col-span-1">
                    <Checkbox 
                      checked={skill.isProficient}
                      onCheckedChange={v => onSkillChange(skill.id, 'isProficient', v)}
                      disabled={!isEditable}
                      className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                    />
                  </div>
                  
                  {/* Skill name */}
                  <div className="col-span-4 text-sm font-medium truncate" title={skill.name}>
                    {skill.name}
                  </div>
                  
                  {/* Attribute */}
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {skill.attribute}
                  </div>
                  
                  {/* Calculated bonus */}
                  <div className="col-span-2 text-sm font-medium">
                    {system === 'horror' ? `${totalMod}%` : formatMod(totalMod)}
                  </div>
                  
                  {/* Extra bonus input */}
                  <div className="col-span-2">
                    <Input 
                      type="number"
                      className="h-7 text-center text-xs px-1"
                      value={skill.extraBonus}
                      onChange={e => onSkillChange(skill.id, 'extraBonus', parseInt(e.target.value) || 0)}
                      disabled={!isEditable}
                    />
                  </div>
                  
                  {/* Roll button */}
                  <div className="col-span-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleRoll(skill)}
                    >
                      <Dices className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
        
        {!isOpen && (
          <p className="text-sm text-muted-foreground text-center">
            {skills.filter(s => s.isProficient).length} perícias com proficiência
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { getSkillsForSystem, SKILLS_5E, SKILLS_AUTORAL, SKILLS_HORROR };

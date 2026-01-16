import { DiceRoll, users } from '@/data/mockData';
import { Dice6, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface RollsSidebarProps {
  rolls: DiceRoll[];
  className?: string;
}

export function RollsSidebar({ rolls, className = '' }: RollsSidebarProps) {
  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Desconhecido';
  };

  const getUserAvatar = (userId: string) => {
    return users.find(u => u.id === userId)?.avatar;
  };

  const isCritical = (result: number, formula: string) => {
    if (formula.includes('d20')) {
      const diceRoll = parseInt(formula.split('+')[0]?.replace('1d20', '') || '0');
      return result - diceRoll >= 20 || result - diceRoll <= 1;
    }
    return false;
  };

  return (
    <div className={`w-72 border-l bg-card flex flex-col ${className}`}>
      <div className="p-4 border-b">
        <h3 className="font-heading font-semibold flex items-center gap-2">
          <Dice6 className="h-5 w-5 text-primary" />
          Log de Rolagens
        </h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <AnimatePresence mode="popLayout">
          {rolls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma rolagem ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {rolls.slice().reverse().map((roll, index) => (
                <motion.div
                  key={roll.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border bg-background ${
                    roll.details.includes('Crítico') ? 'border-destructive bg-destructive/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={getUserAvatar(roll.userId)} 
                      alt="" 
                      className="h-5 w-5 rounded-full"
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {getUserName(roll.userId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">
                      {roll.formula}
                    </span>
                    <span className={`text-xl font-bold font-heading ${
                      roll.details.includes('Crítico') ? 'text-destructive' : 'text-primary'
                    }`}>
                      {roll.result}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {roll.details}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}

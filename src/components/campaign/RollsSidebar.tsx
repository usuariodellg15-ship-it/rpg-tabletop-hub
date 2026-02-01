import { Dice6 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface DiceRoll {
  id: string;
  campaignId: string;
  userId: string;
  formula: string;
  result: number;
  details: string;
  timestamp: string;
}

interface RollsSidebarProps {
  rolls: DiceRoll[];
  className?: string;
  profiles?: Record<string, { name: string; avatar_url?: string | null }>;
}

export function RollsSidebar({ rolls, className = '', profiles = {} }: RollsSidebarProps) {
  const getUserName = (userId: string) => {
    return profiles[userId]?.name || 'Jogador';
  };

  const getUserAvatar = (userId: string) => {
    return profiles[userId]?.avatar_url || undefined;
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
                    roll.details?.includes('Crítico') ? 'border-destructive bg-destructive/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getUserAvatar(roll.userId) ? (
                      <img 
                        src={getUserAvatar(roll.userId)} 
                        alt="" 
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs">
                        {getUserName(roll.userId)?.[0] || '?'}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground truncate">
                      {getUserName(roll.userId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">
                      {roll.formula}
                    </span>
                    <span className={`text-xl font-bold font-heading ${
                      roll.details?.includes('Crítico') ? 'text-destructive' : 'text-primary'
                    }`}>
                      {roll.result}
                    </span>
                  </div>
                  {roll.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {roll.details}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}

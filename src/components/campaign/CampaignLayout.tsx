import { ReactNode } from 'react';
import { RollsSidebar } from './RollsSidebar';
import { DiceRoll } from '@/data/mockData';

interface CampaignLayoutProps {
  children: ReactNode;
  rolls: DiceRoll[];
  showRolls?: boolean;
}

export function CampaignLayout({ children, rolls, showRolls = true }: CampaignLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      {showRolls && (
        <RollsSidebar rolls={rolls} className="hidden lg:flex" />
      )}
    </div>
  );
}

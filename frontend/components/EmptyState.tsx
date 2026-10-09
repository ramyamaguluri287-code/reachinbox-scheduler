import React from 'react';
import { Mail, Plus } from 'lucide-react';
import { Button } from './ui/button';

export interface EmptyStateProps {
  title: string;
  description: string;
  onAction?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  onAction,
  actionText = 'Compose New Email',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#F4F6F8] text-gray-400 flex items-center justify-center mb-4 shadow-inner">
        <Mail className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-sm mb-5">{description}</p>
      {onAction && (
        <Button onClick={onAction} variant="default" size="sm" className="space-x-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
};

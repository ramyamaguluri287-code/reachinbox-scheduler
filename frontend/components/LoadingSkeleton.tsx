import React from 'react';
import { Skeleton } from './ui/skeleton';

export interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="w-full divide-y divide-gray-50 p-4 space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between py-3 space-x-4">
          <div className="flex items-center space-x-3 flex-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1.5 flex-1 max-w-sm">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-2.5 w-1/2 rounded" />
            </div>
          </div>
          <Skeleton className="h-3 w-28 rounded hidden sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
};

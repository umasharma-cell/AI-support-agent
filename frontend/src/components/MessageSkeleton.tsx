import type { ReactElement } from 'react';

export const MessageSkeleton = (): ReactElement => {
  return (
    <div className="space-y-4" aria-label="Loading conversation">
      <SkeletonRow alignment="left" width="w-56" />
      <SkeletonRow alignment="right" width="w-44" />
      <SkeletonRow alignment="left" width="w-64" />
    </div>
  );
};

interface SkeletonRowProps {
  alignment: 'left' | 'right';
  width: string;
}

const SkeletonRow = ({ alignment, width }: SkeletonRowProps): ReactElement => {
  const isRightAligned = alignment === 'right';

  return (
    <div className={`flex ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
      <div className={`h-12 ${width} animate-pulse rounded-2xl bg-gray-200`} />
    </div>
  );
};

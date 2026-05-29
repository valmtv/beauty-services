'use client';

import React from 'react';

export default function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="shimmer-loader h-[106px] w-full rounded-2xl border border-border-main bg-background-card/50"
        ></div>
      ))}
    </div>
  );
}

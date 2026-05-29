'use client';

import React from 'react';

interface PaginationProps {
  setPage: (value: number | ((prev: number) => number)) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  totalPages: number;
  currentPage: number;
}

export default function Pagination({
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  currentPage,
}: PaginationProps) {
  return (
    <div className="shrink-0 glass-panel border-t border-border-main p-4 flex items-center justify-between gap-4 select-none">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-text-muted">Show:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1); // Reset page on limit changes
          }}
          className="bg-background-app text-[11px] font-bold border border-border-main rounded-lg px-2.5 py-1 focus:outline-none text-text-main cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center gap-3.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-xs font-semibold text-text-second hover:text-text-main px-3 py-1.5 rounded-lg border border-border-main bg-background-app hover:bg-background-card-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors"
          >
            Prev
          </button>

          <span className="text-[11px] font-semibold text-text-muted select-none">
            Page <span className="text-text-main font-bold">{currentPage}</span> of{' '}
            <span className="text-text-main font-bold">{totalPages}</span>
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="text-xs font-semibold text-text-second hover:text-text-main px-3 py-1.5 rounded-lg border border-border-main bg-background-app hover:bg-background-card-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors"
          >
            Next
          </button>
        </div>
      ) : (
        <span className="text-[11px] font-semibold text-text-muted select-none">
          All salons shown
        </span>
      )}
    </div>
  );
}

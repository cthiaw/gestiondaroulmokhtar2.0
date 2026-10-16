import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"></div>
      <span className="text-sm text-slate-500">Chargement…</span>
    </div>
  );
}

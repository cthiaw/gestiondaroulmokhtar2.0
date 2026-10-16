import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Daroul Mokhtar · Réalisé par Cheikh A.K THIAW · thiawch@gmail.com
        </p>
      </div>
    </footer>
  );
}

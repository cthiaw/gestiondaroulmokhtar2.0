import React, { useState, useRef, useEffect } from 'react';
import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Wallet,
  BookOpen,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/authService';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, text: 'Tableau de bord' },
  { to: '/students', icon: Users, text: 'Élèves' },
  { to: '/teachers', icon: GraduationCap, text: 'Personnels' },
  { to: '/classes', icon: School, text: 'Classes' },
  { to: '/grades', icon: BookOpen, text: 'Notes' },
  { to: '/finances', icon: Wallet, text: 'Finances' },
];

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPage = navLinks.find((link) => location.pathname.startsWith(link.to))?.text ?? '';
  const initials = (user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64 print:pl-0 print:bg-white">
      {/* Barre latérale (ordinateur) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-brand-900 print:hidden">
        <Brand />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navLinks.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs text-brand-100/70">
          École Franco-Arabe
        </div>
      </aside>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-brand-900 shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 text-brand-100 hover:bg-white/10"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navLinks.map((link) => (
                <SidebarLink key={link.to} {...link} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur print:hidden">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="-ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <span className="text-base font-semibold text-slate-900 lg:hidden">Daroul Mokhtar</span>
              <span className="hidden text-sm font-medium text-slate-500 lg:block">{currentPage}</span>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                  {initials}
                </span>
                <span className="hidden max-w-[16rem] truncate text-sm font-medium sm:block">{user?.email}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-2 sm:hidden">
                    <p className="truncate text-sm text-slate-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex h-16 items-center gap-3 px-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-400/90">
        <School className="h-5 w-5 text-brand-950" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-wide text-white">DAROUL MOKHTAR</p>
        <p className="text-xs text-brand-100/70">Gestion scolaire</p>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

function SidebarLink({ to, icon: Icon, text }: SidebarLinkProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-brand-100/80 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-5 w-5 ${isActive ? 'text-accent-400' : ''}`} />
          <span>{text}</span>
        </>
      )}
    </RouterNavLink>
  );
}

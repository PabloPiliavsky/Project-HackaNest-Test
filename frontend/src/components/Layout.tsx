import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Button } from './ui/Button';
import { Terminal, LogOut, Shield, Home as HomeIcon } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-foreground hover:opacity-95 transition-opacity">
              <Terminal className="h-6 w-6 text-primary" />
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                HackaNest
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/' ? 'text-primary' : 'text-zinc-400'
                }`}
              >
                <HomeIcon size={16} />
                <span>Hackathons</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/admin' ? 'text-primary' : 'text-zinc-400'
                  }`}
                >
                  <Shield size={16} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-zinc-200">{user.name}</p>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20 capitalize">
                    {user.role}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-1.5 text-red-400 border-red-950/40 hover:bg-red-950/20 hover:text-red-300">
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Ingresar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-6 bg-zinc-950/40 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} HackaNest Platform. Todos los derechos reservados.</p>
          <div className="flex space-x-4">
            <a href="https://nestjs.com" target="_blank" rel="noreferrer" className="hover:text-zinc-400 transition-colors">NestJS API</a>
            <span className="text-zinc-700">|</span>
            <a href="https://react.dev" target="_blank" rel="noreferrer" className="hover:text-zinc-400 transition-colors">React Frontend</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

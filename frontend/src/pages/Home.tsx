import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, ArrowRight, Layers, HelpCircle } from 'lucide-react';

interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  start: string;
  end: string;
  isActive: boolean;
}

export function Home() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHackathons() {
      try {
        const data = await api.get<Hackathon[]>('/hackathons');
        setHackathons(data || []);
      } catch (err) {
        // Error already logged and toasted in api.ts
      } finally {
        setLoading(false);
      }
    }
    fetchHackathons();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatus = (startStr: string, endStr: string, isActive: boolean) => {
    if (!isActive) return { text: 'Inactivo', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (now < start) {
      return { text: 'Próximo', color: 'bg-blue-950/40 text-blue-300 border-blue-800/40' };
    } else if (now > end) {
      return { text: 'Finalizado', color: 'bg-red-950/40 text-red-300 border-red-800/40' };
    } else {
      return { text: 'Activo', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' };
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="text-center py-12 relative overflow-hidden rounded-2xl bg-zinc-950/30 border border-border/40 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
            HackaNest Plataforma v1.0
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Desarrolla el Futuro en <span className="gradient-text">Nuestras Hackathons</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg">
            Únete a programadores de todo el mundo para resolver retos complejos usando NestJS y React. Demuestra tus habilidades, aprende y gana premios.
          </p>
        </div>
      </section>

      {/* Main Hackathons Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Layers className="text-primary h-6 w-6" />
            <span>Hackathons Disponibles</span>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Total: {hackathons.length}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 animate-pulse bg-zinc-900/50 border border-border/20 rounded-xl" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/40 rounded-xl bg-zinc-900/20">
            <HelpCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium text-lg">No hay hackathons disponibles en este momento.</p>
            <p className="text-zinc-500 text-sm mt-1">¡Vuelve a consultar más tarde o crea una desde el panel administrador!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((h) => {
              const status = getStatus(h.start, h.end, h.isActive);
              return (
                <Card key={h.id} glow className="flex flex-col h-full bg-zinc-950/40">
                  <CardHeader className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {h.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 mt-2 text-zinc-400">
                      {h.description || 'Sin descripción detallada disponible para este evento.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-xs text-zinc-400 space-x-2 bg-zinc-900/30 p-2 rounded-lg border border-border/20">
                      <Calendar size={14} className="text-primary" />
                      <span>{formatDate(h.start)} - {formatDate(h.end)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/10">
                    <Link to={`/hackathons/${h.id}`} className="w-full">
                      <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                        <span>Ver Detalles</span>
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/api';
import { useAuth } from '../context/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Users, ArrowLeft, CheckCircle, Info, Lock } from 'lucide-react';
import { toast } from '../components/ui/Toast';

interface Participant {
  id: string;
  personId: string;
  person: {
    id: string;
    name: string;
    userId: string;
  };
}

interface HackathonDetail {
  id: string;
  name: string;
  description: string | null;
  start: string;
  end: string;
  isActive: boolean;
  participants: Participant[];
}

export function HackathonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<HackathonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const fetchHackathon = async () => {
    if (!id) return;
    try {
      const data = await api.get<HackathonDetail>(`/hackathons/${id}`);
      setHackathon(data);
    } catch (err) {
      // Error handles in api.ts
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathon();
  }, [id]);

  const handleJoin = async () => {
    if (!id) return;
    setJoining(true);
    try {
      await api.post(`/hackathons/${id}/join`);
      toast({ title: '¡Inscripción Exitosa!', description: 'Te has unido al hackathon con éxito.', type: 'success' });
      await fetchHackathon();
    } catch (err) {
      // Handled in api.ts
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-zinc-400 text-sm">Cargando detalles del evento...</span>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-16">
        <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Hackathon no encontrada</h2>
        <p className="text-zinc-500 mt-2">El evento solicitado no existe o fue eliminado.</p>
        <Link to="/" className="inline-block mt-4">
          <Button variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const isJoined = user && hackathon.participants.some(p => p.person.userId === user.id);
  const totalParticipants = hackathon.participants.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEnded = new Date() > new Date(hackathon.end);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center space-x-1.5 text-zinc-400 hover:text-primary transition-colors text-sm font-semibold">
        <ArrowLeft size={16} />
        <span>Volver a Hackathons</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-950/40 border-border/40">
            <CardHeader>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-left">{hackathon.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  isEnded 
                    ? 'bg-red-950/40 text-red-300 border-red-800/40' 
                    : hackathon.isActive 
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {isEnded ? 'Finalizado' : hackathon.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className="inline-flex items-center rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                  <Users size={12} className="mr-1" />
                  {totalParticipants} {totalParticipants === 1 ? 'participante' : 'participantes'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 border-t border-border/20">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-zinc-200">Descripción del Evento</h3>
                <p className="text-zinc-400 leading-relaxed text-sm whitespace-pre-line">
                  {hackathon.description || 'No hay descripción detallada disponible para este evento todavía.'}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/10">
                <h3 className="text-lg font-semibold text-zinc-200">Fechas Importantes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-900/40 rounded-lg border border-border/15">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Inicio de Hackathon</span>
                    <span className="text-sm font-medium text-zinc-300">{formatDate(hackathon.start)}</span>
                  </div>
                  <div className="p-3 bg-zinc-900/40 rounded-lg border border-border/15">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Fin de Hackathon</span>
                    <span className="text-sm font-medium text-zinc-300">{formatDate(hackathon.end)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card className="bg-zinc-950/60 border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Inscripción</CardTitle>
              <CardDescription>Participa y compite en este reto de programación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                isJoined ? (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex flex-col items-center text-center space-y-2">
                    <CheckCircle className="h-10 w-10 text-emerald-400 animate-bounce" />
                    <span className="font-bold text-emerald-300 text-sm">¡Ya estás inscrito!</span>
                    <p className="text-xs text-emerald-400/80">Estás en la lista de participantes de este evento. Prepárate para codificar.</p>
                  </div>
                ) : isEnded ? (
                  <Button disabled className="w-full">
                    Evento Finalizado
                  </Button>
                ) : !hackathon.isActive ? (
                  <Button disabled className="w-full">
                    Inscripción Deshabilitada
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoin}
                    isLoading={joining}
                    className="w-full shadow-lg shadow-primary/20"
                  >
                    Unirse al Hackathon
                  </Button>
                )
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-start space-x-3">
                    <Lock size={18} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-zinc-400 leading-normal">
                      Debes iniciar sesión con tu cuenta de programador para inscribirte a este evento.
                    </p>
                  </div>
                  <Link to="/login" className="block w-full">
                    <Button variant="primary" className="w-full">
                      Iniciar Sesión para Unirse
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participant List (Optional preview) */}
          <Card className="bg-zinc-950/40 border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <Users size={16} className="text-primary" />
                <span>Participantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hackathon.participants.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">Sé el primero en unirte a este reto.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {hackathon.participants.map((p) => (
                    <div key={p.id} className="flex items-center space-x-2 text-xs py-1.5 border-b border-border/10 last:border-0">
                      <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-primary">
                        {p.person.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-zinc-300 font-medium">{p.person.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

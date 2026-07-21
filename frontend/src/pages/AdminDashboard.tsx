import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../api/api';
import { useAuth } from '../context/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { toast } from '../components/ui/Toast';
import { Calendar, Edit, Trash2, Plus, RefreshCw, Eye, Power } from 'lucide-react';

interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  start: string;
  end: string;
  isActive: boolean;
}

const hackathonSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional().refine(val => !val || val.trim().length === 0 || val.trim().length >= 10, {
    message: 'La descripción debe tener al menos 10 caracteres si se proporciona',
  }),
  start: z.string().min(1, 'La fecha de inicio es requerida'),
  end: z.string().min(1, 'La fecha de fin es requerida'),
  isActive: z.boolean().optional(),
});

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      name: '',
      description: '',
      start: '',
      end: '',
      isActive: true,
    },
  });

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const data = await api.get<Hackathon[]>('/hackathons');
      setHackathons(data || []);
    } catch (err) {
      // Handled in api.ts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirection if not admin
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        toast({ title: 'Acceso Denegado', description: 'No tienes permisos para ver esta sección.', type: 'error' });
        navigate('/');
      } else {
        fetchHackathons();
      }
    }
  }, [user, authLoading, navigate]);

  const toLocalDatetimeString = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Format YYYY-MM-DDTHH:mm for datetime-local inputs
    const pad = (num: number) => String(num).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const openCreateModal = () => {
    setEditingHackathon(null);
    reset({
      name: '',
      description: '',
      start: '',
      end: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (h: Hackathon) => {
    setEditingHackathon(h);
    setValue('name', h.name);
    setValue('description', h.description || '');
    setValue('start', toLocalDatetimeString(h.start));
    setValue('end', toLocalDatetimeString(h.end));
    setValue('isActive', h.isActive);
    setIsModalOpen(true);
  };

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    // Cleanup description if empty
    const payload = {
      ...values,
      description: values.description?.trim() === '' ? undefined : values.description,
      // The backend expects an authorId to pass validation DTO, so we send a dummy value
      // because our backend controller intercepts and overwrites it with the real one.
      authorId: 'temp',
    };

    try {
      if (editingHackathon) {
        await api.patch(`/hackathons/${editingHackathon.id}`, payload);
        toast({ title: 'Hackathon Actualizada', description: 'Los cambios se han guardado con éxito.', type: 'success' });
      } else {
        await api.post('/hackathons', payload);
        toast({ title: 'Hackathon Creada', description: 'El evento ha sido registrado correctamente.', type: 'success' });
      }
      setIsModalOpen(false);
      fetchHackathons();
    } catch (err) {
      // Handled in api.ts
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la hackathon "${name}"?`)) return;

    try {
      await api.delete(`/hackathons/${id}`);
      toast({ title: 'Hackathon Eliminada', description: 'El evento ha sido removido del sistema.', type: 'success' });
      fetchHackathons();
    } catch (err) {
      // Handled in api.ts
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading && hackathons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-zinc-400 text-sm">Cargando panel de administración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Panel de Control</h1>
          <p className="text-sm text-zinc-400">Administra los eventos de hackathon del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={fetchHackathons} className="p-2.5">
            <RefreshCw size={16} />
          </Button>
          <Button onClick={openCreateModal} className="flex items-center space-x-1.5">
            <Plus size={16} />
            <span>Nueva Hackathon</span>
          </Button>
        </div>
      </div>

      {/* Grid List */}
      <Card className="bg-zinc-950/40 border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-border/30">
              <tr>
                <th className="p-4">Evento</th>
                <th className="p-4 hidden md:table-cell">Fechas</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {hackathons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    No hay hackathons creadas. ¡Empieza creando una!
                  </td>
                </tr>
              ) : (
                hackathons.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-zinc-200">{h.name}</div>
                      <div className="text-xs text-zinc-500 line-clamp-1 mt-0.5 max-w-md">
                        {h.description || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                        <Calendar size={12} className="text-primary" />
                        <span>{formatDate(h.start)} al {formatDate(h.end)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                        h.isActive 
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' 
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {h.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/hackathons/${h.id}`)}
                          title="Ver en público"
                          className="h-8 w-8 p-0"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(h)}
                          title="Editar"
                          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-950/20"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(h.id, h.name)}
                          title="Eliminar"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Dialog Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHackathon ? 'Editar Hackathon' : 'Crear Nueva Hackathon'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre de la Hackathon"
            placeholder="e.g., HackaNest 2026"
            error={errors.name?.message as string}
            {...register('name')}
          />

          <Textarea
            label="Descripción"
            placeholder="Escribe detalles del reto, reglas y premios..."
            error={errors.description?.message as string}
            {...register('description')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio"
              type="datetime-local"
              error={errors.start?.message as string}
              {...register('start')}
            />
            <Input
              label="Fecha de Fin"
              type="datetime-local"
              error={errors.end?.message as string}
              {...register('end')}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-border bg-zinc-950 text-primary focus:ring-primary focus:ring-offset-0 accent-primary"
              {...register('isActive')}
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-zinc-300 flex items-center space-x-1.5 cursor-pointer">
              <Power size={14} />
              <span>Marcar como activa / disponible para inscripciones</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-border/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingHackathon ? 'Guardar Cambios' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

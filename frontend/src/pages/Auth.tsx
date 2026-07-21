import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/useAuth';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Terminal, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const [submitting, setSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Reset form when changing between login and register
  useEffect(() => {
    reset();
  }, [isRegister, reset]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(data.name, data.email, data.password);
      } else {
        await login(data.email, data.password);
      }
      navigate('/');
    } catch (err) {
      // API client will automatically trigger toast notifications for errors
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <Terminal className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {isRegister ? 'Crear una cuenta' : 'Inicia sesión en HackaNest'}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {isRegister
              ? 'Únete a nuestra plataforma y participa en retos increíbles'
              : 'Bienvenido de vuelta. Ingresa tus datos para continuar'}
          </p>
        </div>

        <Card className="border border-border/40 bg-zinc-950/40">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-6">
              {isRegister && (
                <Input
                  label="Nombre Completo"
                  placeholder="John Doe"
                  type="text"
                  error={errors.name?.message as string}
                  {...registerField('name')}
                />
              )}

              <Input
                label="Correo Electrónico"
                placeholder="developer@hackanest.com"
                type="email"
                error={errors.email?.message as string}
                {...registerField('email')}
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                type="password"
                error={errors.password?.message as string}
                {...registerField('password')}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-6 pt-4 border-t border-border/20">
              <Button type="submit" isLoading={submitting} className="w-full flex items-center justify-center space-x-2">
                <span>{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</span>
                <ArrowRight size={16} />
              </Button>

              <div className="text-center text-sm">
                <span className="text-zinc-400">
                  {isRegister ? '¿Ya tienes una cuenta? ' : '¿No tienes cuenta aún? '}
                </span>
                <Link
                  to={isRegister ? '/login' : '/register'}
                  className="text-primary hover:underline font-semibold"
                >
                  {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

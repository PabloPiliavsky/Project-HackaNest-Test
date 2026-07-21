import { toast } from '../components/ui/Toast';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // Not JSON
    }

    if (!response.ok) {
      const errorMessage = json?.message || 'Algo salió mal';
      if (response.status === 400) {
        const detail = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
        toast({ title: 'Error de Validación', description: detail, type: 'error' });
      } else if (response.status === 401) {
        // We only toast unauthorized for explicitly authenticated endpoints, 
        // to avoid annoying toast messages when checking initial session status (which returns 401).
        // So we let the calling code handle it, or we toast it only if it's not a session check.
        if (!path.includes('get-session')) {
          toast({ title: 'No Autorizado', description: 'Por favor, inicia sesión para continuar.', type: 'error' });
        }
      } else {
        toast({ title: 'Error', description: errorMessage, type: 'error' });
      }
      throw {
        status: response.status,
        message: errorMessage,
        data: json?.data
      };
    }

    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as T;
    }

    return json as T;
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    toast({ title: 'Error de Conexión', description: 'No se pudo conectar con el servidor backend.', type: 'error' });
    throw { status: 500, message: 'Error de red o el backend no está disponible' };
  }
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: any, options?: RequestInit) => apiRequest<T>(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }),
  patch: <T>(path: string, body?: any, options?: RequestInit) => apiRequest<T>(path, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  }),
  delete: <T>(path: string, options?: RequestInit) => apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

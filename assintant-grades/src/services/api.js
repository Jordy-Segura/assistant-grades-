const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Error HTTP ${response.status}`);
  }
  return data;
}

export function apiHealth() {
  return request('/health');
}

export function saveConfigToApi(payload) {
  return request('/configuraciones', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function saveStudentsToApi(idConfiguracion, students) {
  if (!idConfiguracion) return Promise.resolve({ ok: false, message: 'Sin IdConfiguracion' });
  return request(`/configuraciones/${idConfiguracion}/estudiantes`, {
    method: 'POST',
    body: JSON.stringify({ students })
  });
}

export function saveGradesToApi(idConfiguracion, grades) {
  if (!idConfiguracion) return Promise.resolve({ ok: false, message: 'Sin IdConfiguracion' });
  return request(`/configuraciones/${idConfiguracion}/calificaciones`, {
    method: 'POST',
    body: JSON.stringify({ grades })
  });
}

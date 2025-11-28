export interface Usuario {
  us_id: number;
  us_nombre: string;
  us_email: string;
  us_icono?: string;
  us_fecha_nacimiento?: string;
  es_admin?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  us_nombre: string;
  us_email: string;
  us_contrasena: string;
  us_fecha_nacimiento?: string;
  us_icono?: string;
}

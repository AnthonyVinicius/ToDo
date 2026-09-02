export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  name: string;
  exp: number;
}

import { cookies } from 'next/headers';
import { AuthUser } from '../types';
import { verifyToken } from './jwt';

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role as 'superadmin' | 'resident' | 'guard',
      propertyId: payload.propertyId,
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
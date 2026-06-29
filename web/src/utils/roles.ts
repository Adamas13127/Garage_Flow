/*
 * Ce fichier declare des helpers de roles pour le frontend web GarageFlow.
 * Il existe pour distinguer clairement les comptes garage des comptes client dans l'interface web.
 * Il communique avec AuthContext, ProtectedRoute et les types d'authentification.
 */
import type { AuthUser } from '../types/auth';

const garageRoles = ['ROLE_GERANT', 'ROLE_EMPLOYE', 'ROLE_ADMIN'];

/** Cette fonction extrait les roles quelle que soit la forme renvoyee par l'API. */
export function getUserRoles(user?: AuthUser | null): string[] {
  if (!user) {
    return [];
  }

  const roles = [...(user.roles ?? [])];
  if (typeof user.role === 'string') {
    roles.push(user.role);
  }
  if (typeof user.role === 'object' && user.role?.code) {
    roles.push(user.role.code);
  }

  return [...new Set(roles)];
}

/** Cette fonction verifie si l'utilisateur peut entrer dans le dashboard web garage. */
export function hasGarageAccess(user?: AuthUser | null): boolean {
  return getUserRoles(user).some((role) => garageRoles.includes(role));
}

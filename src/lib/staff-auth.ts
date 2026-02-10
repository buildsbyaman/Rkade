export function isUserStaff(role?: string | null) {
  return role === 'LO' || role === 'MODERATOR';
}

export function isUserLO(role?: string | null) {
  return role === 'LO';
}

export function isUserModerator(role?: string | null) {
  return role === 'MODERATOR';
}

export function canAccessStaffRoutes(role?: string | null) {
  return role === 'LO' || role === 'MODERATOR';
}

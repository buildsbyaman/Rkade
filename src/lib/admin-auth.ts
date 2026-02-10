
export const ADMIN_EMAILS = [
  'ashmit.singh.k@gmail.com', // Primary Admin
  'lunayachprateek@gmail.com', // Primary Admin
  'admin@rkade.in',
  'lprabh096@gmail.com',
  'ayushpathak781@gmail.com',
  'amankumarunofficial2810@gmail.com',
  'ayushpathak98812@gmail.com'
  // Add other authorized emails here
];

export function isUserAdmin(email?: string | null, role?: string | null) {
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return true;
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

export function isUserSuperAdmin(email?: string | null, role?: string | null) {
  if (role === 'SUPER_ADMIN') return true;
  return email === 'amankumarunofficial2810@gmail.com' || email === 'lprabh096@gmail.com';
}

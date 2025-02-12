// Configuración de rutas permitidas por rol
export const ROLE_ROUTES = {
  superadmin: [
    '/dashboard',
    '/dashboard/users',
    '/dashboard/companies',
    '/dashboard/finances',
    '/dashboard/buses',
    '/dashboard/routes',
    '/dashboard/tickets',
    '/dashboard/parcels'
  ],
  company_admin: [
    '/dashboard',
    '/dashboard/users',
    '/dashboard/finances',
    '/dashboard/buses',
    '/dashboard/buses/bus-templates',
    '/dashboard/routes',
    '/dashboard/tickets',
    '/dashboard/parcels'
  ],
  branch_admin: [
    '/dashboard',
    '/dashboard/tickets',
    '/dashboard/tickets/sales',
    '/dashboard/parcels',
    '/dashboard/buses',
    '/dashboard/routes'
  ],
  seller: [
    '/dashboard/tickets/sales',
    '/dashboard/tickets',
    '/dashboard/parcels'
  ]
};

// Rutas por defecto por rol
export const DEFAULT_ROUTES = {
  superadmin: '/dashboard',
  company_admin: '/dashboard',
  branch_admin: '/dashboard/tickets/sales',
  seller: '/dashboard/tickets/sales'
}

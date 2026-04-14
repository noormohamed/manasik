-- Seed roles
INSERT INTO roles (name, description, is_system) VALUES
('SUPER_ADMIN', 'System administrator with full access', TRUE),
('COMPANY_ADMIN', 'Company administrator who manages agents and company settings', TRUE),
('AGENT', 'Service provider (hotel owner, taxi firm, etc.)', TRUE),
('CUSTOMER', 'End user who makes bookings', TRUE);

-- Seed permissions
INSERT INTO permissions (name, description, resource, action) VALUES
-- User permissions
('user:read', 'Read user information', 'user', 'read'),
('user:create', 'Create new user', 'user', 'create'),
('user:update', 'Update user information', 'user', 'update'),
('user:delete', 'Delete user', 'user', 'delete'),

-- Company permissions
('company:read', 'Read company information', 'company', 'read'),
('company:create', 'Create new company', 'company', 'create'),
('company:update', 'Update company information', 'company', 'update'),
('company:delete', 'Delete company', 'company', 'delete'),

-- Agent permissions
('agent:read', 'Read agent information', 'agent', 'read'),
('agent:create', 'Create new agent', 'agent', 'create'),
('agent:update', 'Update agent information', 'agent', 'update'),
('agent:delete', 'Delete agent', 'agent', 'delete'),

-- Hotel permissions
('hotel:read', 'Read hotel information', 'hotel', 'read'),
('hotel:create', 'Create new hotel', 'hotel', 'create'),
('hotel:update', 'Update hotel information', 'hotel', 'update'),
('hotel:delete', 'Delete hotel', 'hotel', 'delete'),

-- Booking permissions
('booking:read', 'Read booking information', 'booking', 'read'),
('booking:create', 'Create new booking', 'booking', 'create'),
('booking:update', 'Update booking information', 'booking', 'update'),
('booking:delete', 'Delete booking', 'booking', 'delete'),

-- Review permissions
('review:read', 'Read review information', 'review', 'read'),
('review:create', 'Create new review', 'review', 'create'),
('review:update', 'Update review information', 'review', 'update'),
('review:delete', 'Delete review', 'review', 'delete'),

-- Admin permissions
('admin:read', 'Read admin information', 'admin', 'read'),
('admin:create', 'Create new admin', 'admin', 'create'),
('admin:update', 'Update admin information', 'admin', 'update'),
('admin:delete', 'Delete admin', 'admin', 'delete');

-- Assign permissions to SUPER_ADMIN role (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SUPER_ADMIN';

-- Assign permissions to COMPANY_ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'COMPANY_ADMIN' AND p.name IN (
  'user:read', 'user:create', 'user:update',
  'company:read', 'company:update',
  'agent:read', 'agent:create', 'agent:update',
  'hotel:read', 'hotel:create', 'hotel:update',
  'booking:read',
  'review:read',
  'admin:read', 'admin:update'
);

-- Assign permissions to AGENT role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'AGENT' AND p.name IN (
  'user:read', 'user:update',
  'company:read',
  'agent:read', 'agent:update',
  'hotel:read', 'hotel:create', 'hotel:update',
  'booking:read',
  'review:read'
);

-- Assign permissions to CUSTOMER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'CUSTOMER' AND p.name IN (
  'user:read', 'user:update',
  'hotel:read',
  'booking:read', 'booking:create',
  'review:read', 'review:create'
);

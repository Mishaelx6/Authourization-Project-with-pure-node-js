// In-memory policy store for authorization data

const users = {
    alice: {
        username: 'alice',
        roles: ['admin', 'it'],
        clearance: 5,
        attributes: {
            department: 'IT',
            location: 'main-office'
        }
    },
    bob: {
        username: 'bob',
        roles: ['resident'],
        clearance: 1,
        attributes: {
            department: 'Estate',
            location: 'Estate-A'
        }
    },
    charlie: {
        username: 'charlie',
        roles: ['rider'],
        clearance: 2,
        attributes: {
            department: 'Logistics',
            location: 'warehouse'
        }
    }
};

const roles = {
    admin: {
        permissions: ['file:read', 'file:write', 'file:delete', 'dir:create', 'dir:delete', 'user:manage']
    },
    it: {
        permissions: ['file:read', 'file:write', 'dir:create', 'system:admin']
    },
    resident: {
        permissions: ['file:read', 'file:write']
    },
    rider: {
        permissions: ['file:read']
    }
};

const permissions = {
    'file:read': {
        description: 'Read file contents',
        clearanceRequired: 1
    },
    'file:write': {
        description: 'Write to files',
        clearanceRequired: 2
    },
    'file:delete': {
        description: 'Delete files',
        clearanceRequired: 3
    },
    'dir:create': {
        description: 'Create directories',
        clearanceRequired: 2
    },
    'dir:delete': {
        description: 'Delete directories',
        clearanceRequired: 3
    },
    'user:manage': {
        description: 'Manage user accounts',
        clearanceRequired: 5
    },
    'system:admin': {
        description: 'System administration',
        clearanceRequired: 4
    }
};

module.exports = {
    users,
    roles,
    permissions
};

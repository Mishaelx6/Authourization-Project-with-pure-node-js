// Role-Based Access Control (RBAC) implementation

const { roles, permissions } = require('./policy-store');

class RBAC {
    static hasPermission(user, permission) {
        // Check if user has the required permission through their roles
        for (const roleName of user.roles) {
            const role = roles[roleName];
            if (role && role.permissions.includes(permission)) {
                return true;
            }
        }
        return false;
    }

    static getPermissions(user) {
        // Get all permissions for a user based on their roles
        const userPermissions = new Set();
        
        for (const roleName of user.roles) {
            const role = roles[roleName];
            if (role) {
                role.permissions.forEach(permission => {
                    userPermissions.add(permission);
                });
            }
        }
        
        return Array.from(userPermissions);
    }

    static hasRole(user, roleName) {
        return user.roles.includes(roleName);
    }

    static canAccess(user, resource, action) {
        // Check if user can perform action on resource
        const permission = `${resource}:${action}`;
        return this.hasPermission(user, permission);
    }
}

module.exports = RBAC;

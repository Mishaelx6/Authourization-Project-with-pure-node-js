// Permission management and validation

const RBAC = require('./rbac');
const ABAC = require('./abac');
const { permissions } = require('./policy-store');

class Permission {
    static canAccess(user, resource, action, context = {}) {
        // First check RBAC
        const rbacAllowed = RBAC.canAccess(user, resource, action);
        if (!rbacAllowed) {
            return { allowed: false, reason: 'RBAC: Insufficient role permissions' };
        }
        
        // Then check ABAC
        const abacAllowed = ABAC.canAccess(user, resource, action, context);
        if (!abacAllowed) {
            return { allowed: false, reason: 'ABAC: Attribute-based access denied' };
        }
        
        return { allowed: true, reason: 'Access granted' };
    }
    
    static validatePermission(permission) {
        return permissions.hasOwnProperty(permission);
    }
    
    static getPermissionInfo(permission) {
        return permissions[permission] || null;
    }
    
    static getAllPermissions() {
        return Object.keys(permissions);
    }
    
    static getPermissionsByClearance(clearanceLevel) {
        return Object.entries(permissions)
            .filter(([_, info]) => info.clearanceRequired <= clearanceLevel)
            .map(([name, info]) => ({ name, ...info }));
    }
    
    static auditAccess(user, resource, action, context, result) {
        // Create audit log entry
        const auditEntry = {
            timestamp: new Date().toISOString(),
            user: user.username,
            resource,
            action,
            context,
            result: result.allowed ? 'GRANTED' : 'DENIED',
            reason: result.reason
        };
        
        // In a real system, this would be logged to a file or database
        console.log('AUDIT:', JSON.stringify(auditEntry));
        
        return auditEntry;
    }
}

module.exports = Permission;

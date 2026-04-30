// Attribute-Based Access Control (ABAC) implementation

const { permissions } = require('./policy-store');

class ABAC {
    static canAccess(user, resource, action, context = {}) {
        const permission = `${resource}:${action}`;
        const permissionInfo = permissions[permission];
        
        if (!permissionInfo) {
            return false;
        }
        
        // Check clearance level
        if (user.clearance < permissionInfo.clearanceRequired) {
            return false;
        }
        
        // Check additional attribute-based rules
        return this.evaluateAttributeRules(user, resource, action, context);
    }
    
    static evaluateAttributeRules(user, resource, action, context) {
        // Time-based access control
        if (context.time) {
            const hour = new Date(context.time).getHours();
            
            // IT staff can only access system resources during business hours
            if (user.roles.includes('it') && resource === 'system') {
                if (hour < 9 || hour > 17) {
                    return false;
                }
            }
        }
        
        // Location-based access control
        if (context.requestedLocation && user.attributes.location) {
            // Users can only access resources from their own location
            if (context.requestedLocation !== user.attributes.location) {
                // Admins can access from any location
                if (!user.roles.includes('admin')) {
                    return false;
                }
            }
        }
        
        // Department-based access control
        if (context.department && user.attributes.department) {
            // Estate residents can only access estate-related resources
            if (user.roles.includes('resident') && !context.department.includes('Estate')) {
                return false;
            }
            
            // Logistics staff can only access logistics resources
            if (user.roles.includes('rider') && !context.department.includes('Logistics')) {
                return false;
            }
        }
        
        return true;
    }
    
    static getAccessLevel(user) {
        // Calculate overall access level based on attributes
        let accessLevel = user.clearance;
        
        // Boost access level for certain roles
        if (user.roles.includes('admin')) {
            accessLevel = Math.max(accessLevel, 5);
        }
        
        if (user.roles.includes('it')) {
            accessLevel = Math.max(accessLevel, 4);
        }
        
        return accessLevel;
    }
}

module.exports = ABAC;

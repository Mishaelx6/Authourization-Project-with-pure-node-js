// Session and token management using crypto

const crypto = require('crypto');
const { users } = require('../authorization/policy-store');

class SessionManager {
    constructor() {
        this.sessions = new Map(); // In-memory session storage
        this.tokenExpiry = 3600000; // 1 hour in milliseconds
    }
    
    // Generate a secure token using crypto
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    // Create a new session for a user
    createSession(username, password) {
        const user = users[username.toLowerCase()];
        
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        
        // In a real system, you'd hash and compare passwords
        // For this demo, we'll accept any non-empty password
        if (!password || password.length === 0) {
            return { success: false, error: 'Invalid password' };
        }
        
        const token = this.generateToken();
        const session = {
            user: user,
            token: token,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.tokenExpiry,
            lastAccessed: Date.now()
        };
        
        this.sessions.set(token, session);
        
        return {
            success: true,
            token: token,
            user: {
                username: user.username,
                roles: user.roles,
                clearance: user.clearance
            }
        };
    }
    
    // Validate a token and return the associated session
    validateToken(token) {
        if (!token) {
            return { valid: false, error: 'No token provided' };
        }
        
        const session = this.sessions.get(token);
        
        if (!session) {
            return { valid: false, error: 'Invalid token' };
        }
        
        // Check if token has expired
        if (Date.now() > session.expiresAt) {
            this.sessions.delete(token);
            return { valid: false, error: 'Token expired' };
        }
        
        // Update last accessed time
        session.lastAccessed = Date.now();
        
        return { valid: true, session: session };
    }
    
    // Refresh a token (extend expiry)
    refreshToken(token) {
        const validation = this.validateToken(token);
        
        if (!validation.valid) {
            return validation;
        }
        
        const session = validation.session;
        session.expiresAt = Date.now() + this.tokenExpiry;
        
        return {
            valid: true,
            session: session,
            newExpiry: new Date(session.expiresAt).toISOString()
        };
    }
    
    // Destroy a session (logout)
    destroySession(token) {
        const deleted = this.sessions.delete(token);
        return { success: deleted };
    }
    
    // Get all active sessions (for admin purposes)
    getActiveSessions() {
        const sessions = [];
        
        for (const [token, session] of this.sessions.entries()) {
            sessions.push({
                token: token.substring(0, 8) + '...', // Partial token for security
                username: session.user.username,
                createdAt: new Date(session.createdAt).toISOString(),
                expiresAt: new Date(session.expiresAt).toISOString(),
                lastAccessed: new Date(session.lastAccessed).toISOString()
            });
        }
        
        return sessions;
    }
    
    // Clean up expired sessions
    cleanupExpiredSessions() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [token, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(token);
                cleaned++;
            }
        }
        
        return cleaned;
    }
}

module.exports = SessionManager;

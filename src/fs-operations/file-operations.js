// File operations with authorization checks

const fs = require('fs');
const path = require('path');
const Permission = require('../authorization/permission');

class FileOperations {
    constructor(dataPath) {
        this.dataPath = dataPath;
    }
    
    // Read file content with authorization check
    readFile(filename, user, context = {}) {
        const fullPath = path.join(this.dataPath, filename);
        
        // Check authorization
        const authResult = Permission.canAccess(user, 'file', 'read', context);
        if (!authResult.allowed) {
            Permission.auditAccess(user, 'file', 'read', context, authResult);
            return { success: false, error: authResult.reason };
        }
        
        try {
            // Ensure file exists and is within data path
            if (!fullPath.startsWith(this.dataPath)) {
                return { success: false, error: 'Access denied: Path traversal attempt' };
            }
            
            if (!fs.existsSync(fullPath)) {
                return { success: false, error: 'File not found' };
            }
            
            const content = fs.readFileSync(fullPath, 'utf8');
            const stats = fs.statSync(fullPath);
            
            Permission.auditAccess(user, 'file', 'read', context, authResult);
            
            return {
                success: true,
                content: content,
                metadata: {
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    accessed: stats.atime
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Write file content with authorization check
    writeFile(filename, content, user, context = {}) {
        const fullPath = path.join(this.dataPath, filename);
        
        // Check authorization
        const authResult = Permission.canAccess(user, 'file', 'write', context);
        if (!authResult.allowed) {
            Permission.auditAccess(user, 'file', 'write', context, authResult);
            return { success: false, error: authResult.reason };
        }
        
        try {
            // Ensure path is within data path
            if (!fullPath.startsWith(this.dataPath)) {
                return { success: false, error: 'Access denied: Path traversal attempt' };
            }
            
            // Create directory if it doesn't exist
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, content, 'utf8');
            const stats = fs.statSync(fullPath);
            
            Permission.auditAccess(user, 'file', 'write', context, authResult);
            
            return {
                success: true,
                metadata: {
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Delete file with authorization check
    deleteFile(filename, user, context = {}) {
        const fullPath = path.join(this.dataPath, filename);
        
        // Check authorization
        const authResult = Permission.canAccess(user, 'file', 'delete', context);
        if (!authResult.allowed) {
            Permission.auditAccess(user, 'file', 'delete', context, authResult);
            return { success: false, error: authResult.reason };
        }
        
        try {
            // Ensure path is within data path
            if (!fullPath.startsWith(this.dataPath)) {
                return { success: false, error: 'Access denied: Path traversal attempt' };
            }
            
            if (!fs.existsSync(fullPath)) {
                return { success: false, error: 'File not found' };
            }
            
            fs.unlinkSync(fullPath);
            
            Permission.auditAccess(user, 'file', 'delete', context, authResult);
            
            return { success: true, message: 'File deleted successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Get file information without reading content
    getFileInfo(filename, user, context = {}) {
        const fullPath = path.join(this.dataPath, filename);
        
        // Check authorization (read permission required for file info)
        const authResult = Permission.canAccess(user, 'file', 'read', context);
        if (!authResult.allowed) {
            return { success: false, error: authResult.reason };
        }
        
        try {
            // Ensure path is within data path
            if (!fullPath.startsWith(this.dataPath)) {
                return { success: false, error: 'Access denied: Path traversal attempt' };
            }
            
            if (!fs.existsSync(fullPath)) {
                return { success: false, error: 'File not found' };
            }
            
            const stats = fs.statSync(fullPath);
            
            return {
                success: true,
                info: {
                    name: path.basename(fullPath),
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    accessed: stats.atime,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = FileOperations;

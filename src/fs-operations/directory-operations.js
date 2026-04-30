// Directory operations with authorization checks

const fs = require('fs');
const path = require('path');
const Permission = require('../authorization/permission');

class DirectoryOperations {
    constructor(dataPath) {
        this.dataPath = dataPath;
    }
    
    // Create directory with authorization check
    createDirectory(dirname, user, context = {}) {
        const fullPath = path.join(this.dataPath, dirname);
        
        // Check authorization
        const authResult = Permission.canAccess(user, 'dir', 'create', context);
        if (!authResult.allowed) {
            Permission.auditAccess(user, 'dir', 'create', context, authResult);
            return { success: false, error: authResult.reason };
        }
        
        try {
            // Ensure path is within data path
            if (!fullPath.startsWith(this.dataPath)) {
                return { success: false, error: 'Access denied: Path traversal attempt' };
            }
            
            if (fs.existsSync(fullPath)) {
                return { success: false, error: 'Directory already exists' };
            }
            
            fs.mkdirSync(fullPath, { recursive: true });
            const stats = fs.statSync(fullPath);
            
            Permission.auditAccess(user, 'dir', 'create', context, authResult);
            
            return {
                success: true,
                metadata: {
                    created: stats.birthtime,
                    modified: stats.mtime
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Delete directory with authorization check
    deleteDirectory(dirname, user, context = {}) {
        const fullPath = path.join(this.dataPath, dirname);
        
        // Check authorization
        const authResult = Permission.canAccess(user, 'dir', 'delete', context);
        if (!authResult.allowed) {
            Permission.auditAccess(user, 'dir', 'delete', context, authResult);
            return { success: false, error: authResult.reason };
        }
        
        try {
            // Ensure path is within data path
            if (!fullPath.startsWith(this.dataPath)) {
                return { success: false, error: 'Access denied: Path traversal attempt' };
            }
            
            if (!fs.existsSync(fullPath)) {
                return { success: false, error: 'Directory not found' };
            }
            
            // Check if directory is empty (safety measure)
            const items = fs.readdirSync(fullPath);
            if (items.length > 0) {
                return { success: false, error: 'Directory is not empty' };
            }
            
            fs.rmdirSync(fullPath);
            
            Permission.auditAccess(user, 'dir', 'delete', context, authResult);
            
            return { success: true, message: 'Directory deleted successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // List directory contents with authorization check
    listDirectory(dirname, user, context = {}) {
        const fullPath = path.join(this.dataPath, dirname || '.');
        
        // Check authorization (read permission required for listing)
        const authResult = Permission.canAccess(user, 'file', 'read', context);
        if (!authResult.allowed) {
            Permission.auditAccess(user, 'dir', 'list', context, authResult);
            return { success: false, error: authResult.reason };
        }
        
        try {
            // Ensure path is within data path
            if (!fullPath.startsWith(this.dataPath)) {
                return { success: false, error: 'Access denied: Path traversal attempt' };
            }
            
            if (!fs.existsSync(fullPath)) {
                return { success: false, error: 'Directory not found' };
            }
            
            const items = fs.readdirSync(fullPath);
            const itemDetails = [];
            
            for (const item of items) {
                const itemPath = path.join(fullPath, item);
                const stats = fs.statSync(itemPath);
                
                itemDetails.push({
                    name: item,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    accessed: stats.atime
                });
            }
            
            return {
                success: true,
                path: dirname || '.',
                items: itemDetails.sort((a, b) => {
                    // Directories first, then files, both alphabetically
                    if (a.type !== b.type) {
                        return a.type === 'directory' ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                })
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Get directory information
    getDirectoryInfo(dirname, user, context = {}) {
        const fullPath = path.join(this.dataPath, dirname || '.');
        
        // Check authorization (read permission required for directory info)
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
                return { success: false, error: 'Directory not found' };
            }
            
            const stats = fs.statSync(fullPath);
            const items = fs.readdirSync(fullPath);
            
            return {
                success: true,
                info: {
                    name: path.basename(fullPath),
                    path: dirname || '.',
                    itemCount: items.length,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    accessed: stats.atime,
                    isDirectory: stats.isDirectory()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = DirectoryOperations;

// Main HTTP server for Secure File Management System

const http = require('http');
const url = require('url');
const path = require('path');

// Import custom modules
const SessionManager = require('./auth/session-manager');
const FileOperations = require('./fs-operations/file-operations');
const DirectoryOperations = require('./fs-operations/directory-operations');
const SyncVsAsyncDemo = require('./fs-operations/sync-vs-async-demo');

// Configuration
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data');

// Initialize components
const sessionManager = new SessionManager();
const fileOps = new FileOperations(DATA_PATH);
const dirOps = new DirectoryOperations(DATA_PATH);
const demo = new SyncVsAsyncDemo(DATA_PATH);

// HTTP Server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Parse request body for POST/PUT requests
    let body = '';
    if (method === 'POST' || method === 'PUT') {
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            handleRequest(req, res, method, pathname, parsedUrl.query, body);
        });
    } else {
        handleRequest(req, res, method, pathname, parsedUrl.query, null);
    }
});

function handleRequest(req, res, method, pathname, query, body) {
    try {
        // Route handling
        if (pathname === '/login' && method === 'POST') {
            handleLogin(req, res, body);
        } else if (pathname === '/logout' && method === 'POST') {
            handleLogout(req, res, body);
        } else if (pathname === '/file/read' && method === 'GET') {
            handleFileRead(req, res, query);
        } else if (pathname === '/file/write' && method === 'POST') {
            handleFileWrite(req, res, body);
        } else if (pathname === '/file/delete' && method === 'DELETE') {
            handleFileDelete(req, res, query);
        } else if (pathname === '/dir/create' && method === 'POST') {
            handleDirCreate(req, res, body);
        } else if (pathname === '/dir/delete' && method === 'DELETE') {
            handleDirDelete(req, res, query);
        } else if (pathname === '/dir/list' && method === 'GET') {
            handleDirList(req, res, query);
        } else if (pathname === '/demo/sync' && method === 'GET') {
            handleDemoSync(req, res);
        } else if (pathname === '/demo/async' && method === 'GET') {
            handleDemoAsync(req, res);
        } else if (pathname === '/demo/performance' && method === 'GET') {
            handleDemoPerformance(req, res, query);
        } else if (pathname === '/sessions' && method === 'GET') {
            handleSessions(req, res);
        } else {
            sendResponse(res, 404, { error: 'Endpoint not found' });
        }
    } catch (error) {
        console.error('Server error:', error);
        sendResponse(res, 500, { error: 'Internal server error' });
    }
}

// Authentication middleware
function authenticate(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'No token provided' };
    }
    
    const token = authHeader.substring(7);
    return sessionManager.validateToken(token);
}

// Route handlers
function handleLogin(req, res, body) {
    try {
        const { username, password } = JSON.parse(body);
        const result = sessionManager.createSession(username, password);
        
        if (result.success) {
            sendResponse(res, 200, result);
        } else {
            sendResponse(res, 401, result);
        }
    } catch (error) {
        sendResponse(res, 400, { error: 'Invalid request body' });
    }
}

function handleLogout(req, res, body) {
    try {
        const { token } = JSON.parse(body);
        const result = sessionManager.destroySession(token);
        sendResponse(res, 200, result);
    } catch (error) {
        sendResponse(res, 400, { error: 'Invalid request body' });
    }
}

function handleFileRead(req, res, query) {
    const auth = authenticate(req);
    if (!auth.valid) {
        sendResponse(res, 401, { error: auth.error });
        return;
    }
    
    const { filename } = query;
    if (!filename) {
        sendResponse(res, 400, { error: 'Filename required' });
        return;
    }
    
    const context = {
        time: new Date().toISOString(),
        requestedLocation: req.headers['x-location'] || 'unknown'
    };
    
    const result = fileOps.readFile(filename, auth.session.user, context);
    sendResponse(res, result.success ? 200 : 403, result);
}

function handleFileWrite(req, res, body) {
    const auth = authenticate(req);
    if (!auth.valid) {
        sendResponse(res, 401, { error: auth.error });
        return;
    }
    
    try {
        const { filename, content } = JSON.parse(body);
        if (!filename) {
            sendResponse(res, 400, { error: 'Filename required' });
            return;
        }
        
        const context = {
            time: new Date().toISOString(),
            requestedLocation: req.headers['x-location'] || 'unknown'
        };
        
        const result = fileOps.writeFile(filename, content, auth.session.user, context);
        sendResponse(res, result.success ? 200 : 403, result);
    } catch (error) {
        sendResponse(res, 400, { error: 'Invalid request body' });
    }
}

function handleFileDelete(req, res, query) {
    const auth = authenticate(req);
    if (!auth.valid) {
        sendResponse(res, 401, { error: auth.error });
        return;
    }
    
    const { filename } = query;
    if (!filename) {
        sendResponse(res, 400, { error: 'Filename required' });
        return;
    }
    
    const context = {
        time: new Date().toISOString(),
        requestedLocation: req.headers['x-location'] || 'unknown'
    };
    
    const result = fileOps.deleteFile(filename, auth.session.user, context);
    sendResponse(res, result.success ? 200 : 403, result);
}

function handleDirCreate(req, res, body) {
    const auth = authenticate(req);
    if (!auth.valid) {
        sendResponse(res, 401, { error: auth.error });
        return;
    }
    
    try {
        const { dirname } = JSON.parse(body);
        if (!dirname) {
            sendResponse(res, 400, { error: 'Directory name required' });
            return;
        }
        
        const context = {
            time: new Date().toISOString(),
            requestedLocation: req.headers['x-location'] || 'unknown'
        };
        
        const result = dirOps.createDirectory(dirname, auth.session.user, context);
        sendResponse(res, result.success ? 200 : 403, result);
    } catch (error) {
        sendResponse(res, 400, { error: 'Invalid request body' });
    }
}

function handleDirDelete(req, res, query) {
    const auth = authenticate(req);
    if (!auth.valid) {
        sendResponse(res, 401, { error: auth.error });
        return;
    }
    
    const { dirname } = query;
    if (!dirname) {
        sendResponse(res, 400, { error: 'Directory name required' });
        return;
    }
    
    const context = {
        time: new Date().toISOString(),
        requestedLocation: req.headers['x-location'] || 'unknown'
    };
    
    const result = dirOps.deleteDirectory(dirname, auth.session.user, context);
    sendResponse(res, result.success ? 200 : 403, result);
}

function handleDirList(req, res, query) {
    const auth = authenticate(req);
    if (!auth.valid) {
        sendResponse(res, 401, { error: auth.error });
        return;
    }
    
    const { dirname } = query;
    const context = {
        time: new Date().toISOString(),
        requestedLocation: req.headers['x-location'] || 'unknown'
    };
    
    const result = dirOps.listDirectory(dirname, auth.session.user, context);
    sendResponse(res, result.success ? 200 : 403, result);
}

function handleDemoSync(req, res) {
    const result = demo.syncOperations('demo_sync.txt', 'This is a synchronous demo file');
    sendResponse(res, 200, result);
}

function handleDemoAsync(req, res) {
    demo.promiseOperations('demo_async.txt', 'This is an asynchronous demo file')
        .then(result => {
            sendResponse(res, 200, result);
        })
        .catch(error => {
            sendResponse(res, 500, { success: false, error: error.message });
        });
}

function handleDemoPerformance(req, res, query) {
    const iterations = parseInt(query.iterations) || 10;
    
    demo.performanceComparison('demo_perf.txt', 'Performance test content', iterations)
        .then(result => {
            sendResponse(res, 200, result);
        })
        .catch(error => {
            sendResponse(res, 500, { success: false, error: error.message });
        });
}

function handleSessions(req, res) {
    const sessions = sessionManager.getActiveSessions();
    sendResponse(res, 200, { sessions });
}

// Utility function to send JSON responses
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
}

// Start server
server.listen(PORT, () => {
    console.log(`Secure File Management System running on port ${PORT}`);
    console.log(`Data directory: ${DATA_PATH}`);
    console.log('Available endpoints:');
    console.log('  POST /login - User authentication');
    console.log('  POST /logout - User logout');
    console.log('  GET  /file/read?filename=<name> - Read file');
    console.log('  POST /file/write - Write file');
    console.log('  DELETE /file/delete?filename=<name> - Delete file');
    console.log('  POST /dir/create - Create directory');
    console.log('  DELETE /dir/delete?dirname=<name> - Delete directory');
    console.log('  GET  /dir/list?dirname=<name> - List directory contents');
    console.log('  GET  /demo/sync - Synchronous demo');
    console.log('  GET  /demo/async - Asynchronous demo');
    console.log('  GET  /demo/performance?iterations=<n> - Performance comparison');
    console.log('  GET  /sessions - List active sessions');
});

// Cleanup expired sessions every 5 minutes
setInterval(() => {
    const cleaned = sessionManager.cleanupExpiredSessions();
    if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} expired sessions`);
    }
}, 300000);

module.exports = server;

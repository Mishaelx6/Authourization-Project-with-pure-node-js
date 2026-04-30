// Demonstration of synchronous vs asynchronous file operations

const fs = require('fs');
const path = require('path');

class SyncVsAsyncDemo {
    constructor(dataPath) {
        this.dataPath = dataPath;
    }
    
    // Synchronous file operations
    syncOperations(filename, content) {
        console.log('=== SYNCHRONOUS OPERATIONS ===');
        const startTime = Date.now();
        
        try {
            // Write file synchronously
            console.log('Writing file synchronously...');
            const fullPath = path.join(this.dataPath, filename);
            fs.writeFileSync(fullPath, content, 'utf8');
            
            // Read file synchronously
            console.log('Reading file synchronously...');
            const readContent = fs.readFileSync(fullPath, 'utf8');
            
            // Get file stats synchronously
            console.log('Getting file stats synchronously...');
            const stats = fs.statSync(fullPath);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            return {
                success: true,
                content: readContent,
                stats: stats,
                duration: duration,
                blocking: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                blocking: true
            };
        }
    }
    
    // Asynchronous file operations with callbacks
    asyncOperations(filename, content, callback) {
        console.log('=== ASYNCHRONOUS OPERATIONS (Callbacks) ===');
        const startTime = Date.now();
        
        // Write file asynchronously
        console.log('Writing file asynchronously...');
        const fullPath = path.join(this.dataPath, filename);
        
        fs.writeFile(fullPath, content, 'utf8', (writeErr) => {
            if (writeErr) {
                callback({
                    success: false,
                    error: writeErr.message,
                    blocking: false
                });
                return;
            }
            
            // Read file asynchronously
            console.log('Reading file asynchronously...');
            fs.readFile(fullPath, 'utf8', (readErr, readContent) => {
                if (readErr) {
                    callback({
                        success: false,
                        error: readErr.message,
                        blocking: false
                    });
                    return;
                }
                
                // Get file stats asynchronously
                console.log('Getting file stats asynchronously...');
                fs.stat(fullPath, (statErr, stats) => {
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    
                    if (statErr) {
                        callback({
                            success: false,
                            error: statErr.message,
                            blocking: false
                        });
                        return;
                    }
                    
                    callback({
                        success: true,
                        content: readContent,
                        stats: stats,
                        duration: duration,
                        blocking: false
                    });
                });
            });
        });
    }
    
    // Asynchronous file operations with promises
    async promiseOperations(filename, content) {
        console.log('=== ASYNCHRONOUS OPERATIONS (Promises) ===');
        const startTime = Date.now();
        
        try {
            // Write file with promise
            console.log('Writing file with promise...');
            const fullPath = path.join(this.dataPath, filename);
            await this.writeFilePromise(fullPath, content);
            
            // Read file with promise
            console.log('Reading file with promise...');
            const readContent = await this.readFilePromise(fullPath);
            
            // Get file stats with promise
            console.log('Getting file stats with promise...');
            const stats = await this.statPromise(fullPath);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            return {
                success: true,
                content: readContent,
                stats: stats,
                duration: duration,
                blocking: false
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                blocking: false
            };
        }
    }
    
    // Promise wrappers for fs operations
    writeFilePromise(filePath, content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, 'utf8', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    
    readFilePromise(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }
    
    statPromise(filePath) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) reject(err);
                else resolve(stats);
            });
        });
    }
    
    // Performance comparison
    async performanceComparison(filename, content, iterations = 100) {
        console.log(`=== PERFORMANCE COMPARISON (${iterations} iterations) ===`);
        
        // Synchronous performance
        const syncStart = Date.now();
        for (let i = 0; i < iterations; i++) {
            const syncFile = `${filename}_sync_${i}`;
            try {
                fs.writeFileSync(path.join(this.dataPath, syncFile), content);
                fs.readFileSync(path.join(this.dataPath, syncFile));
                fs.unlinkSync(path.join(this.dataPath, syncFile));
            } catch (error) {
                console.error('Sync error:', error.message);
            }
        }
        const syncDuration = Date.now() - syncStart;
        
        // Asynchronous performance
        const asyncStart = Date.now();
        const asyncPromises = [];
        
        for (let i = 0; i < iterations; i++) {
            const asyncFile = `${filename}_async_${i}`;
            const promise = this.performAsyncOperations(asyncFile, content);
            asyncPromises.push(promise);
        }
        
        await Promise.all(asyncPromises);
        const asyncDuration = Date.now() - asyncStart;
        
        return {
            sync: {
                duration: syncDuration,
                avgPerOperation: syncDuration / iterations
            },
            async: {
                duration: asyncDuration,
                avgPerOperation: asyncDuration / iterations
            },
            improvement: ((syncDuration - asyncDuration) / syncDuration * 100).toFixed(2) + '%'
        };
    }
    
    async performAsyncOperations(filename, content) {
        const filePath = path.join(this.dataPath, filename);
        
        try {
            await this.writeFilePromise(filePath, content);
            await this.readFilePromise(filePath);
            await this.unlinkPromise(filePath);
        } catch (error) {
            console.error('Async error:', error.message);
        }
    }
    
    unlinkPromise(filePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    
    // Demonstrate event loop blocking
    demonstrateBlocking() {
        console.log('=== EVENT LOOP BLOCKING DEMONSTRATION ===');
        
        // Start a timer to show event loop is blocked
        const interval = setInterval(() => {
            console.log('Timer tick (event loop running)');
        }, 100);
        
        // Perform synchronous operation that blocks
        console.log('Starting synchronous operation (blocking event loop)...');
        const result = this.syncOperations('blocking_test.txt', 'This will block the event loop');
        console.log('Synchronous operation completed');
        
        // Clear interval
        clearInterval(interval);
        
        return result;
    }
}

module.exports = SyncVsAsyncDemo;

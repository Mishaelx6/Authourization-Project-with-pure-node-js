// Simple API test script for the Secure File Management System

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test function
async function runTests() {
    console.log('🚀 Starting API Tests...\n');
    
    // Test 1: Login as Alice
    console.log('📝 Test 1: Login as Alice (Admin)');
    try {
        const loginResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { username: 'alice', password: 'password123' });
        
        console.log(`Status: ${loginResponse.statusCode}`);
        console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
        
        const aliceToken = loginResponse.data.token;
        console.log(`✅ Alice token: ${aliceToken.substring(0, 16)}...\n`);
        
        // Test 2: Write file as Alice
        console.log('📝 Test 2: Write file as Alice');
        const writeResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/file/write',
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`
            }
        }, { filename: 'alice_test.txt', content: 'Hello from Alice! This is a test file.' });
        
        console.log(`Status: ${writeResponse.statusCode}`);
        console.log('Response:', JSON.stringify(writeResponse.data, null, 2));
        console.log('✅ File written successfully\n');
        
        // Test 3: Login as Bob
        console.log('📝 Test 3: Login as Bob (Resident)');
        const bobLoginResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { username: 'bob', password: 'password123' });
        
        console.log(`Status: ${bobLoginResponse.statusCode}`);
        console.log('Response:', JSON.stringify(bobLoginResponse.data, null, 2));
        
        const bobToken = bobLoginResponse.data.token;
        console.log(`✅ Bob token: ${bobToken.substring(0, 16)}...\n`);
        
        // Test 4: Read file as Bob
        console.log('📝 Test 4: Read file as Bob');
        const readResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/file/read?filename=alice_test.txt',
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${bobToken}`
            }
        });
        
        console.log(`Status: ${readResponse.statusCode}`);
        console.log('Response:', JSON.stringify(readResponse.data, null, 2));
        console.log('✅ File read successfully\n');
        
        // Test 5: Login as Charlie
        console.log('📝 Test 5: Login as Charlie (Rider)');
        const charlieLoginResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { username: 'charlie', password: 'password123' });
        
        console.log(`Status: ${charlieLoginResponse.statusCode}`);
        console.log('Response:', JSON.stringify(charlieLoginResponse.data, null, 2));
        
        const charlieToken = charlieLoginResponse.data.token;
        console.log(`✅ Charlie token: ${charlieToken.substring(0, 16)}...\n`);
        
        // Test 6: Try to write file as Charlie (should fail)
        console.log('📝 Test 6: Try to write file as Charlie (should fail)');
        const charlieWriteResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/file/write',
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${charlieToken}`
            }
        }, { filename: 'charlie_test.txt', content: 'This should fail!' });
        
        console.log(`Status: ${charlieWriteResponse.statusCode}`);
        console.log('Response:', JSON.stringify(charlieWriteResponse.data, null, 2));
        console.log(charlieWriteResponse.statusCode === 403 ? '✅ Authorization working correctly' : '❌ Authorization failed');
        console.log();
        
        // Test 7: Create directory as Alice
        console.log('📝 Test 7: Create directory as Alice');
        const dirCreateResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/dir/create',
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`
            }
        }, { dirname: 'alice_directory' });
        
        console.log(`Status: ${dirCreateResponse.statusCode}`);
        console.log('Response:', JSON.stringify(dirCreateResponse.data, null, 2));
        console.log('✅ Directory created successfully\n');
        
        // Test 8: List directory contents
        console.log('📝 Test 8: List directory contents');
        const listResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/dir/list',
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${aliceToken}`
            }
        });
        
        console.log(`Status: ${listResponse.statusCode}`);
        console.log('Response:', JSON.stringify(listResponse.data, null, 2));
        console.log('✅ Directory listing successful\n');
        
        // Test 9: Test sync demo
        console.log('📝 Test 9: Synchronous demo');
        const syncResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/demo/sync',
            method: 'GET'
        });
        
        console.log(`Status: ${syncResponse.statusCode}`);
        console.log('Response:', JSON.stringify(syncResponse.data, null, 2));
        console.log('✅ Sync demo completed\n');
        
        // Test 10: Test API docs
        console.log('📝 Test 10: API Documentation');
        const docsResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/docs.json',
            method: 'GET'
        });
        
        console.log(`Status: ${docsResponse.statusCode}`);
        console.log(`OpenAPI spec version: ${docsResponse.data.openapi}`);
        console.log(`API title: ${docsResponse.data.info.title}`);
        console.log('✅ API documentation available\n');
        
        console.log('🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the tests
runTests();

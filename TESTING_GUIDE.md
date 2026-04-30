# Testing Guide for Secure File Management System

## Quick Start Testing

### 1. Start the Server
```bash
cd src
node server.js
```

Server should start on port 3001 with all endpoints listed.

### 2. Test Authentication

#### Login as Alice (Admin)
```bash
curl -X POST http://localhost:3001/login `
  -H "Content-Type: application/json" `
  -d '{"username":"alice","password":"password123"}'
```

#### Login as Bob (Resident)
```bash
curl -X POST http://localhost:3001/login `
  -H "Content-Type: application/json" `
  -d '{"username":"bob","password":"password123"}'
```

#### Login as Charlie (Rider)
```bash
curl -X POST http://localhost:3001/login `
  -H "Content-Type: application/json" `
  -d '{"username":"charlie","password":"password123"}'
```

### 3. Test File Operations

#### Write a file as Alice
```bash
# First get Alice's token from login response
curl -X POST http://localhost:3001/file/write `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer ALICE_TOKEN" `
  -d '{"filename":"test.txt","content":"Hello from Alice!"}'
```

#### Read the file as Bob
```bash
curl -X GET "http://localhost:3001/file/read?filename=test.txt" `
  -H "Authorization: Bearer BOB_TOKEN"
```

#### Try to write as Charlie (should fail)
```bash
curl -X POST http://localhost:3001/file/write `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer CHARLIE_TOKEN" `
  -d '{"filename":"rider_test.txt","content":"This should fail"}'
```

### 4. Test Directory Operations

#### Create directory as Alice
```bash
curl -X POST http://localhost:3001/dir/create `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer ALICE_TOKEN" `
  -d '{"dirname":"admin_folder"}'
```

#### List directory contents
```bash
curl -X GET "http://localhost:3001/dir/list" `
  -H "Authorization: Bearer ALICE_TOKEN"
```

### 5. Test Demonstrations

#### Synchronous demo
```bash
curl -X GET http://localhost:3001/demo/sync
```

#### Asynchronous demo
```bash
curl -X GET http://localhost:3001/demo/async
```

#### Performance comparison
```bash
curl -X GET "http://localhost:3001/demo/performance?iterations=10"
```

### 6. Test Documentation

#### View API documentation
```bash
curl -X GET http://localhost:3001/docs
```

#### Get OpenAPI specification
```bash
curl -X GET http://localhost:3001/docs.json
```

### 7. Test Administration

#### List active sessions (admin only)
```bash
curl -X GET http://localhost:3001/sessions `
  -H "Authorization: Bearer ALICE_TOKEN"
```

## Expected Results

### Authentication
- ✅ All users should successfully login and receive tokens
- ✅ Tokens should be 64-character hex strings
- ✅ User info should include username, roles, and clearance

### File Operations
- ✅ Alice (Admin): Can read, write, delete files
- ✅ Bob (Resident): Can read and write files
- ❌ Charlie (Rider): Can only read files (write should fail with 403)

### Directory Operations
- ✅ Alice (Admin): Can create and delete directories
- ❌ Bob (Resident): Cannot create directories (should fail with 403)
- ❌ Charlie (Rider): Cannot create directories (should fail with 403)

### Security Tests
- ❌ No token: Should return 401 Unauthorized
- ❌ Invalid token: Should return 401 Unauthorized
- ❌ Path traversal: Should return 403 Forbidden

## PowerShell Testing Commands

If using PowerShell on Windows, use these commands instead:

```powershell
# Login as Alice
Invoke-RestMethod -Uri "http://localhost:3001/login" -Method POST -ContentType "application/json" -Body '{"username":"alice","password":"password123"}'

# Write file
Invoke-RestMethod -Uri "http://localhost:3001/file/write" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer ALICE_TOKEN"} -Body '{"filename":"test.txt","content":"Hello from Alice!"}'

# Read file
Invoke-RestMethod -Uri "http://localhost:3001/file/read?filename=test.txt" -Method GET -Headers @{"Authorization"="Bearer BOB_TOKEN"}
```

## Browser Testing

You can also test these endpoints in your browser:

1. Open http://localhost:3001/docs - View API documentation
2. Open http://localhost:3001/demo/sync - Run sync demo
3. Open http://localhost:3001/demo/async - Run async demo
4. Open http://localhost:3001/demo/performance - Run performance test

For endpoints requiring authentication, use curl or a REST client like Postman.

## Troubleshooting

### Server won't start
- Check if port 3001 is in use
- Make sure all required files exist
- Check for syntax errors in the code

### Authentication fails
- Verify username spelling (alice, bob, charlie)
- Make sure password is not empty
- Check if server is running

### File operations fail
- Ensure you have a valid token
- Check user permissions in policy-store.js
- Verify data directory exists

### 403 Forbidden errors
- This is expected for users without sufficient permissions
- Check the user's role and clearance level
- Review the authorization logic in permission.js

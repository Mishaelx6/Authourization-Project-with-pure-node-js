# Secure File Management System

A Node.js backend implementation demonstrating secure file operations with Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) using only built-in Node.js modules.

## Project Structure

```
authorization-fs-project/
├── research/
│   ├── authorization-research.md
│   └── node-fs-research.md
├── src/
│   ├── server.js                    # Main HTTP server (port 3000)
│   ├── auth/
│   │   └── session-manager.js       # Token-based authentication
│   ├── authorization/
│   │   ├── rbac.js                  # Role-Based Access Control
│   │   ├── abac.js                  # Attribute-Based Access Control
│   │   ├── permission.js            # Permission validation
│   │   └── policy-store.js          # User/role/permission data
│   ├── fs-operations/
│   │   ├── file-operations.js       # Secure file operations
│   │   ├── directory-operations.js  # Secure directory operations
│   │   └── sync-vs-async-demo.js    # Performance demonstrations
│   └── data/                        # Virtual file system
├── test-scenarios/
│   └── test-cases.json              # Comprehensive test cases
└── README.md
```

## Features

### Authentication & Authorization
- **Token-based authentication** using crypto module
- **RBAC**: Role-based permissions (Admin, IT, Resident, Rider)
- **ABAC**: Attribute-based access control (time, location, department)
- **Session management** with automatic expiry
- **Audit logging** for all access attempts

### File System Operations
- **Secure file operations**: read, write, delete with authorization checks
- **Directory operations**: create, delete, list with permission validation
- **Path traversal protection** against malicious requests
- **Sync vs async demonstrations** with performance comparisons

### Users & Permissions

#### Users
- **Alice**: Admin, IT, Clearance 5
- **Bob**: Resident, Estate-A, Clearance 1  
- **Charlie**: Rider, Logistics, Clearance 2

#### Permissions
- `file:read` - Read file contents (Clearance 1)
- `file:write` - Write to files (Clearance 2)
- `file:delete` - Delete files (Clearance 3)
- `dir:create` - Create directories (Clearance 2)
- `dir:delete` - Delete directories (Clearance 3)
- `user:manage` - Manage user accounts (Clearance 5)
- `system:admin` - System administration (Clearance 4)

## API Endpoints

### Authentication
- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /sessions` - List active sessions (admin)

### File Operations
- `GET /file/read?filename=<name>` - Read file
- `POST /file/write` - Write file
- `DELETE /file/delete?filename=<name>` - Delete file

### Directory Operations
- `POST /dir/create` - Create directory
- `DELETE /dir/delete?dirname=<name>` - Delete directory
- `GET /dir/list?dirname=<name>` - List directory contents

### Demonstrations
- `GET /demo/sync` - Synchronous operations demo
- `GET /demo/async` - Asynchronous operations demo
- `GET /demo/performance?iterations=<n>` - Performance comparison

## Usage

### Start the Server
```bash
cd src
node server.js
```

### Example API Usage

#### Login as Alice
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

#### Read a File
```bash
curl -X GET "http://localhost:3000/file/read?filename=test.txt" \
  -H "Authorization: Bearer <token>"
```

#### Write a File
```bash
curl -X POST http://localhost:3000/file/write \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"filename": "example.txt", "content": "Hello World"}'
```

## Security Features

### RBAC Implementation
- Users inherit permissions from assigned roles
- Hierarchical permission structure
- Role-based access validation

### ABAC Implementation
- **Time-based access**: IT staff restricted during non-business hours
- **Location-based access**: Users limited to their assigned locations
- **Department-based access**: Resource access by department affiliation
- **Clearance levels**: Minimum clearance required for sensitive operations

### Security Controls
- Path traversal attack prevention
- Token-based authentication with crypto
- Session expiry management
- Comprehensive audit logging
- Input validation and sanitization

## Testing

Run the test scenarios using the provided test cases:

```bash
# Use the test-cases.json file with your preferred HTTP client
# Each test case includes expected responses and status codes
```

## Technical Constraints

✅ **No External Libraries**: Uses only built-in Node.js modules
- `http` - Web server
- `fs` - File system operations  
- `path` - Path manipulation
- `crypto` - Secure token generation
- `url` - URL parsing

✅ **In-Memory Storage**: User data stored in policy-store.js
✅ **Port 3000**: Default server configuration
✅ **Native HTTP**: No Express or external frameworks

## Performance Considerations

### Synchronous vs Asynchronous
- **Sync operations** block the event loop (simpler but slower)
- **Async operations** use callbacks/promises (non-blocking, faster)
- Performance comparison available at `/demo/performance`

### Memory Usage
- In-memory session storage
- Token-based authentication reduces database overhead
- Efficient permission caching strategies

## Development

### Adding New Users
Edit `src/authorization/policy-store.js`:

```javascript
const users = {
  newuser: {
    username: 'newuser',
    roles: ['resident'],
    clearance: 1,
    attributes: {
      department: 'NewDept',
      location: 'NewLocation'
    }
  }
};
```

### Adding New Permissions
Define in `permissions` object and assign to roles:

```javascript
const permissions = {
  'new:permission': {
    description: 'New permission description',
    clearanceRequired: 2
  }
};
```

## License

This project is for educational purposes to demonstrate secure file system operations with Node.js.

# Node.js File System Research

## File Operations
- `fs.readFile()` - Asynchronous file reading
- `fs.readFileSync()` - Synchronous file reading
- `fs.writeFile()` - Asynchronous file writing
- `fs.writeFileSync()` - Synchronous file writing

## Directory Operations
- `fs.mkdir()` - Create directory
- `fs.readdir()` - Read directory contents
- `fs.rmdir()` - Remove directory

## Path Operations
- `path.join()` - Join path segments
- `path.resolve()` - Resolve absolute path
- `path.basename()` - Get filename
- `path.dirname()` - Get directory name

## Sync vs Async Considerations
- Sync operations block event loop
- Async operations use callbacks or promises
- Performance implications for file operations

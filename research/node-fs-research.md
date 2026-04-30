Node.js FS Module Documentation
General Rule: Sync vs. Async
Async (Preferred): Use for server-side code (APIs, Web Apps) to avoid blocking the Event Loop.
Sync: Use only for CLI tools or during the initial startup of a server (e.g., loading config files before the server goes live).

1. Read File
Signatures: fs.readFile(path, options, callback) | fs.readFileSync(path, options)
Code Example:
JavaScript
// Async
fs.readFile('./gatekeeper.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

Common Pitfall: Forgetting to specify 'utf8' encoding, which results in receiving a Buffer (raw binary) instead of a string.
2. Write File
Signatures: fs.writeFile(file, data, callback) | fs.writeFileSync(file, data)
Code Example:
JavaScript
// Async
fs.writeFile('./logs.txt', 'New User Registered', (err) => {
  if (err) console.error("Write failed");
});

Common Pitfall: writeFile overwrites the existing file entirely. Be careful not to lose data.
3. Append File
Signatures: fs.appendFile(path, data, callback) | fs.appendFileSync(path, data)
Code Example:
JavaScript
fs.appendFile('./audit.log', '\nNew login attempt', (err) => { /* handle err */ });

When to use: Perfect for logging user activities in your security engine without destroying previous logs.
4. Delete File (Unlink)
Signatures: fs.unlink(path, callback) | fs.unlinkSync(path)
Code Example:
JavaScript
fs.unlink('./temp_secret.txt', (err) => {
  if (err) console.log("File already deleted or not found");
});

Common Pitfall: Attempting to unlink a directory (use rmdir instead).
5. Check File Stats
Signatures: fs.stat(path, callback) | fs.statSync(path)
Code Example:
JavaScript
fs.stat('./database.json', (err, stats) => {
  console.log("Is File:", stats.isFile());
  console.log("Size:", stats.size);
});

Use Case: Essential for verifying file permissions or checking if a file exists before trying to read it.
6. Create Directory
Signatures: fs.mkdir(path, options, callback) | fs.mkdirSync(path, options)
Code Example:
JavaScript
// Recursive creates parents if they don't exist
fs.mkdir('./data/users/logs', { recursive: true }, (err) => { /* ... */ });

Common Pitfall: Trying to create a nested folder without the { recursive: true } flag; it will throw an error if the parent folder doesn't exist.
7. Read Directory
Signatures: fs.readdir(path, callback) | fs.readdirSync(path)
Code Example:
JavaScript
fs.readdir('./uploads', (err, files) => {
  // files is an array of filenames
  console.log(files); 
});


Error Handling Approach
Async (Callback): Always check the first argument (err).
JavaScript
if (err) { 
   // Log to your audit file or return 500 error 
}




Sync: Must be wrapped in try...catch blocks to prevent the entire server from crashing.
JavaScript
try {
  const data = fs.readFileSync('config.json');
} catch (err) {
  console.error("Critical Failure: Config missing");
}




Common FS Pitfalls
Race Conditions: Multiple async writeFile calls to the same file can finish in the wrong order or corrupt the data. Use Streams or Promises for complex operations.
Relative Paths: path.join(__dirname, 'file.txt') is always safer than using ./file.txt, as the latter depends on where you launched the terminal from.


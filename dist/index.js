"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
let users = [];
let files = [];
// Register User
app.post('/register', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    // Check if the username is already taken
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ error: 'Username is already taken' });
    }
    // Save the user
    const newUser = { username };
    users.push(newUser);
    res.json({ message: 'User registered successfully' });
});
app.post('/files', (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }
    const createdBy = req.headers['username'];
    const fileId = Math.random().toString(36).substring(7); // Generate a random file ID
    const newFile = {
        id: fileId,
        content,
        createdBy,
        sharedWith: [createdBy] // Initially shared with the creator
    };
    files.push(newFile);
    res.json({ message: 'File created successfully', id: fileId });
});
// Share File
// app.post('/files/:fileId/share', (req: Request, res: Response) => {
//     const { fileId } = req.params;
//     const { username } = req.body;
//     if (!username) {
//         return res.status(400).json({ error: 'Username is required' });
//     }
//     const file = files.find(f => f.id === fileId);
//     if (!file) {
//         return res.status(404).json({ error: 'File not found' });
//     }
//     const currentUser = req.headers['username'] as string;
//     if (file.createdBy !== currentUser) {
//         return res.status(403).json({ error: 'You do not have permission to share this file' });
//     }
//     const recipient = users.find(u => u.username === username);
//     if (!recipient) {
//         return res.status(404).json({ error: 'Recipient not found' });
//     }
//     if (!file.sharedWith.includes(username)) {
//         file.sharedWith.push(username);
//     }
//     res.json({ message: 'User added successfully' });
// });
app.post('/files/:fileId/share', (req, res) => {
    const { fileId } = req.params;
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    const file = files.find(f => f.id === fileId);
    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }
    const currentUser = req.headers['username'];
    if (file.createdBy !== currentUser) {
        return res.status(403).json({ error: 'You do not have permission to share this file' });
    }
    const recipient = users.find(u => u.username === username);
    if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
    }
    if (!file.sharedWith.includes(username)) {
        file.sharedWith.push(username);
    }
    res.json({ message: 'User added successfully' });
});
// Get Files
app.get('/files', (req, res) => {
    const currentUser = req.headers['username'];
    if (!currentUser) {
        return res.status(400).json({ error: 'Username is required in headers' });
    }
    // Filter files that have been shared with the current user
    const sharedFiles = files.filter(file => file.sharedWith.includes(currentUser));
    // Map and return the filtered files
    const decryptedFiles = sharedFiles.map(file => ({
        id: file.id,
        content: file.content,
        createdBy: file.createdBy,
        sharedWith: file.sharedWith
    }));
    res.json(decryptedFiles);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

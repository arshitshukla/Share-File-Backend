import express, { Request, Response } from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Encrypt content using recipient's public key
function encryptContent(content: string, publicKey: string): string {
    const buffer = Buffer.from(content, 'utf-8');
    const encryptedData = crypto.publicEncrypt(publicKey, buffer);
    return encryptedData.toString('base64');
}

// Decrypt content using user's private key
function decryptContent(encryptedContent: string, privateKey: string): string {
    const buffer = Buffer.from(encryptedContent, 'base64');
    const decryptedData = crypto.privateDecrypt(privateKey, buffer);
    return decryptedData.toString('utf-8');
}

type User = {
    publicKey: string;
    privateKey: string;
    username: string;
}
 
type File = {
    id: string;
    content: string;
    createdBy: string;
    sharedTo: string[];
}

let users: User[] = [];
let files: File[] = [];


// Register User
app.post('/register_user', (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ error: 'Username is already taken' });
    }

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const newUser: User = { username, publicKey: publicKey.toString(), privateKey: privateKey.toString() };
    users.push(newUser);

    res.json({ message: 'User registered successfully' });
});

// Get Files
app.get('/files', (req: Request, res: Response) => {
    const currentUser = req.headers['username'] as string;
    if (!currentUser) {
        return res.status(400).json({ error: 'Username is required in headers' });
    }

    const sharedFiles = files.filter(file => file.sharedTo.includes(currentUser));

    const decryptedFiles = sharedFiles.map(file => {
        const user = users.find(u => u.username === currentUser);
        if (!user) {
            return {
                id: file.id,
                content: 'Error: User not found',
                createdBy: file.createdBy,
            };
        }

        const sender = users.find(u => u.username === file.createdBy);
        if (!sender) {
            return {
                id: file.id,
                content: 'Error: Sender not found',
                createdBy: file.createdBy,
            };
        }

        const decryptedContent = decryptContent(file.content, sender.privateKey);

        return {
            id: file.id,
            content: decryptedContent,
            createdBy: file.createdBy,
        };
    });

    res.json(decryptedFiles);
});

// Create File (Encrypt Content)
app.post('/create_file', (req: Request, res: Response) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const createdBy = req.headers['username'] as string;
    const fileId = Math.random().toString(36).substring(7);

    const user = users.find(u => u.username === createdBy);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const encryptedContent = encryptContent(content, user.publicKey);

    const newFile: File = {
        id: fileId,
        content: encryptedContent,
        createdBy,
        sharedTo: [createdBy]
    };

    files.push(newFile);

    res.json({ message: 'File created successfully', id: fileId });
});

// Share File
app.post('/create_file/:fileId/share', (req: Request, res: Response) => {
    const { fileId } = req.params;
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const file = files.find(f => f.id === fileId);
    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }

    const currentUser = req.headers['username'] as string;
    if (file.createdBy !== currentUser) {
        return res.status(403).json({ error: 'You do not have permission to share this file' });
    }

    const recipient = users.find(u => u.username === username);
    if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
    }

    if (!file.sharedTo.includes(username)) {
        file.sharedTo.push(username);
    }

    res.json({ message: 'User added successfully' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

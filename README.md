# File Sharing Backend Using Node.js and TypeScript
This is a simple file sharing application built with Node.js and TypeScript, allowing users to securely share encrypted text files.
# Features
1. User registration with unique usernames
2. Creation of encrypted text files
3. Sharing files with other users securely
4. Encryption and decryption of files using RSA key pairs
5. Role-based access control

# Installation
Clone the repository:
git clone https://github.com/arshitshukla/Share-File-Backend.git

Install dependencies:
npm install

Start the server:
npm start

Access the application at http://localhost:3000

Usage

1. Register a user by sending a POST request to /register_user with a unique username in the request body.
2. Create a new encrypted file by sending a POST request to /create_file with the content in the request body. The file will be encrypted using the user's public key.
3. Share a file with another user by sending a POST request to /create_file/:fileId/share with the recipient's username in the request body.
4. Retrieve shared files by sending a GET request to /files. Files will be decrypted using the creator's private key.

Technologies Used

1. Node.js
2. Express.js
3. TypeScript
4. Crypto

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

let currentList = [];
let currentIndex = 0;
let currentFile = '';

// Function to read the list from the selected file
const readListFromFile = (filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${filePath}:`, err);
            return;
        }
        currentList = data.split('\n').filter(line => line.trim() !== '');
        // Notify all connected clients about the updated list
        io.emit('updateList', currentList);
        // Check and update current.txt if necessary
        updateCurrentTxtIfNeeded();
    });
};

// Function to save the current index and file to config.json
const saveConfigToFile = () => {
    const config = { currentIndex, currentFile };
    fs.writeFile('config.json', JSON.stringify(config, null, 2), (err) => {
        if (err) {
            console.error('Error writing to config.json:', err);
        }
    });
};

// Function to update current.txt if the current item has changed
const updateCurrentTxtIfNeeded = () => {
    if (currentList[currentIndex]) {
        fs.readFile('current.txt', 'utf8', (err, data) => {
            if (err || data.trim() !== currentList[currentIndex]) {
                fs.writeFile('current.txt', currentList[currentIndex], (err) => {
                    if (err) {
                        console.error('Error writing to current.txt:', err);
                    }
                });
            }
        });
    }
};

// Function to list available files in the data directory
const listFiles = () => {
    return fs.readdirSync(DATA_DIR).filter(file => path.extname(file) === '.txt');
};

// Initial read of the config file
if (fs.existsSync('config.json')) {
    fs.readFile('config.json', 'utf8', (err, data) => {
        if (!err) {
            const config = JSON.parse(data);
            if (config) {
                currentIndex = config.currentIndex || 0;
                currentFile = config.currentFile || listFiles()[0];
                readListFromFile(path.join(DATA_DIR, currentFile));
            }
        }
    });
} else {
    currentFile = listFiles()[0]; // Default to the first file if no config
    readListFromFile(path.join(DATA_DIR, currentFile));
}

// Watch for changes in the current file
let watcher;
const watchCurrentFile = () => {
    if (watcher) {
        watcher.close();
    }
    watcher = chokidar.watch(path.join(DATA_DIR, currentFile), { persistent: true });
    watcher.on('change', () => {
        console.log(`${currentFile} has been updated`);
        readListFromFile(path.join(DATA_DIR, currentFile));
        // Notify clients that the list has changed
        io.emit('listChanged');
    });
};

watchCurrentFile();

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Send the current list, index, and available files to the client
    socket.emit('initialData', { list: currentList, index: currentIndex, files: listFiles(), currentFile });

    // Handle list selection
    socket.on('selectList', (index) => {
        currentIndex = index;
        saveConfigToFile();
        updateCurrentTxtIfNeeded();
        io.emit('updateCurrent', currentIndex);
    });

    // Handle file selection
    socket.on('selectFile', (fileName) => {
        currentFile = fileName;
        currentIndex = 0; // Reset the index when a new file is selected
        saveConfigToFile();
        readListFromFile(path.join(DATA_DIR, currentFile));
        watchCurrentFile(); // Update the watcher to the new file
        io.emit('fileChanged', { list: currentList, currentFile });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

let currentList = [];
let currentIndex = 0;

// Function to read the list from list.txt
const readListFromFile = () => {
    fs.readFile('list.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading list.txt:', err);
            return;
        }
        currentList = data.split('\n').filter(line => line.trim() !== '');
        // Notify all connected clients about the updated list
        io.emit('updateList', currentList);
        // Check and update current.txt if necessary
        updateCurrentTxtIfNeeded();
    });
};

// Function to save the current index to config.json
const saveCurrentIndexToFile = () => {
    const config = { currentIndex };
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

// Initial read of the list
readListFromFile();

// Watch for changes in list.txt
const watcher = chokidar.watch('list.txt', { persistent: true });

watcher.on('change', () => {
    console.log('list.txt has been updated');
    readListFromFile();
    // Notify clients that the list has changed
    io.emit('listChanged');
});

// Read current index from config.json on startup
fs.readFile('config.json', 'utf8', (err, data) => {
    if (!err) {
        const config = JSON.parse(data);
        if (config && typeof config.currentIndex === 'number') {
            currentIndex = config.currentIndex;
        }
    }
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Send the current list and index to the client
    socket.emit('initialData', { list: currentList, index: currentIndex });

    // Handle list selection
    socket.on('selectList', (index) => {
        currentIndex = index;
        saveCurrentIndexToFile();
        updateCurrentTxtIfNeeded();
        io.emit('updateCurrent', currentIndex);
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

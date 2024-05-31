# OBS Item list selector

This project is a Node.js application that allows you to dynamically manage and display lists of items in an OBS (Open Broadcaster Software) setup. It includes a web interface to select and navigate through different lists stored as text files in a specified directory.
I'm personally using it to show the current scene of a dance performance, but it can be used for any other purpose where you need to display a list of items in OBS.

Join my Discord server for support, feedback, and updates: [https://discord.gg/hJQ8n949du](https://discord.gg/hJQ8n949du)

## Features

- Dynamically load and display lists from text files.
- Switch between different lists stored in the `./data` directory.
- Save the current state and list selection.
- Real-time updates and notifications to clients when the list or list items change.
- Works through a web interface that can be displayed in OBS as a dock, or any other browser source such as a phone or tablet.

## Installation

### Prerequisites

- Node.js (v12 or later) with npm installed.

### Steps

1. Clone the repository

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `data` directory and add your text files (each containing a list of items):

   ```sh
   mkdir data
   # Add your .txt files in the data directory
   ```

4. Rename the `config.example.json` file to `config.json`.

   ```sh
   mv config.example.json config.json
   ```

5. Rename the current.example.txt file to current.txt

## Usage

1. Start the server:

   ```sh
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:3000/index.html` and check if the server is running.

3. Setup OBS to display the web interface as a dock

   - Add a new browser source in OBS.
   - Set the URL to `http://localhost:3000/index.html`.
   - Adjust the width and height to fit your layout.

4. Show your current item in a text field in OBS

   - Add a new text source in OBS.
   - Set the text as a file pointing to the `./current.txt` file.

5. Use the web interface to navigate through the lists and display the items in OBS, make sure that the text is updated in real-time.

6. The current state is saved automatically, and any changes to the text files in the `./data` directory will be reflected in real-time on the web interface.

## Project Structure

- `server.js`: Main server-side script.
- `public/`: Directory containing static files served to the client.
- `public/index.html`: Main client-side HTML file.
- `data/`: Directory to store the list files (.txt format).
- `config.json`: Configuration file to store the current state (index and file).

## Dependencies

- express: Fast, unopinionated, minimalist web framework for Node.js.
- http: Node.js built-in module to create HTTP server.
- socket.io: Enables real-time bidirectional event-based communication.
- chokidar: A neat wrapper around node.js fs.watch / fs.watchFile / FSEvents.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs, improvements, or feature requests.

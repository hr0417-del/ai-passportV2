import express from 'express';
import OBSWebSocket from 'obs-websocket-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const obs = new OBSWebSocket();

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to OBS once at startup
async function connectOBS() {
    try {
        console.log("Connecting to OBS WebSocket...");
        await obs.connect('ws://192.168.1.3:4455', 'NgyZtWX8IDWIznDe');
        console.log("Connected to OBS successfully!");
    } catch (error) {
        console.error("Failed to connect to OBS:", error.message);
    }
}
connectOBS();

// Reconnect if disconnected
obs.on('ConnectionClosed', () => {
    console.log("Connection to OBS closed. Attempting to reconnect in 5 seconds...");
    setTimeout(connectOBS, 5000);
});

// API endpoint to switch scenes
app.get('/api/switch-scene/:sceneName', async (req, res) => {
    const sceneName = req.params.sceneName;
    try {
        await obs.call('SetCurrentProgramScene', { sceneName: sceneName });
        console.log(`✅ Switched to scene: ${sceneName}`);
        res.json({ success: true, scene: sceneName });
    } catch (error) {
        console.error(`❌ Failed to switch to scene ${sceneName}:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server on 0.0.0.0 to allow access from the local network
app.listen(port, '0.0.0.0', () => {
    console.log(`\n==============================================`);
    console.log(`📱 OBS Remote Control is Live!`);
    console.log(`📱 Connect your phone to the same Wi-Fi.`);
    console.log(`📱 Open this URL on your phone browser:`);
    console.log(`📱 http://192.168.1.3:3000`);
    console.log(`==============================================\n`);
});

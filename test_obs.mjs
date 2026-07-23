import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

async function connect() {
  try {
    console.log("Attempting to connect to OBS...");
    const {
      obsWebSocketVersion,
      negotiatedRpcVersion
    } = await obs.connect('ws://192.168.1.3:4455', 'NgyZtWX8IDWIznDe');
    
    console.log(`\x1b[32mSUCCESS!\x1b[0m Connected to OBS WebSocket (v${obsWebSocketVersion})`);
    
    // Get list of scenes
    const sceneList = await obs.call('GetSceneList');
    console.log(`\nCurrent active scene: \x1b[36m${sceneList.currentProgramSceneName}\x1b[0m`);
    console.log("All scenes:");
    sceneList.scenes.forEach(scene => {
      console.log(` - ${scene.sceneName}`);
    });

    await obs.disconnect();
  } catch (error) {
    console.error('\x1b[31mFailed to connect\x1b[0m:', error.code, error.message);
  }
}

connect();

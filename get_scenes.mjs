import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();
async function run() {
  try {
    await obs.connect('ws://192.168.1.3:4455', 'NgyZtWX8IDWIznDe');
    const { scenes } = await obs.call('GetSceneList');
    console.log(scenes.map(s => s.sceneName).join(', '));
    await obs.disconnect();
  } catch(e) {
    console.error(e.message);
  }
}
run();

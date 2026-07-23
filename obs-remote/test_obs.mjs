import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();
async function test() {
  try {
    await obs.connect('ws://127.0.0.1:4455', 'NgyZtWX8IDWIznDe');
    console.log("SUCCESS");
    await obs.disconnect();
  } catch(e) {
    console.log("FAIL: " + e.message);
  }
}
test();

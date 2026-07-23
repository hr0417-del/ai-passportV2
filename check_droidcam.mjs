import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();
async function run() {
  try {
    await obs.connect('ws://192.168.1.3:4455', 'NgyZtWX8IDWIznDe');
    const { inputs } = await obs.call('GetInputList');
    for (const input of inputs) {
      if (input.inputKind.toLowerCase().includes('droidcam')) {
        console.log(`Found DroidCam input: ${input.inputName}`);
        const settings = await obs.call('GetInputSettings', { inputName: input.inputName });
        console.log("Settings:", settings.inputSettings);
      }
    }
    await obs.disconnect();
  } catch(e) {
    console.error(e.message);
  }
}
run();

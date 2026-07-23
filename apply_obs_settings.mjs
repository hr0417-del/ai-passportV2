import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

async function run() {
  try {
    console.log("Connecting to OBS...");
    await obs.connect('ws://192.168.1.3:4455', 'NgyZtWX8IDWIznDe');
    console.log("Connected!");
    
    // Get all inputs (sources)
    const { inputs } = await obs.call('GetInputList');
    
    let targetSource = null;
    let targetFilter = null;
    let currentSettings = null;
    
    for (const input of inputs) {
      try {
        const { filters } = await obs.call('GetSourceFilterList', { sourceName: input.inputName });
        for (const filter of filters) {
          if (filter.filterName.toLowerCase().includes('background removal') || filter.filterKind.includes('background')) {
            targetSource = input.inputName;
            targetFilter = filter.filterName;
            currentSettings = filter.filterSettings;
            console.log(`\nFound filter '${filter.filterName}' on source '${input.inputName}'`);
            console.log("Current settings:", JSON.stringify(currentSettings, null, 2));
          }
        }
      } catch (e) {
         // Some inputs might not support filters, ignore
      }
    }
    
    if (targetSource && targetFilter) {
       console.log("\nApplying optimal settings...");
       
       // Try to apply the most common internal setting names for this plugin
       await obs.call('SetSourceFilterSettings', {
         sourceName: targetSource,
         filterName: targetFilter,
         filterSettings: {
           threshold: 0.45,
           contour_filter: 0.60,
           smooth_contour: 0.60,
           feather: 0.15,
           feather_filter: 0.15
         },
         overlay: true // Merges with existing settings so we don't break things like the chosen model
       });
       console.log("\x1b[32mSUCCESS! Applied optimal cinematic settings to your webcam.\x1b[0m");
    } else {
       console.log("\x1b[31mCould not find the Background Removal filter on any of your sources.\x1b[0m");
    }
    
    await obs.disconnect();
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();

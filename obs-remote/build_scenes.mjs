import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();

async function buildScenes() {
  try {
    await obs.connect('ws://127.0.0.1:4455', 'NgyZtWX8IDWIznDe');
    console.log("Connected to OBS!");

    const scenesToCreate = [
      "1. AI Passport - Starting Soon",
      "2. AI Passport - Main Stage",
      "3. AI Passport - Presentation"
    ];

    // Create scenes if they don't exist
    const { scenes } = await obs.call('GetSceneList');
    const existingSceneNames = scenes.map(s => s.sceneName);

    for (const name of scenesToCreate) {
      if (!existingSceneNames.includes(name)) {
        await obs.call('CreateScene', { sceneName: name });
        console.log(`Created scene: ${name}`);
      }
    }

    // SCENE 1: Starting Soon
    await addBrowserSource("1. AI Passport - Starting Soon", "AIPASS_Tech_Background", "C:/Users/HP/Downloads/AIPASS/moving_background.html", 1920, 1080);
    await addBrowserSource("1. AI Passport - Starting Soon", "AIPASS_Countdown", "C:/Users/HP/Downloads/AIPASS/countdown.html", 1920, 1080);

    // SCENE 2: Main Stage
    await addBrowserSource("2. AI Passport - Main Stage", "AIPASS_Tech_Background", "C:/Users/HP/Downloads/AIPASS/moving_background.html", 1920, 1080);
    
    // Attempt to auto-add their DroidCam if they set it up
    const { inputs } = await obs.call('GetInputList');
    const droidCamInput = inputs.find(i => i.inputName.toLowerCase().includes('droidcam') || i.inputKind.toLowerCase().includes('droidcam'));
    if (droidCamInput) {
      await addExistingSource("2. AI Passport - Main Stage", droidCamInput.inputName);
    }
    
    await addBrowserSource("2. AI Passport - Main Stage", "AIPASS_Lower_Third", "C:/Users/HP/Downloads/AIPASS/lower_third.html", 1920, 1080);

    // SCENE 3: Presentation
    await addBrowserSource("3. AI Passport - Presentation", "AIPASS_Tech_Background", "C:/Users/HP/Downloads/AIPASS/moving_background.html", 1920, 1080);
    
    // Add Display Capture placeholder
    const displayExists = inputs.find(i => i.inputName === "Screen Share");
    if(!displayExists) {
      try {
        await obs.call('CreateInput', {
          sceneName: "3. AI Passport - Presentation",
          inputName: "Screen Share",
          inputKind: 'monitor_capture',
          inputSettings: {}
        });
      } catch(e) {}
    } else {
        await addExistingSource("3. AI Passport - Presentation", "Screen Share");
    }

    if (droidCamInput) {
      await addExistingSource("3. AI Passport - Presentation", droidCamInput.inputName);
    }
    
    await addBrowserSource("3. AI Passport - Presentation", "AIPASS_Presentation_Frame", "C:/Users/HP/Downloads/AIPASS/presentation_layout.html", 1920, 1080);

    console.log("Successfully built all scenes!");
    await obs.disconnect();

  } catch (error) {
    console.error("Error building scenes:", error);
  }
}

async function addBrowserSource(sceneName, sourceName, url, width, height) {
  try {
    const { inputs } = await obs.call('GetInputList');
    const exists = inputs.find(i => i.inputName === sourceName);
    
    if (!exists) {
      await obs.call('CreateInput', {
        sceneName: sceneName,
        inputName: sourceName,
        inputKind: 'browser_source',
        inputSettings: {
          is_local_file: true,
          local_file: url,
          width: width,
          height: height
        }
      });
    } else {
      await addExistingSource(sceneName, sourceName);
    }
  } catch(e) {
    console.log(`Could not add ${sourceName} to ${sceneName}: ${e.message}`);
  }
}

async function addExistingSource(sceneName, sourceName) {
  try {
    const res = await obs.call('CreateSceneItem', {
      sceneName: sceneName,
      sourceName: sourceName
    });
    return res.sceneItemId;
  } catch(e) {
    // Usually means it's already in the scene
  }
}

buildScenes();

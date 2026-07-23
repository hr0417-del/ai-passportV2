import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();

async function buildKeynoteScenes() {
  try {
    await obs.connect('ws://127.0.0.1:4455', 'NgyZtWX8IDWIznDe');
    console.log("Connected to OBS!");

    // Set transition to Fade 300ms
    try {
      await obs.call('SetCurrentSceneTransition', { transitionName: 'Fade' });
      await obs.call('SetCurrentSceneTransitionDuration', { transitionDuration: 300 });
      console.log("Set global transition to Fade 300ms");
    } catch(e) { console.log("Could not set transition: ", e.message); }

    const scenes = [
      "SCENE 1 - PRE SHOW",
      "SCENE 2 - MAIN STAGE",
      "SCENE 3 - PANEL",
      "SCENE 4 - NAVI",
      "SCENE 5 - LIVE DEMO",
      "SCENE 6 - CINEMATIC VIDEO",
      "SCENE 7 - AI PASSPORT",
      "SCENE 8 - ACTIVATION"
    ];

    for (const scene of scenes) {
      try { await obs.call('CreateScene', { sceneName: scene }); } catch(e) {}
    }

    const basePath = "C:/Users/HP/Downloads/AIPASS/";

    // 1. PRE SHOW
    await addBrowser("SCENE 1 - PRE SHOW", "AIPASS_Tech_Background", basePath + "moving_background.html");
    await addBrowser("SCENE 1 - PRE SHOW", "AIPASS_Countdown", basePath + "countdown.html");

    // 2. MAIN STAGE
    await addBrowser("SCENE 2 - MAIN STAGE", "AIPASS_Tech_Background", basePath + "moving_background.html");
    await addPlaceholder("SCENE 2 - MAIN STAGE", "Mobile Camera (Main)", "dshow_input");
    await addBrowser("SCENE 2 - MAIN STAGE", "AIPASS_Lower_Third", basePath + "lower_third.html");

    // 3. PANEL
    await addBrowser("SCENE 3 - PANEL", "AIPASS_Tech_Background", basePath + "moving_background.html");
    await addPlaceholder("SCENE 3 - PANEL", "Nishant Google Meet", "monitor_capture");
    await addPlaceholder("SCENE 3 - PANEL", "Mobile Camera (Main)", "dshow_input");
    await addBrowser("SCENE 3 - PANEL", "AIPASS_Panel_Layout", basePath + "panel_layout.html");

    // 4. NAVI
    await addBrowser("SCENE 4 - NAVI", "AIPASS_Tech_Background", basePath + "moving_background.html");
    await addPlaceholder("SCENE 4 - NAVI", "Gemini Browser", "window_capture");
    await addPlaceholder("SCENE 4 - NAVI", "Mobile Camera (Main)", "dshow_input");
    await addBrowser("SCENE 4 - NAVI", "AIPASS_Navi_Layout", basePath + "navi_layout.html");

    // 5. LIVE DEMO
    await addBrowser("SCENE 5 - LIVE DEMO", "AIPASS_Tech_Background", basePath + "moving_background.html");
    await addPlaceholder("SCENE 5 - LIVE DEMO", "Demo Browser", "window_capture");
    await addPlaceholder("SCENE 5 - LIVE DEMO", "Mobile Camera (Main)", "dshow_input");
    await addBrowser("SCENE 5 - LIVE DEMO", "AIPASS_Demo_Layout", basePath + "demo_layout.html");

    // 6. CINEMATIC VIDEO
    await addPlaceholder("SCENE 6 - CINEMATIC VIDEO", "Cinematic Video Loop", "ffmpeg_source");

    // 7. AI PASSPORT
    await addBrowser("SCENE 7 - AI PASSPORT", "AIPASS_Reveal_Anim", basePath + "reveal.html");
    await addPlaceholder("SCENE 7 - AI PASSPORT", "Mobile Camera (Main)", "dshow_input");

    // 8. ACTIVATION
    await addBrowser("SCENE 8 - ACTIVATION", "AIPASS_Activation", basePath + "activation.html");

    console.log("Successfully built all 8 scenes!");
    await obs.disconnect();

  } catch (error) {
    console.error("Error building scenes:", error);
  }
}

async function addBrowser(sceneName, sourceName, url) {
  try {
    const { inputs } = await obs.call('GetInputList');
    if (!inputs.find(i => i.inputName === sourceName)) {
      await obs.call('CreateInput', {
        sceneName: sceneName, inputName: sourceName, inputKind: 'browser_source',
        inputSettings: { is_local_file: true, local_file: url, width: 1920, height: 1080 }
      });
    } else {
      await obs.call('CreateSceneItem', { sceneName: sceneName, sourceName: sourceName });
    }
  } catch(e) {}
}

async function addPlaceholder(sceneName, sourceName, kind) {
  try {
    const { inputs } = await obs.call('GetInputList');
    if (!inputs.find(i => i.inputName === sourceName)) {
      await obs.call('CreateInput', { sceneName: sceneName, inputName: sourceName, inputKind: kind, inputSettings: {} });
    } else {
      await obs.call('CreateSceneItem', { sceneName: sceneName, sourceName: sourceName });
    }
  } catch(e) {}
}

buildKeynoteScenes();

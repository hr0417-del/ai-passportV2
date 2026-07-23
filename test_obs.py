import sys
import subprocess

try:
    import obsws_python as obs
except ImportError:
    print("Installing obsws-python...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "obsws-python"])
    import obsws_python as obs

try:
    # Connect to OBS WebSocket
    cl = obs.ReqClient(host='192.168.1.3', port=4455, password='L8pHKDHpASEbBCUP')
    
    # Get basic info
    resp = cl.get_version()
    print(f"SUCCESS! Connected to OBS version: {resp.obs_version}")
    
    # Get scenes
    scenes = cl.get_scene_list()
    print(f"Current active scene: {scenes.current_program_scene_name}")
    print("\nAll available scenes:")
    for scene in scenes.scenes:
        print(f" - {scene['sceneName']}")
        
except Exception as e:
    print(f"Failed to connect: {e}")

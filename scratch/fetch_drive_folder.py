import urllib.request
import re
import json

url = 'https://drive.google.com/drive/folders/1zEZGPEe4Gg1MmCaqrP9Vmo0FW9K6vRge?usp=sharing'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print("Page fetched successfully. Size:", len(html))
        
        # Look for titles or file names in initial data
        filenames = set(re.findall(r'\"([^\"]+\.(?:png|jpg|jpeg|pdf|webp))\"', html, re.IGNORECASE))
        print("Found image/pdf filenames:", filenames)

        # Look for general item labels/titles in Google Drive state
        titles = set(re.findall(r'\[\"([a-zA-Z0-9_\- ]{3,60})\",\[\"[a-zA-Z0-9_\-]{20,50}\"\]', html))
        print("Found drive item titles:", list(titles)[:30])

        # Also search for names pattern in window._DRIVE_state or AF_initDataCallback
        callbacks = re.findall(r'AF_initDataCallback\(({.*?})\);', html, re.DOTALL)
        print("Found AF_initDataCallback count:", len(callbacks))

except Exception as e:
    print("Error:", e)

import os
import urllib.request
import zipfile
import sys

def download_and_extract():
    url = "https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x64.zip"
    dest_dir = r"c:\Users\utsav\OneDrive\Desktop\online-food-ordering-system\node-portable"
    zip_path = os.path.join(dest_dir, "node.zip")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    print(f"Downloading Node.js from {url}...")
    try:
        urllib.request.urlretrieve(url, zip_path)
        print("Download complete. Extracting...")
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(dest_dir)
            
        print("Extraction complete!")
        extracted_folder = os.path.join(dest_dir, "node-v18.19.0-win-x64")
        if os.path.exists(extracted_folder):
            node_exe = os.path.join(extracted_folder, "node.exe")
            npm_cmd = os.path.join(extracted_folder, "npm.cmd")
            print(f"Node.js portable installed at: {node_exe}")
            print(f"NPM command at: {npm_cmd}")
            
            # Clean up zip
            os.remove(zip_path)
            sys.exit(0)
        else:
            print("Extracted folder not found!", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    download_and_extract()

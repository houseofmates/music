#!/usr/bin/env python3
"""
YouTube Cookie Extractor for Chrome
Extracts YouTube cookies from Chrome browser and saves them to a file
"""

import os
import json
import sqlite3
import shutil
from pathlib import Path
import tempfile
import sys
from datetime import datetime

def get_chrome_cookie_path():
    """Find the Chrome cookie database path"""
    home = Path.home()
    
    # Common Chrome cookie database paths
    possible_paths = [
        home / ".config/google-chrome/Default/Cookies",
        home / ".config/google-chrome/Profile 1/Cookies",
        home / ".config/google-chrome/Profile 2/Cookies",
        home / ".config/google-chrome/Profile 3/Cookies",
        home / ".config/chromium/Default/Cookies",
        home / ".config/chromium/Profile 1/Cookies",
    ]
    
    for path in possible_paths:
        if path.exists():
            return path
    
    return None

def extract_youtube_cookies(cookie_db_path, output_file):
    """Extract YouTube cookies from Chrome database"""
    
    # Create a temporary copy of the database to avoid locking issues
    with tempfile.NamedTemporaryFile(delete=False) as temp_db:
        try:
            shutil.copy2(cookie_db_path, temp_db.name)
            
            # Connect to the temporary database
            conn = sqlite3.connect(temp_db.name)
            conn.row_factory = sqlite3.Row
            
            # Query for YouTube cookies
            cursor = conn.execute('''
                SELECT name, value, host_key, path, expires_utc, is_secure, is_httponly
                FROM cookies 
                WHERE host_key LIKE '%youtube%' OR host_key LIKE '%google%'
                ORDER BY host_key, name
            ''')
            
            cookies = []
            for row in cursor.fetchall():
                cookie_data = {
                    'name': row['name'],
                    'value': row['value'],
                    'domain': row['host_key'],
                    'path': row['path'],
                    'expires': row['expires_utc'],
                    'secure': bool(row['is_secure']),
                    'httpOnly': bool(row['is_httponly'])
                }
                cookies.append(cookie_data)
            
            conn.close()
            
            # Save cookies to file
            with open(output_file, 'w') as f:
                json.dump(cookies, f, indent=2)
            
            return len(cookies)
            
        except (sqlite3.Error, OSError) as e:
            print(f"Error extracting cookies: {e}")
            return 0
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_db.name)
            except OSError:
                pass

def main():
    """Main function to extract YouTube cookies"""
    
    # Define output path relative to script location for portability
    script_dir = Path(__file__).resolve().parent.parent / "backend" / "data"
    script_dir.mkdir(parents=True, exist_ok=True)
    output_file = script_dir / "youtube_cookies.json"
    
    print("🍪 YouTube Cookie Extractor")
    print("=" * 40)
    
    # Find Chrome cookie database
    cookie_db_path = get_chrome_cookie_path()
    if not cookie_db_path:
        print("❌ Chrome cookie database not found!")
        print("Please make sure Chrome is installed and has been used to visit YouTube.")
        sys.exit(1)
    
    print(f"📁 Found Chrome cookies at: {cookie_db_path}")
    
    # Extract cookies
    print("🔧 Extracting YouTube cookies...")
    cookie_count = extract_youtube_cookies(cookie_db_path, output_file)
    
    if cookie_count > 0:
        print(f"✅ Successfully extracted {cookie_count} cookies!")
        print(f"📄 Cookies saved to: {output_file}")
        print(f"🕒 Extraction time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n📋 To use these cookies in your backend:")
        print(f"   Add this line to your .env file:")
        print(f"   YT_COOKIES_PATH={output_file}")
    else:
        print("❌ No YouTube cookies found!")
        print("Please make sure you're logged into YouTube in Chrome.")
        sys.exit(1)

if __name__ == "__main__":
    main()

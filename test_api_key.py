"""
Test script to verify your Gemini API key is working correctly.
Run this before starting the app to diagnose any issues.

USAGE:
    python test_api_key.py
"""

import sys
import yaml
import os

print("=" * 60)
print("GEMINI API KEY TEST SCRIPT")
print("=" * 60)

# Step 1: Check if config.yaml exists
print("\n[1/5] Checking if config.yaml exists...")

try:
    # Get absolute path of current script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(BASE_DIR, "config.yaml")

    print(f"   Looking for config at: {config_path}")

    if not os.path.exists(config_path):
        raise FileNotFoundError

    with open(config_path, "r") as f:
        config_content = f.read()

    print("✓ config.yaml found!")

except FileNotFoundError:
    print("✗ ERROR: config.yaml not found!")
    print(f"   Current working directory: {os.getcwd()}")
    print(f"   Expected path: {config_path}")
    print("\nMake sure config.yaml is in the SAME folder as this script.")
    sys.exit(1)
# Step 2: Parse YAML
print("\n[2/5] Parsing config.yaml...")
try:
    data = yaml.safe_load(config_content)
    print("✓ YAML parsed successfully!")
except Exception as e:
    print(f"✗ ERROR: Invalid YAML format: {e}")
    sys.exit(1)

# Step 3: Check if API key exists
print("\n[3/5] Checking for GEMINI_API_KEY...")
api_key = data.get('GEMINI_API_KEY')
if not api_key:
    print("✗ ERROR: GEMINI_API_KEY not found in config.yaml!")
    print("\nYour config.yaml should look like:")
    print("GEMINI_API_KEY: 'AIzaSy...'")
    sys.exit(1)

if api_key == 'your-gemini-api-key-here':
    print("✗ ERROR: You're still using the placeholder API key!")
    print("\nPlease replace with your actual API key from:")
    print("https://aistudio.google.com/app/apikey")
    sys.exit(1)

print(f"✓ API key found: {api_key[:10]}...{api_key[-5:]}")

# Step 4: Test import
print("\n[4/5] Testing google-generativeai import...")
try:
    import google.generativeai as genai
    print("✓ google-generativeai imported successfully!")
except ImportError:
    print("✗ ERROR: google-generativeai not installed!")
    print("\nRun: pip install google-generativeai")
    sys.exit(1)

# Step 5: Test API call
print("\n[5/5] Testing API call with your key...")
try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    print("   Sending test request to Gemini API...")
    response = model.generate_content('Say "Hello! API is working!"')
    
    if response and response.text:
        print("✓ API call successful!")
        print(f"   Response: {response.text}")
    else:
        print("✗ ERROR: API returned empty response")
        print(f"   Response object: {response}")
        sys.exit(1)
        
except Exception as e:
    print(f"✗ ERROR: API call failed!")
    print(f"   Error type: {type(e).__name__}")
    print(f"   Error message: {e}")
    
    # Check for common errors
    error_str = str(e).lower()
    
    if 'api key not valid' in error_str or 'invalid' in error_str:
        print("\n💡 SOLUTION: Your API key is invalid")
        print("   1. Go to: https://aistudio.google.com/app/apikey")
        print("   2. Create a new API key")
        print("   3. Copy the ENTIRE key (starts with AIzaSy)")
        print("   4. Update config.yaml")
        
    elif 'quota' in error_str or 'limit' in error_str:
        print("\n💡 SOLUTION: You've hit the rate limit")
        print("   Free tier limits: 15 requests per minute")
        print("   Wait 60 seconds and try again")
        
    elif 'permission denied' in error_str:
        print("\n💡 SOLUTION: API not enabled")
        print("   1. Go to Google Cloud Console")
        print("   2. Enable the Generative Language API")
        
    else:
        print("\n💡 Check the error message above for details")
    
    sys.exit(1)

print("\n" + "=" * 60)
print("✓ ALL TESTS PASSED!")
print("=" * 60)
print("\nYour Gemini API key is working correctly!")
print("You can now run: python app.py")
print("=" * 60)
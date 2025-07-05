#!/usr/bin/env python3
"""
Deep Fake Video Detection UI - Startup Script
"""

import os
import sys
import subprocess
import importlib.util

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'flask',
        'tensorflow',
        'cv2',
        'numpy',
        'werkzeug'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        if package == 'cv2':
            spec = importlib.util.find_spec('cv2')
        else:
            spec = importlib.util.find_spec(package)
        
        if spec is None:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Install dependencies with:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed")
    return True

def check_model_file():
    """Check if the model file exists"""
    model_files = [
        'deepfake_detection_model_final.keras',
        'deepfake_detection_model.keras'
    ]
    
    for model_file in model_files:
        if os.path.exists(model_file):
            print(f"✅ Model file found: {model_file}")
            return True
    
    print("❌ No model file found!")
    print("   Expected: deepfake_detection_model_final.keras or deepfake_detection_model.keras")
    return False

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'templates', 'static/css', 'static/js']
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    print("✅ Directories created/verified")

def main():
    """Main startup function"""
    print("🚀 Deep Fake Video Detection UI - Startup")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check model file
    if not check_model_file():
        print("\n⚠️  Warning: Model file not found. The application may not work properly.")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Create directories
    create_directories()
    
    print("\n🎯 Starting Flask application...")
    print("📱 Open your browser to: http://localhost:8080")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Import and run the Flask app
        from app import app
        app.run(debug=True, host='0.0.0.0', port=8080)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
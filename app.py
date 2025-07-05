import os
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for, send_file
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model
import tempfile
import uuid
import time
import requests
import yt_dlp
import re

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'}

# Load the model
try:
    model = load_model('deepfake_detection_model_final.keras')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_frames(video_path, output_size=(128, 128), frame_count=10):
    """Extract frames from video for prediction"""
    cap = cv2.VideoCapture(video_path)
    frames = []
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if total_frames == 0:
        return None
    
    # Sample frames evenly
    frame_indices = np.linspace(0, total_frames - 1, frame_count, dtype=int)
    
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            # Resize and normalize
            frame = cv2.resize(frame, output_size)
            frame = frame / 255.0
            frames.append(frame)
    
    cap.release()
    
    if len(frames) == 0:
        return None
    
    return np.array(frames)

def predict_video(video_path):
    """Predict if video is real or fake"""
    if model is None:
        return "Model not loaded", 0.0
    
    frames = extract_frames(video_path)
    if frames is None:
        return "Error: Could not extract frames from video", 0.0
    
    try:
        # Reshape for model input
        frames = frames.reshape(1, frames.shape[0], frames.shape[1], frames.shape[2], frames.shape[3])
        prediction = model.predict(frames, verbose=0)
        
        label_idx = np.argmax(prediction)
        label = "FAKE" if label_idx == 1 else "REAL"
        confidence = float(prediction[0][label_idx])
        
        return label, confidence
    except Exception as e:
        return f"Prediction error: {str(e)}", 0.0

def download_video_from_url(url):
    """Download video from URL using yt-dlp"""
    try:
        # Create temporary directory for download
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, 'video.mp4')
        
        # Configure yt-dlp options
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': temp_path,
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        # Download video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get('title', 'Unknown Video')
            duration = info.get('duration', 0)
            file_size = os.path.getsize(temp_path) if os.path.exists(temp_path) else 0
            
        return temp_path, video_title, duration, file_size
        
    except Exception as e:
        raise Exception(f"Failed to download video: {str(e)}")

def is_direct_video_url(url):
    """Check if URL is a direct video link"""
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    return any(url.lower().endswith(ext) for ext in video_extensions)

def get_video_info_from_url(url):
    """Get video information from direct URL"""
    try:
        response = requests.head(url, timeout=10)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = response.headers.get('content-length', 0)
            
            # Extract filename from URL
            filename = url.split('/')[-1].split('?')[0]
            if not filename or '.' not in filename:
                filename = 'video.mp4'
                
            return filename, int(content_length) if content_length else 0
        else:
            raise Exception(f"HTTP {response.status_code}")
    except Exception as e:
        raise Exception(f"Failed to get video info: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        try:
            file.save(filepath)
            
            # Record start time
            start_time = time.time()
            
            # Perform prediction
            label, confidence = predict_video(filepath)
            
            # Calculate analysis time
            analysis_time = time.time() - start_time
            
            # Clean up uploaded file
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'label': label,
                'confidence': confidence,
                'filename': filename,
                'source_type': 'File Upload',
                'analysis_time': f"{analysis_time:.2f} seconds"
            })
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': f'Processing error: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided'}), 400
    
    url = data['url'].strip()
    if not url:
        return jsonify({'error': 'Empty URL provided'}), 400
    
    try:
        # Record start time
        start_time = time.time()
        
        # Determine if it's a direct video URL or platform URL
        if is_direct_video_url(url):
            # Direct video URL - download directly
            filename, file_size = get_video_info_from_url(url)
            temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4()}_{filename}")
            
            # Download the video
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            with open(temp_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Perform prediction
            label, confidence = predict_video(temp_path)
            
            # Clean up
            os.remove(temp_path)
            
        else:
            # Platform URL (YouTube, Vimeo, etc.) - use yt-dlp
            temp_path, video_title, duration, file_size = download_video_from_url(url)
            
            # Perform prediction
            label, confidence = predict_video(temp_path)
            
            # Clean up
            os.remove(temp_path)
            # Remove temp directory
            temp_dir = os.path.dirname(temp_path)
            if os.path.exists(temp_dir):
                import shutil
                shutil.rmtree(temp_dir)
            
            filename = video_title
        
        # Calculate analysis time
        analysis_time = time.time() - start_time
        
        return jsonify({
            'success': True,
            'label': label,
            'confidence': confidence,
            'filename': filename,
            'url': url,
            'source_type': 'URL Analysis',
            'file_size': f"{file_size / (1024*1024):.2f} MB" if file_size > 0 else 'Unknown',
            'analysis_time': f"{analysis_time:.2f} seconds"
        })
        
    except Exception as e:
        return jsonify({'error': f'URL analysis error: {str(e)}'}), 500

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080) 
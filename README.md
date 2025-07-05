# Deep-Fake-Classification-with-unique-Fourier-Attentaion-layers
This repository is used to classify the deepfake video classification using deep learning techniques with Fourier attention layer. Fourier Attention Layers are a type of neural network layers that uses fourier Transformer techniques into attention mechanism.
# Deep Fake Video Detection UI

A modern, beautiful web interface for deep fake video classification using Fourier Attention Layers.

## Features

- **Modern UI Design**: Beautiful gradient backgrounds with glassmorphism effects
-  **Drag & Drop Upload**: Easy file upload with drag and drop functionality
- **Multiple Video Formats**: Supports MP4, AVI, MOV, MKV, WMV, FLV, WEBM
-  **Real-time Analysis**: Instant video processing with loading animations
-  **Detailed Results**: Clear classification with confidence scores
-  **Responsive Design**: Works perfectly on desktop, tablet, and mobile
-  **Secure Processing**: Files are automatically cleaned up after analysis

## Screenshots of UI:

<img width="1645" alt="Screenshot 2025-07-04 at 10 39 35 PM" src="https://github.com/user-attachments/assets/b78437f7-bb1d-4611-aed6-2f0ed56cb818" />
<img width="1267" alt="Screenshot 2025-07-04 at 10 40 30 PM" src="https://github.com/user-attachments/assets/fef7ca74-22bc-425c-b67d-b23fc973b0f7" />

The UI features:
- Gradient background with modern design
- Glassmorphism cards with blur effects
- Interactive upload area with drag & drop
- Animated loading spinner
- Color-coded results (Green for REAL, Red for FAKE)
- Confidence bar visualization
- Responsive layout for all devices

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd Deep-Fake-Classification-with-unique-Fourier-Attentaion-layers
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Ensure model file exists**:
   Make sure `deepfake_detection_model_final.keras` is in the root directory.

## Usage

1. **Start the application**:
   ```bash
   python app.py
   ```

2. **Open your browser**:
   Navigate to `http://localhost:5000`

3. **Upload a video**:
   - Drag and drop a video file onto the upload area
   - Or click "Choose Video File" to browse
   - Supported formats: MP4, AVI, MOV, MKV, WMV, FLV, WEBM
   - Maximum file size: 100MB

4. **View results**:
   - The AI will analyze your video using Fourier Attention Layers
   - Results show classification (REAL/FAKE) and confidence score
   - Files are automatically deleted after processing

## Technical Details

### Backend (Flask)
- **Framework**: Flask 2.3.3
- **Model**: TensorFlow/Keras with Fourier Attention Layers
- **Video Processing**: OpenCV for frame extraction
- **File Handling**: Secure file upload with automatic cleanup

### Frontend
- **HTML5**: Semantic markup with modern structure
- **CSS3**: Advanced styling with gradients, animations, and glassmorphism
- **JavaScript**: Interactive functionality with drag & drop and AJAX
- **Fonts**: Inter font family for modern typography
- **Icons**: Font Awesome for beautiful icons

### Key Features
- **Frame Extraction**: Extracts 10 evenly distributed frames from video
- **Preprocessing**: Resizes frames to 128x128 and normalizes pixel values
- **Model Prediction**: Uses the trained deep fake detection model
- **Real-time Feedback**: Loading animations and progress indicators

## File Structure

```
├── app.py                          # Flask application
├── requirements.txt                # Python dependencies
├── deepfake_detection_model_final.keras  # Trained model
├── templates/
│   └── index.html                 # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css              # Modern CSS styles
│   └── js/
│       └── script.js              # Interactive JavaScript
└── uploads/                       # Temporary upload directory
```

## API Endpoints

- `GET /`: Main application page
- `POST /upload`: Video upload and analysis endpoint
- `GET /health`: Health check endpoint

## Configuration

### Environment Variables
- `FLASK_ENV`: Set to 'development' for debug mode
- `SECRET_KEY`: Flask secret key for session management

### Model Configuration
- Model file: `deepfake_detection_model_final.keras`
- Frame size: 128x128 pixels
- Frame count: 10 frames per video
- Supported formats: MP4, AVI, MOV, MKV, WMV, FLV, WEBM

## Troubleshooting

### Common Issues

1. **Model not loading**:
   - Ensure `deepfake_detection_model_final.keras` exists in root directory
   - Check TensorFlow version compatibility

2. **Video processing errors**:
   - Verify video format is supported
   - Check file size (max 100MB)
   - Ensure video has valid frames

3. **Upload directory issues**:
   - Application automatically creates `uploads/` directory
   - Ensure write permissions in project directory

### Performance Tips

- Use compressed video formats (MP4) for faster uploads
- Keep video files under 50MB for optimal processing speed
- Close other applications to free up system resources

## Security Features

- **File Validation**: Strict file type and size checking
- **Secure Filenames**: UUID-based unique filenames
- **Automatic Cleanup**: Files deleted after processing
- **Input Sanitization**: All inputs are validated and sanitized


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console for error messages
3. Ensure all dependencies are installed
4. Verify model file exists and is accessible

---

**Note**: This UI is designed to work with the Fourier Attention Layer deep fake detection model. Make sure the model file is properly trained and available before running the application. 

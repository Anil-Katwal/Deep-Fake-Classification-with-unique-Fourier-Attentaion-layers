// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const videoInput = document.getElementById('videoInput');
const videoUrlInput = document.getElementById('videoUrl');
const videoSection = document.getElementById('videoSection');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const videoName = document.getElementById('videoName');
const videoSize = document.getElementById('videoSize');
const videoUrlDisplay = document.getElementById('videoUrlDisplay');
const resultsSection = document.getElementById('resultsSection');
const loadingSection = document.getElementById('loadingSection');
const loadingMessage = document.getElementById('loadingMessage');

// File upload handling
videoInput.addEventListener('change', handleFileSelect);

// Drag and drop functionality
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

// URL input handling
videoUrlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        analyzeFromUrl();
    }
});

// Click to upload
uploadArea.addEventListener('click', () => {
    videoInput.click();
});

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv', 'video/flv', 'video/webm'];
    
    if (!allowedTypes.includes(file.type)) {
        showError('Please select a valid video file (MP4, AVI, MOV, MKV, WMV, FLV, WEBM)');
        return;
    }
    
    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
        showError('File size must be less than 100MB');
        return;
    }
    
    // Show video preview
    showVideoPreview(file);
    
    // Upload file
    uploadFile(file);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('video', file);
    
    // Show loading
    showLoading('Processing uploaded video...');
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            showResults(data);
        } else {
            showError(data.error || 'An error occurred during analysis');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error:', error);
        showError('Network error. Please try again.');
    });
}

function analyzeFromUrl() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showError('Please enter a valid video URL');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL format');
        return;
    }
    
    // Show loading
    showLoading('Downloading and processing video from URL...');
    
    fetch('/analyze-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            showVideoFromUrl(url, data);
            showResults(data);
        } else {
            showError(data.error || 'An error occurred during analysis');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error:', error);
        showError('Network error. Please try again.');
    });
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showVideoFromUrl(url, data) {
    // Set video source to the URL
    videoSource.src = url;
    videoPlayer.load();
    
    // Update video info
    videoName.textContent = data.filename || 'Video from URL';
    videoSize.textContent = data.file_size || 'Unknown size';
    videoUrlDisplay.textContent = url;
    
    // Show video section
    videoSection.style.display = 'block';
    
    // Scroll to video
    videoSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add success animation
    videoSection.style.animation = 'fadeInUp 0.6s ease-out';
}

function showLoading(message = 'Please wait while our AI model processes your video') {
    loadingMessage.textContent = message;
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Scroll to loading section
    loadingSection.scrollIntoView({ behavior: 'smooth' });
}

function hideLoading() {
    loadingSection.style.display = 'none';
}

function showVideoPreview(file) {
    // Create object URL for video
    const videoURL = URL.createObjectURL(file);
    
    // Set video source
    videoSource.src = videoURL;
    videoPlayer.load();
    
    // Update video info
    videoName.textContent = file.name;
    videoSize.textContent = formatFileSize(file.size);
    
    // Show video section
    videoSection.style.display = 'block';
    
    // Scroll to video
    videoSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add success animation
    videoSection.style.animation = 'fadeInUp 0.6s ease-out';
}

function hideVideo() {
    videoSection.style.display = 'none';
    
    // Clean up object URL
    if (videoSource.src) {
        URL.revokeObjectURL(videoSource.src);
        videoSource.src = '';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function togglePlayPause() {
    if (videoPlayer.paused) {
        videoPlayer.play();
        document.getElementById('playIcon').className = 'fas fa-pause';
    } else {
        videoPlayer.pause();
        document.getElementById('playIcon').className = 'fas fa-play';
    }
}

function restartVideo() {
    videoPlayer.currentTime = 0;
    videoPlayer.play();
    document.getElementById('playIcon').className = 'fas fa-pause';
}

function toggleMute() {
    if (videoPlayer.muted) {
        videoPlayer.muted = false;
        document.getElementById('muteIcon').className = 'fas fa-volume-up';
    } else {
        videoPlayer.muted = true;
        document.getElementById('muteIcon').className = 'fas fa-volume-mute';
    }
}

function showResults(data) {
    // Update source type
    document.getElementById('sourceType').textContent = data.source_type || 'File Upload';
    
    // Update file/URL name
    document.getElementById('fileName').textContent = data.filename || data.url || 'Unknown';
    
    const classificationBadge = document.getElementById('classificationBadge');
    classificationBadge.textContent = data.label;
    classificationBadge.className = `classification-badge ${data.label.toLowerCase()}`;
    
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    const confidencePercent = Math.round(data.confidence * 100);
    
    confidenceFill.style.width = `${confidencePercent}%`;
    confidenceText.textContent = `${confidencePercent}%`;
    
    // Update analysis time
    document.getElementById('analysisTime').textContent = data.analysis_time || 'N/A';
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add success animation
    resultsSection.style.animation = 'fadeInUp 0.6s ease-out';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function showError(message) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert after upload section
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.parentNode.insertBefore(errorDiv, uploadSection.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}

function showSuccess(message) {
    // Remove existing success messages
    const existingSuccess = document.querySelectorAll('.success-message');
    existingSuccess.forEach(success => success.remove());
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Insert after upload section
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.parentNode.insertBefore(successDiv, uploadSection.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// Add CSS animation for fadeInUp
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fadeInUp {
        animation: fadeInUp 0.6s ease-out;
    }
`;
document.head.appendChild(style);

// Health check on page load
window.addEventListener('load', () => {
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            if (!data.model_loaded) {
                showError('Warning: AI model is not loaded. Please check server configuration.');
            }
        })
        .catch(error => {
            console.error('Health check failed:', error);
        });
});

// Prevent default drag behaviors
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effect to upload button
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '100px';
            ripple.style.height = '100px';
            ripple.style.marginLeft = '-50px';
            ripple.style.marginTop = '-50px';
            
            uploadBtn.style.position = 'relative';
            uploadBtn.style.overflow = 'hidden';
            uploadBtn.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    // Add video event listeners
    if (videoPlayer) {
        videoPlayer.addEventListener('play', () => {
            document.getElementById('playIcon').className = 'fas fa-pause';
        });
        
        videoPlayer.addEventListener('pause', () => {
            document.getElementById('playIcon').className = 'fas fa-play';
        });
        
        videoPlayer.addEventListener('ended', () => {
            document.getElementById('playIcon').className = 'fas fa-play';
        });
        
        videoPlayer.addEventListener('volumechange', () => {
            const muteIcon = document.getElementById('muteIcon');
            if (videoPlayer.muted || videoPlayer.volume === 0) {
                muteIcon.className = 'fas fa-volume-mute';
            } else {
                muteIcon.className = 'fas fa-volume-up';
            }
        });
    }
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle); 
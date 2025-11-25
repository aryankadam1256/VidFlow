import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../api';
import { Upload as UploadIcon, X, Image as ImageIcon, Film, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
    isPublished: true,
    tags: ''
  });

  const [preview, setPreview] = useState({
    video: null,
    thumbnail: null
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFile = (file, type) => {
    if (!file) return;

    if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('Video size must be less than 100MB');
        return;
      }
      setFormData(prev => ({ ...prev, videoFile: file }));
      setPreview(prev => ({ ...prev, video: URL.createObjectURL(file) }));
      // Auto-fill title with filename if empty
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    } else if (type === 'thumbnail') {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setFormData(prev => ({ ...prev, thumbnail: file }));
      setPreview(prev => ({ ...prev, thumbnail: URL.createObjectURL(file) }));
    }
    setError(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], 'video');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.videoFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('videoFile', formData.videoFile);
      if (formData.thumbnail) {
        uploadData.append('thumbnail', formData.thumbnail);
      }
      uploadData.append('isPublished', formData.isPublished);
      // Handle tags (split by comma and trim)
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      tagsArray.forEach(tag => uploadData.append('tags', tag));

      // Mock progress for better UX (since axios progress isn't hooked up in the API wrapper yet)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await videoAPI.uploadVideo(uploadData);

      clearInterval(interval);
      setUploadProgress(100);

      // Small delay to show 100%
      setTimeout(() => {
        navigate(`/video/${response.data.data._id}`);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload video');
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Uploading Video...</h2>
            <p className="text-slate-500">Please do not close this window.</p>
          </div>

          <div className="mb-2 flex justify-between text-sm font-medium">
            <span className="text-slate-700">Progress</span>
            <span className="text-brand-blue">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-brand-gradient transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Your video is being processed and optimized.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Upload Video</h1>
          <button
            onClick={() => navigate('/')}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Form Area */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Details</h2>

              {/* Title */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title (required)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Add a title that describes your video"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Tell viewers about your video"
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              {/* Thumbnail */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Thumbnail
                </label>
                <p className="mb-3 text-xs text-slate-500">
                  Select or upload a picture that shows what's in your video.
                </p>
                <div className="flex gap-4">
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex h-28 w-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 hover:bg-slate-50"
                  >
                    <ImageIcon className="mb-2 h-6 w-6 text-slate-400" />
                    <span className="text-xs text-slate-500">Upload file</span>
                  </div>
                  {preview.thumbnail && (
                    <div className="relative h-28 w-44 overflow-hidden rounded-lg border border-slate-200">
                      <img
                        src={preview.thumbnail}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={(e) => handleFile(e.target.files[0], 'thumbnail')}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Add tags separated by commas (e.g., react, coding, tutorial)"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Visibility</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="isPublished"
                    checked={formData.isPublished === true}
                    onChange={() => setFormData(prev => ({ ...prev, isPublished: true }))}
                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Public</span>
                    <span className="block text-xs text-slate-500">Everyone can watch your video</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="isPublished"
                    checked={formData.isPublished === false}
                    onChange={() => setFormData(prev => ({ ...prev, isPublished: false }))}
                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Private</span>
                    <span className="block text-xs text-slate-500">Only you can watch your video</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar - Video Preview & Upload */}
          <div className="space-y-6">
            <div className="sticky top-24">
              {/* Video Upload Zone */}
              {!formData.videoFile ? (
                <div
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-brand-blue bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <UploadIcon className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="mb-2 text-sm font-medium text-slate-900">
                    Drag and drop video files to upload
                  </p>
                  <p className="mb-6 text-xs text-slate-500">
                    Your videos will be private until you publish them.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    Select Files
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFile(e.target.files[0], 'video')}
                    accept="video/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl bg-slate-900 shadow-lg">
                  <div className="relative aspect-video bg-black">
                    <video
                      src={preview.video}
                      className="h-full w-full object-contain"
                      controls
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-white">
                          {formData.videoFile.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(formData.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFormData(prev => ({ ...prev, videoFile: null }));
                          setPreview(prev => ({ ...prev, video: null }));
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Video uploaded successfully</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!formData.videoFile || !formData.title}
                  className="flex-1 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Upload Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Mic, MicOff } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VideoPlayer = ({ src, poster }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Voice Control State
    const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
    const [feedback, setFeedback] = useState('');

    // Clear feedback after timer
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const commands = [
        {
            command: ['play', 'start', 'resume', 'play video'],
            callback: () => {
                if (videoRef.current) {
                    videoRef.current.play();
                    setIsPlaying(true);
                    setFeedback('▶ Playing');
                }
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.2
        },
        {
            command: ['pause', 'stop', 'wait', 'pause video'],
            callback: () => {
                if (videoRef.current) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                    setFeedback('⏸ Paused');
                }
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.2
        },
        {
            command: ['mute', 'silence', 'quiet', 'mute video'],
            callback: () => {
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                    setFeedback('🔇 Muted');
                }
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.2
        },
        {
            command: ['unmute', 'speak', 'sound on', 'unmute video'],
            callback: () => {
                if (videoRef.current) {
                    videoRef.current.muted = false;
                    setIsMuted(false);
                    setFeedback('🔊 Unmuted');
                }
            },
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.2
        }
    ];

    const { browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

    // Handle Voice Control Toggle
    useEffect(() => {
        if (voiceControlEnabled) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        } else {
            SpeechRecognition.stopListening();
        }
        return () => {
            SpeechRecognition.stopListening();
        };
    }, [voiceControlEnabled]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVoiceControl = () => {
        setVoiceControlEnabled(!voiceControlEnabled);
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = pos * duration;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="group relative aspect-video overflow-hidden rounded-xl bg-black">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="h-full w-full"
                onClick={togglePlay}
            />

            {/* Voice Command Feedback Overlay */}
            {feedback && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm animate-fade-in flex items-center gap-2">
                    <span className="text-lg font-medium">{feedback}</span>
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Progress Bar Container */}
                    <div
                        className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/30"
                        onClick={handleProgressClick}
                    >
                        {/* Progress Fill with Brand Gradient */}
                        <div
                            className="h-full rounded-full bg-brand-gradient transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </button>

                            {/* Mute/Unmute */}
                            <button
                                onClick={toggleMute}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </button>

                            {/* Time Display */}
                            <span className="text-sm font-medium text-white">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Voice Control Toggle */}
                            {browserSupportsSpeechRecognition && (
                                <button
                                    onClick={toggleVoiceControl}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${voiceControlEnabled
                                            ? 'bg-brand-gradient text-white shadow-lg animate-pulse'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                    title={voiceControlEnabled ? "Voice Control ON" : "Enable Voice Control"}
                                >
                                    {voiceControlEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                </button>
                            )}

                            {/* Fullscreen */}
                            <button
                                onClick={handleFullscreen}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                                <Maximize className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Play Button (when paused) */}
            {!isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg hover:scale-110 transition-transform"
                >
                    <Play className="h-8 w-8 ml-1" />
                </button>
            )}
        </div>
    );
};

export default VideoPlayer;

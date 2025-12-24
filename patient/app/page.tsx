"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, Send } from "lucide-react";

export default function HomePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [placeholderText] = useState("Search for doctors, symptoms, or specialists...");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/patient-dashboard?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleVoiceSearch = async () => {
        if (isListening) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setIsListening(false);
                setIsProcessing(true); // Show processing state

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                try {
                    // 1. Upload to Resemble STT
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.webm');

                    const uploadRes = await fetch('/api/stt', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!uploadRes.ok) throw new Error('Upload failed');

                    const uploadData = await uploadRes.json();
                    if (!uploadData.success || !uploadData.item?.uuid) throw new Error("Invalid upload response");

                    const uuid = uploadData.item.uuid;

                    // 2. Poll for completion
                    let text = null;
                    let attempts = 0;
                    const maxAttempts = 60; // 60s timeout

                    while (attempts < maxAttempts) {
                        await new Promise(r => setTimeout(r, 1000));
                        const statusRes = await fetch(`/api/stt/status/${uuid}`);

                        if (statusRes.ok) {
                            const statusData = await statusRes.json();
                            const status = statusData.item?.status;
                            if (status === 'completed') {
                                text = statusData.item.text;
                                break;
                            } else if (status === 'failed') {
                                throw new Error('Transcription failed at provider');
                            }
                        }
                        attempts++;
                    }

                    if (text) {
                        setSearchQuery(text);
                        // Auto-submit removed
                    } else {
                        alert("No speech detected or transcription timed out.");
                    }

                } catch (error: any) {
                    console.error('Error transcribing audio:', error);
                    alert(error.message || 'Failed to process voice search. Please try again.');
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorder.start();
            setIsListening(true);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please ensure permissions are granted.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50">
            {/* Main Content */}
            <div className="container mx-auto px-4 pt-20 pb-20">
                <div className="max-w-3xl mx-auto text-center">
                    {/* AI Badge */}
                    <div
                        className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full mb-8 border-2"
                        style={{
                            borderColor: '#10B981',
                            boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.1), 0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)'
                        }}
                    >
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }}></div>
                        <span className="text-sm font-medium">AI-Powered Healthcare Platform</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Find a Doctor That Fits
                        <br />
                        Your Needs
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        Describe your symptoms and get AI- powered recommendations for doctors,
                        nurses, and caregivers near you.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-8">
                        <div className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isListening ? "Listening... (Click to stop)" : isProcessing ? "Processing audio..." : placeholderText}
                                className="w-full px-6 py-5 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:outline-none transition-all shadow-sm pr-28"
                                style={{
                                    '--tw-ring-color': '#10B981',
                                    borderColor: (isListening || isProcessing) ? '#10B981' : undefined,
                                } as React.CSSProperties}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#10B981';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                                }}
                                onBlur={(e) => {
                                    if (!searchQuery && !isListening) {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleVoiceSearch}
                                    className={`w-11 h-11 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg ${isListening ? 'animate-pulse' : ''} ${isProcessing ? 'animate-spin' : ''}`}
                                    style={{
                                        backgroundColor: isListening ? '#EF4444' : isProcessing ? '#F59E0B' : '#10B981',
                                    }}
                                    disabled={isProcessing}
                                    aria-label="Voice search"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    className="w-11 h-11 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg"
                                    style={{
                                        backgroundColor: '#10B981',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#059669';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#10B981';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                    }}
                                    aria-label="Search"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

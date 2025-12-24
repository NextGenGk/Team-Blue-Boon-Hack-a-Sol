"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, Volume2, X, Loader2, StopCircle, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export function VoiceAssistant() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [response, setResponse] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                await handleAudioUpload(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setTranscript("");
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleAudioUpload = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setTranscript("Transcribing audio...");

        try {
            const formData = new FormData();
            formData.append("file", audioBlob, "voice_command.mp3");

            // 1. Upload to Resemble STT
            const uploadRes = await fetch("/api/stt", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const uploadData = await uploadRes.json();

            if (!uploadData.success || !uploadData.item?.uuid) {
                console.error("Upload Data:", uploadData);
                throw new Error("Invalid upload response from Resemble");
            }

            const uuid = uploadData.item.uuid;

            // 2. Poll for completion
            const text = await pollForTranscript(uuid);

            if (!text) {
                setTranscript("No speech detected.");
                setIsProcessing(false);
                return;
            }

            setTranscript(text);
            setIsProcessing(false);
            // Auto-submit removed. User must click send.

        } catch (error) {
            console.error("STT Error:", error);
            toast.error("Transcription failed.");
            setTranscript("Error processing audio.");
            setIsProcessing(false);
        }
    };

    const pollForTranscript = async (uuid: string): Promise<string | null> => {
        let attempts = 0;
        const maxAttempts = 60; // 60s timeout

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000));

            const res = await fetch(`/api/stt/status/${uuid}`);
            if (!res.ok) continue;

            const data = await res.json();
            const status = data.item?.status;

            if (status === 'completed') {
                return data.item.text;
            } else if (status === 'failed') {
                throw new Error("Transcription failed at provider");
            }

            attempts++;
        }
        throw new Error("Transcription timeout");
    };

    const handleVoiceCommand = async (text: string) => {
        if (!text.trim()) return;

        // Navigate to dashboard immediately with search query
        router.push(`/patient-dashboard?search=${encodeURIComponent(text)}`);

        // Keep isProcessing = true for voice feedback
        try {
            // 1. Send to RAG Search
            const searchRes = await fetch(`/api/search?query=${encodeURIComponent(text)}`);
            const searchData = await searchRes.json();

            let replyText = "I couldn't find any relevant information.";

            if (searchData.results && searchData.results.length > 0) {
                const topResult = searchData.results[0];
                replyText = `I found Dr. ${topResult.name}, a specialist in ${topResult.specializations[0]}.`;
            } else {
                replyText = "I'm sorry, I couldn't find any doctors matching that description.";
            }

            setResponse(replyText);

            // 2. Generate Speech (TTS)
            await speakResponse(replyText);

        } catch (error) {
            console.error("Error processing voice command:", error);
            setResponse("Sorry, something went wrong.");
        } finally {
            setIsProcessing(false);
        }
    };

    const speakResponse = async (text: string) => {
        setIsSpeaking(true);
        try {
            const ttsRes = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const ttsData = await ttsRes.json();

            if (ttsData.audioUrl) {
                playAudio(ttsData.audioUrl);
            } else if (ttsData.audioContent) {
                playAudio(`data:audio/mp3;base64,${ttsData.audioContent}`);
            } else if (ttsData.mock) {
                // Fallback
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = window.speechSynthesis.getVoices();
                utterance.voice = voices.find(v => v.name.includes("Google US English")) || null;
                window.speechSynthesis.speak(utterance);
                utterance.onend = () => setIsSpeaking(false);
                toast(ttsData.message, { icon: 'ℹ️' });
            } else {
                throw new Error("No audio returned");
            }

        } catch (e) {
            console.error("TTS Error", e);
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
            utterance.onend = () => setIsSpeaking(false);
        }
    };

    const playAudio = (url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setIsSpeaking(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
                title="Talk to AI Assistant"
            >
                <Mic className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between text-primary-foreground">
                <h3 className="font-semibold flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> AI Voice Assistant
                </h3>
                <button
                    onClick={() => {
                        setIsOpen(false);
                        stopRecording();
                        if (audioRef.current) audioRef.current.pause();
                    }}
                    className="hover:bg-primary/80 p-1 rounded-full text-white/90 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center gap-4 text-center">

                <div className={`relative px-4 py-2`}>
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`relative z-10 p-5 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-red-500/50 animate-pulse' :
                            isProcessing ? 'bg-yellow-500 text-white animate-spin' :
                                isSpeaking ? 'bg-blue-500 text-white animate-bounce' :
                                    'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white'
                            } shadow-lg`}
                    >
                        {isProcessing ? <Loader2 className="w-8 h-8" /> : isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                </div>

                <div className="min-h-[60px] w-full">
                    {isRecording && <p className="text-sm font-medium text-red-500">Recording... Tap to stop</p>}
                    {isProcessing && <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Thinking...</p>}
                    {isSpeaking && <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Speaking...</p>}

                    {!isRecording && !isProcessing && !isSpeaking && !response && (
                        <div className="w-full mt-2">
                            <div className="relative">
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="Speak or type your query..."
                                    className="w-full p-3 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 resize-none"
                                    rows={3}
                                />
                                {transcript && (
                                    <button
                                        onClick={() => handleVoiceCommand(transcript)}
                                        className="absolute bottom-2 right-2 p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                        title="Search"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {!transcript && <p className="text-xs text-gray-400 mt-2">Tap mic to speak</p>}
                        </div>
                    )}

                    {response && !isRecording && !isProcessing && (
                        <div className="text-left w-full">
                            <p className="text-sm text-gray-800 dark:text-white mt-2 font-medium bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                {response}
                            </p>
                            <button
                                onClick={() => setResponse("")}
                                className="text-xs text-blue-500 hover:underline mt-1"
                            >
                                New Search
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-[10px] text-gray-400 text-center w-full pt-2 border-t border-gray-100 dark:border-gray-800">
                    Powered by Resemble AI (STT & TTS)
                </div>

            </div>
        </div>
    );
}

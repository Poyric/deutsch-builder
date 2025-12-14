import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, MicOff } from 'lucide-react';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';

interface LiveConversationProps {
    onClose: () => void;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ onClose }) => {
    const [connected, setConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState("Bağlanıyor...");
    
    // Refs for audio handling to avoid re-renders
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<any>(null);

    useEffect(() => {
        let isMounted = true;

        const initLiveSession = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                
                const outputNode = outputAudioContextRef.current.createGain();
                outputNode.connect(outputAudioContextRef.current.destination);

                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            if (!isMounted) return;
                            setConnected(true);
                            setStatus("Dinliyor...");
                            
                            // Setup input stream
                            if (!inputAudioContextRef.current || !streamRef.current) return;
                            
                            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                                if (isMuted) return; // Simple software mute
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                
                                sessionPromise.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            
                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputAudioContextRef.current.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (!outputAudioContextRef.current) return;

                            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            
                            if (base64EncodedAudioString) {
                                nextStartTimeRef.current = Math.max(
                                    nextStartTimeRef.current,
                                    outputAudioContextRef.current.currentTime
                                );
                                
                                const audioBuffer = await decodeAudioData(
                                    decode(base64EncodedAudioString),
                                    outputAudioContextRef.current,
                                    24000,
                                    1
                                );
                                
                                const source = outputAudioContextRef.current.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNode);
                                source.addEventListener('ended', () => {
                                    sourcesRef.current.delete(source);
                                });
                                
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(source);
                            }

                            const interrupted = message.serverContent?.interrupted;
                            if (interrupted) {
                                for (const source of sourcesRef.current.values()) {
                                    source.stop();
                                    sourcesRef.current.delete(source);
                                }
                                nextStartTimeRef.current = 0;
                            }
                        },
                        onerror: (e) => {
                            console.error(e);
                            setStatus("Hata oluştu.");
                        },
                        onclose: () => {
                            setStatus("Bağlantı kapandı.");
                            setConnected(false);
                        }
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                        },
                        systemInstruction: "You are a friendly German tutor helping a student practice pronunciation. Speak clearly and simply in German. If the user makes a mistake, gently correct them in Turkish but then switch back to German. Keep sentences short.",
                    },
                });
                
                sessionRef.current = sessionPromise;

            } catch (err) {
                console.error("Failed to start live session", err);
                setStatus("Mikrofon izni gerekli.");
            }
        };

        initLiveSession();

        return () => {
            isMounted = false;
            // Cleanup
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (inputAudioContextRef.current) inputAudioContextRef.current.close();
            if (outputAudioContextRef.current) outputAudioContextRef.current.close();
            // We can't strictly 'close' the live session promise externally easily without the session object, 
            // but closing the stream and contexts stops the flow.
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col items-center justify-between p-8 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="w-full flex justify-end">
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                    <X size={24} />
                </button>
            </div>

            {/* Visualizer / Status */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${connected ? 'bg-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.5)] animate-pulse' : 'bg-gray-700'}`}>
                    <Mic size={48} className="text-white" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Canlı Sohbet</h2>
                    <p className="text-cyan-400 font-medium">{status}</p>
                    <p className="text-gray-400 text-sm mt-4 max-w-xs mx-auto">
                        Almanca pratik yapmak için konuşmaya başlayın. Yapay zeka sizi dinliyor.
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="w-full flex justify-center pb-8">
                <button 
                    onClick={toggleMute}
                    className={`p-6 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                    {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
            </div>
        </div>
    );
};

export default LiveConversation;

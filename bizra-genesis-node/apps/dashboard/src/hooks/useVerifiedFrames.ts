// bizra-genesis-node/apps/dashboard/src/hooks/useVerifiedFrames.ts
// React hook for connecting to BIZRA Gateway WebSocket
// Streams VerifiedFrames from Rust Sovereign Kernel (VΩ.5.1)

import { useEffect, useState } from 'react';

export interface VerifiedFrame {
    id: string;
    did: string;
    content: string;
    proof: number[];
    isnad_chain: string[];
    got_branch: number;
    got_depth: number;
    timestamp: string;
}

export interface FATEResponse {
    verified: boolean;
    proof: number[];
    confidence: number;
}

export function useVerifiedFrames(gatewayUrl: string = 'ws://localhost:8081/ws') {
    const [frames, setFrames] = useState<VerifiedFrame[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            try {
                ws = new WebSocket(gatewayUrl);

                ws.onopen = () => {
                    console.log('🔗 Connected to BIZRA Gateway');
                    setIsConnected(true);
                    setError(null);
                };

                ws.onmessage = (event) => {
                    try {
                        const frame: VerifiedFrame = JSON.parse(event.data);
                        console.log('📨 Received VerifiedFrame:', frame.id);

                        setFrames(prev => {
                            // Avoid duplicates
                            if (prev.some(f => f.id === frame.id)) {
                                return prev;
                            }
                            return [...prev, frame];
                        });
                    } catch (err) {
                        console.error('❌ Failed to parse WebSocket message:', err);
                    }
                };

                ws.onclose = () => {
                    console.log('🔌 Disconnected from BIZRA Gateway');
                    setIsConnected(false);

                    // Auto-reconnect after 3 seconds
                    reconnectTimeout = setTimeout(() => {
                        console.log('🔄 Reconnecting to BIZRA Gateway...');
                        connect();
                    }, 3000);
                };

                ws.onerror = (event) => {
                    console.error('🚨 WebSocket error:', event);
                    setError('WebSocket connection failed');
                    setIsConnected(false);
                };

            } catch (err) {
                console.error('❌ Failed to create WebSocket connection:', err);
                setError('Failed to connect to gateway');
            }
        };

        connect();

        // Cleanup on unmount
        return () => {
            if (ws) {
                ws.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [gatewayUrl]);

    // REST API functions
    const submitFrame = async (content: string): Promise<VerifiedFrame | null> => {
        try {
            const response = await fetch('http://localhost:8081/frames', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                const frame: VerifiedFrame = await response.json();
                console.log('✅ Frame verified and created:', frame.id);
                return frame;
            } else {
                const errorData = await response.json();
                console.error('❌ Frame verification failed:', errorData);
                setError(`Verification failed: ${errorData.error}`);
                return null;
            }
        } catch (err) {
            console.error('❌ Failed to submit frame:', err);
            setError('Failed to submit frame');
            return null;
        }
    };

    const fetchFrames = async (): Promise<VerifiedFrame[]> => {
        try {
            const response = await fetch('http://localhost:8081/frames');
            if (response.ok) {
                const frames: VerifiedFrame[] = await response.json();
                setFrames(frames);
                return frames;
            } else {
                console.error('❌ Failed to fetch frames');
                return [];
            }
        } catch (err) {
            console.error('❌ Failed to fetch frames:', err);
            return [];
        }
    };

    const clearFrames = () => {
        setFrames([]);
    };

    return {
        frames,
        isConnected,
        error,
        submitFrame,
        fetchFrames,
        clearFrames,
    };
}

// Higher-order hook for Graph of Thoughts operations
export function useGraphOfThoughts(gatewayUrl?: string) {
    const { frames, submitFrame, isConnected } = useVerifiedFrames(gatewayUrl);

    const getFramesByBranch = (branch: number) => {
        return frames.filter(f => f.got_branch === branch);
    };

    const getMaxDepth = () => {
        return Math.max(...frames.map(f => f.got_depth), 0);
    };

    const submitThought = async (content: string, branch: number, depth: number) => {
        // Add GoT metadata to content
        const enrichedContent = `${content}\n\n[GoT: branch=${branch}, depth=${depth}]`;
        return await submitFrame(enrichedContent);
    };

    return {
        frames,
        isConnected,
        getFramesByBranch,
        getMaxDepth,
        submitThought,
    };
}

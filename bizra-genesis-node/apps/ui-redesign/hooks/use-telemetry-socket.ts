import { useState, useEffect } from "react"
import { toast } from "sonner"

export interface GenesisSynapse {
    timestamp: string;
    nodeId: string;
    latencyUs: number;
    ihsanScore: number;
    consensusState: 'STABLE' | 'PENDING' | 'DIVERGENT';
    epoch: number;
    activeAgents: {
        PAT: number;
        SAT: number;
    };
    poiEventsLastMinute: number;
    errorRate: number;
    resources: {
        cpuUsage: number;
        memoryUsage: number;
        gpuUsage: number | null;
    };
    services: Record<string, string>;
}

export function useTelemetrySocket() {
    const [telemetry, setTelemetry] = useState<GenesisSynapse | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Connect to the bridge endpoint (port 3002 as per user context)
        // In production this might be proxied, but for now we target localhost:3002
        const wsUrl = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL || "ws://localhost:3002"
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            try {
                ws = new WebSocket(wsUrl)

                ws.onopen = () => {
                    console.log("[Telemetry] Connected to Bridge")
                    setIsConnected(true)
                    toast.success("Telemetry Stream Active")
                }

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data) as GenesisSynapse
                        setTelemetry(data)
                    } catch (e) {
                        console.error("[Telemetry] Parse error:", e)
                    }
                }

                ws.onclose = () => {
                    console.log("[Telemetry] Disconnected")
                    setIsConnected(false)
                    // Reconnect logic
                    reconnectTimeout = setTimeout(connect, 2000)
                }

                ws.onerror = (err) => {
                    console.error("[Telemetry] Error:", err)
                    ws?.close()
                }
            } catch (e) {
                console.error("Connection failed", e)
                reconnectTimeout = setTimeout(connect, 2000)
            }
        }

        connect()

        return () => {
            if (ws) ws.close()
            clearTimeout(reconnectTimeout)
        }
    }, [])

    return { telemetry, isConnected }
}

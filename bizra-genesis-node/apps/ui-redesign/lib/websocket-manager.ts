import { toast } from "sonner"

type MessageHandler = (data: any) => void
type EventHandler = (data: any) => void

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectDelay = 30000 // 30s
  private url: string
  private messageHandlers: Map<string, MessageHandler> = new Map()
  private eventHandlers: Map<string, Set<EventHandler>> = new Map()

  constructor(url: string = "ws://localhost:8080") {
    this.url = url
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0
        toast.success("Connected to BIZRA Network")
        this.emit("connection_change", { status: "connected" })
      }

      this.ws.onclose = () => {
        console.log("[v0] WebSocket disconnected")
        this.emit("connection_change", { status: "disconnected" })
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
        this.emit("connection_change", { status: "error" })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Handle RPC responses
          if (data.id && this.messageHandlers.has(data.id)) {
            this.messageHandlers.get(data.id)?.(data)
            this.messageHandlers.delete(data.id)
          }
          // Handle events/subscriptions
          if (data.method) {
            this.emit(data.method, data.params)
          }
        } catch (e) {
          console.error("[v0] Failed to parse message:", e)
        }
      }
    } catch (e) {
      console.error("[v0] Connection failed:", e)
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay)
    console.log(`[v0] Reconnecting in ${delay}ms...`)
    setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  send(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"))
        return
      }

      const id = crypto.randomUUID()
      const message = { jsonrpc: "2.0", method, params, id }

      this.messageHandlers.set(id, (response) => {
        if (response.error) {
          reject(response.error)
        } else {
          resolve(response.result)
        }
      })

      this.ws.send(JSON.stringify(message))
    })
  }

  subscribe(topic: string, handler: EventHandler) {
    if (!this.eventHandlers.has(topic)) {
      this.eventHandlers.set(topic, new Set())
    }
    this.eventHandlers.get(topic)?.add(handler)
  }

  unsubscribe(topic: string, handler: EventHandler) {
    this.eventHandlers.get(topic)?.delete(handler)
  }

  private emit(topic: string, data: any) {
    this.eventHandlers.get(topic)?.forEach((handler) => handler(data))
  }
}

export const wsManager = new WebSocketManager()

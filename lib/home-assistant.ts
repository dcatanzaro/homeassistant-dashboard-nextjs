interface HomeAssistantConfig {
    url: string;
    urlPost: string;
    wsUrl: string;
    token: string;
}

interface HomeAssistantState {
    entity_id: string;
    state: string;
    attributes: Record<string, any>;
    last_changed: string;
    last_updated: string;
}

interface HomeAssistantServiceCall {
    domain: string;
    service: string;
    service_data?: Record<string, any>;
    target?: {
        entity_id?: string | string[];
        device_id?: string | string[];
    };
}

interface WebSocketMessage {
    type: string;
    id?: number;
    success?: boolean;
    result?: any;
    event?: {
        event_type: string;
        data: any;
    };
}

class HomeAssistantWebSocket {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private messageId = 1;
    private onStateChange: ((state: HomeAssistantState) => void) | null = null;
    private config: HomeAssistantConfig;

    constructor(
        config: HomeAssistantConfig,
        onStateChange: (state: HomeAssistantState) => void
    ) {
        this.config = config;
        this.onStateChange = onStateChange;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.config.wsUrl);

                this.ws.onopen = () => {
                    console.log("WebSocket connected to Home Assistant");
                    this.authenticate()
                        .then(() => this.subscribeToStates())
                        .then(() => {
                            this.reconnectAttempts = 0;
                            resolve();
                        })
                        .catch(reject);
                };

                this.ws.onmessage = (event) => {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    this.handleMessage(message);
                };

                this.ws.onclose = () => {
                    console.log("WebSocket disconnected from Home Assistant");
                    this.handleReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private async authenticate(): Promise<void> {
        if (!this.ws) throw new Error("WebSocket not connected");

        const authMessage = {
            type: "auth",
            access_token: this.config.token,
        };

        this.ws.send(JSON.stringify(authMessage));

        return new Promise((resolve, reject) => {
            const handleAuth = (event: MessageEvent) => {
                const message: WebSocketMessage = JSON.parse(event.data);
                if (message.type === "auth_ok") {
                    this.ws!.removeEventListener("message", handleAuth);
                    resolve();
                } else if (message.type === "auth_invalid") {
                    this.ws!.removeEventListener("message", handleAuth);
                    reject(new Error("Authentication failed"));
                }
            };

            this.ws!.addEventListener("message", handleAuth);
        });
    }

    private async subscribeToStates(): Promise<void> {
        if (!this.ws) throw new Error("WebSocket not connected");

        const subscribeMessage = {
            id: this.messageId++,
            type: "subscribe_events",
            event_type: "state_changed",
        };

        this.ws.send(JSON.stringify(subscribeMessage));
    }

    private handleMessage(message: WebSocketMessage): void {
        if (
            message.type === "event" &&
            message.event?.event_type === "state_changed"
        ) {
            const newState = message.event.data.new_state as HomeAssistantState;
            if (this.onStateChange) {
                this.onStateChange(newState);
            }
        }
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(
                `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
            );

            setTimeout(() => {
                this.connect().catch((error) => {
                    console.error("Reconnection failed:", error);
                    this.handleReconnect();
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error("Max reconnection attempts reached");
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

class HomeAssistantClient {
    private config: HomeAssistantConfig;
    private wsClient: HomeAssistantWebSocket | null = null;
    private stateUpdateCallbacks: Set<(state: HomeAssistantState) => void> =
        new Set();

    constructor() {
        this.config = {
            url: `${process.env.DASHBOARD_URL}/api/home-assistant`,
            urlPost: `${process.env.DASHBOARD_POSTURL}/api/home-assistant`,
            wsUrl: `${process.env.HA_URL?.replace("http", "ws")}/api/websocket`,
            token: process.env.HA_TOKEN || "",
        };
    }

    async connectWebSocket(): Promise<void> {
        if (this.wsClient) {
            this.wsClient.disconnect();
        }

        this.wsClient = new HomeAssistantWebSocket(
            this.config,
            (state: HomeAssistantState) => {
                // Notify all registered callbacks
                this.stateUpdateCallbacks.forEach((callback) =>
                    callback(state)
                );
            }
        );

        await this.wsClient.connect();
    }

    disconnectWebSocket(): void {
        if (this.wsClient) {
            this.wsClient.disconnect();
            this.wsClient = null;
        }
    }

    onStateChange(callback: (state: HomeAssistantState) => void): () => void {
        this.stateUpdateCallbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.stateUpdateCallbacks.delete(callback);
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = new URL(this.config.url);
        const urlPost = new URL(this.config.urlPost);

        if (endpoint.startsWith("/states")) {
            const entityId = endpoint.split("/")[2];
            if (entityId) {
                url.searchParams.set("entityId", entityId);
            }
        }

        const response = await fetch(
            options.method === "POST" ? urlPost.toString() : url.toString(),
            {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...options.headers,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Home Assistant API error: ${response.statusText}`);
        }

        return response.json();
    }

    async getStates(): Promise<HomeAssistantState[]> {
        return this.request<HomeAssistantState[]>("/states");
    }

    async getState(entityId: string): Promise<HomeAssistantState> {
        return this.request<HomeAssistantState>(`/states/${entityId}`);
    }

    async callService(serviceCall: HomeAssistantServiceCall): Promise<any> {
        return this.request("", {
            method: "POST",
            body: JSON.stringify(serviceCall),
        });
    }

    async toggleEntity(entityId: string): Promise<any> {
        const [domain] = entityId.split(".");
        return this.callService({
            domain,
            service: "toggle",
            service_data: {
                entity_id: entityId,
            },
        });
    }
}

export const homeAssistant = new HomeAssistantClient();

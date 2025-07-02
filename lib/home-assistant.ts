interface HomeAssistantConfig {
    url: string;
    urlPost: string;
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

class HomeAssistantClient {
    private config: HomeAssistantConfig;

    constructor() {
        this.config = {
            url: `${process.env.DASHBOARD_URL}/api/home-assistant`,
            urlPost: `${process.env.DASHBOARD_POSTURL}/api/home-assistant`,
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

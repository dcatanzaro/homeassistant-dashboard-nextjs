interface HomeAssistantConfig {
    url: string;
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

class HomeAssistantClient {
    private config: HomeAssistantConfig;

    constructor() {
        const url = process.env.HA_URL;
        const token = process.env.HA_TOKEN;

        if (!url || !token) {
            throw new Error(
                "Home Assistant URL and token must be provided in environment variables"
            );
        }

        this.config = {
            url: url.endsWith("/") ? url.slice(0, -1) : url,
            token,
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        console.log(`${this.config.url}/api${endpoint}`);
        const response = await fetch(`${this.config.url}/api${endpoint}`, {
            ...options,
            mode: "cors",
            credentials: "same-origin",
            headers: {
                Authorization: `Bearer ${this.config.token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                ...options.headers,
            },
        });

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
        console.log(serviceCall);

        return this.request(
            `/services/${serviceCall.domain}/${serviceCall.service}`,
            {
                method: "POST",
                body: JSON.stringify(serviceCall.service_data || {}),
            }
        );
    }

    async toggleEntity(entityId: string): Promise<any> {
        console.log({ entityId });

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

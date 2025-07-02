export interface SensorData {
    displayName: string;
    value: string;
    unit: string;
    icon: string;
    lastUpdated: string;
}

export interface RoomData {
    temperature: string;
    humidity: string;
    lights: number;
    lightsOn: number;
}

export interface DoorStatus {
    status: string;
    lastUpdated: string;
}

export interface SensorConfig {
    entityId: string;
    displayName: string;
    unit: string;
    icon: string;
}

export const sensorConfigs: SensorConfig[] = [
    {
        entityId: "switch.lightswitch_lobby",
        displayName: "Lobby",
        unit: "",
        icon: "",
    },
    {
        entityId: "switch.lightswitch_workshop",
        displayName: "Workshop",
        unit: "",
        icon: "",
    },
    {
        entityId: "switch.lightswitch_living_ladder",
        displayName: "Living Ladder",
        unit: "",
        icon: "",
    },
    {
        entityId: "switch.lightswitch_office",
        displayName: "Office",
        unit: "",
        icon: "",
    },
    {
        entityId: "switch.lightswitch_bedroom",
        displayName: "Bedroom",
        unit: "",
        icon: "",
    },
    {
        entityId: "switch.lightswitch_kitchen_ceil",
        displayName: "Kitchen Ceiling",
        unit: "",
        icon: "",
    },
    {
        entityId: "switch.lightswitch_kitchen_cupboard",
        displayName: "Kitchen Cupboard",
        unit: "",
        icon: "",
    },
    {
        entityId: "switch.lightswitch_yard",
        displayName: "Yard",
        unit: "",
        icon: "",
    },
    {
        entityId: "sensor.breaker_phase_a_power",
        displayName: "Phase A Power",
        unit: "W",
        icon: "zap",
    },
    {
        entityId: "sensor.breaker_phase_a_current",
        displayName: "Phase A Current",
        unit: "A",
        icon: "zap",
    },
    {
        entityId: "sensor.breaker_phase_a_voltage",
        displayName: "Phase A Voltage",
        unit: "V",
        icon: "zap",
    },
    {
        entityId: "binary_sensor.sensor_lobby_door_contact",
        displayName: "Lobby Door",
        unit: "",
        icon: "door-closed",
    },
    {
        entityId: "binary_sensor.sensor_yard_door_contact",
        displayName: "Yard Door",
        unit: "",
        icon: "door-closed",
    },
    {
        entityId: "sensor.sensor_temperature_living_temperature",
        displayName: "Living Room Temperature",
        unit: "°C",
        icon: "thermometer",
    },
    {
        entityId: "sensor.sensor_temperature_living_humidity",
        displayName: "Living Room Humidity",
        unit: "%",
        icon: "droplet",
    },
    {
        entityId: "sensor.sensor_temperature_bedroom_temperature",
        displayName: "Bedroom Temperature",
        unit: "°C",
        icon: "thermometer",
    },
    {
        entityId: "sensor.sensor_temperature_bedroom_humidity",
        displayName: "Bedroom Humidity",
        unit: "%",
        icon: "droplet",
    },
    {
        entityId: "sensor.sensor_temperature_kitchen_temperature",
        displayName: "Kitchen Temperature",
        unit: "°C",
        icon: "thermometer",
    },
    {
        entityId: "sensor.sensor_temperature_kitchen_humidity",
        displayName: "Kitchen Humidity",
        unit: "%",
        icon: "droplet",
    },
    {
        entityId: "sensor.sensor_temperature_office_temperature",
        displayName: "Office Temperature",
        unit: "°C",
        icon: "thermometer",
    },
    {
        entityId: "sensor.sensor_temperature_office_humidity",
        displayName: "Office Humidity",
        unit: "%",
        icon: "droplet",
    },
    // Battery sensors
    {
        entityId: "sensor.sensor_temperature_living_battery",
        displayName: "Living Room Battery",
        unit: "%",
        icon: "battery",
    },
    {
        entityId: "sensor.sensor_temperature_kitchen_battery",
        displayName: "Kitchen Battery",
        unit: "%",
        icon: "battery",
    },
    {
        entityId: "sensor.sensor_temperature_office_battery",
        displayName: "Office Battery",
        unit: "%",
        icon: "battery",
    },
    {
        entityId: "sensor.sensor_temperature_bedroom_battery",
        displayName: "Bedroom Battery",
        unit: "%",
        icon: "battery",
    },
    // Link quality sensors
    {
        entityId: "sensor.sensor_temperature_living_linkquality",
        displayName: "Living Room Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.sensor_temperature_kitchen_linkquality",
        displayName: "Kitchen Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.sensor_temperature_office_linkquality",
        displayName: "Office Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.sensor_temperature_bedroom_linkquality",
        displayName: "Bedroom Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.sensor_yard_door_linkquality",
        displayName: "Yard Door Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.sensor_lobby_door_linkquality",
        displayName: "Lobby Door Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lightswitch_living_ladder_linkquality",
        displayName: "Living Ladder Switch Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lightswitch_bedroom_linkquality",
        displayName: "Bedroom Switch Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lightswitch_kitchen_cupboard_linkquality",
        displayName: "Kitchen Cupboard Switch Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lightswitch_kitchen_ceil_linkquality",
        displayName: "Kitchen Ceiling Switch Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lightswitch_yard_linkquality",
        displayName: "Yard Switch Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lightswitch_lobby_linkquality",
        displayName: "Lobby Switch Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lighthue_dinning_2_linkquality",
        displayName: "Dining Hue 2 Signal",
        unit: "lqi",
        icon: "signal",
    },
    {
        entityId: "sensor.lighthue_dinning_1_linkquality",
        displayName: "Dining Hue 1 Signal",
        unit: "lqi",
        icon: "signal",
    },
];

export const sensorEntityIds = sensorConfigs.map((config) => config.entityId);

export function getSensorConfig(entityId: string): SensorConfig | undefined {
    return sensorConfigs.find((config) => config.entityId === entityId);
}

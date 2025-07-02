# Home Assistant Dashboard

A real-time dashboard for Home Assistant with WebSocket integration for live state updates.

## Features

-   **Real-time Updates**: WebSocket connection to Home Assistant for live state changes
-   **Responsive Design**: Works on both desktop and mobile devices
-   **Light Control**: Toggle lights on/off with real-time feedback
-   **Sensor Monitoring**: View temperature, humidity, power consumption, and more
-   **Connection Status**: Visual indicator showing WebSocket connection status

## Environment Variables

Make sure to set these environment variables:

```env
HA_URL=http://your-home-assistant-instance:8123
HA_TOKEN=your_long_lived_access_token
DASHBOARD_URL=http://localhost:3000
DASHBOARD_POSTURL=http://localhost:3000
```

## Real-time Updates

The dashboard uses WebSocket connections to receive real-time updates from Home Assistant. When states change in Home Assistant, they are automatically reflected in the dashboard without requiring page refreshes.

### How it works:

1. **Initial Load**: Fetches all current states from Home Assistant API
2. **WebSocket Connection**: Establishes a WebSocket connection to Home Assistant
3. **State Subscription**: Subscribes to `state_changed` events
4. **Real-time Updates**: Automatically updates the UI when states change
5. **Reconnection**: Automatically reconnects if the connection is lost

### Connection Status

The dashboard shows a connection status indicator:

-   🟢 **Connected**: WebSocket is connected and receiving updates
-   🔴 **Disconnected**: WebSocket is disconnected or failed to connect
-   ⚠️ **Error**: Connection error occurred

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Architecture

-   **`lib/home-assistant.ts`**: Core Home Assistant client with WebSocket support
-   **`hooks/use-home-assistant.ts`**: React hook for managing real-time state
-   **`components/connection-status.tsx`**: Connection status indicator component
-   **`app/page.tsx`**: Main dashboard with real-time updates

## Troubleshooting

### WebSocket Connection Issues

1. Check that `HA_URL` is correct and accessible
2. Verify that `HA_TOKEN` is valid and has the necessary permissions
3. Ensure Home Assistant WebSocket API is enabled
4. Check browser console for connection errors

### State Updates Not Working

1. Verify that entities exist in Home Assistant
2. Check that the WebSocket connection is established
3. Look for errors in the browser console
4. Ensure the access token has read permissions for the entities

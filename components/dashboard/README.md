# Dashboard Components

This directory contains all the components used in the Home Assistant Dashboard. The components have been separated for better maintainability and readability.

## Component Structure

### Core Components

-   **`QuickStatusCards`** (`quick-status-cards.tsx`)

    -   Displays temperature and power status cards
    -   Shows average temperature, humidity, and power consumption

-   **`OverviewTab`** (`overview-tab.tsx`)

    -   Shows room summaries with temperature, humidity, and light status
    -   Displays security status for doors

-   **`LightCard`** (`light-card.tsx`)

    -   Individual light control component
    -   Handles light toggle functionality with loading states

-   **`ClimateTab`** (`climate-tab.tsx`)

    -   AC control interface
    -   Room temperature displays

-   **`BottomNavigation`** (`bottom-navigation.tsx`)

    -   Mobile navigation bar
    -   Tab switching functionality

-   **`LoadingScreen`** (`loading-screen.tsx`)
    -   Loading state display
    -   Consistent loading UI across the app

### Types

-   **`types/dashboard.ts`**
    -   Centralized type definitions
    -   `SensorData`, `RoomData`, `DoorStatus` interfaces

### Usage

All components are exported through the index file for clean imports:

```typescript
import {
    QuickStatusCards,
    OverviewTab,
    LightCard,
    ClimateTab,
    BottomNavigation,
    LoadingScreen,
} from "@/components/dashboard";
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused in other parts of the app
3. **Maintainability**: Easier to find and modify specific functionality
4. **Testing**: Individual components can be tested in isolation
5. **Readability**: Main dashboard page is now much cleaner and easier to understand

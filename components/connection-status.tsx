import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
    connected: boolean;
    error?: string | null;
}

export function ConnectionStatus({ connected, error }: ConnectionStatusProps) {
    return (
        <div className="flex items-center gap-1">
            {connected ? (
                <Wifi className="h-4 w-4 text-green-400" />
            ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs text-gray-400">
                {error ? "Error" : connected ? "Connected" : "Disconnected"}
            </span>
        </div>
    );
}

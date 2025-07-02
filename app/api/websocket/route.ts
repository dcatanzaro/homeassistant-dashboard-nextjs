import { NextRequest } from "next/server";

const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;

export async function GET(request: NextRequest) {
    // Check if this is an SSE request
    const accept = request.headers.get("accept");
    if (accept !== "text/event-stream") {
        return new Response("Expected SSE request", { status: 400 });
    }

    try {
        // Create WebSocket connection to Home Assistant
        const wsUrl = `${HA_URL?.replace("http", "ws")}/api/websocket`;
        const ws = new WebSocket(wsUrl);

        // Create SSE response
        const encoder = new TextEncoder();
        let controllerClosed = false;

        const stream = new ReadableStream({
            start(controller) {
                // Send initial connection message
                controller.enqueue(
                    encoder.encode('data: {"type":"connected"}\n\n')
                );

                // Handle WebSocket close
                ws.onclose = () => {
                    if (!controllerClosed) {
                        try {
                            controller.enqueue(
                                encoder.encode(
                                    'data: {"type":"disconnected"}\n\n'
                                )
                            );
                        } catch (error) {
                            console.log(
                                "Controller already closed during WebSocket close"
                            );
                        }
                        controllerClosed = true;
                        controller.close();
                    }
                };

                // Handle errors
                ws.onerror = (error) => {
                    console.error("Home Assistant WebSocket error:", error);
                    if (!controllerClosed) {
                        try {
                            controller.enqueue(
                                encoder.encode('data: {"type":"error"}\n\n')
                            );
                        } catch (error) {
                            console.log(
                                "Controller already closed during WebSocket error"
                            );
                        }
                        controllerClosed = true;
                        controller.close();
                    }
                };

                // Wait for WebSocket to be ready before sending messages
                ws.onopen = () => {
                    console.log("Home Assistant WebSocket connected");

                    // Authenticate with Home Assistant
                    const authMessage = {
                        type: "auth",
                        access_token: HA_TOKEN,
                    };
                    ws.send(JSON.stringify(authMessage));

                    // Handle messages from Home Assistant after connection
                    ws.onmessage = (event) => {
                        if (controllerClosed) return;

                        try {
                            const message = JSON.parse(event.data);

                            // Check if authentication was successful
                            if (message.type === "auth_ok") {
                                console.log("Authentication successful");

                                // Subscribe to state changes
                                const subscribeMessage = {
                                    id: 1,
                                    type: "subscribe_events",
                                    event_type: "state_changed",
                                };
                                ws.send(JSON.stringify(subscribeMessage));
                            } else if (message.type === "auth_invalid") {
                                console.error("Authentication failed");
                                if (!controllerClosed) {
                                    try {
                                        controller.enqueue(
                                            encoder.encode(
                                                'data: {"type":"auth_error"}\n\n'
                                            )
                                        );
                                    } catch (error) {
                                        console.log(
                                            "Controller already closed during auth error"
                                        );
                                    }
                                    controllerClosed = true;
                                    controller.close();
                                }
                            } else {
                                // Forward other messages to client
                                if (!controllerClosed) {
                                    try {
                                        controller.enqueue(
                                            encoder.encode(
                                                `data: ${event.data}\n\n`
                                            )
                                        );
                                    } catch (error) {
                                        console.log(
                                            "Controller already closed during message forwarding"
                                        );
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(
                                "Error parsing WebSocket message:",
                                error
                            );
                        }
                    };
                };
            },
            cancel() {
                controllerClosed = true;
                ws.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("SSE proxy error:", error);
        return new Response("SSE proxy error", { status: 500 });
    }
}

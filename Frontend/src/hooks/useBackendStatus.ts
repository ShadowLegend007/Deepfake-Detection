import { useState, useEffect } from "react";

type BackendStatus = "checking" | "online" | "offline";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8064";

export function useBackendStatus(intervalMs = 10_000): BackendStatus {
    const [status, setStatus] = useState<BackendStatus>("checking");

    useEffect(() => {
        let cancelled = false;

        const ping = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/`, {
                    method: "GET",
                    signal: AbortSignal.timeout(4000),
                });
                if (!cancelled) setStatus(res.ok ? "online" : "offline");
            } catch {
                if (!cancelled) setStatus("offline");
            }
        };

        ping();
        const id = setInterval(ping, intervalMs);
        return () => { cancelled = true; clearInterval(id); };
    }, [intervalMs]);

    return status;
}

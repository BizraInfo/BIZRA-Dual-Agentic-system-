export const API_BASE_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:33333";

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_url}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success === false) {
        throw new Error(json.error || "Unknown API error");
    }

    return json.data;
}

export interface PoiStats {
    total_events: number;
    verified_events: number;
    total_impact: number;
    avg_ihsan: number;
}

export interface MasterpieceSeal {
    protocol: string;
    version: string;
    timestamp: string;
    status: string;
    grade: string;
    ihsan_score: number;
    dimensions: Record<string, number>;
    verification: {
        unit_tests: number;
        integration_tests: number;
        property_tests: number;
        formal_proofs: string[];
        fuzz_runs_per_target: number;
        smt_solver: string;
        tpm_anchor: string;
    };
    merkle_root: string;
    governance: string;
    seal_hash: string;
    snr_metrics?: {
        peak_snr: number;
        avg_signal: number;
        floor_noise: number;
        beam_count: number;
    };
}

export interface ReasoningResult {
    method: string;
    steps: string[];
    conclusion: string;
    confidence: number;
    performance_ms: number;
    metadata: {
        traces: Array<{
            step_number: number;
            observation: string;
            reflection: string;
            plan: string;
            action: string;
            artifacts: any[];
        }>;
        artifacts: Array<{
            id: string;
            title: string;
            content_type: string;
            body: string;
            metadata: Record<string, string>;
        }>;
        summary: {
            core_intent: string;
            accumulated_knowledge: string;
            resolved_tensions: string[];
            pending_subgoals: string[];
        };
    };
}

export interface GotRequest {
    prompt: string;
}

export async function submitReasoning(payload: GotRequest): Promise<ReasoningResult> {
    return fetchFromApi<ReasoningResult>("/api/reasoning/apotheosis", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export interface PoiEvent {
    id: string;
    event_type: string;
    impact_score: number;
    ihsan_score: number;
    verified: boolean;
    timestamp: string;
}

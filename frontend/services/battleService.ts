import { post, get } from "./httpClient";

export interface Battle {
    id: number;
    status: string;
    exerciseId: string;
    startedAt?: string;
    createdAt?: string;
    isPlayer1?: boolean;
    winnerId?: number;
    player1Accepted?: boolean;
    player2Accepted?: boolean;
}

export interface Opponent {
    id: number;
    username: string;
    display_name?: string;
    rating: number;
    avatar_animal?: string;
    avatar_color?: string;
}

export interface QueueStatus {
    status: 'waiting' | 'matched' | 'none';
    battleId?: number;
}

// Join matchmaking queue
export function joinQueue(): Promise<any> {
    return post("/battle/join-queue", {});
}

// Leave matchmaking queue
export function leaveQueue(): Promise<any> {
    return post("/battle/leave-queue", {});
}

// Get queue status
export function getQueueStatus(): Promise<QueueStatus> {
    return get("/battle/queue-status");
}

// Get active battle
export function getActiveBattle(): Promise<{ battle: Battle | null; opponent?: Opponent; exercise?: any; submissions?: any[] }> {
    return get("/battle/active");
}

// Accept match
export function acceptMatch(battleId: number): Promise<any> {
    return post(`/battle/${battleId}/accept`, {});
}

// Submit code in battle
export function submitBattle(battleId: number, code: string, exerciseId: string): Promise<any> {
    return post("/battle/submit", { battleId, code, exerciseId });
}

// Resign from battle
export function resign(battleId: number): Promise<any> {
    return post(`/battle/${battleId}/resign`, {});
}

// Get submission status (same as practice but different endpoint)
export function getSubmission(submissionId: number): Promise<any> {
    return get(`/battle/submissions/${submissionId}`);
}

export default {
    joinQueue,
    leaveQueue,
    getQueueStatus,
    getActiveBattle,
    acceptMatch,
    submitBattle,
    resign,
    getSubmission
};

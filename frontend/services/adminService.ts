import { post, get, put, del } from "./httpClient";

// Users management
export function getUsers(): Promise<{ users: any[] }> {
    return get("/admin/users");
}

export function updateUser(userId: number, data: any): Promise<any> {
    return put(`/admin/users/${userId}`, data);
}

export function deleteUser(userId: number): Promise<any> {
    return del(`/admin/users/${userId}`);
}

// Exercises management
export function getExercises(): Promise<{ exercises: any[] }> {
    return get("/admin/exercises");
}

export function getExercise(exerciseId: string): Promise<any> {
    return get(`/admin/exercises/${exerciseId}`);
}

export function createExercise(data: any): Promise<any> {
    return post("/admin/exercises", data);
}

export function updateExercise(exerciseId: string, data: any): Promise<any> {
    return put(`/admin/exercises/${exerciseId}`, data);
}

export function deleteExercise(exerciseId: string): Promise<any> {
    return del(`/admin/exercises/${exerciseId}`);
}

// Tickets management
export function getTickets(): Promise<{ tickets: any[] }> {
    return get("/admin/tickets");
}

export function getTicket(ticketId: number): Promise<any> {
    return get(`/admin/tickets/${ticketId}`);
}

export function replyToTicket(ticketId: number, message: string): Promise<any> {
    return post(`/admin/tickets/${ticketId}/message`, { message });
}

export function updateTicketStatus(ticketId: number, status: string): Promise<any> {
    return put(`/admin/tickets/${ticketId}/status`, { status });
}

export default {
    getUsers,
    updateUser,
    deleteUser,
    getExercises,
    getExercise,
    createExercise,
    updateExercise,
    deleteExercise,
    getTickets,
    getTicket,
    replyToTicket,
    updateTicketStatus
};

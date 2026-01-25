import { post, get } from "./httpClient";

export interface Ticket {
    id: number;
    user_id: number;
    subject: string;
    status: 'open' | 'in_progress' | 'closed';
    created_at: string;
    updated_at?: string;
}

export interface TicketMessage {
    id: number;
    ticket_id: number;
    sender_id: number;
    message: string;
    created_at: string;
}

export interface TicketDetail extends Ticket {
    messages: TicketMessage[];
}

// Get all user's tickets
export function getTickets(): Promise<{ tickets: Ticket[] }> {
    return get("/support/tickets");
}

// Get single ticket with messages
export function getTicket(ticketId: number): Promise<TicketDetail> {
    return get(`/support/${ticketId}`);
}

// Create new ticket
export function createTicket(subject: string, message: string): Promise<Ticket> {
    return post("/support/create", { subject, message });
}

// Send message to ticket
export function sendMessage(ticketId: number, message: string): Promise<TicketMessage> {
    return post(`/support/${ticketId}/message`, { message });
}

export default {
    getTickets,
    getTicket,
    createTicket,
    sendMessage
};

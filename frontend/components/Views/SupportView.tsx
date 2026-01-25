import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, CheckCircle, Plus, Send, ChevronLeft, AlertCircle, Terminal } from "lucide-react";
import { getTickets, getTicket, createTicket, sendMessage, Ticket, TicketDetail, TicketMessage } from "../../services/supportService";
import { getMe } from "../../services/authService";

export default function SupportView() {
    // State
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const [activeTicket, setActiveTicket] = useState<TicketDetail | null>(null); // Full detail with messages
    const [messages, setMessages] = useState<TicketMessage[]>([]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [userId, setUserId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({ subject: "", content: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        // Get User ID
        getMe().then(res => {
            if (res.user) setUserId(res.user.id);
        }).catch(err => console.error(err));

        // Get Tickets
        refreshTickets();
    }, []);

    const refreshTickets = () => {
        getTickets().then(res => {
            setTickets(res.tickets || []);
        }).catch(err => console.error("Failed to load tickets", err));
    };

    // Load Ticket Details
    useEffect(() => {
        if (activeTicketId) {
            setIsLoading(true);
            getTicket(activeTicketId).then(res => {
                setActiveTicket(res);
                setMessages(res.messages || []);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            });
        } else {
            setActiveTicket(null);
            setMessages([]);
        }
    }, [activeTicketId]);

    // Scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages, activeTicketId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Actions
    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.content) return;

        setIsSubmitting(true);
        try {
            const newTicket = await createTicket(formData.subject, formData.content);
            setFormData({ subject: "", content: "" });
            setShowCreateForm(false);
            refreshTickets();
            setActiveTicketId(newTicket.id);
        } catch (err) {
            console.error("Failed to create ticket", err);
            alert("Failed to create ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTicketId) return;

        try {
            const msg = await sendMessage(activeTicketId, newMessage);
            setMessages(prev => [...prev, msg]);
            setNewMessage("");
            // Logic to auto-reply simulation is removed since backend handles it or real human replies
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-ui-900/95 border border-ui-border shadow-hard relative overflow-hidden backdrop-blur-sm">

            {/* Header */}
            <div className="p-6 border-b border-ui-border bg-ui-800/80 shrink-0 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-display font-bold text-ui-text-main tracking-wider flex items-center gap-2">
                        <Terminal size={24} className="text-brand" />
                        SUPPORT STATION
                    </h2>
                    <p className="text-xs text-ui-text-muted font-mono mt-1">
                        SECURE COMM LINK // ENCRYPTED
                    </p>
                </div>
                {!showCreateForm && !activeTicketId && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-brand hover:bg-brand-hover text-black px-4 py-2 flex items-center gap-2 font-bold text-xs uppercase transition-colors"
                    >
                        <Plus size={16} />
                        <span>New Ticket</span>
                    </button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">

                {/* LIST PANEL */}
                <div className={`
                    w-full md:w-80 border-r border-ui-border flex flex-col bg-black/5 dark:bg-black/20
                    ${(activeTicketId || showCreateForm) ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="p-3 border-b border-ui-border bg-ui-800/50">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Tickets</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {tickets.length === 0 && (
                            <div className="text-center p-4 text-xs text-gray-500">No tickets found.</div>
                        )}
                        {tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => { setActiveTicketId(ticket.id); setShowCreateForm(false); }}
                                className={`
                                    p-3 border cursor-pointer transition-all group
                                    ${activeTicketId === ticket.id
                                        ? 'bg-brand/10 border-brand'
                                        : 'bg-ui-800 border-transparent hover:border-ui-border hover:bg-ui-700'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-mono font-bold ${activeTicketId === ticket.id ? 'text-brand' : 'text-gray-500'}`}>
                                        TCK-{ticket.id}
                                    </span>
                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm 
                                        ${ticket.status === 'open' ? 'bg-green-500/20 text-green-500' :
                                            ticket.status === 'closed' ? 'bg-gray-500/20 text-gray-400' : 'bg-yellow-500/20 text-yellow-500'}
                                    `}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <h3 className="text-xs font-bold text-ui-text-main truncate mb-1 group-hover:text-brand transition-colors">
                                    {ticket.subject}
                                </h3>
                                <p className="text-[10px] text-gray-500 truncate font-mono">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETAIL / FORM PANEL */}
                <div className="flex-1 flex flex-col relative bg-ui-900/50">

                    {/* Scenario 1: Create Form */}
                    {showCreateForm && (
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-ui-border flex items-center gap-2 md:hidden">
                                <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-ui-text-main">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-bold text-sm">Cancel</span>
                            </div>

                            <div className="p-8 max-w-2xl mx-auto w-full animate-fade-in">
                                <h3 className="text-xl font-bold text-ui-text-main mb-6 flex items-center gap-2">
                                    <AlertCircle className="text-brand" size={20} />
                                    Submit Incident Report
                                </h3>

                                <form onSubmit={handleCreateTicket} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Subject Line</label>
                                        <input
                                            type="text"
                                            className="w-full bg-ui-800 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                            placeholder="e.g., Glitch in Sector 7"
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Detailed Log</label>
                                        <textarea
                                            className="w-full h-40 bg-ui-800 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono resize-none transition-colors"
                                            placeholder="Describe the anomaly..."
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateForm(false)}
                                            className="px-6 py-2 border border-ui-border text-gray-500 hover:text-ui-text-main hover:bg-ui-800 text-xs font-bold uppercase transition-colors"
                                        >
                                            Cancel Operation
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-brand hover:bg-brand-hover text-black px-6 py-2 font-bold text-xs uppercase flex justify-center items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <span className="animate-pulse">Transmitting...</span>
                                            ) : (
                                                <>
                                                    <span>Submit Ticket</span>
                                                    <Send size={14} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Scenario 2: Active Ticket Chat */}
                    {!showCreateForm && activeTicket && (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-ui-border bg-ui-800/80 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setActiveTicketId(null)} className="md:hidden text-gray-400 hover:text-ui-text-main">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-ui-text-main text-sm">{activeTicket.subject}</h3>
                                            <span className="text-[10px] font-mono text-brand border border-brand/30 px-1">TCK-{activeTicket.id}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-mono uppercase">Status: {activeTicket.status}</span>
                                    </div>
                                </div>
                                {activeTicket.status === 'closed' && ( // Backend uses 'closed'
                                    <div className="flex items-center gap-1 text-green-500">
                                        <CheckCircle size={14} />
                                        <span className="text-[10px] font-bold uppercase">Resolved</span>
                                    </div>
                                )}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/5 dark:bg-black/20">

                                {isLoading ? (
                                    <div className="flex justify-center p-8"><span className="animate-spin text-brand"><Terminal size={24} /></span></div>
                                ) : (
                                    <>
                                        {messages.map(msg => {
                                            const isMe = msg.sender_id === userId;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`
                                                        max-w-[80%] p-3 border
                                                        ${isMe
                                                            ? 'bg-brand/10 border-brand/30 rounded-tl-lg rounded-bl-lg rounded-br-lg'
                                                            : 'bg-ui-800 border-ui-border rounded-tr-lg rounded-bl-lg rounded-br-lg'}
                                                    `}>
                                                        <p className={`text-sm ${isMe ? 'text-ui-text-main' : 'text-ui-text-main'}`}>{msg.message}</p>
                                                        <div className={`text-[9px] font-mono mt-1 flex gap-2 ${isMe ? 'text-brand/70 justify-end' : 'text-gray-500'}`}>
                                                            <span className="uppercase font-bold">{isMe ? 'You' : 'Support Agent'}</span>
                                                            <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {messages.length === 0 && (
                                            <div className="text-center text-xs text-gray-500 mt-10">Start the conversation...</div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-ui-border bg-ui-800/80 shrink-0">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-ui-900 border border-ui-border px-4 py-2.5 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono placeholder:text-gray-500 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-brand hover:bg-brand-hover disabled:bg-ui-700 disabled:text-gray-500 text-black p-2.5 transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Scenario 3: Empty State */}
                    {!showCreateForm && !activeTicket && (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                            <div className="w-16 h-16 border-2 border-dashed border-ui-border rounded-full flex items-center justify-center mb-4 opacity-50">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="text-lg font-display font-bold text-gray-500">NO FREQUENCY SELECTED</h3>
                            <p className="text-xs font-mono max-w-xs mt-2 opacity-60">
                                Select an existing transmission from the left or initialize a new incident report.
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="mt-6 md:hidden bg-ui-800 border border-ui-border text-ui-text-main px-4 py-2 text-xs font-bold uppercase"
                            >
                                Create Ticket
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
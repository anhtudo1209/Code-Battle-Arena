import React, { useState, useEffect, useRef } from "react";
import { post, get } from "../services/httpClient";
import Header from "../components/Header";
import PageTitle from "../components/PageTitle";
import ThemeToggle from "../components/ThemeToggle";
import { MessageSquare, Clock, CheckCircle, Plus, Send, ChevronLeft } from "lucide-react";
import "./Home.css";

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    // Chat view state
    const [activeTicket, setActiveTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const [form, setForm] = useState({ subject: "", content: "" });
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (activeTicket) {
            scrollToBottom();
        }
    }, [messages, activeTicket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await get("/support");
            setTickets(data.tickets || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTicketDetails = async (ticketId) => {
        try {
            setLoading(true);
            const data = await get(`/support/${ticketId}`);
            setActiveTicket(data.ticket);
            setMessages(data.messages || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");
        if (!form.subject || !form.content) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setSubmitting(true);
            const res = await post("/support", form);
            setInfo("Ticket submitted successfully!");
            setForm({ subject: "", content: "" });
            setShowCreateForm(false);
            loadTickets();
            // Automatically open the new ticket
            if (res.ticket) {
                loadTicketDetails(res.ticket.id);
            }
        } catch (err) {
            setError(err.message || "Failed to submit ticket");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTicket) return;

        try {
            setSubmitting(true);
            const res = await post(`/support/${activeTicket.id}/message`, { message: newMessage });
            setMessages([...messages, res.message]);
            setNewMessage("");
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="home-page">
            <PageTitle title="Support" />
            <Header />
            <ThemeToggle />

            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-5xl mx-auto h-full flex flex-col">
                    {/* Page Title Area */}
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 mt-4 flex-shrink-0">
                        <div>
                            <span className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-800">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Support Center
                            </span>
                            <h2 className="text-3xl font-bold mt-3">
                                Get <span className="text-emerald-400">Help</span>
                            </h2>
                            <p className="text-slate-400 mt-2 max-w-xl">
                                Submit support tickets, track your requests, and get assistance from our team.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT LIST (Visible on mobile if no active ticket) */}
                    <div className={`md:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col overflow-hidden ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
                            <h2 className="font-bold text-slate-200">My Tickets</h2>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition text-white"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {loading && !activeTicket ? (
                                <p className="text-slate-500 text-center p-4">Loading...</p>
                            ) : tickets.length === 0 ? (
                                <p className="text-slate-500 text-center p-4">No tickets yet.</p>
                            ) : (
                                tickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => loadTicketDetails(ticket.id)}
                                        className={`p-4 rounded-xl cursor-pointer transition border ${activeTicket?.id === ticket.id
                                            ? 'bg-emerald-900/20 border-emerald-500/30'
                                            : 'bg-slate-900/40 border-transparent hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold text-sm truncate pr-2 ${activeTicket?.id === ticket.id ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                {ticket.subject}
                                            </h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-slate-500/10 text-slate-400'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{ticket.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT CHAT / CREATE FORM */}
                    <div className={`md:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col overflow-hidden ${!activeTicket && !showCreateForm ? 'hidden md:flex items-center justify-center' : 'flex'}`}>

                        {showCreateForm ? (
                            <div className="p-6 w-full max-w-lg mx-auto overflow-y-auto">
                                <div className="flex items-center gap-2 mb-6">
                                    <button onClick={() => setShowCreateForm(false)} className="md:hidden p-2 hover:bg-slate-800 rounded-lg">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        Create New Ticket
                                    </h2>
                                </div>
                                <form onSubmit={handleCreateTicket} className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">Subject</label>
                                        <input
                                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-emerald-500 outline-none transition"
                                            placeholder="What's the issue?"
                                            value={form.subject}
                                            onChange={e => setForm({ ...form, subject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-emerald-500 outline-none transition resize-none h-40"
                                            placeholder="Describe your problem..."
                                            value={form.content}
                                            onChange={e => setForm({ ...form, content: e.target.value })}
                                        />
                                    </div>
                                    {error && <p className="text-red-400 text-sm">{error}</p>}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                                    >
                                        {submitting ? "Creating..." : "Create Ticket"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="w-full py-3 text-slate-400 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        ) : activeTicket ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center gap-3">
                                    <button onClick={() => setActiveTicket(null)} className="md:hidden p-2 hover:bg-slate-800 rounded-lg">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="font-bold text-lg text-white">{activeTicket.subject}</h2>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>#{activeTicket.id}</span>
                                            <span>•</span>
                                            <span className={`uppercase ${activeTicket.status === 'resolved' ? 'text-emerald-400' : 'text-blue-400'}`}>{activeTicket.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/30">
                                    {messages.map(msg => {
                                        // "Me" is the ticket owner (the active user for this view) checking their own ticket.
                                        const isMe = msg.sender_id === activeTicket.user_id;

                                        return (
                                            <div key={msg.id} className={`flex flex-col ${!isMe ? 'items-start' : 'items-end'}`}>
                                                <div className={`max-w-[80%] rounded-2xl p-4 ${!isMe
                                                    ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                                                    : 'bg-emerald-600 text-white rounded-tr-sm'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 px-1">
                                                    <span className="text-[10px] text-slate-500 font-bold">
                                                        {!isMe ? 'SUPPORT' : 'YOU'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Chat Input */}
                                <div className="p-4 bg-slate-900/60 border-t border-slate-800">
                                    {activeTicket.status === 'resolved' && (
                                        <div className="mb-3 p-2 bg-emerald-900/20 border border-emerald-500/20 rounded text-center text-xs text-emerald-400 font-bold">
                                            This ticket is marked as resolved. Replying will reopen it.
                                        </div>
                                    )}
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-emerald-500 outline-none transition"
                                            placeholder="Type your reply..."
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={submitting || !newMessage.trim()}
                                            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl transition"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-500">
                                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Select a ticket to view conversation</p>
                            </div>
                        )}
                    </div>

                </div>
                </div>
            </main>
        </div>
    );
}

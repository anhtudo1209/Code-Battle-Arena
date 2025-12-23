import React, { useState, useEffect } from "react";
import { post, get } from "../services/httpClient";
import Header from "../components/Header";
import { MessageSquare, Clock, CheckCircle, Plus } from "lucide-react";

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const [form, setForm] = useState({ subject: "", content: "" });

    useEffect(() => {
        loadTickets();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");
        if (!form.subject || !form.content) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setSubmitting(true);
            await post("/support", form);
            setInfo("Ticket submitted successfully!");
            setForm({ subject: "", content: "" });
            loadTickets();
        } catch (err) {
            setError(err.message || "Failed to submit ticket");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-slate-100 font-sans selection:bg-emerald-500/30">
            <Header />

            <main className="max-w-4xl mx-auto p-6 pt-10">
                <h1 className="text-4xl font-black text-slate-100 mb-8 flex items-center gap-3">
                    <MessageSquare className="w-10 h-10 text-emerald-500" />
                    SUPPORT <span className="text-emerald-500">CENTER</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Submit Form */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-fit">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-emerald-400" /> New Ticket
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm font-bold mb-2">Subject</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                                    placeholder="What's the issue?"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm font-bold mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition resize-none h-40"
                                    placeholder="Describe your problem in detail..."
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-red-400 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
                            {info && <p className="text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{info}</p>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "SUBMITTING..." : "SUBMIT TICKET"}
                            </button>
                        </form>
                    </div>

                    {/* Ticket History */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-slate-400" /> My Tickets
                        </h2>

                        {loading ? (
                            <p className="text-slate-500 animate-pulse">Loading tickets...</p>
                        ) : tickets.length === 0 ? (
                            <div className="p-8 text-center bg-slate-900/20 rounded-2xl border border-slate-800/50">
                                <p className="text-slate-500">No tickets yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {tickets.map(ticket => (
                                    <div key={ticket.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg text-slate-200 group-hover:text-emerald-400 transition">{ticket.subject}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">{ticket.content}</p>
                                        <div className="text-xs text-slate-600 flex justify-between items-center border-t border-slate-800 pt-3">
                                            <span>{new Date(ticket.created_at).toLocaleString()}</span>
                                            <span className="font-mono text-slate-700">#{ticket.id}</span>
                                        </div>

                                        {ticket.admin_response && (
                                            <div className="mt-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
                                                <p className="text-xs text-emerald-500 font-bold mb-1 flex items-center gap-2"><CheckCircle className="w-3 h-3" /> ADMIN RESPONSE</p>
                                                <p className="text-slate-300 text-sm">{ticket.admin_response}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

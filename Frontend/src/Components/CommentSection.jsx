import React, { useEffect, useState, useRef } from "react";
import { MessageSquare, Send, Trash2, User, CornerDownRight, X, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { fetchComments, createComment, deleteComment } from "../api";
import toast from "react-hot-toast";

export default function CommentSection({ articleId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [collapsedComments, setCollapsedComments] = useState({});
    const formRef = useRef(null);
    const inputRef = useRef(null);

    const getSafeUser = () => {
        const raw = localStorage.getItem("user_data");
        if (!raw || raw.includes("<!doctype")) return null;
        try { return JSON.parse(raw); } catch { return null; }
    };

    const user = getSafeUser();
    const token = localStorage.getItem("access_token");

    const loadComments = async () => {
        try {
            const res = await fetchComments(articleId);
            setComments(res.data);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    useEffect(() => {
        loadComments();
    }, [articleId]);

    // WebSocket Logic: The ONLY place state is updated for live events
    useEffect(() => {
        if (!articleId) return;

        const socketUrl = `wss://sentinel-ou6m.onrender.com/ws/articles/${articleId}/comments/`;
        const socket = new WebSocket(socketUrl);
        let heartbeat;

        socket.onopen = () => {
            console.log("WebSocket Connected ✅");
            heartbeat = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "ping" }));
                }
            }, 30000);
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "pong") return;

            // Handle Real-time Deletion
            if (message.type === 'delete') {
                setComments((prev) => prev.filter(c => c.id !== message.id));
                return;
            }

            const data = message.data || message;

            setComments(prev => {
                // PERMANENT FIX: Check if ID already exists to prevent double-rendering
                if (prev.some(c => c.id === data.id)) return prev;

                // Handle Replies (Re-fetch to handle complex nested arrays)
                if (data.parent) {
                    loadComments();
                    return prev;
                }

                // Handle New Top-Level Comments
                return [data, ...prev];
            });
        };

        socket.onclose = () => clearInterval(heartbeat);

        return () => {
            socket.close();
            clearInterval(heartbeat);
        };
    }, [articleId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !token) return;
        setIsSubmitting(true);
        try {
            await createComment(articleId, {
                content: newComment,
                parent: replyingTo ? replyingTo.id : null
            }, token);

            // Reset form UI only. 
            // DO NOT update setComments here; the WebSocket will do it.
            setNewComment("");
            setReplyingTo(null);
            toast.success("Comment sent");
        } catch {
            toast.error("Failed to publish");
        } finally {
            setIsSubmitting(false);
        }
    };

    const executeDelete = async (id) => {
        try {
            // We only call the API. The WebSocket 'delete' message will remove it from UI.
            await deleteComment(articleId, id, token);
            toast.success("Comment removed");
        } catch (err) {
            toast.error("Could not delete comment");
            console.error(err);
        }
    };

    // ... (rest of your helper functions: confirmDelete, toggleReplies, renderComments)

    const handleReplyClick = (comment) => {
        setReplyingTo(comment);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            inputRef.current?.focus();
        }, 500);
    };

    const toggleReplies = (commentId) => {
        setCollapsedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const confirmDelete = (commentId) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1 min-w-62.5">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Confirm Removal
                </p>
                <div className="flex justify-end gap-4 border-t border-slate-100 pt-3 mt-1">
                    <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
                    <button onClick={() => { toast.dismiss(t.id); executeDelete(commentId); }} className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Delete</button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-center' });
    };

    const renderComments = (commentList) => {
        return commentList.map((comment) => {
            const isCollapsed = collapsedComments[comment.id];
            const hasReplies = comment.replies && comment.replies.length > 0;

            return (
                <div key={comment.id} className="group">
                    <div className="flex flex-col">
                        <header className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">
                                    {comment.user ? comment.user[0].toUpperCase() : "?"}
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">{comment.user}</h4>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </header>

                        <div className="pl-9">
                            <p className="text-[15px] leading-relaxed text-slate-700 mb-4 whitespace-pre-wrap">
                                {comment.content}
                            </p>

                            <footer className="flex items-center gap-6 mb-8">
                                <button onClick={() => handleReplyClick(comment)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Reply</button>

                                {hasReplies && (
                                    <button onClick={() => toggleReplies(comment.id)} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1">
                                        {isCollapsed ? <>Show Replies ({comment.replies.length}) <ChevronDown className="w-3 h-3" /></> : <>Hide Replies <ChevronUp className="w-3 h-3" /></>}
                                    </button>
                                )}

                                {(user?.username === comment.user || user?.role === "ADMIN") && (
                                    <button onClick={() => confirmDelete(comment.id)} className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-rose-600 flex items-center gap-1">Delete</button>
                                )}
                            </footer>

                            {hasReplies && !isCollapsed && (
                                <div className="space-y-12 border-l border-slate-100 pl-8 ml-1 mb-8">
                                    {renderComments(comment.replies)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <section className="mt-12 max-w-4xl mx-auto px-4 mb-24 text-slate-900 antialiased">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-slate-900 flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 stroke-[2.5px]" />
                    Comments <span className="text-slate-400 font-medium tracking-normal">({comments.length})</span>
                </h2>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="mb-16">
                {replyingTo && (
                    <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                            <CornerDownRight className="w-3 h-3 text-blue-600" /> Replying to @{replyingTo.user}
                        </span>
                        <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-950"><X className="w-3 h-3" /></button>
                    </div>
                )}
                <div className="relative border-b-2 border-slate-100 focus-within:border-slate-900 transition-all duration-300">
                    <textarea
                        ref={inputRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={token ? "Join the discussion..." : "Authentication required to post."}
                        disabled={!token}
                        className="w-full bg-transparent py-4 outline-none text-[15px] text-slate-800 placeholder:text-slate-300 min-h-20 resize-none"
                    />
                    {token && (
                        <div className="flex justify-end pb-3">
                            <button type="submit" disabled={isSubmitting} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-blue-600 disabled:text-slate-300 flex items-center gap-2">
                                {isSubmitting ? "Sending..." : <>Publish Comment <Send className="w-3 h-3" /></>}
                            </button>
                        </div>
                    )}
                </div>
            </form>

            <div className="space-y-12">
                {renderComments(comments)}
            </div>
        </section>
    );
}
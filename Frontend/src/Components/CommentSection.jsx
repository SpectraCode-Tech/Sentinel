import React, { useEffect, useState, useRef } from "react";
import { MessageSquare, Send, Trash2, User, CornerDownRight, X, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { fetchComments, createComment, deleteComment } from "../api";
import toast from "react-hot-toast";

// --- Custom Delete Modal Component ---
const DeleteModal = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-100 p-8 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-rose-600" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Confirm Removal</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed uppercase tracking-wider">
                        This action is permanent and cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 border border-slate-100 rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-lg shadow-rose-100"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CommentSection({ articleId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [collapsedComments, setCollapsedComments] = useState({});
    const [commentToDelete, setCommentToDelete] = useState(null);

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

    // WebSocket: The Single Source of Truth for UI Updates
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
                // Prevent duplicate render (Race condition check)
                if (prev.some(c => c.id === data.id)) return prev;

                // Handle Replies (Re-fetch for complex nested state)
                if (data.parent) {
                    loadComments();
                    return prev;
                }

                // New Top-level Comment
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

            setNewComment("");
            setReplyingTo(null);
            toast.success("Message delivered");
        } catch {
            toast.error("Failed to deliver");
        } finally {
            setIsSubmitting(false);
        }
    };

    const executeDelete = async () => {
        const id = commentToDelete;
        setCommentToDelete(null); // Close modal
        try {
            await deleteComment(articleId, id, token);
            toast.success("Comment removed");
        } catch (err) {
            toast.error("Could not delete");
        }
    };

    const handleReplyClick = (comment) => {
        setReplyingTo(comment);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => inputRef.current?.focus(), 500);
    };

    const toggleReplies = (commentId) => {
        setCollapsedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
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
                                <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </header>

                        <div className="pl-9">
                            <p className="text-[15px] leading-relaxed text-slate-700 mb-4 whitespace-pre-wrap">
                                {comment.content}
                            </p>

                            <footer className="flex items-center gap-6 mb-8">
                                <button onClick={() => handleReplyClick(comment)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Reply</button>

                                {hasReplies && (
                                    <button onClick={() => toggleReplies(comment.id)} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                                        {isCollapsed ? <>View Replies ({comment.replies.length}) <ChevronDown className="w-3 h-3" /></> : <>Hide Replies <ChevronUp className="w-3 h-3" /></>}
                                    </button>
                                )}

                                {(user?.username === comment.user || user?.role === "ADMIN") && (
                                    <button onClick={() => setCommentToDelete(comment.id)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-rose-600 transition-colors flex items-center gap-1">Delete</button>
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
                        <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-950 transition-colors"><X className="w-3 h-3" /></button>
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
                            <button type="submit" disabled={isSubmitting} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-blue-600 disabled:text-slate-300 transition-colors flex items-center gap-2">
                                {isSubmitting ? "Sending..." : <>Publish Comment <Send className="w-3 h-3" /></>}
                            </button>
                        </div>
                    )}
                </div>
            </form>

            <div className="space-y-12">
                {renderComments(comments)}
            </div>

            <DeleteModal
                isOpen={!!commentToDelete}
                onCancel={() => setCommentToDelete(null)}
                onConfirm={executeDelete}
            />
        </section>
    );
}
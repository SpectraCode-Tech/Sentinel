import React, { useEffect, useState, useRef } from "react";
import { MessageSquare, Send, Trash2, User, CornerDownRight, X, AlertCircle } from "lucide-react";
import { fetchComments, createComment, deleteComment } from "../api";
import toast from "react-hot-toast";

export default function CommentSection({ articleId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const formRef = useRef(null);
    const inputRef = useRef(null); // Ref for the textarea focus

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

    useEffect(() => { loadComments(); }, [articleId]);

    const handleReplyClick = (comment) => {
        setReplyingTo(comment);
        // Scroll to form and focus textarea
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            inputRef.current?.focus();
        }, 500); // Small delay to let the scroll finish
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !token) return;
        setIsSubmitting(true);
        try {
            await createComment(articleId, { content: newComment, parent: replyingTo ? replyingTo.id : null }, token);
            setNewComment("");
            setReplyingTo(null);
            await loadComments();
            toast.success("Comment published");
        } catch {
            toast.error("Failed to publish");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (commentId) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1 min-w-[250px]">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Confirm Removal
                </p>
                <p className="text-[10px] text-slate-500 uppercase leading-none">This action cannot be undone.</p>
                <div className="flex justify-end gap-4 border-t border-slate-100 pt-3 mt-1">
                    <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                    <button onClick={() => { toast.dismiss(t.id); executeDelete(commentId); }} className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:text-rose-800 transition-colors">Delete</button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: { border: '1px solid #e2e8f0', padding: '16px', color: '#0f172a', borderRadius: '4px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
        });
    };

    const executeDelete = async (id) => {
        const deletePromise = deleteComment(articleId, id, token);
        toast.promise(deletePromise, { loading: 'Removing dispatch...', success: 'Entry deleted', error: 'Could not remove entry' }, {
            position: 'top-center',
            success: { duration: 2000 },
            error: { duration: 3000 },
            style: { minWidth: '250px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '0px', border: '1px solid #e2e8f0' },
        });

        try {
            await deletePromise;
            await loadComments();
        } catch (err) {
            console.error(err);
        }
    };

    const renderComments = (commentList) => {
        return commentList.map((comment) => (
            <div key={comment.id} className="group">
                <div className="flex flex-col">
                    <header className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {comment.user[0].toUpperCase()}
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">{comment.user}</h4>
                            <span className="text-[10px] text-slate-400 font-medium"> {new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                    </header>

                    <div className="pl-9">
                        <p className="text-[15px] leading-relaxed text-slate-700 mb-4 whitespace-pre-wrap">
                            {comment.content}
                        </p>

                        <footer className="flex items-center gap-6 mb-8">
                            <button onClick={() => handleReplyClick(comment)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Reply</button>
                            {(user?.username === comment.user || user?.role === "ADMIN") && (
                                <button onClick={() => confirmDelete(comment.id)} className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-rose-600 transition-colors flex items-center gap-1">Delete</button>
                            )}
                        </footer>

                        {comment.replies && comment.replies.length > 0 && (
                            <div className="space-y-12 border-l border-slate-100 pl-8 ml-1 mb-8">
                                {renderComments(comment.replies)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ));
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
                        ref={inputRef} // Added ref here
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={token ? "Join the discussion..." : "Authentication required to post."}
                        disabled={!token}
                        className="w-full bg-transparent py-4 outline-none text-[15px] text-slate-800 placeholder:text-slate-300 min-h-[80px] resize-none"
                    />
                    {token && (
                        <div className="flex justify-end pb-3">
                            <button type="submit" disabled={isSubmitting} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-blue-600 disabled:text-slate-300 transition-colors flex items-center gap-2">
                                {isSubmitting ? "Sending..." : <>Publish Dispatch <Send className="w-3 h-3" /></>}
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
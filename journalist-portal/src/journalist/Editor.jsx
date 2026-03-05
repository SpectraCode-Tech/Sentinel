import React, { useEffect, useState } from "react";
import {
    Type, Image as ImageIcon, FileEdit, Plus, Save,
    Globe, X, UploadCloud, Send, ChevronLeft
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"; // Import for navigation
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";


export default function JournalistEditor() {
    const navigate = useNavigate(); // Hook for dashboard redirection
    const { id } = useParams(); // Hook for getting article ID from URL
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load categories & tags
    useEffect(() => {
        API.get("/articles/categories/")
            .then(res => setCategories(res.data))
            .catch(() => { });

        API.get("/articles/tags/")
            .then(res => setTags(res.data))
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (id) {
            API.get(`/articles/articles/${id}/`)
                .then(res => {
                    setTitle(res.data.title);
                    setExcerpt(res.data.excerpt);
                    setContent(res.data.content);
                    setSelectedCategory(res.data.category || "");
                    setSelectedTags(res.data.tags);
                })
                .catch(err => console.error(err));
        }
    }, [id]);

    const handleTagToggle = (id) => {
        setSelectedTags(prev =>
            prev.includes(id)
                ? prev.filter(tag => tag !== id)
                : [...prev, id]
        );
    };
    // Updated Submit Function
    const handleSubmit = async (status) => {
        // Validation check
        if (!title || !content) {
            toast.error("Please provide a title and content before saving.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading(status === 'draft' ? "Saving draft..." : "Submitting for review...");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("excerpt", excerpt);
        formData.append("content", content);
        formData.append("category", selectedCategory);
        formData.append("status", status);

        selectedTags.forEach(tag => formData.append("tags", tag));
        if (image) {
            formData.append("image", image);
        }

        try {
            if (id) {
                await API.put(`/articles/articles/${id}/`, formData);
            } else {
                await API.post("articles/articles/", formData);
            }

            // 1. Show Success Toast
            toast.success(
                status === 'draft' ? "Article saved as draft!" : "Article submitted for review!",
                { id: loadingToast }
            );

            // 2. Redirect back to the articles view
            // We use a slight delay for 'review' so the user sees the success message, 
            // but for 'draft' we can go back almost immediately.
            const delay = status === 'review' ? 2000 : 1000;

            setTimeout(() => {
                navigate("/journalist/articles"); // Ensure this matches your route path
            }, delay);

        } catch (error) {
            console.error(error);
            toast.error("Failed to save article. Please try again.", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Top sticky bar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3">
                <div className="max-w-350 mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/journalist")}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900 group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        {/* ... Studio Logo ... */}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={isSubmitting}
                            onClick={() => handleSubmit('draft')} // ✅ Passes 'draft'
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Save Draft
                        </button>

                        <button
                            disabled={isSubmitting}
                            onClick={() => handleSubmit('review')} // ✅ Passes 'review'
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" /> Submit for Review
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-350 mx-auto flex flex-col lg:flex-row">
                <main className="flex-1 bg-white min-h-screen p-8 md:p-16 border-r border-slate-100">
                    <div className="max-w-3xl mx-auto">
                        <input
                            type="text"
                            placeholder="Breaking News Title..."
                            className="w-full text-5xl font-black mb-6 outline-none border-none placeholder:text-slate-100 tracking-tight"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            placeholder="Write a compelling hook..."
                            className="w-full min-h-25 mb-8 text-xl text-slate-500 font-medium leading-relaxed outline-none border-none resize-none placeholder:text-slate-200"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                        />

                        <textarea
                            placeholder="Tell your story..."
                            className="w-full min-h-150 text-lg leading-[1.8] text-slate-700 placeholder:text-slate-200 outline-none border-none resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </main>

                <aside className="w-full lg:w-80 p-8 bg-[#F8FAFC] h-auto lg:sticky lg:top-16.25 lg:h-[calc(100vh-65px)] overflow-y-auto">
                    <div className="space-y-10">
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Publish Settings</h3>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 tracking-widest">Department</label>
                            <select
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Uncategorized</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 tracking-widest">Keywords</label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagToggle(tag.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${selectedTags.includes(tag.id)
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                            }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 tracking-widest">Cover Media</label>
                            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-colors cursor-pointer group">
                                {image ? (
                                    <div className="flex flex-col items-center text-center p-2">
                                        <div className="p-2 bg-emerald-50 rounded-full mb-1">
                                            <ImageIcon className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-37.5">{image.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 mb-2 transition-colors" />
                                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors uppercase">Upload Image</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                                {image && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); setImage(null); }}
                                        className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </label>
                        </div>
                    </div>
                </aside>
            </div>

            {content.length > 0 && (
                <div className="fixed bottom-6 left-6 z-60 bg-slate-900 shadow-2xl px-4 py-2 rounded-full text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    {content.split(/\s+/).filter(Boolean).length} Words Written
                </div>
            )}
        </div>
    );
}
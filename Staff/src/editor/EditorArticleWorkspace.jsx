import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
    Save, CheckCircle, XCircle, ArrowLeft,
    Layout, Tag, Eye, Type, Image as ImageIcon, Upload, Trash2, Layers
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function EditorArticleWorkspace() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [allTags, setAllTags] = useState([]);
    const [categories, setCategories] = useState([]); // State for categories
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch article, tags, and categories in parallel
        Promise.all([
            api.get(`/articles/articles/${id}/`),
            api.get(`/articles/tags/`),
            api.get(`/articles/categories/`) // Ensure this endpoint matches your urls.py
        ])
            .then(([articleRes, tagsRes, catRes]) => {
                setArticle(articleRes.data);
                setAllTags(tagsRes.data);
                setCategories(catRes.data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Initialization failed");
                navigate("/editor/reviews");
            });
    }, [id, navigate]);

    const toggleTag = (tagName) => {
        const isSelected = article.tags.includes(tagName);
        const updatedTags = isSelected
            ? article.tags.filter(t => t !== tagName)
            : [...article.tags, tagName];
        setArticle({ ...article, tags: updatedTags });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
            setArticle({ ...article, image: file, imagePreview: URL.createObjectURL(file) });
        }
    };

    const handleUpdate = async (newStatus = null) => {
        const loadingToast = toast.loading("Syncing with Sentinel...");
        const formData = new FormData();

        // Cleanse and Append Data
        Object.keys(article).forEach(key => {
            if (key === 'tags') {
                article.tags.forEach(tag => formData.append('tags', tag));
            } else if (key === 'image') {
                if (article.image instanceof File) {
                    formData.append('image', article.image);
                }
            } else if (key === 'category') {
                // Send only the ID to the backend
                const catId = article.category?.id || article.category;
                if (catId) formData.append('category', catId);
            } else if (!['imagePreview', 'author_name', 'category_name'].includes(key)) {
                // Avoid sending read-only frontend helpers
                formData.append(key, article[key] || "");
            }
        });

        if (newStatus) formData.set('status', newStatus);

        try {
            await api.patch(`/articles/articles/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(newStatus ? `Article ${newStatus}` : "Changes saved", { id: loadingToast });
            if (newStatus) navigate("/editor/reviews");
        } catch (err) {
            console.error(err);
            toast.error("Save failed. Check terminal for 500 details.", { id: loadingToast });
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse">LOADING WORKSPACE...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Toaster />

            {/* Top Toolbar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm">
                        <ArrowLeft className="w-4 h-4" /> Exit Editor
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={() => handleUpdate()} className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all">
                            <Save className="w-4 h-4" /> Save Draft
                        </button>
                        <button onClick={() => handleUpdate('published')} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-black text-sm rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                            <CheckCircle className="w-4 h-4" /> Publish
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Image Section */}
                    <div className="relative group rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 aspect-video flex items-center justify-center">
                        {article.image || article.imagePreview ? (
                            <>
                                <img src={article.imagePreview || article.image} className="w-full h-full object-cover" alt="Hero" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <label className="cursor-pointer bg-white p-3 rounded-full hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5 text-indigo-600" />
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                    <button onClick={() => setArticle({ ...article, image: null, imagePreview: null })} className="bg-white p-3 rounded-full hover:scale-110 transition-transform text-rose-600">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                <ImageIcon className="w-12 h-12" />
                                <span className="font-bold text-sm">Upload Cover Image</span>
                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        )}
                    </div>

                    <input
                        type="text"
                        value={article.title}
                        onChange={(e) => setArticle({ ...article, title: e.target.value })}
                        className="w-full bg-transparent text-4xl font-black text-slate-900 border-none focus:ring-0"
                        placeholder="Article Title..."
                    />

                    <textarea
                        value={article.excerpt || ""}
                        onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                        className="w-full min-h-25 bg-white border border-slate-200 rounded-2xl p-4 text-sm italic outline-none"
                        placeholder="Excerpt..."
                    />

                    <textarea
                        value={article.content}
                        onChange={(e) => setArticle({ ...article, content: e.target.value })}
                        className="w-full min-h-125 bg-white border border-slate-200 rounded-3xl p-8 text-lg text-slate-700 outline-none"
                        placeholder="Content..."
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        {/* Category Selector */}
                        <div>
                            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest mb-4">
                                <Layers className="w-4 h-4" /> Category
                            </h3>
                            <select
                                value={article.category?.id || article.category || ""}
                                onChange={(e) => setArticle({ ...article, category: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tag Selector */}
                        <div className="pt-4 border-t border-slate-50">
                            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest mb-4">
                                <Tag className="w-4 h-4" /> Tags
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-62.5 overflow-y-auto pr-2 custom-scrollbar">
                                {allTags.map(tag => {
                                    const isSelected = article.tags.includes(tag.name);
                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.name)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${isSelected
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                                : "bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200"
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
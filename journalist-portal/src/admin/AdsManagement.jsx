import React, { useEffect, useState } from "react";
import {
    Plus, Search, MoreHorizontal, AlertCircle,
    Image as ImageIcon, Calendar, Link as LinkIcon,
    Menu, X, Layout, Trash2
} from "lucide-react";

import api, { fetchAds, toggleAdStatus, deleteAd } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import AdminSidebar from "./Sidebar";

const AdsManagement = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- NEW STATE FOR DYNAMIC PLACEMENTS ---
    const [placementOptions, setPlacementOptions] = useState([]);

    const initialFormState = {
        title: "",
        image: null,
        link: "",
        placement: "", // Set empty initially so it can take the first fetched option
        start_date: "",
        end_date: "",
        priority: 0,
        target_page: "all",
        is_active: true
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH PLACEMENTS FROM BACKEND ---
    const loadPlacements = async () => {
        try {
            const res = await api.get("/ads/advertisements/placements/");
            setPlacementOptions(res.data);

            // Set default placement value if current formData.placement is empty
            if (res.data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    placement: prev.placement || res.data[0].value
                }));
            }
        } catch (err) {
            console.error("Failed to load placement options", err);
        }
    };

    const loadAds = async () => {
        try {
            setLoading(true);
            const res = await fetchAds();
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setAds(data);
        } catch (err) {
            toast.error("Failed to sync ad dispatches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAds();
        loadPlacements(); // Load dynamic dropdown on mount
    }, []);

    const handleImageChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const toastId = toast.loading("Deploying campaign...");

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("link", formData.link);
            data.append("placement", formData.placement);
            data.append("priority", formData.priority);
            data.append("is_active", formData.is_active);
            data.append("target_page", formData.target_page);

            if (formData.image) data.append("image", formData.image);
            if (formData.start_date) data.append("start_date", formData.start_date);
            if (formData.end_date) data.append("end_date", formData.end_date);

            await api.post("/ads/advertisements/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Campaign deployed", { id: toastId });
            setIsDrawerOpen(false);

            // Reset form and maintain the default placement
            setFormData({
                ...initialFormState,
                placement: placementOptions[0]?.value || ""
            });
            loadAds();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to create campaign", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (ad) => {
        try {
            await toggleAdStatus(ad.id, !ad.is_active);
            toast.success("Ad status updated");
            loadAds();
        } catch {
            toast.error("Failed to update ad");
        }
    };

    const handleDelete = async (adId) => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;

        const toastId = toast.loading("Removing campaign...");
        try {
            await deleteAd(adId);
            toast.success("Campaign deleted", { id: toastId });
            setAds(prev => prev.filter(ad => ad.id !== adId));
        } catch (error) {
            toast.error("Failed to delete campaign", { id: toastId });
        }
    };

    const filteredAds = ads.filter(ad =>
        ad?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad?.placement?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            <Toaster position="top-right" />
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 bg-white border-b flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900">Sentinel Ads</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Ad Dispatches</h1>
                            <p className="text-slate-500 mt-1 font-medium">Manage and deploy promotional creative assets</p>
                        </div>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            New Campaign
                        </button>
                    </header>

                    {/* Search Bar */}
                    <div className="relative mb-8 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title or placement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-14 bg-white rounded-2xl border border-slate-100 outline-none focus:border-indigo-500 transition-all text-sm shadow-sm"
                        />
                    </div>

                    {/* Ads List */}
                    <div className="grid gap-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                        ) : filteredAds.length > 0 ? (
                            filteredAds.map(ad => (
                                <div key={ad.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                            {ad.image ? <img src={ad.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight mb-1">{ad.title}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-400 font-medium uppercase tracking-tighter">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600">{ad.placement}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {ad.start_date ? new Date(ad.start_date).toLocaleDateString() : "No date"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => toggleStatus(ad)}
                                            className={`px-3 py-1 rounded-lg text-[10px] tracking-widest font-black uppercase transition-colors ${ad.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                        >
                                            {ad.is_active ? 'Active' : 'Paused'}
                                        </button>
                                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                            <a href={ad.link} target="_blank" rel="noreferrer" className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-all"><LinkIcon className="w-4 h-4" /></a>
                                            <button
                                                onClick={() => handleDelete(ad.id)}
                                                className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white hover:text-slate-900 rounded-lg text-slate-400 transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">No campaign dispatches found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Overlay */}
            {isDrawerOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />
            )}

            {/* Form Drawer */}
            <aside className={`fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">New Campaign</h2>
                            <p className="text-xs text-slate-500 font-medium">Configure your ad asset and visibility</p>
                        </div>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Title</label>
                            <input
                                placeholder="Summer Sale 2024..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Creative Image</label>
                            <div className="relative group">
                                <input type="file" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center group-hover:border-indigo-300 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                                    <p className="text-xs font-bold text-slate-400">Click to upload or drag image</p>
                                    {formData.image && <p className="mt-2 text-[10px] text-indigo-600 font-bold truncate max-w-[200px]">{formData.image.name}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement</label>
                                <select
                                    value={formData.placement}
                                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500"
                                >
                                    {/* --- DYNAMIC MAPPING --- */}
                                    {placementOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    placeholder="https://example.com/promo"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule Start</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 text-xs font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule End</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500 text-xs font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl transition-all mt-4 ${submitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 shadow-indigo-100'}`}
                        >
                            {submitting ? "Deploying..." : "Deploy Campaign"}
                        </button>
                    </form>
                </div>
            </aside>
        </div>
    );
};

export default AdsManagement;
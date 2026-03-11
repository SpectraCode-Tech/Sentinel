import React, { useEffect, useState, useCallback } from "react";
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
    const [placementOptions, setPlacementOptions] = useState([]);

    // Track if we are editing an existing ad
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        title: "",
        image: null,
        link: "",
        placement: "",
        start_date: "",
        end_date: "",
        priority: 0,
        target_page: "all",
        is_active: true
    };

    const [formData, setFormData] = useState(initialFormState);

    const loadPlacements = useCallback(async () => {
        try {
            const res = await api.get("/ads/advertisements/placements/");
            setPlacementOptions(res.data);
            if (res.data.length > 0 && !editingId) {
                setFormData(prev => ({ ...prev, placement: res.data[0].value }));
            }
        } catch (err) {
            console.error("Failed to load placement options", err);
        }
    }, [editingId]);

    const loadAds = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAds();
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setAds(data);
        } catch (err) {
            toast.error("Failed to sync ads");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAds();
        loadPlacements();
    }, [loadAds, loadPlacements]);

    const handleEditClick = (ad) => {
        setEditingId(ad.id);
        setFormData({
            title: ad.title || "",
            link: ad.link || "",
            placement: ad.placement || "",
            // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
            start_date: ad.start_date ? ad.start_date.substring(0, 16) : "",
            end_date: ad.end_date ? ad.end_date.substring(0, 16) : "",
            priority: ad.priority || 0,
            target_page: ad.target_page || "all",
            is_active: ad.is_active,
            image: null // Keep null unless user chooses a new file
        });
        setIsDrawerOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData({
            ...initialFormState,
            placement: placementOptions[0]?.value || ""
        });
        setIsDrawerOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.start_date && formData.end_date) {
            if (new Date(formData.end_date) <= new Date(formData.start_date)) {
                toast.error("The end date must be after the start date.");
                return;
            }
        }

        setSubmitting(true);
        const toastId = toast.loading(editingId ? "Updating Ad..." : "Deploying Ad...");

        try {
            let processedLink = formData.link.trim();
            if (processedLink && !/^https?:\/\//i.test(processedLink)) {
                processedLink = `https://${processedLink}`;
            }

            const data = new FormData();
            data.append("title", formData.title);
            data.append("link", processedLink);
            data.append("placement", formData.placement);
            data.append("priority", formData.priority);
            data.append("is_active", formData.is_active ? "true" : "false");
            data.append("target_page", formData.target_page);

            if (formData.image) data.append("image", formData.image);
            if (formData.start_date) data.append("start_date", formData.start_date);
            if (formData.end_date) data.append("end_date", formData.end_date);

            if (editingId) {
                await api.patch(`/ads/advertisements/${editingId}/`, data);
                toast.success("Ad updated", { id: toastId });
            } else {
                await api.post("/ads/advertisements/", data);
                toast.success("Ad deployed", { id: toastId });
            }

            setIsDrawerOpen(false);
            loadAds();
        } catch (error) {
            const errorMsg = error.response?.data?.link?.[0] || "Check your submission";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (e, ad) => {
        e.stopPropagation(); // Stop card click
        try {
            await toggleAdStatus(ad.id, !ad.is_active);
            toast.success("Status updated");
            loadAds();
        } catch {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (e, adId) => {
        e.stopPropagation(); // Stop card click
        if (!window.confirm("Delete this ad?")) return;
        const toastId = toast.loading("Removing...");
        try {
            await deleteAd(adId);
            toast.success("Deleted", { id: toastId });
            setAds(prev => prev.filter(ad => ad.id !== adId));
        } catch {
            toast.error("Delete failed", { id: toastId });
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
                <div className="lg:hidden p-4 bg-white border-b flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold">Sentinel Ads</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Advertisements</h1>
                            <p className="text-slate-500 mt-1 font-medium">Manage and deploy promotional assets</p>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Advertisement
                        </button>
                    </header>

                    <div className="relative mb-8 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500" />
                        <input
                            type="text"
                            placeholder="Search by title or placement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-14 bg-white rounded-2xl border border-slate-100 outline-none focus:border-indigo-500 shadow-sm"
                        />
                    </div>

                    <div className="grid gap-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                        ) : filteredAds.length > 0 ? (
                            filteredAds.map(ad => (
                                <div
                                    key={ad.id}
                                    onClick={() => handleEditClick(ad)}
                                    className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-62.5">
                                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                            {ad.image ? <img src={ad.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight mb-1">{ad.title}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-400 font-medium uppercase">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600">{ad.placement}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 text-[10px]">
                                                    <Calendar className="w-3 h-3" />
                                                    {ad.start_date ? new Date(ad.start_date).toLocaleDateString() : "No date"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        <button
                                            onClick={(e) => toggleStatus(e, ad)}
                                            className={`px-3 py-1 rounded-lg text-[10px] tracking-widest font-black uppercase ${ad.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                                        >
                                            {ad.is_active ? 'Active' : 'Paused'}
                                        </button>
                                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                            <a
                                                href={ad.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 hover:text-indigo-600 rounded-lg text-slate-400"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={(e) => handleDelete(e, ad.id)}
                                                className="p-2 hover:text-rose-600 rounded-lg text-slate-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">No advertisements found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isDrawerOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />
            )}

            <aside className={`fixed right-0 top-0 h-full w-full sm:w-110 bg-white shadow-2xl z-50 transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">{editingId ? "Edit Advertisement" : "New Advertisement"}</h2>
                            <p className="text-xs text-slate-500 font-medium">Configure your ad detail and visibility</p>
                        </div>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ad Title</label>
                            <input
                                placeholder="Summer Sale 2024..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Banner Image {editingId && "(Optional)"}</label>
                            <div className="relative group">
                                <input type="file" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center group-hover:border-indigo-300 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                                    <p className="text-xs font-bold text-slate-400 text-center">
                                        {formData.image ? formData.image.name : "Click to upload or drag image"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement</label>
                                <select
                                    value={formData.placement}
                                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none"
                                >
                                    {placementOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    placeholder="example.com"
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none"
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
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule End</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    min={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Visibility</label>
                                <select
                                    value={formData.target_page}
                                    onChange={(e) => setFormData({ ...formData, target_page: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 outline-none font-medium"
                                >
                                    <option value="all">Everywhere</option>
                                    <option value="home">Home Page</option>
                                    <option value="news_detail">Article Detail</option>
                                    <option value="category">Category/Search</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800">Status</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Active status</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? "bg-indigo-600" : "bg-slate-200"}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${submitting ? 'opacity-50' : 'active:scale-95'}`}
                        >
                            {submitting ? "Processing..." : editingId ? "Update Ad" : "Deploy Ad"}
                        </button>
                    </form>
                </div>
            </aside>
        </div>
    );
};

export default AdsManagement;
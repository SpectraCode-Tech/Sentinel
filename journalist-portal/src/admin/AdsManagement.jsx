import React, { useEffect, useState } from "react";
import {
    BarChart3, Plus, Search, Filter,
    MoreHorizontal, Play, Pause, AlertCircle,
    Image as ImageIcon, Calendar, Link as LinkIcon
} from "lucide-react";
import api, { fetchAds, toggleAdStatus } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import AdminSidebar from "./sidebar";

const AdsManagement = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "", placement: "sidebar", link: "",
        is_active: true, start_date: "", end_date: ""
    });

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

    useEffect(() => { loadAds(); }, []);

    const filteredAds = ads.filter(ad =>
        ad?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            <Toaster position="top-right" />
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <div className="p-6 md:p-10 lg:p-12 overflow-y-auto">

                    {/* Header: Matched to Global Content UI */}
                    <header className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Ad Dispatches
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">Manage and deploy promotional creative assets</p>
                        </div>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> New Campaign
                        </button>
                    </header>

                    {/* Quick Stats: Rounded & Styled like Content UI */}
                    {/* Search Bar: Matched to Content UI style */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or placement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-14 bg-white rounded-2xl border border-slate-100 outline-none focus:border-indigo-500 transition-all text-sm shadow-sm"
                        />
                    </div>

                    {/* Ads List: Card-based UI from Global Content */}
                    <div className="grid gap-4">
                        {filteredAds.length > 0 ? (
                            filteredAds.map(ad => (
                                <div key={ad.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                                        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight mb-1">{ad.title}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-400 font-medium uppercase tracking-tighter">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">{ad.placement}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(ad.start_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        {/* Status Badge */}
                                        <button
                                            onClick={() => {/* Toggle Logic */ }}
                                            className={`px-3 py-1 rounded-lg text-[10px] tracking-widest font-black uppercase transition-colors ${ad.is_active
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                }`}
                                        >
                                            {ad.is_active ? 'Active' : 'Paused'}
                                        </button>

                                        {/* Action Group */}
                                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                            <a href={ad.link} target="_blank" rel="noreferrer" className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-all">
                                                <LinkIcon className="w-5 h-5" />
                                            </a>
                                            <button className="p-2 hover:bg-white hover:text-slate-900 rounded-lg text-slate-400 transition-all">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
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
            {/* Drawer implementation remains the same but styled to match */}
        </div>
    );
};

export default AdsManagement;
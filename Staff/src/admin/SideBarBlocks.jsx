import React, { useState, useEffect } from "react";
import { Layout, Eye, EyeOff, Edit2, Trash2, Plus, Loader2, X, AlertTriangle, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { useNavigate } from "react-router-dom"; // Added useNavigate
import toast from "react-hot-toast";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function SidebarBlocksManagement() {
    const navigate = useNavigate(); // Initialize navigation
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        block_type: "html",
        content: "",
        order: 0,
        is_active: true
    });

    const blockOptions = [
        { value: "ad", label: "Advertisement" },
        { value: "html", label: "Custom HTML" },
        { value: "trending", label: "Trending Articles" },
        { value: "recommended", label: "Recommended For You" },
    ];

    useEffect(() => { fetchBlocks(); }, []);

    const fetchBlocks = async () => {
        try {
            const res = await api.get("/ads/sidebar-blocks/");
            setBlocks(res.data);
        } catch (err) {
            toast.error("Failed to load blocks");
        } finally { setLoading(false); }
    };

    const handleOpenModal = (block = null) => {
        if (block) {
            setEditingId(block.id);
            setFormData({
                title: block.title,
                block_type: block.block_type,
                content: block.content || "",
                order: block.order,
                is_active: block.is_active
            });
        } else {
            setEditingId(null);
            setFormData({ title: "", block_type: "html", content: "", order: 0, is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingId ? "Updating block..." : "Creating block...");

        try {
            if (editingId) {
                const res = await api.put(`/ads/sidebar-blocks/${editingId}/`, formData);
                setBlocks(prev => prev.map(b => b.id === editingId ? res.data : b));
                toast.success("Block updated successfully!", { id: toastId });
            } else {
                const res = await api.post("/ads/sidebar-blocks/", formData);
                setBlocks(prev => [...prev, res.data]);
                toast.success("Block created successfully!", { id: toastId });
            }
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Action failed. Please try again.", { id: toastId });
        }
    };

    const handleDeleteRequest = (id) => {
        Swal.fire({
            title: "Delete this block?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e11d48",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                executeDelete(id);
            }
        });
    };

    const executeDelete = async (id) => {
        const toastId = toast.loading("Deleting...");
        try {
            await api.delete(`/ads/sidebar-blocks/${id}/`);
            setBlocks((prevBlocks) => prevBlocks.filter(b => b.id !== id));
            toast.success("Deleted successfully", { id: toastId });
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Delete failed", { id: toastId });
        }
    };

    const toggleStatus = async (block) => {
        const toastId = toast.loading("Updating status...");
        try {
            const updatedStatus = !block.is_active;
            await api.patch(`/ads/sidebar-blocks/${block.id}/`, { is_active: updatedStatus });
            setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, is_active: updatedStatus } : b));
            toast.success(`Block ${updatedStatus ? 'visible' : 'hidden'}`, { id: toastId });
        } catch (err) {
            toast.error("Update failed", { id: toastId });
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Layout className="w-6 md:w-8 h-8 text-indigo-600" />
                        Sidebar Blocks
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Configure layout components and advertisements</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-5 h-5" /> New Block
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Block' : 'Create New Block'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
                                    <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Sponsored Ad" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Type</label>
                                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.block_type} onChange={(e) => setFormData({ ...formData, block_type: e.target.value })}>
                                        {blockOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Sort Order</label>
                                    <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            {(formData.block_type === 'html' || formData.block_type === 'ad') && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Content</label>
                                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="HTML or Script tags..." />
                                </div>
                            )}

                            <div className="flex items-center gap-2 py-2">
                                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500" />
                                <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">Show on frontend</label>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                {editingId ? 'Update Block' : 'Save Block'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Table / Cards */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Order</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {blocks.map((block) => (
                                <tr key={block.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-400 text-sm">#{block.order}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{block.title}</div>
                                        <div className="text-[10px] text-slate-400">ID: {block.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                            {block.block_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${block.is_active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${block.is_active ? "bg-emerald-500" : "bg-rose-400"}`}></span>
                                            {block.is_active ? "Active" : "Hidden"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => toggleStatus(block)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200 transition-all" title="Toggle Visibility">
                                                {block.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => handleOpenModal(block)} className="p-2 hover:bg-white rounded-lg text-indigo-500 border border-transparent hover:border-slate-200 transition-all" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteRequest(block.id)} className="p-2 hover:bg-white rounded-lg text-rose-500 border border-transparent hover:border-slate-200 transition-all" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden divide-y divide-slate-100">
                    {blocks.map((block) => (
                        <div key={block.id} className="p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order #{block.order}</div>
                                    <h3 className="font-bold text-slate-900">{block.title}</h3>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">
                                        {block.block_type}
                                    </span>
                                </div>
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${block.is_active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                    {block.is_active ? "Visible" : "Hidden"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleStatus(block)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 rounded-xl text-slate-600 text-xs font-bold border border-slate-200">
                                    {block.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {block.is_active ? "Hide" : "Show"}
                                </button>
                                <button onClick={() => handleOpenModal(block)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 rounded-xl text-indigo-600 text-xs font-bold border border-indigo-100">
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                                <button onClick={() => handleDeleteRequest(block.id)} className="p-2.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {blocks.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mt-4">
                    <p className="text-slate-500 font-medium italic">No sidebar blocks have been added yet.</p>
                </div>
            )}
        </div>
    );
}
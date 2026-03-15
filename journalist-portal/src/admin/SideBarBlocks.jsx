import React, { useState, useEffect } from "react";
import { Layout, Eye, EyeOff, Edit2, Trash2, Plus, GripVertical, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function SidebarBlocksManagement() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
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
            const res = await api.get("/sidebar-blocks/");
            setBlocks(res.data);
        } catch (err) {
            toast.error("Failed to load blocks");
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/sidebar-blocks/", formData);
            setBlocks([...blocks, res.data]);
            toast.success("Block created successfully!");
            setIsModalOpen(false);
            setFormData({ title: "", block_type: "html", content: "", order: 0, is_active: true });
        } catch (err) {
            toast.error("Error creating block. Check your inputs.");
        }
    };

    const toggleStatus = async (block) => {
        try {
            const updatedStatus = !block.is_active;
            await api.patch(`/sidebar-blocks/${block.id}/`, { is_active: updatedStatus });
            setBlocks(blocks.map(b => b.id === block.id ? { ...b, is_active: updatedStatus } : b));
            toast.success("Status updated");
        } catch (err) { toast.error("Update failed"); }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        <div className="p-6 lg:p-10 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Layout className="w-8 h-8 text-indigo-600" />
                        Sidebar Block Management
                    </h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all"
                >
                    <Plus className="w-5 h-5" /> New Sidebar Block
                </button>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Create New Block</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    required
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Weekly Trending"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Block Type</label>
                                <select
                                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none"
                                    value={formData.block_type}
                                    onChange={(e) => setFormData({ ...formData, block_type: e.target.value })}
                                >
                                    {blockOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {(formData.block_type === 'html' || formData.block_type === 'ad') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Content (HTML or URL)</label>
                                    <textarea
                                        className="w-full p-2.5 border border-slate-200 rounded-lg h-24 outline-none"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Enter your HTML code or script here..."
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border border-slate-200 rounded-lg outline-none"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-end pb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Active</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all mt-4">
                                Save Sidebar Block
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Your Existing Table Code Here... */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Order</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Block Details</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {blocks.map((block) => (
                            <tr key={block.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4" />
                                        {block.order}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{block.title}</div>
                                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                                        ID: {block.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {block.block_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${block.is_active
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-rose-50 text-rose-500"
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${block.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-400"}`}></span>
                                        {block.is_active ? "Active" : "Hidden"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => toggleStatus(block)}
                                            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-500 transition-all"
                                            title={block.is_active ? "Hide" : "Show"}
                                        >
                                            {block.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-indigo-500">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(block.id)}
                                            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-rose-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
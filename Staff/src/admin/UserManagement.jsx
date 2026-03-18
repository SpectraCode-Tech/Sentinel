import React, { useEffect, useState } from "react";
import API from "../api/axios";
import {
    Shield,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Mail,
    Calendar,
    ArrowLeft,
    UserPlus,
    X,
    Eye,
    EyeOff,
    Search,
    AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userArticles, setUserArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminPass, setShowAdminPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null); // New state for delete modal

    // Form States
    const [adminPassword, setAdminPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for deletion

    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        password: "",
        role: "JOURNALIST",
        first_name: "",
        last_name: ""
    });

    const navigate = useNavigate();

    const capitalize = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchUsers = async () => {
        try {
            const res = await API.get("admin/users/");
            const journalistsOnly = res.data.filter(
                user => user.role?.toUpperCase() === "JOURNALIST"
            );
            setUsers(journalistsOnly);
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await API.post("admin/users/", newUser);
            toast.success("Journalist account created!");
            setShowCreateModal(false);
            setNewUser({
                username: "", email: "", password: "",
                role: "JOURNALIST", first_name: "", last_name: ""
            });
            fetchUsers();
        } catch (err) {
            const errorData = err.response?.data;
            const serverMsg = typeof errorData === 'object'
                ? Object.values(errorData).flat()[0]
                : errorData?.detail;
            toast.error(serverMsg || "Creation failed");
        } finally {
            setIsCreating(false);
        }
    };

    const changeUserPassword = async () => {
        if (!adminPassword || !newPassword) return toast.error("All fields required");
        setIsChangingPassword(true);
        try {
            await API.post(`admin/users/${selectedUser.id}/change-password/`, {
                admin_password: adminPassword,
                new_password: newPassword,
            });
            toast.success("Password updated successfully");
            setAdminPassword("");
            setNewPassword("");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Update failed");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setUserArticles([]);
        setLoadingArticles(true);
        setIsMobileView(true);

        API.get(`articles/?author=${user.id}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data.results || [];
                setUserArticles(data);
            })
            .catch(() => setUserArticles([]))
            .finally(() => setLoadingArticles(false));
    };

    const updateRole = async (id, newRole) => {
        const loadingToast = toast.loading("Updating role...");
        try {
            await API.patch(`admin/users/${id}/`, { role: newRole });
            toast.success("Role updated", { id: loadingToast });
            fetchUsers();
            if (newRole !== "JOURNALIST") {
                setSelectedUser(null);
                setIsMobileView(false);
            }
        } catch (err) { toast.error("Update failed", { id: loadingToast }); }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await API.patch(`admin/users/${id}/`, { is_active: !currentStatus });
            toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
            setSelectedUser(prev => ({ ...prev, is_active: !currentStatus }));
        } catch (err) { toast.error("Status update failed"); }
    };

    // Updated Delete Logic
    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await API.delete(`admin/users/${userToDelete.id}/`);
            toast.success("User removed");
            setSelectedUser(null);
            setIsMobileView(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            toast.error("Deletion failed");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden relative">
            <Toaster position="top-right" />

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {userToDelete && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transition-all">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">Confirm Delete</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Are you sure you want to permanently remove <span className="font-bold text-slate-800">@{userToDelete.username}</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100">
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="flex-1 px-4 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CREATE USER MODAL --- */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
                            <h2 className="text-xl font-black text-slate-900">New Journalist</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">First Name</label>
                                    <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Last Name</label>
                                    <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label>
                                <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
                                <input type="email" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-12"
                                        value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button disabled={isCreating} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- LEFT SIDEBAR --- */}
            <div className={`${isMobileView ? 'hidden' : 'flex'} md:flex w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex-col`}>
                <div className="p-6 border-b border-slate-100">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 text-sm font-semibold group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
                    </button>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-black text-slate-900">Journalists</h1>
                        <button onClick={() => setShowCreateModal(true)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.id} onClick={() => handleUserClick(user)} className={`w-full flex items-center gap-4 p-4 cursor-pointer border-b border-slate-50 transition-all ${selectedUser?.id === user.id ? "bg-indigo-50 border-r-4 border-r-indigo-600" : "hover:bg-slate-50"}`}>
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold ${selectedUser?.id === user.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate capitalize">{user.username}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user.role?.toLowerCase()}</p>
                                </div>
                                <ChevronRight className={`w-4 h-4 shrink-0 ${selectedUser?.id === user.id ? "text-indigo-600" : "text-slate-300"}`} />
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-slate-400 text-sm">
                            No journalists found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT CONTENT --- */}
            <div className={`${isMobileView ? 'flex' : 'hidden'} md:flex flex-1 flex-col overflow-y-auto bg-white`}>
                {selectedUser ? (
                    <div className="max-w-4xl mx-auto w-full p-4 md:p-10">
                        <button onClick={() => setIsMobileView(false)} className="md:hidden flex items-center gap-2 text-indigo-600 font-bold mb-6">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </button>

                        <header className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex gap-6 w-full lg:w-auto">
                                <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shrink-0">
                                    {selectedUser.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-black text-slate-900 truncate capitalize">
                                        {selectedUser.username}
                                    </h2>
                                    <div className="space-y-1 mt-2 text-slate-500 text-sm">
                                        <div className="flex items-center gap-2 truncate"><Mail className="w-4 h-4 shrink-0" /> {selectedUser.email}</div>
                                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined {new Date(selectedUser.date_joined).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full sm:w-64 space-y-4">
                                <select value={selectedUser.role} onChange={(e) => updateRole(selectedUser.id, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none cursor-pointer">
                                    <option value="JOURNALIST">Journalist</option>
                                    <option value="EDITOR">Editor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleActive(selectedUser.id, selectedUser.is_active)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${selectedUser.is_active ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-rose-100 text-rose-600 hover:bg-rose-200"}`}>
                                        {selectedUser.is_active ? "Active" : "Suspended"}
                                    </button>
                                    <button
                                        onClick={() => setUserToDelete(selectedUser)}
                                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="text-xs font-black text-slate-400 uppercase mb-3">Reset Password</h4>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input type={showAdminPass ? "text" : "password"} placeholder="Your Admin Pass" className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none pr-8"
                                                value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                                            <button type="button" onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                                {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input type={showNewPass ? "text" : "password"} placeholder="New User Pass" className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none pr-8"
                                                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <button onClick={changeUserPassword} disabled={isChangingPassword} className="w-full bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                            {isChangingPassword ? "..." : "Confirm Update"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 px-2"><FileText className="w-5 h-5 text-indigo-600" /> Article History</h3>
                        {loadingArticles ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-300" /></div>
                        ) : userArticles.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {userArticles.map((article) => (
                                    <div key={article.id} onClick={() => navigate(`/admin/articles/${article.id}`)} className="group bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all flex justify-between items-center cursor-pointer">
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 truncate">{article.title}</h4>
                                            <div className="mt-1 flex gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                                <span className={article.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}>{article.status}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 font-medium">No articles found.</div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 p-10 text-center">
                        <Shield className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-medium max-w-xs text-slate-400">Select a journalist to manage their profile and view history</p>
                    </div>
                )}
            </div>
        </div>
    );
}
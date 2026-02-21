import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Editor() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("access");
    const headers = { Authorization: `Bearer ${token}` };

    // ✅ Fetch categories and tags from backend
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/categories/", { headers })
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));

        axios.get("http://127.0.0.1:8000/tags/", { headers })
            .then(res => setTags(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const formData = () => {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("content", content);
        fd.append("excerpt", excerpt);
        if (image) fd.append("image", image);
        if (selectedCategory) fd.append("category", selectedCategory);
        selectedTags.forEach(tag => fd.append("tags", tag));
        return fd;
    };

    const saveDraft = async () => {
        if (!title || !content) return alert("Title and content required");
        setLoading(true);
        try {
            await axios.post(
                "http://127.0.0.1:8000/articles/",
                formData(),
                { headers: { ...headers, "Content-Type": "multipart/form-data" } }
            );
            alert("Draft saved!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Error saving draft");
        } finally {
            setLoading(false);
        }
    };

    const submitForReview = async () => {
        if (!title || !content) return alert("Title and content required");
        setLoading(true);
        try {
            // 1️⃣ Create the draft first
            const res = await axios.post(
                "http://127.0.0.1:8000/articles/",
                formData(),
                { headers: { ...headers, "Content-Type": "multipart/form-data" } }
            );

            const articleId = res.data.id;

            // 2️⃣ Submit for review
            await axios.post(
                `http://127.0.0.1:8000/articles/${articleId}/submit/`,
                {},
                { headers }
            );

            alert("Submitted for review!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Error submitting for review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Write New Article</h1>

            <input
                className="border p-3 w-full mb-4"
                placeholder="Article Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                className="border p-3 w-full mb-4 h-32"
                placeholder="Excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
            />

            <textarea
                className="border p-3 w-full mb-4 h-64"
                placeholder="Write your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-4"
            />

            <select
                className="border p-2 mb-4 w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="">Select Category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <div className="mb-4">
                <label className="block mb-1">Tags:</label>
                {tags.map(tag => (
                    <label key={tag.id} className="mr-2">
                        <input
                            type="checkbox"
                            value={tag.id}
                            checked={selectedTags.includes(tag.id)}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setSelectedTags(prev =>
                                    prev.includes(value)
                                        ? prev.filter(t => t !== value)
                                        : [...prev, value]
                                );
                            }}
                        />
                        {tag.name}
                    </label>
                ))}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={saveDraft}
                    className="bg-gray-600 text-white px-6 py-2"
                    disabled={loading || !title || !content}
                >
                    {loading ? "Saving..." : "Save Draft"}
                </button>

                <button
                    onClick={submitForReview}
                    className="bg-black text-white px-6 py-2"
                    disabled={loading || !title || !content}
                >
                    {loading ? "Submitting..." : "Submit for Review"}
                </button>
            </div>
        </div>
    );
}
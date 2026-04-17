import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { Loader2, Newspaper } from "lucide-react";
import SocietyPostCard from "../Societies/SocietyPostCard";

export default function ProfileSocietyPosts({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await axios.get(`${API_BASE_URL}/societies/posts/my-feed`, { withCredentials: true });
        if (!cancelled) setPosts(res.data.data || []);
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || "Could not load posts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
        <p className="text-sm">Loading posts from your societies…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50/80 p-6 text-sm text-red-800">
        {err}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a8a]/10 text-[#1e3a8a]">
          <Newspaper size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Society updates</h2>
          <p className="mt-1 text-sm text-gray-500">
            Announcements from societies you belong to. Explore all public posts on the{" "}
            <Link to="/society-posts" className="font-semibold text-[#1e3a8a] underline underline-offset-2">
              community news
            </Link>{" "}
            page.
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          No posts yet from your societies. When managers publish updates, they will show up here.
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((p) => (
            <SocietyPostCard key={p._id} post={p} showSociety />
          ))}
        </div>
      )}
    </div>
  );
}

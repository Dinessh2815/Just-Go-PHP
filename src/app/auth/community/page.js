"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowUp, MessageSquare, Plus, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar"; // Import the Navbar component

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCities();
    fetchPosts();
  }, [selectedCity]);

  const fetchCities = async () => {
    const { data } = await supabase.from("city_tags").select("*").order("name");
    setCities(data || []);
  };

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select(
        "id, title, content, image_url, created_at, likes_count, comments_count, post_cities(city_id, city_tags(id, name))"
      )
      .order("created_at", { ascending: false });

    if (selectedCity) {
      // First, find post IDs that have the selected city
      const { data: filteredPosts } = await supabase
        .from("post_cities")
        .select("post_id, city_tags!inner(name)")
        .eq("city_tags.name", selectedCity);

      if (filteredPosts && filteredPosts.length > 0) {
        const postIds = filteredPosts.map((post) => post.post_id);
        query = query.in("id", postIds);
      } else {
        // If no posts match the city, return empty result
        setPosts([]);
        setLoading(false);
        return;
      }
    }

    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  };

  const refreshPosts = () => {
    fetchPosts();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: "url('/images/image 1@2x.png')" }}
    >
      <div className="min-h-screen bg-black/20">
        {/* Navbar */}
        <Navbar />

        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-white">
              Community Insights
            </h1>
            <button
              onClick={refreshPosts}
              className="text-white hover:text-gray-200 flex items-center gap-1"
            >
              <RefreshCw size={16} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>

          {/* City filters */}
          <div className="glass-effect rounded-lg mb-8 p-3 overflow-x-auto">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setSelectedCity(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCity
                    ? "bg-white text-gray-800"
                    : "bg-white/30 text-white hover:bg-white/40"
                }`}
              >
                All Cities
              </button>
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCity === city.name
                      ? "bg-white text-gray-800"
                      : "bg-white/30 text-white hover:bg-white/40"
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Create post button */}
          <Link
            href="/auth/community/submit"
            className="mb-8 flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            Create Post
          </Link>

          {/* Posts list */}
          <div className="space-y-10">
            {loading ? (
              // Loading skeleton
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/90 rounded-lg shadow animate-pulse mb-16 last:mb-0"
                  >
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-24 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
            ) : posts.length === 0 ? (
              <div className="bg-white/90 rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">
                  No posts yet. Be the first to post!
                </p>
                <Link
                  href="/auth/community/submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Create Post
                </Link>
              </div>
            ) : (
              posts.map((post, index) => (
                <div key={post.id} className="mb-16 last:mb-0">
                  <Link href={`/auth/community/post/${post.id}`}>
                    <div className="bg-white/90 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                      <div className="p-6">
                        {/* Post metadata */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {post.post_cities?.map((pc, i) => (
                              <span
                                key={i}
                                className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium"
                              >
                                {pc.city_tags?.name}
                              </span>
                            ))}
                          </div>
                          <span className="ml-auto">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>

                        {/* Post title */}
                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Post image */}
                        {post.image_url && (
                          <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={post.image_url || "/placeholder.svg"}
                              alt=""
                              className="w-full max-h-80 object-cover"
                            />
                          </div>
                        )}

                        {/* Post content preview */}
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {post.content?.slice(0, 120)}
                          {post.content?.length > 120 && "..."}
                        </p>

                        {/* Post stats */}
                        <div className="flex gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <ArrowUp size={16} />
                            <span>{post.likes_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageSquare size={16} />
                            <span>{post.comments_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

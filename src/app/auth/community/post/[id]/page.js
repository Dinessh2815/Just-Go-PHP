"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowUp,
  Heart,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userLikes, setUserLikes] = useState({ post: false, comments: {} });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postId = Number(id);

        if (isNaN(postId)) {
          router.replace("/community");
          return;
        }

        // Fetch post with explicit inner joins
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(
            `
            *,
            post_cities!inner(
              city_tags!inner(
                name
              )
            )
          `
          )
          .eq("id", postId)
          .single();

        if (postError || !postData) {
          router.replace("/community");
          return;
        }

        // Fetch comments with username
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(
            `
            *,
            profiles(username)
          `
          )
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
        }

        // Check user's likes if they're logged in
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userLikesObj = { post: false, comments: {} };

        if (session) {
          // Check if user has liked the post
          const { data: postLike } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", session.user.id)
            .single();

          userLikesObj.post = !!postLike;

          // Check if user has liked any comments
          if (commentsData && commentsData.length > 0) {
            const commentIds = commentsData.map((c) => c.id).filter(Boolean);
            if (commentIds.length > 0) {
              const { data: commentLikes } = await supabase
                .from("likes")
                .select("comment_id")
                .eq("user_id", session.user.id)
                .in("comment_id", commentIds);

              if (commentLikes) {
                commentLikes.forEach((like) => {
                  userLikesObj.comments[like.comment_id] = true;
                });
              }
            }
          }
        }

        setPost(postData);
        setComments(commentsData || []);
        setUserLikes(userLikesObj);
      } catch (err) {
        setError(err.message);
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    id && fetchData();
  }, [id, router]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase.from("comments").insert([
        {
          post_id: Number(id),
          content: comment,
          user_id: session.user.id,
        },
      ]);

      if (error) throw error;

      // Optimistic update
      setComments((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          content: comment,
          created_at: new Date().toISOString(),
          profiles: { username: session.user.email?.split("@")[0] },
          user_id: session.user.id,
          likes_count: 0,
        },
      ]);
      setComment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Add a function to handle liking the post
  const handleLikePost = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const postId = Number(id);
      const userId = session.user.id;

      // Check if the user has already liked this post
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        // User has already liked the post, so remove the like (dislike)
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        if (error) throw error;

        // Optimistically update the likes count (decrease by 1)
        setPost((prev) => ({
          ...prev,
          likes_count: Math.max(0, (prev.likes_count || 0) - 1),
        }));

        // Update user's like status in the state
        setUserLikes((prev) => ({
          ...prev,
          post: false,
        }));
      } else {
        // User hasn't liked the post yet, so add a like
        const { error } = await supabase
          .from("likes")
          .insert([{ post_id: postId, user_id: userId }]);

        if (error) throw error;

        // Optimistically update the likes count (increase by 1)
        setPost((prev) => ({
          ...prev,
          likes_count: (prev.likes_count || 0) + 1,
        }));

        // Update user's like status in the state
        setUserLikes((prev) => ({
          ...prev,
          post: true,
        }));
      }
    } catch (err) {
      setError(err.message);
      console.error("Error toggling post like:", err);
    }
  };

  // Add a function to handle liking a comment
  const handleLikeComment = async (commentId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const userId = session.user.id;

      // Check if the user has already liked this comment
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        // User has already liked the comment, so remove the like (dislike)
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        if (error) throw error;

        // Optimistically update the likes count for the comment (decrease by 1)
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, likes_count: Math.max(0, (c.likes_count || 0) - 1) }
              : c
          )
        );

        // Update user's like status for this comment
        setUserLikes((prev) => ({
          ...prev,
          comments: {
            ...prev.comments,
            [commentId]: false,
          },
        }));
      } else {
        // User hasn't liked the comment yet, so add a like
        const { error } = await supabase
          .from("likes")
          .insert([{ comment_id: commentId, user_id: userId }]);

        if (error) throw error;

        // Optimistically update the likes count for the comment (increase by 1)
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, likes_count: (c.likes_count || 0) + 1 }
              : c
          )
        );

        // Update user's like status for this comment
        setUserLikes((prev) => ({
          ...prev,
          comments: {
            ...prev.comments,
            [commentId]: true,
          },
        }));
      }
    } catch (err) {
      setError(err.message);
      console.error("Error toggling comment like:", err);
    }
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

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundImage: "url('/images/image 1@2x.png')" }}
      >
        <div className="min-h-screen bg-black/20">
          <Navbar />
          <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/30 rounded w-3/4"></div>
              <div className="h-4 bg-white/30 rounded w-1/2"></div>
              <div className="h-64 bg-white/30 rounded"></div>
              <div className="h-4 bg-white/30 rounded w-full"></div>
              <div className="h-4 bg-white/30 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundImage: "url('/images/image 1@2x.png')" }}
      >
        <div className="min-h-screen bg-black/20">
          <Navbar />
          <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              Error: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: "url('/images/image 1@2x.png')" }}
    >
      <div className="min-h-screen bg-black/20">
        <Navbar />
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
          <div className="mb-6">
            <Link
              href="/auth/community"
              className="inline-flex items-center text-white hover:text-gray-200"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Community
            </Link>
          </div>

          {post && (
            <>
              {/* Post card */}
              <div className="bg-white rounded-lg overflow-hidden mb-6 shadow-lg">
                {/* Post header */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {post.post_cities?.map((pc, i) => (
                        <span
                          key={i}
                          className="bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium"
                        >
                          {pc.city_tags?.name || "Unknown"}
                        </span>
                      ))}
                    </div>
                    <span className="ml-auto">
                      {formatTimeAgo(post.created_at)}
                    </span>
                  </div>

                  {/* Post title */}
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {post.title}
                  </h1>

                  {/* Post image */}
                  {post.image_url && (
                    <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={post.image_url || "/placeholder.svg"}
                        alt=""
                        className="w-full max-h-[500px] object-contain"
                      />
                    </div>
                  )}

                  {/* Post content */}
                  <div className="text-gray-700 mb-6 whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Post actions */}
                  <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
                    <button
                      onClick={handleLikePost}
                      className={`flex items-center gap-2 py-2 px-3 rounded-full transition-colors ${
                        userLikes.post
                          ? "bg-orange-500 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {userLikes.post ? (
                        <Heart size={18} className="fill-white text-white" />
                      ) : (
                        <ArrowUp size={18} />
                      )}
                      <span className="font-medium">
                        {post.likes_count || 0}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        document.getElementById("comment-input").focus()
                      }
                      className="flex items-center gap-2 py-2 px-3 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <MessageSquare size={18} />
                      <span className="font-medium">{comments.length}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments section */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    Comments {comments.length > 0 && `(${comments.length})`}
                  </h2>
                </div>

                {/* Comment form */}
                <div className="p-6 border-b border-gray-200">
                  <form onSubmit={handleComment} className="flex gap-3">
                    <input
                      id="comment-input"
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={submitting || !comment.trim()}
                    >
                      {submitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      <span className="hidden sm:inline">Comment</span>
                    </button>
                  </form>
                </div>

                {/* Comments list */}
                <div className="divide-y divide-gray-200">
                  {comments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                    comments.map((c, index) => (
                      <div key={c.id || index} className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">
                            {c.profiles?.username ||
                              (c.profiles && c.profiles[0]?.username) ||
                              "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(c.created_at)}
                          </span>
                        </div>
                        <div className="text-gray-700 mb-3">{c.content}</div>
                        <button
                          onClick={() => handleLikeComment(c.id)}
                          className={`flex items-center gap-1.5 text-sm ${
                            userLikes.comments[c.id]
                              ? "text-orange-500"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {userLikes.comments[c.id] ? (
                            <Heart
                              size={14}
                              className="fill-orange-500 text-orange-500"
                            />
                          ) : (
                            <ArrowUp size={14} />
                          )}
                          <span>{c.likes_count || 0}</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

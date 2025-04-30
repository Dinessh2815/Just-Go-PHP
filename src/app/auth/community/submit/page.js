"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from("city_tags")
        .select("id, name")
        .order("name");

      if (error) {
        setError("Failed to load cities. Please refresh the page.");
        return;
      }
      setCities(data);
    };

    fetchCities();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      // 1. Get current user session
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session?.user) {
        throw new Error("You must be logged in to create a post");
      }

      // 2. Upload image if exists
      let image_url = null;
      if (image) {
        const fileExt = image.name.split(".").pop();
        const filePath = `posts/${session.user.id}/${Date.now()}.${fileExt}`;

        // Upload the image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, image);

        if (uploadError)
          throw new Error("Image upload failed: " + uploadError.message);

        // Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        image_url = publicUrlData.publicUrl;
      }

      // 3. Create post
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content,
            image_url,
            user_id: session.user.id,
          },
        ])
        .select("id")
        .single();

      if (postError)
        throw new Error("Failed to create post: " + postError.message);

      // 4. Link to city (convert city_id to integer)
      if (selectedCityId) {
        const cityId = parseInt(selectedCityId);
        if (isNaN(cityId)) throw new Error("Invalid city selection");

        const { error: linkError } = await supabase.from("post_cities").insert([
          {
            post_id: postData.id,
            city_id: cityId,
          },
        ]);

        if (linkError)
          throw new Error("Failed to link post to city: " + linkError.message);
      }

      // 5. Redirect to community feed
      router.push("/auth/community");
      router.refresh(); // Ensure new post appears immediately
    } catch (err) {
      setError(err.message);
      console.error("Submission error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: "url('/images/image 1@2x.png')" }}
    >
      <div className="min-h-screen bg-black/20">
        {/* Navbar */}
        <Navbar />

        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
          <div className="mb-6">
            <Link
              href="/auth/community"
              className="inline-flex items-center text-white hover:text-gray-200"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Community
            </Link>
          </div>

          <div className="glass-effect rounded-lg overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h1 className="text-2xl font-bold text-white">Create a Post</h1>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Title
                </label>
                <input
                  id="title"
                  className="w-full bg-white/90 border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900"
                  placeholder="Give your post a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              {/* Content textarea */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  className="w-full bg-white/90 border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition min-h-[120px] text-gray-900"
                  placeholder="Share your experience..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              {/* City selection */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-white mb-1"
                >
                  City
                </label>
                <select
                  id="city"
                  className="w-full bg-white/90 border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900"
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  required
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Image (optional)
                </label>

                <div className="mt-1 flex items-center">
                  <label className="flex items-center justify-center px-4 py-2 bg-white/30 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white hover:bg-white/40 cursor-pointer transition">
                    <ImageIcon size={18} className="mr-2 text-white" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  {image && (
                    <span className="ml-3 text-sm text-white/80">
                      {image.name}
                    </span>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-white/20">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full max-h-60 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Creating Post...
                    </>
                  ) : (
                    "Publish Post"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Keep for user authentication for now
import { ApiClient } from "@/lib/api/client"; // Import our new API client
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import Navbar from "@/components/Navbar"; // Import the Navbar component

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("hotels");
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mainNavActive, setMainNavActive] = useState("home");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile?.username) {
        setUserData({
          username: session.user.email.split("@")[0],
        });
      } else {
        setUserData({
          username: profile.username,
        });
      }
    };

    fetchUserData();
  }, [router, supabase]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, username")
        .eq("id", session.user.id)
        .single();

      setUserData({
        name: profile?.name || "Guest",
        username: profile?.username || session.user.email.split("@")[0],
      });

      // Fetch listings using our new PHP API client
      try {
        const options = {
          category: activeTab,
          search: searchQuery,
          sort: 'created_at',
          order: 'desc',
          page: 1,
          limit: 20
        };
        
        const response = await ApiClient.getListings(options);
        setListings(response.data || []);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      }
    };

    fetchData();
  }, [activeTab, searchQuery, router]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const renderListingContent = (item) => {
    switch (activeTab) {
      case "hotels":
        return (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.name}
            </h3>
            <p className="text-gray-600 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {item.location}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium text-lg">
                {Array(item.price_range).fill("$").join("")}
              </span>
            </div>
          </>
        );

      case "restaurants":
        return (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.name}
            </h3>
            <p className="text-gray-600 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {item.location}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium text-lg">
                {Array(item.price_range).fill("$").join("")}
              </span>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                {item.cuisine_type}
              </span>
            </div>
          </>
        );

      case "things-to-do":
        return (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.name}
            </h3>
            <p className="text-gray-600 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {item.location}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium text-lg">
                {Array(item.price_range).fill("$").join("")}
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                {item.activity_type}
              </span>
            </div>
          </>
        );

      case "events":
        return (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.name}
            </h3>
            <p className="text-gray-600 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {item.location}
            </p>
            <p className="text-gray-500 text-sm mb-2">
              {new Date(item.event_date).toLocaleDateString()} •{" "}
              {item.start_time}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium text-lg">
                {Array(item.price_range).fill("$").join("")}
              </span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                {item.category}
              </span>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: "url('/images/image 1@2x.png')" }}
    >
      <div className="min-h-screen bg-black/10">
        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-20 pb-16">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Welcome, {userData?.username || "Guest"}!
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              THE WHOLE WORLD
              <br />
              AWAITS.
            </h2>

            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-2xl glass-effect rounded-full overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH FOR CITIES"
                className="w-full py-4 px-6 focus:outline-none text-gray-800 bg-transparent"
              />
              <button
                type="submit"
                className="bg-white text-gray-800 px-6 flex items-center justify-center font-bold"
              >
                SEARCH
              </button>
            </form>
          </div>
        </div>

        {/* Categories Section */}
        <div className="container mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-white mb-8">TOP CATEGORIES</h2>

          <div className="flex flex-wrap gap-8 justify-center md:justify-between">
            {[
              { name: "HOTELS", value: "hotels" },
              { name: "RESTAURANTS", value: "restaurants" },
              { name: "THINGS TO DO", value: "things-to-do" },
              { name: "EVENTS", value: "events" },
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveTab(category.value)}
                className={`text-white text-xl uppercase tracking-wider pb-2 ${
                  activeTab === category.value ? "border-b-2 border-white" : ""
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 && (
          <div className="container mx-auto px-6 py-16 bg-white/90">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {activeTab === "hotels"
                ? "Featured Hotels"
                : activeTab === "restaurants"
                ? "Popular Restaurants"
                : activeTab === "things-to-do"
                ? "Things To Do"
                : "Upcoming Events"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((item) => (
                <Link
                  key={item.id}
                  href={`/auth/${activeTab.replace("_", "-")}/${item.id}`}
                  className="group block bg-white rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="h-52 bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={
                        item.image_url ||
                        `/placeholder-${activeTab.replace("_", "-")}.png`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">{renderListingContent(item)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

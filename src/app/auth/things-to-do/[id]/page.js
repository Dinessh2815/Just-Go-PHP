"use client";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api/client";
import { useRouter, useParams } from "next/navigation";

export default function ThingsToDoPage() {
  const router = useRouter();
  const params = useParams();
  const [activity, setActivity] = useState(null);

  // Get id from params
  const id = params?.id;

  useEffect(() => {
    const fetchActivity = async () => {
      // We should implement authentication check here if needed
      // For now, we'll just fetch the activity data

      if (!id) return;

      try {
        // Fetch activity data from our PHP backend
        const data = await ApiClient.getListing(id);
        setActivity(data);
      } catch (error) {
        console.error("Error fetching activity:", error.message);
        router.push("/things-to-do"); // Redirect to the main "Things to Do" page on error
      }
    };

    fetchActivity();
  }, [id, router]);

  if (!activity)
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8 w-full max-w-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
          <p className="text-lg text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={activity.image_url || "/placeholder-activity.jpg"}
            alt={activity.name}
            className="w-full h-80 object-cover"
          />

          <div className="p-6 md:p-8">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {activity.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Location
                </h2>
                <p className="text-gray-700">{activity.location}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Activity Type
                </h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {activity.activity_type}
                </span>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Duration
                </h2>
                <p className="text-gray-700">{activity.duration}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Price Range
                </h2>
                <p className="text-blue-600 text-xl font-medium">
                  {Array(activity.price_range).fill("$").join("")}
                </p>
              </div>

              {activity.description && (
                <div className="md:col-span-2 bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

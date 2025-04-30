"use client";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api/client";
import { useRouter, useParams } from "next/navigation";

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const [restaurant, setRestaurant] = useState(null);

  // Get id from params using the useParams hook
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const fetchRestaurant = async () => {
      try {
        const data = await ApiClient.getListing(id);
        setRestaurant(data);
      } catch (error) {
        console.error("Error fetching restaurant:", error.message);
        router.push("/");
      }
    };

    fetchRestaurant();
  }, [id, router]);

  if (!restaurant)
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
            src={restaurant.image_url || "/placeholder.png"}
            alt={restaurant.name}
            className="w-full h-80 object-cover"
          />

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>←</span> Back
              </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {restaurant.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Location
                </h2>
                <p className="text-gray-700">{restaurant.location}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Cuisine Type
                </h2>
                <p className="text-gray-700">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {restaurant.cuisine_type}
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Price Range
                </h2>
                <p className="text-blue-600 text-xl font-medium">
                  {Array(restaurant.price_range).fill("$").join("")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

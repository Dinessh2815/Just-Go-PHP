"use client";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api/client";
import { useRouter, useParams } from "next/navigation";

export default function HotelPage() {
  const router = useRouter();
  const params = useParams();
  const [hotel, setHotel] = useState(null);

  // Get id from params using the useParams hook
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const fetchHotel = async () => {
      try {
        const data = await ApiClient.getListing(id);
        setHotel(data);
      } catch (error) {
        console.error("Error fetching hotel:", error.message);
        router.push("/");
      }
    };

    fetchHotel();
  }, [id, router]);

  if (!hotel)
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
            src={hotel.image_url || "/placeholder.png"}
            alt={hotel.name}
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
              {hotel.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Location
                </h2>
                <p className="text-gray-700">{hotel.location}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Price Range
                </h2>
                <p className="text-blue-600 text-xl font-medium">
                  {Array(hotel.price_range).fill("$").join("")}
                </p>
              </div>

              {hotel.description && (
                <div className="md:col-span-2 bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {hotel.description}
                  </p>
                </div>
              )}

              <div className="md:col-span-2 bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {hotel.amenities &&
                    hotel.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm shadow-sm border border-gray-200"
                      >
                        {amenity}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api/client";
import { useRouter, useParams } from "next/navigation";

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState(null);

  // Get id from params
  const id = params?.id;

  useEffect(() => {
    const fetchEvent = async () => {
      // We should implement authentication check here if needed
      // For now, we'll just fetch the event data

      if (!id) return;

      try {
        // Fetch event data from our PHP backend
        const data = await ApiClient.getListing(id);
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error.message);
        router.push("/events");
      }
    };

    fetchEvent();
  }, [id, router]);

  if (!event)
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

  // Format date for display
  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={event.image_url || "/placeholder-event.jpg"}
            alt={event.name}
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
              {event.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Location
                </h2>
                <p className="text-gray-700">{event.location}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Category
                </h2>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {event.category}
                </span>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Date & Time
                </h2>
                <p className="text-gray-700">
                  {eventDate} at {event.start_time}
                </p>
                <p className="text-gray-600 mt-2">Duration: {event.duration}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Price Range
                </h2>
                <p className="text-blue-600 text-xl font-medium">
                  {Array(event.price_range).fill("$").join("")}
                </p>
              </div>

              {event.description && (
                <div className="md:col-span-2 bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
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

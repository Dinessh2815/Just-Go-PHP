"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful! Please check your email for verification.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/background.jpg')", // Replace with your background image path
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="glass-effect w-[90%] max-w-md p-8 mx-auto rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-pink-400 text-center">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
              required
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
              required
            />
            <button
              type="submit"
              className="w-full p-3 bg-purple-900 text-white font-bold rounded-lg hover:bg-purple-800 transition"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

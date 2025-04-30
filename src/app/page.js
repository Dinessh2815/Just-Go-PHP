import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/background.jpg')", // Replace with your background image path
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="glass-effect text-center p-8 rounded-lg shadow-lg max-w-xl w-full">
          <h1 className="text-5xl font-extrabold text-white mb-6">
            Welcome to <span className="text-pink-400">Just Go</span>
          </h1>
          <p className="text-lg text-white mb-8">
            Discover the best travel destinations, hotels, and restaurants.
            Start your journey today!
          </p>
          <div className="flex gap-6 justify-center">
            <Link href="/auth/login">
              <button className="px-6 py-3 bg-purple-900 text-white font-bold rounded-lg shadow-md hover:bg-purple-800 transition">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="px-6 py-3 bg-purple-900 text-white font-bold rounded-lg shadow-md hover:bg-purple-800 transition">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

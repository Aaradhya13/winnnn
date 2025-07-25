import Link from 'next/link';

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center text-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/pexels-chrisleboutillier-929382.jpg')"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-gray-900/80 z-0"></div>

      <div className="relative z-10 px-6 md:px-10 text-white max-w-3xl text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Welcome to <span className="text-green-400">CarbonGuard</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-300">
          Empowering businesses to stay ahead of climate regulations and build a sustainable future — one insight at a time.
        </p>
        <Link href="/register">
          <button className="bg-green-500 hover:bg-green-600 transition duration-300 px-8 py-3 text-lg font-semibold rounded-xl shadow-md">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}
export default function TestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600">✅ Admin Panel is Working!</h1>
        <p className="text-xl text-gray-600 mt-4">The Next.js app is rendering correctly.</p>
        <a href="/admin/login" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded">
          Go to Login
        </a>
      </div>
    </div>
  );
}

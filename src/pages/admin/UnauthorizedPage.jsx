import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f5f4] px-6 text-center">
      {/* Icon */}
      <div className="mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-rose-100">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a8626b"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="#a8626b" />
        </svg>
      </div>

      {/* Message */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Access Denied
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        You don’t have permission to view this page.  
        Please contact your administrator or try logging in with a different account.
      </p>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/admin/login")}
          className="px-4 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

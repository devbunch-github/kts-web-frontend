import { X } from "lucide-react";

export default function AuthModal({
  open,
  mode = "login", // "login" | "signup"
  onClose,
  onSwitch,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl relative p-8 animate-fadeIn">
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <h2 className="text-center text-xl font-semibold text-[#E86C28] mb-1">
          {mode === "login" ? "Login" : "Sign up"}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          {mode === "login"
            ? "Login to complete your booking"
            : "Sign up to complete your booking"}
        </p>

        {/* FORM */}
        <div className="grid gap-4">

          {/* SIGNUP EXTRA FIELDS */}
          {mode === "signup" && (
            <>
              <div>
                <label className="text-xs text-gray-600">Full Name</label>
                <input
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E86C28]"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Mobile Number</label>
                <input
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E86C28]"
                  placeholder="Enter your mobile number"
                />
              </div>
            </>
          )}

          {/* EMAIL */}
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E86C28]"
              placeholder="Enter email"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs text-gray-600">Password</label>
            <input
              type="password"
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E86C28]"
              placeholder="Enter your password"
            />
          </div>

          {/* CONFIRM PASSWORD (Signup Only) */}
          {mode === "signup" && (
            <div>
              <label className="text-xs text-gray-600">Confirm Password</label>
              <input
                type="password"
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E86C28]"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {/* NOTE (Signup Only) */}
          {mode === "signup" && (
            <div>
              <label className="text-xs text-gray-600">Note</label>
              <input
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E86C28]"
                placeholder="Enter your note"
              />
            </div>
          )}

          {/* REMEMBER ME (Login Only) */}
          {mode === "login" && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember me
              </label>
              <button className="text-[#E86C28] hover:underline">
                Forgot Password
              </button>
            </div>
          )}

          {/* AGREEMENT */}
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input type="checkbox" />
            {mode === "login" ? (
              <>By login you agree to our <span className="text-[#E86C28]">Terms</span> & <span className="text-[#E86C28]">Privacy Policy</span></>
            ) : (
              <>By sign up you agree to our <span className="text-[#E86C28]">Terms</span> & <span className="text-[#E86C28]">Privacy Policy</span></>
            )}
          </label>

          {/* BUTTON */}
          <button className="w-full py-2.5 rounded-full bg-[#E86C28] text-white font-medium hover:bg-[#cf5f20] transition">
            {mode === "login" ? "Login" : "Sign up"}
          </button>

          {/* SWITCH */}
          <p className="text-center text-xs text-gray-500 mt-2">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  className="text-[#E86C28] hover:underline"
                  onClick={() => onSwitch("signup")}
                >
                  Signup
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-[#E86C28] hover:underline"
                  onClick={() => onSwitch("login")}
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

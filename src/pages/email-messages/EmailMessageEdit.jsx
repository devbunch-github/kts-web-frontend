import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/api/http";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EmailMessageEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/email-messages/${id}`);
        const r = data.data;
        setTitle(r.title || "Edit Email Template");
        setSubject(r.subject || "");
        setBody(r.body || "");
        setStatus(!!r.status);
        setLogoUrl(r.logo_url || "");
        setPreview(r.body || "");
      } catch {
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBodyChange = (val) => {
    setBody(val);
    setPreview(val);
  };

  const save = async () => {
    try {
      await axios.put(`/api/email-messages/${id}`, {
        subject,
        body,
        status,
        logo_url: logoUrl || null,
      });
      toast.success("Template updated");
      nav("/dashboard/email-messages");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f7] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => nav(-1)}
          className="flex items-center text-rose-500 hover:text-rose-700 font-medium mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>

        {/* Loader State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-rose-100">
            <Loader2 className="animate-spin text-rose-400 mb-4" size={32} />
            <p className="text-gray-600 text-sm font-medium">
              Loading email template...
            </p>
          </div>
        ) : (
          /* Actual Form & Preview */
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-rose-100">
            {/* Header */}
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
              Edit Email Template
            </h2>
            <p className="text-gray-500 text-sm mb-6">{title}</p>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Left Column — Form */}
              <div className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm h-56 resize-none focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    value={body}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    placeholder="Write your email content here..."
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-400">
                      Tokens: {"{CustomerName} {BusinessName} {AppointmentDate}"}
                    </span>
                  </div>
                </div>

                {/* Logo URL (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL (optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://yourlogo.com/logo.png"
                  />
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <input
                    id="status"
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="h-4 w-4 accent-rose-400 cursor-pointer"
                  />
                  <label htmlFor="status" className="text-sm text-gray-700">
                    Enabled
                  </label>
                </div>

                {/* Save Button */}
                <button
                  onClick={save}
                  className="w-full bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
                >
                  Save
                </button>
              </div>

              {/* Right Column — Preview */}
              <div className="bg-[#fdfbfb] rounded-2xl border border-gray-100 shadow-inner p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-4 text-gray-800">
                  {logoUrl && (
                    <div className="flex justify-center mb-6">
                      <img
                        src={logoUrl}
                        alt="Business Logo"
                        className="max-h-20 object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {subject || "Email Subject Preview"}
                  </h3>
                  <div
                    className="text-sm leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html:
                        preview ||
                        `<p>Your email content preview will appear here.</p>`,
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-6 border-t pt-4">
                    Thank you for choosing{" "}
                    <span className="text-rose-500 font-medium">Octane</span> for
                    your grooming needs.<br />
                    We look forward to seeing you!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

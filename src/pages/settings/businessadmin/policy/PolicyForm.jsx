import { useEffect, useState } from "react";
import { getBusinessSetting, updateBusinessSetting } from "@/api/settings";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function PolicyForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getBusinessSetting("policy");
        if (data?.policy) setPolicy(data.policy);
      } catch {
        toast.error("Failed to load policy content");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await updateBusinessSetting("policy", { policy });
      toast.success("Policy updated successfully");
    } catch {
      toast.error("Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-rose-100/40">
        Loading…
      </div>
    );

  return (
    <div className="bg-[#fff7f7] rounded-2xl p-6 shadow-sm border border-rose-100/40">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Policy Form</h2>

      {/* Quill Editor */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <ReactQuill
          theme="snow"
          value={policy}
          onChange={setPolicy}
          placeholder="Write your business policy here..."
          className="h-[300px]"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-start md:justify-end mt-8">
        <button
          onClick={save}
          disabled={saving}
          className="px-8 py-2.5 rounded-xl bg-[#c98383] text-white hover:bg-[#b17272] disabled:opacity-60 transition-all"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

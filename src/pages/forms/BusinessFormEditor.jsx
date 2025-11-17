import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createForm, getForm, updateForm } from "@/api/forms";
import http from "@/api/http";

/* ==========================================================
   ✅ QuestionRow component
   Renders each individual question card with its fields
========================================================== */
function QuestionRow({ value, onChange, onRemove }) {
  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className="bg-gray-50 border border-rose-100 rounded-2xl p-4 mb-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Answer type or item</label>
          <select
            value={value.type}
            onChange={(e) => set("type", e.target.value)}
            className="w-full mt-1 rounded-xl border border-rose-200 px-3 py-2"
          >
            <option value="short_answer">Short answer</option>
            <option value="description">Description Text</option>
            <option value="yes_no">Yes or No</option>
            <option value="checkbox">Check Box</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Question</label>
          <input
            value={value.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="Enter question here"
            className="w-full mt-1 rounded-xl border border-rose-200 px-3 py-2"
          />
        </div>
      </div>

      {value.type === "checkbox" && (
        <div className="mt-3">
          <label className="text-xs text-gray-500">
            Checkbox options (comma separated)
          </label>
          <input
            value={(value.options || []).join(", ")}
            onChange={(e) =>
              set(
                "options",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="Option A, Option B"
            className="w-full mt-1 rounded-xl border border-rose-200 px-3 py-2"
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        {/* ✅ Changed Required checkbox → toggle */}
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-700">Required</span>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!value.required}
              onChange={(e) => set("required", e.target.checked)}
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c98383]"></div>
          </div>
        </label>

        <button
          type="button"
          onClick={onRemove}
          className="text-gray-600 hover:text-rose-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ==========================================================
   ✅ ServicesModal component
   Modal for selecting services and frequency
========================================================== */
function ServicesModal({ open, onClose, selected, onSave, frequency, setFrequency }) {
  const [services, setServices] = useState([]);
  const [tmp, setTmp] = useState(selected || []);
  const [all, setAll] = useState(false);

  // ✅ Fetch services when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const { data } = await http.get("/api/services?per_page=500");

        // ✅ Handle your real API shape
        const list = Array.isArray(data?.data) ? data.data : [];
        const clean = list
          .filter((s) => s && s.Id != null)
          .map((s) => ({
            id: s.Id,
            name: s.Name,
          }));

        setServices(clean);
      } catch (err) {
        console.error("Service load error:", err);
        toast.error("Failed to load services");
      }
    })();
  }, [open]);

  // ✅ Reset modal state on open
  useEffect(() => {
    if (open) {
      setAll(false);
      setTmp(selected || []);
    }
  }, [open]);

  const toggleService = (id) => {
    setTmp((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const validIds = (all ? services.map((s) => s.id) : tmp).filter(
      (id) => id != null
    );
    onSave(validIds);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-xl rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Select Services</h4>

        {/* ✅ Service list */}
        <div className="max-h-56 overflow-auto rounded-xl border border-rose-200 p-3 mb-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={all}
              onChange={(e) => {
                const checked = e.target.checked;
                setAll(checked);
                if (checked) setTmp([]);
              }}
            />
            <span>All Services</span>
          </label>

          {!all &&
            services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={tmp.includes(s.id)}
                  onChange={() => toggleService(s.id)}
                />
                <span>{s.name}</span>
              </label>
            ))}

          {services.length === 0 && !all && (
            <div className="text-sm text-gray-500 py-2">Loading services…</div>
          )}
        </div>

        {/* ✅ Frequency select */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Ask clients to complete</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full mt-1 rounded-xl border border-rose-200 px-3 py-2"
          >
            <option value="every_booking">
              Every time they book an appointment
            </option>
            <option value="once">Once</option>
          </select>
        </div>

        {/* ✅ Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="px-5 py-2 rounded-2xl border"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-2xl bg-rose-300 text-white"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================
   ✅ Main BusinessFormEditor
========================================================== */
export default function BusinessFormEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [serviceIds, setServiceIds] = useState([]);
  const [frequency, setFrequency] = useState("every_booking");
  const [isActive, setIsActive] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing form when editing
  useEffect(() => {
    (async () => {
      if (!isEdit) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await getForm(id);
        const r = data.data || data;
        setTitle(r.title || "");
        setFrequency(r.frequency || "every_booking");
        setIsActive(!!r.is_active);
        setServiceIds(r.services || []);
        setQuestions(
          (r.questions || []).map((q, idx) => ({
            ...q,
            sort_order: q.sort_order ?? idx,
          }))
        );
      } catch {
        toast.error("Failed to load form");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Add new question block
  const addQuestion = (type = "short_answer") => {
    setQuestions((qs) => [
      ...qs,
      {
        id: null,
        type,
        label: "",
        required: false,
        sort_order: qs.length,
        options: [],
      },
    ]);
  };

  // Save (create/update)
  const save = async () => {
    const payload = {
      title,
      frequency,
      is_active: isActive,
      service_ids: serviceIds,
      questions: questions.map((q, idx) => ({ ...q, sort_order: idx })),
    };

    try {
      if (isEdit) {
        await updateForm(id, payload);
        toast.success("Form updated");
      } else {
        await createForm(payload);
        toast.success("Form created");
      }
      nav("/dashboard/forms");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    }
  };

  if (loading)
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-sm">Loading form details, please wait...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="px-3 py-2 rounded-xl bg-rose-100 text-rose-700"
        >
          &lt;
        </button>
        <h3 className="text-xl md:text-2xl font-semibold">
          {isEdit ? "Edit Form" : "Add New Form"}
        </h3>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100/60 p-5">
        {/* Title */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hair Consent Form"
            className="w-full mt-1 rounded-xl border border-rose-200 px-3 py-2"
          />
        </div>

        {/* Questions */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Questions</h4>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-2xl border border-rose-200 hover:bg-rose-50"
            >
              Select Services & Frequency
            </button>
          </div>

          {questions.map((q, idx) => (
            <QuestionRow
              key={idx}
              value={q}
              onChange={(val) =>
                setQuestions((arr) =>
                  arr.map((r, i) => (i === idx ? val : r))
                )
              }
              onRemove={() =>
                setQuestions((arr) => arr.filter((_, i) => i !== idx))
              }
            />
          ))}

          <button
            type="button"
            onClick={() => addQuestion()}
            className="mt-2 text-rose-600"
          >
            + Add a new question
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>Status active</span>
          </label>
          <button
            type="button"
            onClick={save}
            className="px-8 py-2 rounded-2xl bg-rose-300 text-white"
          >
            Save
          </button>
        </div>
      </div>

      {/* Modal */}
      <ServicesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selected={serviceIds}
        onSave={setServiceIds}
        frequency={frequency}
        setFrequency={setFrequency}
      />
    </div>
  );
}

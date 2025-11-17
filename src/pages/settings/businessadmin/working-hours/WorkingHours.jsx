import { useEffect, useState } from "react";
import { getBusinessSetting } from "@/api/settings";
import WorkingHoursEditModal from "./WorkingHoursEditModal";
import toast from "react-hot-toast";

export default function WorkingHours() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    (async () => {
        try {
        const response = await getBusinessSetting("working_hours");
        // ✅ Access correct nested structure
        const hoursData =
            response?.data?.data?.hours ||
            response?.data?.hours ||
            response?.hours ||
            [];

        setHours(
            hoursData.length
            ? hoursData
            : [
                { day: "Monday", start: "10:00am", end: "7:00pm", closed: false },
                { day: "Tuesday", start: "10:00am", end: "7:00pm", closed: false },
                { day: "Wednesday", start: "10:00am", end: "7:00pm", closed: false },
                { day: "Thursday", start: "10:00am", end: "7:00pm", closed: false },
                { day: "Friday", start: "10:00am", end: "7:00pm", closed: false },
                { day: "Saturday", start: "", end: "", closed: true },
                { day: "Sunday", start: "", end: "", closed: true },
                ]
        );
        } catch (err) {
        console.error("❌ Failed to load working hours:", err);
        toast.error("Failed to load working hours");
        } finally {
        setLoading(false);
        }
    })();
    }, []);


  if (loading)
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-rose-100/40">
        Loading…
      </div>
    );

  return (
    <div className="bg-[#fff7f7] rounded-2xl p-6 shadow-sm border border-rose-100/40">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Working Hours</h2>
        <button
          onClick={() => setEditOpen(true)}
          className="text-[#c98383] font-medium hover:text-[#b17272] transition"
        >
          Edit
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {hours.map((item) => (
          <div
            key={item.day}
            className={`rounded-xl border text-center p-4 ${
              item.closed
                ? "bg-gray-100 text-gray-500 border-gray-200"
                : "bg-rose-50 border-rose-100 text-gray-800"
            }`}
          >
            <h4
              className={`font-medium mb-2 ${
                item.closed ? "text-gray-500" : "text-[#c98383]"
              }`}
            >
              {item.day}
            </h4>
            {item.closed ? (
              <p className="text-sm font-medium">Closed</p>
            ) : (
              <>
                <p className="text-sm">{item.start}</p>
                <p className="text-sm">-</p>
                <p className="text-sm">{item.end}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <WorkingHoursEditModal
          open={editOpen}
          setOpen={setEditOpen}
          initialHours={hours}
          onUpdated={setHours}
        />
      )}
    </div>
  );
}

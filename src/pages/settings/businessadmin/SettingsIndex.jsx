import { useState } from "react";
import GeneralSettings from "./general/GeneralSettings";
import SiteSettings from "./site/SiteSettings";
import WorkingHours from "./working-hours/WorkingHours";
import ContactSettings from "./contact/ContactSettings";
import PolicyForm from "./policy/PolicyForm";

export default function SettingsIndex() {
  const [open, setOpen] = useState("general");
  const toggle = (key) => setOpen(open === key ? "" : key);

  const headerClass =
    "w-full text-left text-white bg-[#c98383] hover:bg-[#b17272] px-5 py-3 rounded-t-xl font-semibold transition-all";

  return (
    <div className="p-6 space-y-6">
      {/* 1️⃣ Settings */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-rose-100/40">
        <button onClick={() => toggle("general")} className={headerClass}>
          Settings
        </button>
        {open === "general" && (
          <div className="p-4 bg-white">
            <GeneralSettings />
          </div>
        )}
      </div>

      {/* 2️⃣ Business Site Settings */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-rose-100/40">
        <button onClick={() => toggle("site")} className={headerClass}>
          Site Settings
        </button>
        {open === "site" && (
          <div className="p-4 bg-white">
            <SiteSettings />
          </div>
        )}
      </div>

      {/* 3️⃣ Working Hours */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-rose-100/40">
        <button onClick={() => toggle("working_hours")} className={headerClass}>
          Working Hours
        </button>
        {open === "working_hours" && (
          <div className="p-4 bg-white">
            <WorkingHours />
          </div>
        )}
      </div>

      {/* 4️⃣ Contact Settings */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-rose-100/40">
        <button onClick={() => toggle("contact")} className={headerClass}>
          Contact Setting
        </button>
        {open === "contact" && (
          <div className="p-4 bg-white">
            <ContactSettings />
          </div>
        )}
      </div>

      {/* 5️⃣ Policy Form */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-rose-100/40">
        <button onClick={() => toggle("policy")} className={headerClass}>
          Policy Form
        </button>
        {open === "policy" && (
          <div className="p-4 bg-white">
            <PolicyForm />
          </div>
        )}
      </div>
    </div>
  );
}

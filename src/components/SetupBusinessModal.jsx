import { useState, useEffect } from "react";
import axios from "@/api/http";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { UploadCloud } from "lucide-react";

export default function SetupBusinessModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countries] = useState(["United Kingdom"]);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    business_name: "",
    services: [],
    country: "",
    city: "",
    address: "",
    logo: null,
    cover: null,
  });

  // 🌍 check if setup required
  useEffect(() => {
    axios.get("/api/beautician/check").then((res) => {
      if (!res.data.exists) setOpen(true);
    });
  }, []);

  // 🌆 fetch UK cities
  useEffect(() => {
    axios
      .get("https://countriesnow.space/api/v0.1/countries")
      .then((res) => {
        const uk = res.data.data.find((c) => c.country === "United Kingdom");
        setCities(uk?.cities || []);
      })
      .catch(() => setCities([]));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setForm((p) => ({ ...p, [name]: files[0] }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();

    fd.append("name", form.business_name);
    form.services.forEach((s) => fd.append("services[]", s.value));
    fd.append("country", form.country);
    fd.append("city", form.city);
    fd.append("address", form.address);

    // ✅ Generate or send subdomain
    const subdomain = form.subdomain || form.business_name.toLowerCase().replace(/\s+/g, "-");
    fd.append("subdomain", subdomain);

    if (form.logo) fd.append("logo", form.logo);
    if (form.cover) fd.append("cover", form.cover);

    try {
      await axios.post("/api/beautician/setup", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Business setup completed!");
      setOpen(false);
    } catch (err) {
      toast.error("Setup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };


  if (!open) return null;

  const serviceOptions = [
    { value: "Hair", label: "Hair" },
    { value: "Makeup", label: "Makeup" },
    { value: "Nails", label: "Nails" },
    { value: "Facial", label: "Facial" },
    { value: "Massage", label: "Massage" },
    { value: "Waxing", label: "Waxing" },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-y-auto max-h-[90vh] p-8">
        <h2 className="text-center text-2xl font-semibold mb-8 text-gray-900">
          Complete Your Business Setup
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Business Name */}
          <div>
            <label className="text-sm font-medium text-gray-800">
              Business Name
            </label>
            <input
              type="text"
              name="business_name"
              placeholder="Enter business name"
              value={form.business_name}
              onChange={handleChange}
              required
              className="h-11 w-full border border-gray-300 rounded-lg px-3 text-gray-700 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Services Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-800">Services</label>
            <Select
              isMulti
              name="services"
              value={form.services}
              onChange={(selected) => setForm({ ...form, services: selected })}
              options={serviceOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select services"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.5rem",
                  borderColor: "#d1d5db",
                  minHeight: "44px",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#fb7185" },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#fce7f3",
                  color: "#9d174d",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#9d174d",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                }),
              }}
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-medium text-gray-800">Country</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              className="h-11 w-full border border-gray-300 rounded-lg px-3 text-gray-700 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium text-gray-800">City</label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="h-11 w-full border border-gray-300 rounded-lg px-3 text-gray-700 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-800">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter full address"
              value={form.address}
              onChange={handleChange}
              className="h-11 w-full border border-gray-300 rounded-lg px-3 text-gray-700 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Upload Logo */}
          <UploadBox
            label="Upload Logo"
            name="logo"
            file={form.logo}
            onChange={handleChange}
          />

          {/* Upload Cover Image */}
          <UploadBox
            label="Upload Cover Image"
            name="cover"
            file={form.cover}
            onChange={handleChange}
          />

          {/* Button */}
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#c27b7f] hover:bg-[#b36c70] text-white px-8 py-2.5 rounded-md text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ✅ Upload Box Component */
function UploadBox({ label, name, file, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center text-gray-500 hover:border-rose-400 transition cursor-pointer">
        <UploadCloud className="w-6 h-6 text-rose-400 mb-2" />
        <input
          type="file"
          name={name}
          accept="image/*"
          onChange={onChange}
          className="hidden"
          id={`upload-${name}`}
        />
        <label
          htmlFor={`upload-${name}`}
          className="text-sm text-rose-500 font-medium cursor-pointer"
        >
          Browse files
        </label>
        <p className="text-xs text-gray-400 mt-1">
          {file ? file.name : "Drag image to upload"}
        </p>
        {name === "cover" && (
          <p className="text-xs text-gray-400">Supports .jpg, .jpeg, .png</p>
        )}
      </div>
    </div>
  );
}

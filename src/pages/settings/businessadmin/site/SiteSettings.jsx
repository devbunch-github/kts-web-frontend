import { useEffect, useState } from "react";
import { getBusinessSetting, updateBusinessSetting } from "@/api/settings";
import toast from "react-hot-toast";

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    logo: null,
    cover_image: null,
    hero_text: "",
    background_color: "#f4d1b3",
    text_color: "#d6a47d",
    key_color: "#ce8147",
    dark_color: "#804b19",
  });

  const [preview, setPreview] = useState({
    logo: "",
    cover_image: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await getBusinessSetting("site");
        const data = response || {};

        // ✅ Extract nested color structure if present
        const colors = data?.colors || {};

        if (Object.keys(data).length) {
          setForm((prev) => ({
            ...prev,
            hero_text: data.hero_text || "",
            background_color: colors.background || prev.background_color,
            text_color: colors.text || prev.text_color,
            key_color: colors.key || prev.key_color,
            dark_color: colors.dark || prev.dark_color,
          }));

          setPreview({
            logo: data.logo_url || "",
            cover_image: data.cover_url || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load site settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImage = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setForm((p) => ({ ...p, [name]: file }));
      setPreview((p) => ({ ...p, [name]: URL.createObjectURL(file) }));
    }
  };

  const save = async () => {
    const payload = new FormData();
    payload.append("hero_text", form.hero_text);
    payload.append("logo", form.logo || "");
    payload.append("cover_image", form.cover_image || "");

    // ✅ Nest colors back into `colors` object to match backend
    payload.append(
      "colors[background]",
      form.background_color || "#ffffff"
    );
    payload.append("colors[text]", form.text_color || "#000000");
    payload.append("colors[key]", form.key_color || "#000000");
    payload.append("colors[dark]", form.dark_color || "#000000");

    try {
      setSaving(true);
      await updateBusinessSetting("site", payload, true);
      toast.success("Site settings saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update site settings");
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
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Site Settings</h2>

      {/* Logo & Cover */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Logo */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Logo</label>
          {preview.logo ? (
            <img
              src={preview.logo}
              alt="Logo"
              className="w-48 h-28 object-contain rounded-md border border-rose-100 mb-3"
            />
          ) : (
            <div className="w-48 h-28 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-md mb-3 text-gray-400">
              No logo
            </div>
          )}
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleImage}
            className="block text-sm text-gray-600"
          />
        </div>

        {/* Cover */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Cover Image
          </label>
          {preview.cover_image ? (
            <img
              src={preview.cover_image}
              alt="Cover"
              className="w-48 h-28 object-cover rounded-md border border-rose-100 mb-3"
            />
          ) : (
            <div className="w-48 h-28 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-md mb-3 text-gray-400">
              No image
            </div>
          )}
          <input
            type="file"
            name="cover_image"
            accept="image/*"
            onChange={handleImage}
            className="block text-sm text-gray-600"
          />
        </div>
      </div>

      {/* Hero Banner Text */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">
          Hero Banner Text
        </label>
        <input
          type="text"
          name="hero_text"
          value={form.hero_text}
          onChange={handleChange}
          placeholder="Unlock Your Radiance, One Style at a Time"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
        />
      </div>

      {/* Color Theme */}
      <div className="mb-8">
        <h3 className="text-gray-800 font-medium mb-4">Color Theme</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {/* Background */}
          <div className="flex flex-col items-center space-y-2">
            <input
              type="color"
              name="background_color"
              value={form.background_color}
              onChange={handleChange}
              className="w-14 h-14 rounded-md border border-gray-200 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Background Color</span>
          </div>

          {/* Text */}
          <div className="flex flex-col items-center space-y-2">
            <input
              type="color"
              name="text_color"
              value={form.text_color}
              onChange={handleChange}
              className="w-14 h-14 rounded-md border border-gray-200 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Text Color</span>
          </div>

          {/* Key */}
          <div className="flex flex-col items-center space-y-2">
            <input
              type="color"
              name="key_color"
              value={form.key_color}
              onChange={handleChange}
              className="w-14 h-14 rounded-md border border-gray-200 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Key Color</span>
          </div>

          {/* Dark */}
          <div className="flex flex-col items-center space-y-2">
            <input
              type="color"
              name="dark_color"
              value={form.dark_color}
              onChange={handleChange}
              className="w-14 h-14 rounded-md border border-gray-200 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Dark Color</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start md:justify-end">
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

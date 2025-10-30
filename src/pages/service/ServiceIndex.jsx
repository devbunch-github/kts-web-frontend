import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listServices,
  listServiceCategories,
  deleteService,
  deleteServiceCategory,
} from "../../api/service";
import Spinner from "../../components/Spinner";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { Search, MoreVertical, FlaskConical } from "lucide-react"; // bottle & icons

export default function ServiceIndex() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [busyRow, setBusyRow] = useState(null);
  const [deleteCatId, setDeleteCatId] = useState(null);
  const [deleteSvcId, setDeleteSvcId] = useState(null);

  // Filtered data
  const filteredServices = useMemo(() => {
    let rows = services;
    if (activeCategory)
      rows = rows.filter(
        (r) => Number(r.CategoryId || r.category_id) === Number(activeCategory)
      );
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        (r.Name || r.name || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [services, activeCategory, search]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, svcRes] = await Promise.all([
        listServiceCategories(),
        listServices(),
      ]);
      setCategories(catRes?.data || catRes || []);
      setServices(svcRes?.data || svcRes?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCategory =
    categories.find((c) => Number(c.Id || c.id) === Number(activeCategory)) ||
    null;

  // Delete logic
  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    setBusyRow(`cat_${deleteCatId}`);
    try {
      await deleteServiceCategory(deleteCatId);
      setDeleteCatId(null);
      if (activeCategory === deleteCatId) setActiveCategory(null);
      loadData();
    } finally {
      setBusyRow(null);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteSvcId) return;
    setBusyRow(`svc_${deleteSvcId}`);
    try {
      await deleteService(deleteSvcId);
      setDeleteSvcId(null);
      loadData();
    } finally {
      setBusyRow(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F7] px-6 py-8 text-gray-800">
      {/* === HEADER === */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 shadow-sm">
            <FlaskConical size={22} className="text-rose-500" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">Service</h1>
        </div>

        {/* Add dropdown */}
        <div className="relative">
          <button
            onClick={() =>
              document.getElementById("addMenu")?.classList.toggle("hidden")
            }
            className="flex items-center gap-2 rounded-xl bg-[#D6A5A5] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#c38e8e]"
          >
            Add <span className="-mr-1 text-xs">▾</span>
          </button>
          <div
            id="addMenu"
            className="absolute right-0 z-20 mt-2 hidden w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md"
          >
            <button
              onClick={() => navigate("/dashboard/services/new")}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Single Service
            </button>
            <button
              onClick={() => navigate("/dashboard/services/categories/new")}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Category
            </button>
          </div>
        </div>
      </div>

      {/* === SEARCH === */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service name"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-11 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
      </div>

      {/* === GRID === */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* CATEGORIES PANEL */}
        <div className="md:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-[13px] font-medium text-gray-700">
              Categories
            </div>

            {/* All */}
            <button
              onClick={() => setActiveCategory(null)}
              className={`mb-2 block w-full rounded-lg px-3 py-2 text-left text-[13px] ${
                !activeCategory
                  ? "bg-[#E4B6B6]/60 text-rose-700 font-medium"
                  : "hover:bg-rose-50 text-gray-700"
              }`}
            >
              All categories
            </button>

            {/* Each Category */}
            {(categories || []).map((c) => (
              <div
                key={c.Id || c.id}
                className={`group mb-1 flex items-center justify-between rounded-lg ${
                  Number(activeCategory) === Number(c.Id || c.id)
                    ? "bg-[#E4B6B6]/60 text-rose-700 font-medium"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <button
                  onClick={() => setActiveCategory(c.Id || c.id)}
                  className="flex-1 truncate px-3 py-2 text-left text-[13px]"
                >
                  {c.Name || c.name}
                </button>

                <div className="relative">
                  <button
                    onClick={() => {
                      const id = `catmenu-${c.Id || c.id}`;
                      document.getElementById(id)?.classList.toggle("hidden");
                    }}
                    disabled={busyRow === `cat_${c.Id || c.id}`}
                    className="hidden rounded-md p-1 text-gray-500 hover:bg-gray-100 group-hover:block"
                  >
                    <MoreVertical size={16} />
                  </button>
                  <div
                    id={`catmenu-${c.Id || c.id}`}
                    className="absolute right-0 z-20 mt-1 hidden w-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md"
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/services/categories/${c.Id || c.id}/edit`
                        )
                      }
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteCatId(c.Id || c.id)}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Category */}
            <button
              onClick={() => navigate("/dashboard/services/categories/new")}
              className="mt-3 block w-full rounded-lg px-3 py-2 text-left text-[13px] text-[#D6A5A5] hover:bg-rose-50"
            >
              Add categories
            </button>
          </div>
        </div>

        {/* SERVICES */}
        <div className="md:col-span-9">
          {selectedCategory && (
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-gray-800">
                {selectedCategory.Name || selectedCategory.name}
              </h2>

              <div className="relative">
                <button
                  onClick={() =>
                    document
                      .getElementById("categoryActionMenu")
                      ?.classList.toggle("hidden")
                  }
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Action ▾
                </button>
                <div
                  id="categoryActionMenu"
                  className="absolute right-0 z-20 mt-2 hidden w-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md"
                >
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/services/categories/${selectedCategory.Id}/edit`
                      )
                    }
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteCatId(selectedCategory.Id)}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SERVICE CARDS */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : filteredServices.length > 0 ? (
              filteredServices.map((s) => (
                <div
                  key={s.Id || s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[14px] border border-gray-200 bg-white px-6 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.07)] transition"
                >
                  <div>
                    <div className="text-[15px] font-medium text-gray-800">
                      {s.Name || s.name}
                    </div>
                    <div className="text-[12px] text-gray-500">
                      {(s.DefaultAppointmentDuration ||
                        s.default_appointment_duration ||
                        0) + " min"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div className="text-[15px] font-semibold text-gray-800">
                      £ {parseFloat(s.TotalPrice || s.total_price || 0).toFixed(2)}
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          document
                            .getElementById(`svcMenu-${s.Id || s.id}`)
                            ?.classList.toggle("hidden")
                        }
                        className="rounded-full p-1.5 text-gray-600 hover:bg-gray-50"
                      >
                        <MoreVertical size={18} />
                      </button>
                      <div
                        id={`svcMenu-${s.Id || s.id}`}
                        className="absolute right-0 z-20 mt-2 hidden w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md"
                      >
                        <button
                          onClick={() =>
                            navigate(`/dashboard/services/${s.Id || s.id}/edit`)
                          }
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/services/new?duplicate=${s.Id}`)
                          }
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => setDeleteSvcId(s.Id || s.id)}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-500 py-10">
                No services found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === DELETE MODALS === */}
      <ConfirmDeleteModal
        open={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        message="Deleting this category will also remove all services associated with it. Are you sure you want to proceed?"
      />
      <ConfirmDeleteModal
        open={!!deleteSvcId}
        onClose={() => setDeleteSvcId(null)}
        onConfirm={handleDeleteService}
        message="Are you sure you want to delete this service?"
      />
    </div>
  );
}

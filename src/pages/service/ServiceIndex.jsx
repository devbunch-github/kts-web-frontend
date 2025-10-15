import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import {
  listServices,
  listServiceCategories,
  deleteService,
  deleteServiceCategory,
} from "../../api/service";

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

  const filteredServices = useMemo(() => {
    let rows = services;
    if (activeCategory) {
      rows = rows.filter(
        (r) =>
          Number(r.category_id || r.CategoryId) === Number(activeCategory)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        (r.name || r.Name || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [services, activeCategory, search]);

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

  const onDeleteCategory = async () => {
    const id = deleteCatId;
    if (!id) return;
    setBusyRow(`cat_${id}`);
    try {
      await deleteServiceCategory(id);
      setDeleteCatId(null);
      loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed.");
    } finally {
      setBusyRow(null);
    }
  };

  const onDeleteService = async () => {
    const id = deleteSvcId;
    if (!id) return;
    setBusyRow(`svc_${id}`);
    try {
      await deleteService(id);
      setDeleteSvcId(null);
      loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed.");
    } finally {
      setBusyRow(null);
    }
  };

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
            <span className="text-rose-500 text-xl">🧴</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Services</h1>
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-xl bg-rose-300 px-5 py-2.5 text-white hover:bg-rose-400"
            onClick={(e) => {
              const menu = document.getElementById("addMenu");
              menu?.classList.toggle("hidden");
            }}
          >
            Add
            <span className="-mr-1">▾</span>
          </button>

          {/* dropdown */}
          <div
            id="addMenu"
            className="absolute right-0 z-10 mt-2 hidden w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
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

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search service name"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none ring-rose-200 focus:ring-2"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Categories list */}
        <div className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-2 text-sm font-medium text-gray-700">Categories</div>
            <button
              className={`mb-2 block w-full rounded-lg px-3 py-2 text-left text-sm ${
                !activeCategory
                  ? "bg-rose-100 text-rose-700"
                  : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
              }`}
              onClick={() => setActiveCategory(null)}
            >
              All categories
            </button>

            {(categories || []).map((c) => (
              <div key={c.Id || c.id} className="group flex items-center">
                <button
                  className={`mb-2 block w-full rounded-lg px-3 py-2 text-left text-sm ${
                    Number(activeCategory) === Number(c.Id || c.id)
                      ? "bg-rose-100 text-rose-700"
                      : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                  }`}
                  onClick={() => setActiveCategory(c.Id || c.id)}
                >
                  {c.Name || c.name}
                </button>
                <button
                  title="Delete"
                  onClick={() => setDeleteCatId(c.Id || c.id)}
                  disabled={busyRow === `cat_${c.Id || c.id}`}
                  className="ml-2 hidden rounded-md p-1 text-gray-500 hover:bg-gray-100 group-hover:block"
                >
                  🗑️
                </button>
              </div>
            ))}

            <button
              onClick={() => navigate("/dashboard/services/categories/new")}
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              Add category
            </button>
          </div>
        </div>

        {/* Services grid */}
        <div className="col-span-12 md:col-span-9">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((s) => (
                <div
                  key={s.Id || s.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    {s.ImagePath && (
                      <img
                        src={s.ImagePath}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="text-[15px] font-semibold text-gray-800">
                        {s.Name || s.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(s.DefaultAppointmentDuration ||
                          s.default_appointment_duration) +
                          " min"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[15px] font-semibold text-gray-800">
                        £ {parseFloat(s.TotalPrice || s.total_price || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={(e) => {
                          const id = `rowmenu-${s.Id || s.id}`;
                          document.getElementById(id)?.classList.toggle("hidden");
                        }}
                      >
                        Action ▾
                      </button>
                      <div
                        id={`rowmenu-${s.Id || s.id}`}
                        className="absolute right-0 z-10 mt-2 hidden w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                      >
                        <button
                          onClick={() => navigate(`/dashboard/services/${s.Id || s.id}/edit`)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteSvcId(s.Id || s.id)}
                          disabled={busyRow === `svc_${s.Id || s.id}`}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete modals */}
      <ConfirmDeleteModal
        open={Boolean(deleteCatId)}
        onClose={() => setDeleteCatId(null)}
        onConfirm={onDeleteCategory}
        message="Deleting this category will also remove all associated services. Proceed?"
      />
      <ConfirmDeleteModal
        open={Boolean(deleteSvcId)}
        onClose={() => setDeleteSvcId(null)}
        onConfirm={onDeleteService}
        message="Are you sure you want to delete this service?"
      />
    </div>
  );
}

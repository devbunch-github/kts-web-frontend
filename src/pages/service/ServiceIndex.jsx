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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [busyRow, setBusyRow] = useState(null);

  const [deleteCatId, setDeleteCatId] = useState(null);
  const [deleteSvcId, setDeleteSvcId] = useState(null);

  // Filter by category + search
  const filteredServices = useMemo(() => {
    let rows = services;
    if (activeCategory) {
      rows = rows.filter(
        (r) => Number(r.CategoryId || r.category_id) === Number(activeCategory)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        (r.Name || r.name || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [services, activeCategory, search]);

  // Load data
  const loadData = async (p = 1) => {
    setLoading(true);
    try {
      const [catRes, svcRes] = await Promise.all([
        listServiceCategories(),
        listServices({ page: p }),
      ]);
      setCategories(catRes?.data || catRes || []);
      setServices(svcRes?.data || svcRes?.items || []);
      setPagination(svcRes?.meta || svcRes?.pagination || {});
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const selectedCategory =
    categories.find((c) => Number(c.Id || c.id) === Number(activeCategory)) ||
    null;

  // Delete category
  const onDeleteCategory = async () => {
    if (!deleteCatId) return;
    setBusyRow(`cat_${deleteCatId}`);
    try {
      await deleteServiceCategory(deleteCatId);
      setDeleteCatId(null);
      if (activeCategory === deleteCatId) setActiveCategory(null);
      loadData(page);
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed.");
    } finally {
      setBusyRow(null);
    }
  };

  // Delete service
  const onDeleteService = async () => {
    if (!deleteSvcId) return;
    setBusyRow(`svc_${deleteSvcId}`);
    try {
      await deleteService(deleteSvcId);
      setDeleteSvcId(null);
      loadData(page);
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
            <span className="text-rose-500">🧴</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Service</h1>
        </div>

        {/* Add button */}
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-xl bg-rose-300 px-5 py-2.5 text-white hover:bg-rose-400"
            onClick={() =>
              document.getElementById("addMenu")?.classList.toggle("hidden")
            }
          >
            Add <span className="-mr-1">▾</span>
          </button>
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
        {/* Categories */}
        {/* ==== Categories rail (Left Column) ==== */}
        <div className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-2 text-sm font-medium text-gray-700">Categories</div>

            {/* All categories */}
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

            {/* Each category row */}
            {(categories || []).map((c) => (
              <div
                key={c.Id || c.id}
                className={`group mb-1 flex items-center justify-between rounded-lg ${
                  Number(activeCategory) === Number(c.Id || c.id)
                    ? "bg-rose-100 text-rose-700"
                    : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                <button
                  className="flex-1 px-3 py-2 text-left text-sm"
                  onClick={() => setActiveCategory(c.Id || c.id)}
                >
                  {c.Name || c.name}
                </button>

                {/* Category action menu */}
                <div className="relative">
                  <button
                    title="Actions"
                    onClick={() => {
                      const id = `catmenu-${c.Id || c.id}`;
                      document.getElementById(id)?.classList.toggle("hidden");
                    }}
                    disabled={busyRow === `cat_${c.Id || c.id}`}
                    className="mr-1 hidden rounded-md p-1 text-gray-500 hover:bg-gray-100 group-hover:block"
                  >
                    ⋮
                  </button>

                  {/* Dropdown */}
                  <div
                    id={`catmenu-${c.Id || c.id}`}
                    className="absolute right-0 z-10 mt-1 hidden w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
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
                      disabled={busyRow === `cat_${c.Id || c.id}`}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new category */}
            <button
              onClick={() => navigate("/dashboard/services/categories/new")}
              className="mt-2 block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              Add categories
            </button>
          </div>
        </div>


        {/* Services list */}
        <div className="col-span-12 md:col-span-9">
          {/* Category Header + Action */}
          {selectedCategory && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-[17px]">
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
                  className="absolute right-0 z-10 mt-2 hidden w-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
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
                    disabled={busyRow === `cat_${selectedCategory.Id}`}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Service cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : filteredServices.length > 0 ? (
              filteredServices.map((s) => (
                <div
                  key={s.Id || s.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4"
                >
                  <div>
                    <div className="text-[15px] font-semibold text-gray-800">
                      {s.Name || s.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(s.DefaultAppointmentDuration ||
                        s.default_appointment_duration ||
                        0) + " min"}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[15px] font-semibold text-gray-800">
                        £{" "}
                        {parseFloat(s.TotalPrice || s.total_price || 0).toFixed(
                          2
                        )}
                      </div>
                    </div>

                    {/* Service Action Menu (3 dots) */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          document
                            .getElementById(`svcMenu-${s.Id || s.id}`)
                            ?.classList.toggle("hidden")
                        }
                        className="rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50"
                      >
                        ⋮
                      </button>
                      <div
                        id={`svcMenu-${s.Id || s.id}`}
                        className="absolute right-0 z-10 mt-2 hidden w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/services/${s.Id || s.id}/edit`
                            )
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
                          disabled={busyRow === `svc_${s.Id || s.id}`}
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
              <div className="text-gray-500 text-sm py-10 text-center">
                No services found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modals */}
      <ConfirmDeleteModal
        open={Boolean(deleteCatId)}
        onClose={() => setDeleteCatId(null)}
        onConfirm={onDeleteCategory}
        message="Deleting this category will also remove all services associated with it. Are you sure you want to proceed?"
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

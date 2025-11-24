// src/pages/public/CategoryServicesPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { listServices, listServiceCategories } from "../../api/service";
import { getBusinessSetting } from "../../api/settings";
import { listBeauticians } from "../../api/beautician";
import { listPublicGiftCards } from "../../api/giftCards";

const CART_STORAGE_KEY = "booking_cart";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {}
}

export default function CategoryServicesPage() {
  const { subdomain, id } = useParams(); // ⭐ dynamic subdomain + category ID
  const navigate = useNavigate();

  const [beautician, setBeautician] = useState(null);
  const [ACCOUNT_ID, setAccountId] = useState(null);

  const [businessSettings, setBusinessSettings] = useState({});
  const [loadingBeautician, setLoadingBeautician] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [giftCards, setGiftCards] = useState([]);

  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(id);
  const [selectedServices, setSelectedServices] = useState([]);

  // 🛒 booking cart (multi-service selection, across categories)
  const [cart, setCart] = useState(() => loadCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const isInCart = (serviceId) =>
    cart.some((item) => String(item.serviceId) === String(serviceId));

  const toggleCartService = (srv) => {
    setCart((prev) => {
      const exists = prev.some(
        (item) => String(item.serviceId) === String(srv.Id)
      );
      if (exists) {
        return prev.filter(
          (item) => String(item.serviceId) !== String(srv.Id)
        );
      }
      return [
        ...prev,
        {
          serviceId: srv.Id,
          accountId: ACCOUNT_ID,
        },
      ];
    });
  };

  // ------------------------------------------------------
  // 1. LOAD BEAUTICIAN BY SUBDOMAIN (get account_id here)
  // ------------------------------------------------------
  useEffect(() => {
    loadBeautician();
  }, [subdomain]);

  const loadBeautician = async () => {
    try {
      const res = await listBeauticians({ subdomain });
      const b = res?.data?.[0];

      if (b) {
        setBeautician(b);
        setAccountId(b.account_id); // ⭐ DYNAMIC ACCOUNT ID
      }
    } finally {
      setLoadingBeautician(false);
    }
  };

  // ------------------------------------------------------
  // 2. Once account ID is available → load all business data
  // ------------------------------------------------------
  useEffect(() => {
    if (ACCOUNT_ID) {
      loadBusinessSettings();
      loadGiftCards();
      loadAll();
    }
  }, [ACCOUNT_ID]);

  // ------------------------------------------------------
  // LOAD BUSINESS SETTINGS
  // ------------------------------------------------------
  const loadBusinessSettings = async () => {
    try {
      const settings = await getBusinessSetting("site", ACCOUNT_ID); // ⭐ pass account ID
      setBusinessSettings(settings);
    } catch {
    } finally {
      setLoadingSettings(false);
    }
  };

  // ------------------------------------------------------
  // LOAD GIFT CARDS
  // ------------------------------------------------------
  const loadGiftCards = async () => {
    try {
      const list = await listPublicGiftCards(ACCOUNT_ID);
      setGiftCards(list || []);
    } catch {}
  };

  // ------------------------------------------------------
  // LOAD CATEGORIES + SERVICES
  // ------------------------------------------------------
  const loadAll = async () => {
    try {
      const catRes = await listServiceCategories({ account_id: ACCOUNT_ID }); // ⭐
      setCategories(catRes?.data || []);

      const srvRes = await listServices({ account_id: ACCOUNT_ID }); // ⭐
      setServices(srvRes?.data || []);
    } catch {
    } finally {
      setLoadingServices(false);
    }
  };

  const finalLogo =
    businessSettings?.logo_url ||
    beautician?.logo_url ||
    "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url ||
    beautician?.cover_url ||
    "/images/dummy/dummy.png";

  // ------------------------------------------------------
  // FILTERING
  // ------------------------------------------------------
  const filteredServices = services.filter((srv) => {
    const matchCategory = String(srv.CategoryId) === String(selectedCategory);

    const matchService =
      selectedServices.length > 0
        ? selectedServices.includes(srv.Name)
        : true;

    return matchCategory && matchService;
  });

  const sidebarServices = services.filter(
    (s) => String(s.CategoryId) === String(selectedCategory)
  );

  // ------------------------------------------------------
  // Skeleton Loaders
  // ------------------------------------------------------
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-2xl shadow-md p-4">
      <div className="w-full h-52 bg-gray-200 rounded-xl"></div>
      <div className="h-4 bg-gray-200 rounded mt-4 w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded mt-2 w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded mt-4 w-1/3"></div>
    </div>
  );

  const SkeletonHeader = () => (
    <div className="w-full h-[430px] bg-gray-200 animate-pulse mt-[80px]"></div>
  );

  // ------------------------------------------------------
  // Accordion
  // ------------------------------------------------------
  const Accordion = ({ title, children }) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => setOpen(!open)}
        >
          <h4 className="font-medium">{title}</h4>
          <span className="text-[#E86C28] text-xl">{open ? "−" : "+"}</span>
        </div>
        {open && <div className="pl-1">{children}</div>}
      </div>
    );
  };

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            {loadingBeautician || loadingSettings ? (
              <div className="w-32 h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <img src={finalLogo} className="h-full object-contain" />
            )}
          </div>

          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* COVER WITH CATEGORY NAME */}
      {loadingBeautician || loadingSettings ? (
        <SkeletonHeader />
      ) : (
        <div className="w-full h-[430px] mt-[80px] overflow-hidden relative">
          <img
            src={finalCover}
            className="w-full h-full object-cover brightness-[0.75]"
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-white text-4xl font-semibold text-center drop-shadow-lg">
              {
                categories.find(
                  (c) => String(c.id) === String(selectedCategory)
                )?.Name
              }
            </h1>
          </div>
        </div>
      )}

      {/* LAYOUT */}
      <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-12 gap-10">
        {/* ------------------------------------------------- SIDEBAR ------------------------------------------------- */}
        <aside className="col-span-12 lg:col-span-3 bg-white shadow-md rounded-xl p-6 sticky top-[140px] self-start">
          <h3 className="font-semibold text-lg mb-4">
            Filter results ({filteredServices.length})
          </h3>

          {/* Categories */}
          <Accordion title="Categories">
            {loadingServices ? (
              <>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse mt-2"></div>
              </>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`cursor-pointer text-sm mb-1 ${
                    String(selectedCategory) === String(cat.id)
                      ? "text-[#E86C28] font-semibold"
                      : "text-[#777]"
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedServices([]);
                    navigate(`/${subdomain}/categories/${cat.id}`);
                  }}
                >
                  {cat.Name}
                </div>
              ))
            )}
          </Accordion>

          {/* Services */}
          <Accordion title="Services">
            {loadingServices ? (
              <>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse mt-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse mt-2"></div>
              </>
            ) : sidebarServices.length === 0 ? (
              <p className="text-xs text-gray-500">No services found.</p>
            ) : (
              sidebarServices.map((srv) => (
                <label
                  key={srv.Id}
                  className="flex items-center gap-2 mb-2 text-sm text-[#444]"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(srv.Name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, srv.Name]);
                      } else {
                        setSelectedServices(
                          selectedServices.filter((s) => s !== srv.Name)
                        );
                      }
                    }}
                  />
                  <span>{srv.Name}</span>
                </label>
              ))
            )}
          </Accordion>

          {/* Gift Cards */}
          <Accordion title="Gift Card">
            {giftCards.length === 0 ? (
              <p className="text-sm text-gray-500">No gift cards available</p>
            ) : (
              giftCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 bg-[#FAFAFA] border rounded-lg p-3 shadow-sm mb-3"
                >
                  <img
                    src={card.image_url || "/images/dummy/dummy.png"}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{card.title}</h4>
                    <p className="text-xs text-gray-600">Code: {card.code}</p>
                    <p className="text-xs text-gray-600">
                      £{card.discount_amount} ({card.discount_type})
                    </p>
                    <span
                      className={`text-xs mt-1 inline-block px-2 py-1 rounded ${
                        card.is_active
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {card.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </Accordion>
        </aside>

        {/* ------------------------------------------------- SERVICES GRID ------------------------------------------------- */}
        <div className="col-span-12 lg:col-span-9">
          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <p className="text-center text-gray-500 text-lg mt-10">
              No services found for this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredServices.map((srv) => {
                const inCart = isInCart(srv.Id);
                return (
                  <div
                    key={srv.Id}
                    className="bg-white rounded-2xl shadow p-6 flex flex-col hover:shadow-lg transition"
                  >
                    <h3 className="font-semibold text-lg mb-1">{srv.Name}</h3>

                    <p className="text-sm text-[#E86C28] mb-2">
                      {srv.DefaultAppointmentDuration}{" "}
                      {srv.DurationUnit === "hours" ? "hr" : "mins"}
                    </p>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {srv.Description || "No description available."}
                    </p>

                    <div className="border-t border-gray-200 mt-auto pt-4 space-y-2">
                      <p className="font-semibold text-[#333]">
                        from £{Number(srv.TotalPrice).toFixed(2)}
                      </p>

                      {srv.Deposit != null && (
                        <p className="text-xs text-gray-500 mt-1">
                          Min Deposit{" "}
                          {srv.DepositType === 0
                            ? `${Number(srv.Deposit)}%`
                            : `£${Number(srv.Deposit).toFixed(2)}`}
                        </p>
                      )}

                      {/* Original "Book Now" (single-service flow) */}
                      <button
                        className="mt-2 w-full py-2 rounded-full bg-[#E86C28] text-white font-medium hover:bg-[#cf5f20] transition text-sm"
                        onClick={() =>
                          navigate(
                            `/${subdomain}/services/${srv.Id}/professionals`
                          )
                        }
                      >
                        Book Now
                      </button>

                      {/* 🛒 New Add/Remove to multi-booking cart */}
                      <button
                        type="button"
                        onClick={() => toggleCartService(srv)}
                        className={`mt-2 w-full py-2 rounded-full border text-sm font-medium ${
                          inCart
                            ? "border-gray-300 text-gray-700 bg-gray-50"
                            : "border-[#E86C28] text-[#E86C28] hover:bg-[#FFF5EF]"
                        }`}
                      >
                        {inCart ? "Remove from booking" : "Add to booking"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🛒 Sticky bar when there are services in the cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold">
                {cart.length} service{cart.length > 1 ? "s" : ""} selected
              </span>
              <span className="text-gray-500 ml-2">
                You can pick professionals & times on the next step.
              </span>
            </div>
            <button
              className="px-6 py-2 rounded-full bg-[#E86C28] text-white font-medium hover:bg-[#cf5f20] transition"
              onClick={() => navigate(`/${subdomain}/booking/multi`)}
            >
              Continue to booking
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">
          {beautician?.name || "Business"}
        </span>
      </footer>
    </div>
  );
}

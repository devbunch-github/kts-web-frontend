// src/pages/public/BusinessHomePage.jsx
import { useEffect, useState } from "react";
import { listServices, listServiceCategories } from "../../api/service.js";
import { getBusinessSetting } from "../../api/settings.js";
import { listBeauticians } from "../../api/beautician.js";
import { listPublicGiftCards } from "../../api/giftCards";
import { MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function BusinessHomePage() {
  const [beautician, setBeautician] = useState(null);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  const [businessSettings, setBusinessSettings] = useState({});
  const [loadingBeautician, setLoadingBeautician] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [giftCards, setGiftCards] = useState([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const navigate = useNavigate();


  const ACCOUNT_ID = 725;

  useEffect(() => {
    loadBeautician();
    loadServices();
    loadBusinessSettings();
    loadGiftCards();
  }, []);

  const loadGiftCards = async () => {
    const list = await listPublicGiftCards(ACCOUNT_ID);
    setGiftCards(list || []);
  };


  // ===============================
  // LOAD BUSINESS SETTINGS (LOGO + COVER)
  // ===============================
  const loadBusinessSettings = async () => {
    try {
      const settings = await getBusinessSetting("site");
      setBusinessSettings(settings);
    } catch (err) {
      console.error("Business settings error:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const finalLogo =
    businessSettings?.logo_url
      ? businessSettings.logo_url
      : beautician?.logo_url
      ? beautician.logo_url
      : "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url
      ? businessSettings.cover_url
      : beautician?.cover_url
      ? beautician.cover_url
      : "/images/dummy/dummy.png";

  // ===============================
  // BEAUTICIAN (CITY/COUNTRY)
  // ===============================
  const loadBeautician = async () => {
    try {
      const res = await listBeauticians({ account_id: ACCOUNT_ID });
      setBeautician(res.data?.[0] || null);
    } catch (err) {
      console.error("Beautician fetch failed", err);
    } finally {
      setLoadingBeautician(false);
    }
  };

  // ===============================
  // SERVICES + CATEGORIES
  // ===============================
  const loadServices = async () => {
    try {
      const catRes = await listServiceCategories();
      setCategories(catRes?.data || []);

      const srvRes = await listServices({ account_id: ACCOUNT_ID });
      setServices(srvRes?.data || []);
    } catch (err) {
      console.error("Service fetch failed", err);
    } finally {
      setLoadingServices(false);
    }
  };

  // ===============================
  // FILTER LOGIC
  // ===============================
  const filteredServices = services.filter((srv) => {
    const matchCategory = selectedCategory
      ? srv.CategoryId == selectedCategory
      : true;

    const matchService =
      selectedServices.length > 0
        ? selectedServices.includes(srv.Name)
        : true;

    return matchCategory && matchService;
  });

  // ===============================
  // LOADERS
  // ===============================
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

  // ===============================
  // ACCORDION COMPONENT
  // ===============================
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

  // ===============================
  // FINAL RENDER
  // ===============================
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">

      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">

          {/* Logo (auto-scale, pixel perfect) */}
          <div className="h-10 max-w-[180px] flex items-center">
            {loadingBeautician ? (
              <div className="w-32 h-full bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <img
                src={finalLogo}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {/* Header contacts */}
          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* COVER IMAGE */}
      {loadingBeautician ? (
        <SkeletonHeader />
      ) : (
        <div className="w-full h-[430px] mt-[80px] overflow-hidden relative">
          <img
            src={finalCover}
            className="w-full h-full object-cover brightness-[0.75]"
            alt="Cover"
          />
          <div className="absolute top-[35%] w-full text-center">
            <h1 className="text-white text-4xl font-semibold">
              Unlock Your Radiance,
            </h1>
            <h1 className="text-white text-4xl font-semibold mt-1">
              One Style at a Time
            </h1>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-12 gap-10">

        {/* ================= SIDEBAR ================= */}
        <aside
          className="
            col-span-12 lg:col-span-3
            bg-white shadow-md rounded-xl p-6
            sticky top-[140px]
            self-start
          "
        >
          <h3 className="font-semibold text-lg mb-4">
            Filter results ({filteredServices.length})
          </h3>

          {/* Categories */}
          <Accordion title="Categories">
            {loadingServices ? (
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`cursor-pointer text-sm mb-1 ${
                    selectedCategory == cat.id
                      ? "text-[#E86C28] font-semibold"
                      : "text-[#777]"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.Name}
                </div>
              ))
            )}
          </Accordion>

          {/* Services */}
          <Accordion title="Services">
            {loadingServices ? (
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              services.map((srv) => (
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

          {/* Gift Card */}
          <Accordion title="Gift Cards">
            {giftCards.length === 0 ? (
              <p className="text-sm text-gray-500">No gift cards available</p>
            ) : (
              <div className="space-y-4">
                {giftCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 bg-[#FAFAFA] border rounded-lg p-3 shadow-sm"
                  >
                    <img
                      src={card.image_url || "/images/dummy/dummy.png"}
                      className="w-16 h-16 object-cover rounded-md"
                      alt={card.title}
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{card.title}</h4>
                      <p className="text-xs text-gray-600">Code: {card.code}</p>

                      <p className="text-xs text-gray-600">
                        Discount: £{card.discount_amount} ({card.discount_type})
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
                ))}
              </div>
            )}
          </Accordion>

        </aside>

        {/* ================= SERVICES GRID (NOW SHOWING CATEGORIES) ================= */}
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-center text-3xl font-bold mb-3">
            Popular Services
          </h2>
          <p className="text-center max-w-xl mx-auto text-gray-600 mb-10">
            Discover our range of professional beauty services categorized for your convenience.
          </p>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="
                    bg-white rounded-2xl
                    shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                    hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]
                    transition-all p-4 cursor-pointer
                  "
                  onClick={() => navigate(`/business/categories/${cat.id}`)}
                >
                  <div className="relative mb-4">
                    <img
                      src={cat.image_url ? cat.image_url : "/images/dummy/dummy.png"}
                      className="w-full h-52 object-cover rounded-xl"
                      alt={cat.Name}
                    />
                  </div>

                  <h3 className="font-semibold text-lg mb-1 text-center">
                    {cat.Name}
                  </h3>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">Octane</span>
      </footer>
    </div>
  );
}

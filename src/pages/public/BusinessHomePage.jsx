// src/pages/public/BusinessHomePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { listServices, listServiceCategories } from "../../api/service.js";
import { getBusinessSetting } from "../../api/settings.js";
import { listBeauticians } from "../../api/beautician.js";
import { listPublicGiftCards } from "../../api/giftCards";
import AuthModal from "../../components/public/AuthModal";
import { useAuth } from "../../context/AuthContext";

export default function BusinessHomePage() {
  const { subdomain } = useParams();
  const navigate = useNavigate();

  const [beautician, setBeautician] = useState(null);
  const [ACCOUNT_ID, setAccountId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  const [businessSettings, setBusinessSettings] = useState({});
  const [loadingBeautician, setLoadingBeautician] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [giftCards, setGiftCards] = useState([]);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);

  const [viewMode, setViewMode] = useState("services");

  const { isAuthenticated } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [pendingAction, setPendingAction] = useState(null);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  // ========================================
  // LOAD BEAUTICIAN
  // ========================================
  useEffect(() => {
    loadBeautician();
  }, [subdomain]);

  const loadBeautician = async () => {
    setLoadingBeautician(true);
    try {
      const res = await listBeauticians({ subdomain });
      const b = res?.data?.[0];

      if (!b) {
        console.error("No beautician found for this subdomain");
        return;
      }

      setBeautician(b);
      setAccountId(b.account_id);
    } catch (err) {
      console.error("Beautician fetch failed", err);
    } finally {
      setLoadingBeautician(false);
    }
  };

  // ========================================
  // LOAD SERVICES + SETTINGS + GIFT CARDS
  // ========================================
  useEffect(() => {
    if (ACCOUNT_ID) {
      loadServices();
      loadBusinessSettings();
      setLoadingGiftCards(true);
      loadGiftCards();
    }
  }, [ACCOUNT_ID]);

  const loadBusinessSettings = async () => {
    try {
      const settings = await getBusinessSetting("site", ACCOUNT_ID);
      setBusinessSettings(settings);
    } catch (err) {
      console.error("Business settings error:", err);
    } finally {
      setLoadingSettings(false);
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

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const catRes = await listServiceCategories({ account_id: ACCOUNT_ID });
      setCategories(catRes?.data || []);

      const srvRes = await listServices({ account_id: ACCOUNT_ID });
      setServices(srvRes?.data || []);
    } catch (err) {
      console.error("Service fetch failed", err);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadGiftCards = async () => {
    try {
      const cards = await listPublicGiftCards(ACCOUNT_ID);
      setGiftCards(cards || []);
    } catch (err) {
      console.error("Gift card fetch error:", err);
    } finally {
      setLoadingGiftCards(false);
    }
  };

  // ========================================
  // FILTERS
  // ========================================
  const filteredServices = services.filter((srv) => {
    const matchCategory = selectedCategory
      ? srv.CategoryId == selectedCategory
      : true;

    const matchService =
      selectedServices.length > 0 ? selectedServices.includes(srv.Name) : true;

    return matchCategory && matchService;
  });

  const filteredCategories = categories.filter((cat) => {
    if (selectedCategory && cat.id !== selectedCategory) return false;
    if (selectedServices.length > 0) {
      return filteredServices.some((srv) => srv.CategoryId == cat.id);
    }
    return true;
  });

  const filterResultCount =
    viewMode === "services" ? filteredCategories.length : giftCards.length;

  // ========================================
  // UI Skeleton Loaders
  // ========================================
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

  // ========================================
  // Accordion component
  // ========================================
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

  // ========================================
  // Helpers for Gift Cards
  // ========================================
  const getGiftCardSubtitle = (card) => {
    return card.applies_to || card.category || card.service_name || "All Services";
  };

  const getGiftCardFromText = (card) => {
    const amount =
      card.min_amount ?? card.amount ?? card.discount_amount ?? null;
    if (!amount) return null;
    return `from £${amount}`;
  };

  // ========================================
  // FINAL RETURN
  // ========================================
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">

          {/* ✅ FIX — ORIGINAL LOGO WRAPPER RESTORED */}
          <div className="h-10 max-w-[180px] flex items-center">
            {loadingBeautician ? (
              <div className="w-32 h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <img
                src={finalLogo}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            )}
          </div>

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
          <div className="absolute top-[35%] w-full text-center px-4">
            {viewMode === "giftcards" ? (
              <h1 className="text-white text-4xl md:text-5xl font-semibold">
                Gift Card
              </h1>
            ) : (
              <>
                <h1 className="text-white text-4xl md:text-5xl font-semibold">
                  Unlock Your Radiance,
                </h1>
                <h1 className="text-white text-4xl md:text-5xl font-semibold mt-1">
                  One Style at a Time
                </h1>
              </>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-12 gap-10">

        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 bg-white shadow-md rounded-xl p-6 sticky top-[140px] self-start">
          <h3 className="font-semibold text-lg mb-4">
            Filter results ({filterResultCount})
          </h3>

          {/* Categories */}
          <Accordion title="Categories">
            {loadingServices ? (
              <>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse mt-2" />
              </>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`cursor-pointer text-sm mb-1 transition ${
                    selectedCategory == cat.id
                      ? "text-[#E86C28] font-semibold"
                      : "text-[#777]"
                  }`}
                  onClick={() => {
                    setViewMode("services");
                    setSelectedCategory((prev) =>
                      prev === cat.id ? null : cat.id
                    );
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
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse mt-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse mt-2" />
              </>
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
                      setViewMode("services");
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
          <Accordion title="Gift Card">
            <div
              className={`mt-2 text-sm rounded-lg border px-3 py-2 cursor-pointer text-center transition
                ${
                  viewMode === "giftcards"
                    ? "bg-[#E86C28] text-white border-[#E86C28] shadow-md"
                    : "bg-white text-[#333] border-[#E5E7EB] hover:bg-[#FFF7F2]"
                }`}
              onClick={() => setViewMode("giftcards")}
            >
              View Gift Cards ({giftCards.length})
            </div>
          </Accordion>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <div className="col-span-12 lg:col-span-9">
          {viewMode === "giftcards" ? (
            <>
              {/* GIFT CARDS GRID */}
              {loadingGiftCards ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : giftCards.length === 0 ? (
                <p className="text-center text-gray-500">
                  No gift cards available at the moment.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {giftCards.map((card) => {
                    const fromText = getGiftCardFromText(card);

                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-[#F3F4F6] overflow-hidden flex flex-col"
                      >
                        <div className="w-full h-52 overflow-hidden">
                          <img
                            src={card.image_url || "/images/dummy/dummy.png"}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="px-6 pt-5 pb-6 flex flex-col flex-1">

                          <h3 className="font-semibold text-base mb-1">
                            {card.title}
                          </h3>

                          <p className="text-xs text-gray-500 mb-2">
                            {getGiftCardSubtitle(card)}
                          </p>

                          {fromText && (
                            <p className="text-sm font-semibold text-gray-900 mb-4">
                              {fromText}
                            </p>
                          )}

                          <div className="mt-auto">
                            <button
                              type="button"
                              className="w-full text-sm font-medium mt-2 rounded-full border border-[#E86C28] text-[#E86C28] py-2.5 hover:bg-[#E86C28] hover:text-white transition"
                              onClick={() => {
                                const goToPayment = () =>
                                  navigate(
                                    `/${subdomain}/gift-card/${card.id}/payment?account_id=${ACCOUNT_ID}`
                                  );

                                if (!isAuthenticated) {
                                  setPendingAction(() => goToPayment);
                                  openAuth("login");
                                  return;
                                }

                                goToPayment();
                              }}
                            >
                              Buy Now
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* POPULAR SERVICES */}
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
                  {filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl shadow p-4 cursor-pointer hover:shadow-lg transition"
                      onClick={() =>
                        navigate(`/${subdomain}/categories/${cat.id}`)
                      }
                    >
                      <img
                        src={cat.image_url || "/images/dummy/dummy.png"}
                        className="w-full h-52 object-cover rounded-xl"
                        alt={cat.Name}
                      />
                      <h3 className="font-semibold text-lg mt-3 text-center">
                        {cat.Name}
                      </h3>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* AUTH MODAL */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        mode={authMode}
        onSuccess={() => {
          setShowAuth(false);

          // Execute the pending action (redirect to payment)
          if (pendingAction) {
            const action = pendingAction;
            setPendingAction(null);
            action();
          }
        }}
      />

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

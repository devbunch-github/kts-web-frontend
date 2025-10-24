import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSmsPackages } from "../../api/sms";
import PaymentConfirmModal from "../../components/PaymentConfirmModal";

export default function SmsPackagePayment() {
 const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedCard, setSelectedCard] = useState(null);
  const [message, setMessage] = useState(null);
  const [cards, setCards] = useState([
    { id: 1, brand: "mastercard", last4: "2345" },
    { id: 2, brand: "visa", last4: "3456" },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", brand: "" });
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch selected package
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSmsPackages();
        if (res?.success && Array.isArray(res.data)) {
          const found = res.data.find((p) => p.id === parseInt(id));
          setPkg(found);
        }
      } catch (err) {
        console.error(err);
        setMessage({ text: "Failed to load package details.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePay = () => {
    setShowConfirm(true);
  };

  const handleModalClose = () => {
    setShowConfirm(false);
    navigate("/dashboard/sms-packages", {
        state: { activatedPackageId: pkg.id },
    });
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCard.number || !newCard.brand) return;

    const last4 = newCard.number.slice(-4);
    const newCardObj = {
      id: cards.length + 1,
      brand: newCard.brand,
      last4,
    };

    setCards([...cards, newCardObj]);
    setNewCard({ number: "", brand: "" });
    setShowAddCard(false);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#faf7f7] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-1xl">
        {/* Back Button */}
        <div className="flex items-center mb-10">
          <button
            onClick={() => navigate("/dashboard/sms-packages")}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
          >
            <span className="bg-rose-100 text-rose-500 px-2 py-1 rounded-lg shadow-sm">
              <i className="bi bi-arrow-left text-base"></i>
            </span>
          </button>
            {/* Title */}
            <h2 className="text-[22px] font-semibold text-gray-800 pl-3 text-left">
            SMS Package Payment
            </h2>
        </div>


        {message && (
          <div
            className={`mb-6 p-3 rounded-md text-sm text-center ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* CARD CONTAINER */}
        <div className="bg-white rounded-[20px] shadow-xl border border-gray-100 p-8 text-gray-700 text-sm flex flex-col items-center w-full max-w-2xl mx-auto">
          {/* PACKAGE INFO */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{pkg?.name}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              £{parseFloat(pkg?.price).toFixed(2)}
            </p>
            <p className="text-gray-500">{pkg?.total_sms} SMS/month</p>
          </div>

          {/* INNER PAYMENT CARD */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 w-full max-w-sm">
            {/* Credit/Debit Option */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="accent-rose-500"
              />
              <span className="font-medium text-gray-900">Credit / Debit Card</span>
            </label>

            {/* Saved Cards */}
            {paymentMethod === "card" && (
              <div className="space-y-3 mb-4">
                {cards.map((card) => (
                  <label
                    key={card.id}
                    className="flex items-center justify-between border border-gray-200 rounded-xl p-3 hover:bg-rose-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <i className="bi bi-credit-card-2-front text-gray-500 text-sm"></i>
                      <span>**** {card.last4}</span>
                    </div>
                    <input
                      type="radio"
                      name="selectedCard"
                      checked={selectedCard === card.id}
                      onChange={() => setSelectedCard(card.id)}
                      className="accent-rose-500"
                    />
                  </label>
                ))}

                {/* Add Card */}
                <button
                  onClick={() => setShowAddCard(true)}
                  className="text-[#e88a8a] text-sm font-medium hover:underline"
                >
                  + Add Card
                </button>
              </div>
            )}

            {/* PayPal Option */}
            <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                    className="accent-rose-500"
                />
                <span className="font-medium text-gray-900">PayPal</span>
              </div>
              <i className="bi bi-credit-card-2-front text-gray-500 text-sm"></i>
            </label>
          </div>
        </div>

        {/* PAY BUTTON */}
        <div className="flex justify-end mt-8 w-full max-w-2xl mx-auto">
          <button
            onClick={handlePay}
            disabled={!paymentMethod}
            className="bg-[#b77272] hover:bg-[#a66060] text-white font-medium rounded-md px-16 py-2.5 transition disabled:opacity-60"
          >
            Pay
          </button>
        </div>
      </div>

      {/* ADD CARD MODAL */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[95%] max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Card</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  maxLength={16}
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  placeholder="Enter 16-digit number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  value={newCard.brand}
                  onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                  required
                >
                  <option value="">Select Card Type</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">MasterCard</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#b77272] hover:bg-[#a66060] text-white font-medium"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      <PaymentConfirmModal open={showConfirm} onClose={handleModalClose} />
    </div>
  );
}

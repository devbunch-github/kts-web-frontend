import Modal from "../Modal";
import { getPlans, preRegister, checkEmail } from "../../api/publicApi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const navigate = useNavigate();

  const [f, setF] = useState({
    email: "",
    confirm_email: "",
    name: "",
    country: "",
    salary: "",
    plan_id: null,
    agree: false,
  });

  useEffect(() => {
    if (open) {
      getPlans().then(setPlans).catch(() => {});
    }
  }, [open]);

  const next = async () => {
    setError("");

    // STEP 1: Validation + Email Check
    if (step === 1) {
      if (!f.email || !f.confirm_email || !f.name || !f.country) {
        setError("Please fill in all required fields.");
        return;
      }
      if (f.email !== f.confirm_email) {
        setError("Emails do not match.");
        return;
      }

      try {
        setCheckingEmail(true);
        const res = await checkEmail(f.email);
        if (res.exists) {
          setError("This email is already registered.");
          return;
        }
      } catch (err) {
        if (err.response?.status === 409) {
          setError("This email is already registered.");
          return;
        } else {
          setError("Error checking email. Please try again.");
          return;
        }
      } finally {
        setCheckingEmail(false);
      }
    }

    // STEP 3: Pre-register before payment
    if (step === 3) {
      if (!f.plan_id) {
        setError("Please select a plan.");
        return;
      }

      setLoadingPayment(true);
      try {
        const newUser = await preRegister({
          email: f.email,
          name: f.name,
          country: f.country,
        });
        navigate(`/subscription/payment?plan=${f.plan_id}&user=${newUser.id}`);
        onClose();
      } catch (err) {
        setError("This email is already registered.");
      } finally {
        setLoadingPayment(false);
      }
      return;
    }

    setStep((s) => Math.min(s + 1, 4));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Modal open={open} onClose={onClose} title="Sign up">
      <ProgressBar step={step} />

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6 mt-6">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-400 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-800">
              Your Information
            </h3>
            <Field
              label="Email"
              type="email"
              value={f.email}
              onChange={(v) => setF((s) => ({ ...s, email: v }))}
              required
            />
            <Field
              label="Confirm Email"
              type="email"
              value={f.confirm_email}
              onChange={(v) => setF((s) => ({ ...s, confirm_email: v }))}
              required
            />
            <Field
              label="Full Name"
              value={f.name}
              onChange={(v) => setF((s) => ({ ...s, name: v }))}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Country of Residence <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={f.country}
                onChange={(e) =>
                  setF((s) => ({ ...s, country: e.target.value }))
                }
              >
                <option value="">Select country</option>
                <option value="UK">United Kingdom</option>
                <option value="US">United States</option>
                <option value="PK">Pakistan</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: Employment */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-800">
              Employment
            </h3>
            <p className="text-sm text-neutral-600">
              If you have employment income please enter your annual salary. Click next to skip.
            </p>
            <Field
              label="Enter Annual Salary"
              type="number"
              value={f.salary}
              onChange={(v) => setF((s) => ({ ...s, salary: v }))}
            />
          </div>
        )}

        {/* STEP 3: Choose Plan */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-800">
              Choose Your Plan
            </h3>
            <div className="space-y-3">
              {plans.map((p) => {
                const isSelected = f.plan_id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border transition ${
                      isSelected
                        ? "border-rose-400 bg-rose-50"
                        : "border-neutral-300"
                    }`}
                  >
                    <label
                      className="flex items-center justify-between w-full cursor-pointer p-4"
                      onClick={() => setF((s) => ({ ...s, plan_id: p.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() =>
                            setF((s) => ({ ...s, plan_id: p.id }))
                          }
                        />
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-neutral-500">
                            £{(p.price_minor / 100).toFixed(2)}/month
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPlan(
                            expandedPlan === p.id ? null : p.id
                          );
                        }}
                        className="text-sm text-rose-500 underline"
                      >
                        {expandedPlan === p.id ? "Hide" : "Details"}
                      </button>
                    </label>

                    {(expandedPlan === p.id || isSelected) && (
                      <div className="px-6 pb-4 text-sm text-neutral-600 space-y-1">
                        {p.features?.length ? (
                          <ul className="list-disc pl-5">
                            {p.features.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{p.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={prev}
              disabled={checkingEmail || loadingPayment}
              className="rounded-lg border px-4 py-2 text-sm text-rose-500 border-rose-400 hover:bg-rose-50 disabled:opacity-60"
            >
              Previous Step
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={next}
            disabled={checkingEmail || loadingPayment}
            className="rounded-lg bg-rose-400 px-6 py-2 text-white hover:bg-rose-500 disabled:opacity-70 flex items-center gap-2"
          >
            {(checkingEmail || loadingPayment) && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            {checkingEmail
              ? "Checking Email..."
              : loadingPayment
              ? "Processing..."
              : step === 3
              ? "Continue to Payment"
              : "Next Step"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400"
      />
    </div>
  );
}

function ProgressBar({ step }) {
  return (
    <div className="flex items-center justify-between">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex-1 flex items-center">
          <div
            className={`h-2 rounded-full flex-1 ${
              s <= step ? "bg-rose-400" : "bg-neutral-300"
            }`}
          />
          {s < 3 && <div className="w-2" />}
        </div>
      ))}
    </div>
  );
}

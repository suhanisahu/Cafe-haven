
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  UserRound,
  Mail,
  Phone,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  AlertCircle,
} from "lucide-react";

import candleDinner from "../assets/images/candle-dinner.png";
import familyDinner from "../assets/images/family-dinner.png";
import privateTheatre from "../assets/images/private-theatre.png";

const API_URL = "https://cafe-haven.onrender.com/api";

const EXPERIENCE_PRICES = {
  regular: 0,
  candle: 5999,
  family: 6999,
  theatre: 7999,
};

const EXPERIENCE_OPTIONS = [
  {
    id: "candle",
    name: "Candle Light Dinner",
    subtitle: "A romantic evening",
    price: 5999,
    image: candleDinner,
  },
  {
    id: "family",
    name: "Family Dinner",
    subtitle: "Moments together",
    price: 6999,
    image: familyDinner,
  },
  {
    id: "theatre",
    name: "Private Theatre",
    subtitle: "Your private movie night",
    price: 7999,
    image: privateTheatre,
  },
];

const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  guests: "",
  experience: "",
};

const getCookie = (name) => {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
};

function formatPrice(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

function Booking() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  const [toast, setToast] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  // Automatically hide toast after 3.5 seconds
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  // Toast notification helper
  const showToast = (message, type = "error") => {
    setToast({
      message,
      type,
      id: Date.now(),
    });
  };

  const basePrice = EXPERIENCE_PRICES[formData.experience] ?? 0;
  const gstAmount = Math.round(basePrice * 5) / 100;
  const totalAmount = basePrice + gstAmount;
  const advanceAmount = Math.round(totalAmount * 50) / 100;
  const remainingAmount = totalAmount - advanceAmount;

  const selectedExperience = EXPERIENCE_OPTIONS.find(
    (item) => item.id === formData.experience
  );

  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getCsrfToken = async () => {
    const response = await fetch(`${API_URL}/accounts/csrf/`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to get CSRF token.");
    }

    const token = getCookie("csrftoken");

    if (!token) {
      throw new Error(
        "CSRF cookie not found. Check Django CSRF settings."
      );
    }

    return token;
  };

  // Create booking
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!formData.experience) {
      showToast("Please select a dining experience.");
      return;
    }

    if (formData.experience === "regular") {
      showToast(
        "Regular Dining pricing has not been configured yet."
      );
      return;
    }

    const selectedDate = new Date(`${formData.date}T00:00:00`);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const guests = Number(formData.guests);

    if (
      !formData.date ||
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate < currentDate
    ) {
      showToast("Please select today or a future date.");
      return;
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
      showToast("Number of guests must be between 1 and 20.");
      return;
    }

    setLoading(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}/bookings/create/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          ...formData,
          guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit booking.");
      }

      setPendingBooking({
        bookingId: data.booking_id,
        pricing: data.pricing,
        csrfToken,
      });

      setSuccessModal({
        title: "Your booking is created!",
        message:
          "Your reservation details have been saved successfully.",
        bookingId: data.booking_id,
        total: formatPrice(data.pricing.total_amount),
        advance: formatPrice(data.pricing.advance_amount),
        note:
          "Continue to the demo payment section to complete your booking.",
        type: "booking",
      });
    } catch (error) {
      console.error("Booking error:", error);
      showToast(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Simulated PhonePe payment
  const handleDemoPayment = async (paymentResult) => {
    if (!pendingBooking || loading) return;

    setLoading(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `${API_URL}/bookings/demo-phonepe-payment/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            booking_id: pendingBooking.bookingId,
            payment_result: paymentResult,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Demo payment failed.");
      }

      if (paymentResult === "success") {
        setFormData({ ...INITIAL_FORM });
        setPendingBooking(null);

        setSuccessModal({
          title: "Payment successful!",
          message:
            data.message || "Your demo payment was completed successfully.",
          bookingId: data.booking_id,
          total: formatPrice(data.amount),
          advance: formatPrice(data.amount),
          note:
            "This was a simulated payment, not a real PhonePe transaction.",
          type: "payment",
        });
      } else {
        showToast(
          data.message ||
            "Demo payment was unsuccessful. You can try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Demo payment error:", error);
      showToast(
        error.message || "Unable to process demo payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="modern-booking-page">

      {/* Booking hero */}
      <section className="modern-booking-hero">
        <div>
          <span className="booking-eyebrow">
            <Sparkles size={15} /> THE CAFE HAVEN EXPERIENCE
          </span>

          <h1>
            Your moment.
            <br />
            <em>Your table.</em>
          </h1>

          <p>
            Make time for good food, beautiful company and
            experiences worth remembering.
          </p>
        </div>

        <div className="booking-hero-note">
          <span>01 — 03</span>
          <span>RESERVE YOUR EXPERIENCE</span>
        </div>
      </section>

      {/* Booking content */}
      <section className="modern-booking-layout">

        <form className="modern-booking-form" onSubmit={handleSubmit}>

          <div className="booking-section-heading">
            <span>01 / YOUR DETAILS</span>
            <h2>Let's get to know you.</h2>
            <p>Tell us a little about your visit.</p>
          </div>

          <div className="modern-booking-fields">

            <div className="modern-field">
              <label htmlFor="full_name">
                <UserRound size={15} /> Full Name
              </label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="modern-field">
              <label htmlFor="email">
                <Mail size={15} /> Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="modern-field">
              <label htmlFor="phone">
                <Phone size={15} /> Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                autoComplete="tel"
                required
              />
            </div>

          </div>

          <div className="booking-form-divider"></div>

          <div className="booking-section-heading">
            <span>02 / PLAN YOUR VISIT</span>
            <h2>When should we expect you?</h2>
            <p>Choose a date, time and group size.</p>
          </div>

          <div className="modern-booking-fields">

            <div className="modern-field">
              <label htmlFor="date">
                <CalendarDays size={15} /> Preferred Date
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            <div className="modern-field">
              <label htmlFor="time">
                <Clock3 size={15} /> Preferred Time
              </label>
              <input
                id="time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="modern-field">
              <label htmlFor="guests">
                <Users size={15} /> Number of Guests
              </label>
              <input
                id="guests"
                type="number"
                name="guests"
                min="1"
                max="20"
                step="1"
                value={formData.guests}
                onChange={handleChange}
                placeholder="1–20 guests"
                required
              />
            </div>

          </div>

          <div className="booking-form-divider"></div>

          <div className="booking-section-heading">
            <span>03 / CHOOSE YOUR EXPERIENCE</span>
            <h2>Make it a little special.</h2>
            <p>Select the experience you'd love to enjoy.</p>
          </div>

          <div className="modern-experience-options">

            {EXPERIENCE_OPTIONS.map((experience) => (
              <button
                type="button"
                key={experience.id}
                className={`modern-experience-option ${
                  formData.experience === experience.id ? "selected" : ""
                }`}
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    experience: experience.id,
                  }))
                }
                aria-pressed={formData.experience === experience.id}
              >
                <div className="modern-option-image">
                  <img src={experience.image} alt={experience.name} />

                  {formData.experience === experience.id && (
                    <span className="modern-option-check">
                      <Check size={15} />
                    </span>
                  )}
                </div>

                <div className="modern-option-content">
                  <span>{experience.subtitle}</span>
                  <strong>{experience.name}</strong>
                  <b>{formatPrice(experience.price)}</b>
                </div>
              </button>
            ))}

          </div>

          <div className="modern-regular-option">
            <label htmlFor="regular-experience">
              <input
                id="regular-experience"
                type="radio"
                name="regular-experience"
                checked={formData.experience === "regular"}
                onChange={() =>
                  setFormData((previous) => ({
                    ...previous,
                    experience: "regular",
                  }))
                }
              />
              Regular Dining
              <span>Pricing not available yet</span>
            </label>
          </div>

          {!pendingBooking ? (
            <button
              type="submit"
              className="modern-submit-booking"
              disabled={loading}
            >
              {loading ? "Submitting your request..." : "Continue to Booking"}
              <ArrowRight size={18} />
            </button>
          ) : (
            <div className="modern-demo-payment">
              <span className="booking-eyebrow">BOOKING CREATED</span>
              <h3>Your reservation is ready for demo payment.</h3>

              <p>
                Booking ID: <strong>{pendingBooking.bookingId}</strong>
              </p>

              <p>
                Advance Amount:{" "}
                <strong>
                  {formatPrice(pendingBooking.pricing.advance_amount)}
                </strong>
              </p>

              <div className="modern-payment-actions">
                <button
                  type="button"
                  className="modern-submit-booking"
                  disabled={loading}
                  onClick={() => handleDemoPayment("success")}
                >
                  {loading ? "Processing..." : "Simulate Payment Success"}
                </button>

                <button
                  type="button"
                  className="modern-payment-failed"
                  disabled={loading}
                  onClick={() => handleDemoPayment("failed")}
                >
                  Simulate Payment Failure
                </button>
              </div>

              <p className="modern-demo-note">
                Demo only. No real PhonePe transaction will be made.
              </p>
            </div>
          )}

        </form>

        {/* Price summary */}
        <aside className="modern-booking-summary">

          <div className="booking-summary-top">
            <span>YOUR EXPERIENCE</span>
            <Sparkles size={19} />
          </div>

          {selectedExperience ? (
            <>
              <div className="booking-summary-image">
                <img
                  src={selectedExperience.image}
                  alt={selectedExperience.name}
                />
              </div>

              <h3>{selectedExperience.name}</h3>

              <p className="booking-summary-description">
                {selectedExperience.subtitle}
              </p>

              <div className="booking-summary-divider"></div>

              <div className="booking-summary-row">
                <span>Experience Price</span>
                <strong>{formatPrice(basePrice)}</strong>
              </div>

              <div className="booking-summary-row">
                <span>GST (5%)</span>
                <strong>{formatPrice(gstAmount)}</strong>
              </div>

              <div className="booking-summary-total">
                <span>Total Amount</span>
                <strong>{formatPrice(totalAmount)}</strong>
              </div>

              <div className="booking-advance-panel">
                <span>50% ADVANCE PAYMENT</span>
                <strong>{formatPrice(advanceAmount)}</strong>
                <p>Required to proceed with your booking.</p>
              </div>

              <div className="booking-summary-row booking-remaining">
                <span>Remaining at Cafe</span>
                <strong>{formatPrice(remainingAmount)}</strong>
              </div>
            </>
          ) : (
            <div className="booking-summary-empty">
              <Sparkles size={30} />
              <h3>Your special moment starts here.</h3>
              <p>
                Choose one of our dining experiences to see your
                price breakdown.
              </p>
            </div>
          )}

          <div className="booking-summary-security">
            <ShieldCheck size={18} />
            <p>
              Your booking details are submitted securely through
              Cafe Haven's booking system.
            </p>
          </div>

          <div className="booking-summary-footnote">
            <span>CAFE HAVEN</span>
            <span>GOOD FOOD · GREAT MOMENTS</span>
          </div>

        </aside>

      </section>

      {/* Toast notification */}
      {toast && (
        <div
          key={toast.id}
          className={`cafe-toast cafe-toast-${toast.type}`}
          role="alert"
        >
          <span className="cafe-toast-icon">
            <AlertCircle size={19} />
          </span>

          <p>{toast.message}</p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Success modal */}
      {successModal && (
        <div
          className="cafe-modal-overlay"
          onClick={() => setSuccessModal(null)}
        >
          <div
            className="cafe-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cafe-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="cafe-modal-close"
              onClick={() => setSuccessModal(null)}
              aria-label="Close popup"
            >
              <X size={20} />
            </button>

            <div className="cafe-success-icon">
              <Check size={34} strokeWidth={2.5} />
            </div>

            <span className="cafe-modal-eyebrow">
              CAFE HAVEN · CONFIRMATION
            </span>

            <h2 id="cafe-modal-title">{successModal.title}</h2>

            <p className="cafe-modal-message">
              {successModal.message}
            </p>

            <div className="cafe-modal-details">
              <div>
                <span>Booking ID</span>
                <strong>{successModal.bookingId}</strong>
              </div>

              {successModal.type === "booking" && (
                <div>
                  <span>Total Amount</span>
                  <strong>{successModal.total}</strong>
                </div>
              )}

              <div>
                <span>
                  {successModal.type === "payment"
                    ? "Payment Amount"
                    : "Advance Amount"}
                </span>
                <strong>{successModal.advance}</strong>
              </div>
            </div>

            <p className="cafe-modal-note">
              {successModal.note}
            </p>

            <button
              type="button"
              className="cafe-modal-button"
              onClick={() => setSuccessModal(null)}
            >
              Continue <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

export default Booking;

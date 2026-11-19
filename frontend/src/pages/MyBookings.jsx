import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api/bookings/";
const CSRF_URL = "http://localhost:8000/api/accounts/csrf/";

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  guests: "",
  experience: "regular",
};

function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return value.join("=");
    }
  }

  return null;
}

async function getCsrfToken() {
  const response = await fetch(CSRF_URL, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to obtain a CSRF token. Please try again.");
  }

  const token = getCookie("csrftoken");

  if (!token) {
    throw new Error("CSRF token not found. Please refresh and try again.");
  }

  return token;
}

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}my/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        setBookings([]);
        setError("Please log in to view your bookings.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to load bookings.");
      }

      setBookings(data.bookings || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelingId(bookingId);
    setError("");

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}${bookingId}/cancel/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to cancel booking.");
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: data.status || "cancelled" }
            : booking
        )
      );

      if (editingId === bookingId) {
        setEditingId(null);
      }

      window.alert(data.message || "Booking cancelled successfully.");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setCancelingId(null);
    }
  };

  const startEditing = (booking) => {
    if (booking.status === "cancelled") return;

    setEditingId(booking.id);

    setFormData({
      full_name: booking.full_name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      guests: String(booking.guests),
      experience: booking.experience,
    });

    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (saving || editingId === null) return;

    const guests = Number(formData.guests);

    if (
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 20
    ) {
      setError("Number of guests must be a whole number between 1 and 20.");
      return;
    }

    if (!formData.date) {
      setError("Please select a booking date.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${formData.date}T00:00:00`);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate < today
    ) {
      setError("Past dates are not allowed.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}${editingId}/update/`, {
        method: "PUT",
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
        throw new Error(data.error || "Unable to update booking.");
      }

      await fetchBookings();
      setEditingId(null);
      setFormData(emptyForm);

      window.alert(data.message || "Booking updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading bookings...</p>;
  }

  return (
    <main className="booking-page">
      <section className="booking-header">
        <p className="section-label">RESERVATIONS</p>
        <h1>My Bookings</h1>
        <p>View and manage your Cafe Haven reservations.</p>
      </section>

      <section className="booking-form-section">
        {error && <p role="alert">{error}</p>}

        {!error && bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : bookings.length > 0 ? (
          <div className="my-bookings-list">
            {bookings.map((booking) => {
              const isCancelled = booking.status === "cancelled";
              const status = booking.status || "pending";

              return (
                <article
                  key={booking.id}
                  className="my-booking-card"
                >
                  <h2>{booking.full_name}</h2>

                  <p><strong>Booking ID:</strong> {booking.id}</p>
                  <p><strong>Date:</strong> {booking.date}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Guests:</strong> {booking.guests}</p>
                  <p><strong>Experience:</strong> {booking.experience}</p>
                  <p>
  <strong>Payment Status:</strong>{" "}
  <span className={`payment-status status-${booking.payment_status || "pending"}`}>
    {booking.payment_status || "pending"}
  </span>
</p>

<p>
  <strong>Total Amount:</strong>{" "}
  ₹{Number(booking.pricing?.total_amount || 0).toFixed(2)}
</p>

<p>
  <strong>Advance Amount:</strong>{" "}
  ₹{Number(booking.pricing?.advance_amount || 0).toFixed(2)}
</p>

<p>
  <strong>Remaining Amount:</strong>{" "}
  ₹{Number(booking.pricing?.remaining_amount || 0).toFixed(2)}
</p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`booking-status status-${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </p>

                  <p><strong>Email:</strong> {booking.email}</p>
                  <p><strong>Phone:</strong> {booking.phone}</p>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => startEditing(booking)}
                    disabled={
                      cancelingId === booking.id ||
                      saving ||
                      isCancelled
                    }
                  >
                    Edit Booking
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleCancel(booking.id)}
                    disabled={
                      cancelingId === booking.id ||
                      saving ||
                      isCancelled
                    }
                  >
                    {cancelingId === booking.id
                      ? "Cancelling..."
                      : isCancelled
                        ? "Booking Cancelled"
                        : "Cancel Booking"}
                  </button>

                  {editingId === booking.id && !isCancelled && (
                    <form onSubmit={handleUpdate} className="booking-form">
                      <h3>Edit Your Reservation</h3>

                      <label htmlFor={`name-${booking.id}`}>Full Name</label>
                      <input
                        id={`name-${booking.id}`}
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                      />

                      <label htmlFor={`email-${booking.id}`}>Email</label>
                      <input
                        id={`email-${booking.id}`}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />

                      <label htmlFor={`phone-${booking.id}`}>
                        Phone Number
                      </label>
                      <input
                        id={`phone-${booking.id}`}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />

                      <label htmlFor={`date-${booking.id}`}>Date</label>
                      <input
                        id={`date-${booking.id}`}
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={(() => {
                          const date = new Date();
                          date.setMinutes(
                            date.getMinutes() - date.getTimezoneOffset()
                          );
                          return date.toISOString().slice(0, 10);
                        })()}
                        required
                      />

                      <label htmlFor={`time-${booking.id}`}>Time</label>
                      <input
                        id={`time-${booking.id}`}
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />

                      <label htmlFor={`guests-${booking.id}`}>
                        Number of Guests
                      </label>
                      <input
                        id={`guests-${booking.id}`}
                        type="number"
                        name="guests"
                        min="1"
                        max="20"
                        step="1"
                        value={formData.guests}
                        onChange={handleChange}
                        required
                      />

                      <label htmlFor={`experience-${booking.id}`}>
                        Dining Experience
                      </label>
                      <select
                        id={`experience-${booking.id}`}
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                      >
                        <option value="regular">Regular Dining</option>
                        <option value="candle">Candle Light Dinner</option>
                        <option value="family">Family Dinner</option>
                        <option value="theatre">Private Theatre</option>
                      </select>

                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => {
                          setEditingId(null);
                          setFormData(emptyForm);
                          setError("");
                        }}
                        disabled={saving}
                      >
                        Discard Changes
                      </button>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default MyBookings;

import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import * as XLSX from "xlsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_URL = "http://localhost:8000/api/bookings/";
const ACCOUNT_API = "http://localhost:8000/api/accounts/";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const chartData = [
  { name: "Pending", value: stats.pending },
  { name: "Confirmed", value: stats.confirmed },
  { name: "Cancelled", value: stats.cancelled },
];

const chartColors = ["#f59e0b", "#16a34a", "#ef4444"];
const monthlyChartData = Array.from({ length: 12 }, (_, index) => {
  const monthBookings = bookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T00:00:00`);

    return (
      bookingDate.getMonth() === index &&
      bookingDate.getFullYear() === new Date().getFullYear()
    );
  });

  return {
    month: new Date(2000, index).toLocaleString("en-US", {
      month: "short",
    }),
    bookings: monthBookings.length,
  };
});

  const exportToExcel = () => {
  if (filteredBookings.length === 0) {
    alert("No bookings available to export.");
    return;
  }

  const chartData = [
  { name: "Pending", value: stats.pending },
  { name: "Confirmed", value: stats.confirmed },
  { name: "Cancelled", value: stats.cancelled },
];

const monthlyChartData = Array.from({ length: 12 }, (_, index) => {
  const monthBookings = bookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T00:00:00`);

    return (
      bookingDate.getMonth() === index &&
      bookingDate.getFullYear() === new Date().getFullYear()
    );
  });

  return {
    month: new Date(2000, index).toLocaleString("en-US", {
      month: "short",
    }),
    bookings: monthBookings.length,
  };
});

const chartColors = ["#f59e0b", "#16a34a", "#ef4444"];

  const excelData = filteredBookings.map((booking) => ({
    "Booking ID": booking.id,
    "Customer Name": booking.full_name,
    Email: booking.email,
    Phone: booking.phone,
    Date: booking.date,
    Time: booking.time,
    Guests: booking.guests,
    Experience: booking.experience,
    Status: booking.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  XLSX.writeFile(workbook, "Cafe_Haven_Bookings.xlsx");
};

  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const [statsResponse, bookingsResponse] = await Promise.all([
        fetch(`${API_URL}admin-stats/`, {
          credentials: "include",
        }),
        fetch(`${API_URL}admin-all/`, {
          credentials: "include",
        }),
      ]);

      const statsData = await statsResponse.json();
      const bookingsData = await bookingsResponse.json();

      if (!statsResponse.ok || !bookingsResponse.ok) {
        throw new Error("Admin access required. Please log in.");
      }

      setStats(statsData);
      setBookings(bookingsData.bookings);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Search, filter and sort bookings
  const filteredBookings = bookings
  .filter((booking) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      booking.full_name.toLowerCase().includes(search) ||
      booking.email.toLowerCase().includes(search) ||
      booking.phone.includes(search);

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const matchesDate =
      dateFilter === "" || booking.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  })
  .sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);

    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Update booking status
  const updateStatus = async (bookingId, status) => {
    try {
      await fetch(`${ACCOUNT_API}csrf/`, {
        credentials: "include",
      });

      const response = await fetch(
        `${API_URL}admin-update/${bookingId}/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken() || "",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update booking.");
      }

      await loadDashboard();

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((previous) => ({
          ...previous,
          status,
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Admin logout
  const handleLogout = async () => {
    try {
      await fetch(`${ACCOUNT_API}csrf/`, {
        credentials: "include",
      });

      const response = await fetch(`${ACCOUNT_API}logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCSRFToken() || "",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to log out. Please try again.");
      }

      window.location.href = "/admin-login";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-dashboard">

      {/* Dashboard Header */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome to Cafe Haven Administration</p>
        </div>

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {error && <p>{error}</p>}

      {/* Dashboard Statistics */}
      <div className="admin-stats">
        {[
          { title: "Total Bookings", value: stats.total },
          { title: "Pending", value: stats.pending },
          { title: "Confirmed", value: stats.confirmed },
          { title: "Cancelled", value: stats.cancelled },
        ].map((card) => (
          <div className="admin-card" key={card.title}>
            <h3>{card.title}</h3>
            <h2>{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="admin-chart-section">
        <div className="admin-chart-section">
  <h2>Monthly Booking Overview</h2>

  <div className="admin-chart">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />

        <Bar
          dataKey="bookings"
          name="Total Bookings"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
  <h2>Booking Status Overview</h2>

  <div className="admin-chart">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={chartColors[index]}
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
      <h2>All Customer Bookings</h2>

      <button
  className="export-excel-btn"
  onClick={exportToExcel}
>
  Export to Excel
</button>

      {/* Search and Filters */}
      <div className="admin-filters">
        <input
  type="date"
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
  aria-label="Filter bookings by date"
/>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading && <p>Loading bookings...</p>}

      {/* Bookings Table */}
      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.full_name}</td>
                  <td>{booking.email}</td>
                  <td>{booking.date}</td>
                  <td>{booking.time}</td>
                  <td>{booking.guests}</td>
                  <td>{booking.experience}</td>

                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                    >
                      View Details
                    </button>

                    {booking.status !== "confirmed" && (
                      <button
                        onClick={() =>
                          updateStatus(booking.id, "confirmed")
                        }
                      >
                        Confirm
                      </button>
                    )}

                    {booking.status !== "cancelled" && (
                      <button
                        onClick={() =>
                          updateStatus(booking.id, "cancelled")
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <p>No matching bookings found.</p>
          )}
        </div>
      )}

      {/* Booking Details Popup */}
      {selectedBooking && (
        <div
          className="booking-modal-overlay"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="booking-modal-close"
              onClick={() => setSelectedBooking(null)}
            >
              ×
            </button>

            <h2>Booking Details</h2>

            <div className="booking-details">
              <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
              <p><strong>Customer:</strong> {selectedBooking.full_name}</p>
              <p><strong>Email:</strong> {selectedBooking.email}</p>
              <p><strong>Phone:</strong> {selectedBooking.phone}</p>
              <p><strong>Date:</strong> {selectedBooking.date}</p>
              <p><strong>Time:</strong> {selectedBooking.time}</p>
              <p><strong>Guests:</strong> {selectedBooking.guests}</p>
              <p><strong>Experience:</strong> {selectedBooking.experience}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
            </div>

            <button
              className="booking-modal-done"
              onClick={() => setSelectedBooking(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

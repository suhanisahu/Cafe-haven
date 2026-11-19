
import { Link } from "react-router-dom";
import {
  Coffee,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
} from "lucide-react";

function Footer() {
  return (
    <footer className="modern-footer">
      <div className="modern-footer-main">

        <div className="modern-footer-about">
          <Link to="/" className="footer-brand">
            <span className="footer-brand-icon">
              <Coffee size={24} />
            </span>
            <span>CAFE HAVEN</span>
          </Link>

          <p className="footer-tagline">
            Good Food. Great Moments.
          </p>

          <p className="footer-description">
            Enjoy delicious food, celebrate special moments and
            create beautiful memories with the people you love.
          </p>

          <Link to="/booking" className="footer-reserve-link">
            Reserve Your Table <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="modern-footer-column">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/menu">Our Menu</Link>
          <Link to="/experiences">Experiences</Link>
          <Link to="/booking">Book a Table</Link>
          <Link to="/my-bookings">My Bookings</Link>
        </div>

        <div className="modern-footer-column">
          <h3>Contact Us</h3>

          <p><MapPin size={17} /> In Your Heart, City, India</p>
          <p><Phone size={17} /> +91 XXXXX XXXXX</p>
          <p><Mail size={17} /> hello@cafehaven.com</p>
          <p><Clock size={17} /> 10 AM – 10 PM</p>
        </div>

        <div className="modern-footer-column">
          <h3>Help & Support</h3>
          <Link to="/booking">Booking Assistance</Link>
          <Link to="/menu">Menu Information</Link>
          <a href="mailto:hello@cafehaven.com">Contact Support</a>
        </div>

      </div>

      <div className="modern-footer-bottom">
        <p>
          © {new Date().getFullYear()} Cafe Haven. All Rights Reserved.
        </p>
        <p>Made with care for beautiful moments.</p>
      </div>
    </footer>
  );
}

export default Footer;

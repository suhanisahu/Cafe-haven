
import { Link } from "react-router-dom";
import cafeHero from "../assets/images/cafe-hero.jpg";
import candleDinner from "../assets/images/candle-dinner.png";
import familyDinner from "../assets/images/family-dinner.png";
import privateTheatre from "../assets/images/private-theatre.png";

function Home() {
  const experiences = [
    {
      title: "Candlelight Dinner",
      description:
        "An intimate evening, beautiful candlelight and a dining experience made for two.",
      image: candleDinner,
      number: "01",
      tag: "ROMANTIC EVENINGS",
    },
    {
      title: "Family Dining",
      description:
        "Bring everyone together for delicious food and moments worth remembering.",
      image: familyDinner,
      number: "02",
      tag: "MADE FOR TOGETHERNESS",
    },
    {
      title: "Private Theatre",
      description:
        "Your favourite movie, your favourite food and a space all your own.",
      image: privateTheatre,
      number: "03",
      tag: "A PRIVATE ESCAPE",
    },
  ];

  return (
    <main className="home-page modern-home">
      {/* HERO */}
      <section
        className="hero modern-hero"
        style={{ backgroundImage: `url(${cafeHero})` }}
      >
        <div className="hero-overlay modern-hero-overlay"></div>

        <div className="hero-content modern-hero-content">
          <span className="modern-hero-tag">
            ✦ &nbsp; YOUR EVERYDAY ESCAPE
          </span>

          <p className="hero-subtitle">WELCOME TO CAFE HAVEN</p>

          <h1>
            A little taste
            <br />
            of <em>happiness.</em>
          </h1>

          <p className="hero-description">
            Thoughtfully prepared food, warm spaces and beautiful
            experiences. Come for the flavours, stay for the moments.
          </p>

          <div className="hero-buttons">
            <Link to="/booking" className="primary-btn modern-primary">
              Reserve Your Table <span>↗</span>
            </Link>

            <Link to="/menu" className="secondary-btn modern-secondary">
              Explore Our Menu
            </Link>
          </div>

          <div className="modern-hero-bottom">
            <span>GOOD FOOD</span>
            <span>✦</span>
            <span>WARM MOMENTS</span>
            <span>✦</span>
            <span>HAPPY MEMORIES</span>
          </div>
        </div>

        <div className="hero-side-note">A PLACE TO SLOW DOWN & ENJOY</div>
      </section>

      {/* INTRODUCTION */}
      <section className="modern-intro">
        <div className="modern-intro-top">
          <span className="modern-eyebrow">THE CAFE HAVEN EXPERIENCE</span>
          <span className="modern-intro-number">EST. WITH LOVE</span>
        </div>

        <h2>
          More than a café.
          <br />
          <em>A feeling.</em>
        </h2>

        <div className="modern-intro-bottom">
          <p>
            Some places serve food. Others create memories. At Cafe Haven,
            we bring together comforting flavours, welcoming spaces and
            thoughtful experiences for every occasion.
          </p>

          <Link to="/menu" className="modern-text-link">
            GET TO KNOW OUR MENU <span>↗</span>
          </Link>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="modern-experiences">
        <div className="modern-section-heading">
          <div>
            <span className="modern-eyebrow">MADE FOR YOUR MOMENTS</span>
            <h2>
              Find your kind
              <br />
              of <em>special.</em>
            </h2>
          </div>

          <Link to="/booking" className="modern-text-link">
            DISCOVER ALL EXPERIENCES <span>↗</span>
          </Link>
        </div>

        <div className="modern-experience-grid">
          {experiences.map((experience) => (
            <article
              className="modern-experience-card"
              key={experience.number}
            >
              <Link
                to="/booking"
                className="modern-experience-image"
                aria-label={`Book ${experience.title}`}
              >
                <img src={experience.image} alt={experience.title} />

                <span className="modern-experience-number">
                  {experience.number}
                </span>

                <span className="modern-image-arrow">↗</span>
              </Link>

              <div className="modern-experience-content">
                <span className="modern-experience-tag">
                  {experience.tag}
                </span>

                <h3>{experience.title}</h3>

                <p>{experience.description}</p>

                <Link to="/booking" className="modern-card-link">
                  BOOK THIS EXPERIENCE <span>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BOOKING CTA */}
      <section className="modern-booking-cta">
        <div className="modern-cta-decoration">✳</div>

        <span className="modern-eyebrow">A TABLE IS WAITING FOR YOU</span>

        <h2>
          Your next favourite
          <br />
          memory starts <em>here.</em>
        </h2>

        <p>
          Make time for good food, good company and moments that matter.
        </p>

        <Link to="/booking" className="modern-primary modern-cta-button">
          Book Your Experience <span>↗</span>
        </Link>
      </section>
    </main>
  );
}

export default Home;

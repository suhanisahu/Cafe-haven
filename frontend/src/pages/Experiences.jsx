
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";

import candleDinner from "../assets/images/candle-dinner.png";
import familyDinner from "../assets/images/family-dinner.png";
import privateTheatre from "../assets/images/private-theatre.png";

const experiences = [
  {
    number: "01",
    name: "Candle Light Dinner",
    subtitle: "A romantic evening to remember",
    description:
      "Enjoy a beautiful candlelit setting, delicious food and a special evening with someone you love.",
    price: "₹5,999",
    image: candleDinner,
    features: [
      "Romantic candlelit decoration",
      "Special dining arrangement",
      "Memorable private ambience",
    ],
  },
  {
    number: "02",
    name: "Family Dinner",
    subtitle: "Together is a wonderful place to be",
    description:
      "Spend quality time with your family in a welcoming space, with delicious food and beautiful memories.",
    price: "₹6,999",
    image: familyDinner,
    features: [
      "Comfortable family seating",
      "Special dining arrangement",
      "Warm and welcoming ambience",
    ],
  },
  {
    number: "03",
    name: "Private Theatre",
    subtitle: "Your movie night, your way",
    description:
      "Enjoy your favourite movie in a private theatre setting with a comfortable and special dining experience.",
    price: "₹7,999",
    image: privateTheatre,
    features: [
      "Private theatre experience",
      "Comfortable movie seating",
      "Special dining arrangement",
    ],
  },
];

function Experiences() {
  return (
    <main className="premium-experiences">

      <section className="experience-hero">
        <div className="experience-hero-content">
          <span>
            <Sparkles size={15} /> MORE THAN JUST DINING
          </span>

          <h1>
            Moments that
            <br />
            <em>stay with you.</em>
          </h1>

          <p>
            Celebrate love, family and togetherness with thoughtfully
            designed experiences at Cafe Haven.
          </p>

          <Link to="/booking" className="experience-hero-button">
            Plan Your Experience <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <section className="experience-intro">
        <span>DISCOVER CAFE HAVEN</span>
        <h2>Something special for every occasion.</h2>
        <p>
          Whether it is a romantic evening, a family gathering or
          a movie night, we have a special experience waiting for you.
        </p>
      </section>

      <section className="experience-list">
        {experiences.map((experience, index) => (
          <article
            className={`experience-feature ${
              index % 2 !== 0 ? "experience-reverse" : ""
            }`}
            key={experience.number}
          >
            <div className="experience-feature-image">
              <img src={experience.image} alt={experience.name} />
              <span>{experience.number}</span>
            </div>

            <div className="experience-feature-content">
              <span className="experience-feature-label">
                CAFE HAVEN EXPERIENCE / {experience.number}
              </span>

              <h2>{experience.name}</h2>
              <h3>{experience.subtitle}</h3>

              <p>{experience.description}</p>

              <div className="experience-feature-price">
                <span>EXPERIENCE PRICE</span>
                <strong>{experience.price}</strong>
              </div>

              <ul>
                {experience.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} /> {feature}
                  </li>
                ))}
              </ul>

              <Link to="/booking" className="experience-book-button">
                Book This Experience <ArrowUpRight size={17} />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="experience-final-cta">
        <span>YOUR SPECIAL MOMENT STARTS HERE</span>
        <h2>Make memories at Cafe Haven.</h2>
        <p>Choose your favourite experience and let us welcome you.</p>
        <Link to="/booking" className="experience-hero-button">
          Reserve Your Table <ArrowUpRight size={17} />
        </Link>
      </section>

    </main>
  );
}

export default Experiences;

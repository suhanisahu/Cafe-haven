
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Clock,
  ChefHat,
  Sparkles,
} from "lucide-react";

import garlicBread from "../assets/images/garlic-bread.jpg";
import paneerButterMasala from "../assets/images/paneer-butter-masala.jpg";
import paneerTikka from "../assets/images/paneer-tikka.jpg";
import springRolls from "../assets/images/spring-roll.jpg";
import vegBiriyani from "../assets/images/veg-biriyani.jpg";
import whiteSaucePasta from "../assets/images/white-sauce-pasta.jpg";

const menuCategories = [
  {
    title: "Starters",
    subtitle: "A delicious beginning",
    number: "01",
    items: [
      {
        name: "Paneer Tikka",
        description: "Grilled paneer with aromatic spices and vegetables.",
        price: 220,
        image: paneerTikka,
        tag: "CHEF'S SPECIAL",
      },
      {
        name: "Veg Spring Rolls",
        description: "Crispy rolls filled with fresh vegetables.",
        price: 180,
        image: springRolls,
        tag: "POPULAR",
      },
      {
        name: "Cheese Garlic Bread",
        description: "Toasted garlic bread topped with melted cheese.",
        price: 160,
        image: garlicBread,
      },
    ],
  },
  {
    title: "Main Course",
    subtitle: "Comfort food, elevated",
    number: "02",
    items: [
      {
        name: "Paneer Butter Masala",
        description: "Creamy tomato gravy with soft paneer.",
        price: 280,
        image: paneerButterMasala,
        tag: "HOUSE FAVOURITE",
      },
      {
        name: "Veg Biryani",
        description: "Fragrant basmati rice cooked with vegetables and spices.",
        price: 240,
        image: vegBiriyani,
      },
      {
        name: "White Sauce Pasta",
        description: "Creamy pasta prepared with herbs and vegetables.",
        price: 260,
        image: whiteSaucePasta,
        tag: "POPULAR",
      },
    ],
  },
];

function Menu() {
  return (
    <main className="premium-menu">

      {/* Menu Hero */}
      <section className="premium-menu-hero">
        <div className="premium-menu-hero-content">
          <span className="premium-menu-eyebrow">
            <Sparkles size={15} /> A TASTE OF CAFE HAVEN
          </span>

          <h1>
            Crafted with love.
            <br />
            <span>Served with warmth.</span>
          </h1>

          <p>
            Discover thoughtfully prepared dishes, fresh ingredients
            and flavours that make every visit special.
          </p>

          <Link to="/booking" className="premium-menu-button">
            Reserve Your Table <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="premium-menu-hero-bottom">
          <span>FRESH INGREDIENTS</span>
          <span>THOUGHTFUL FLAVOURS</span>
          <span>MADE WITH LOVE</span>
        </div>
      </section>

      {/* Menu Introduction */}
      <section className="premium-menu-intro">
        <span>THE CAFE HAVEN COLLECTION</span>
        <h2>A little something for every craving.</h2>
        <p>
          From delightful starters to comforting main courses,
          explore the flavours prepared specially for you.
        </p>
      </section>

      {/* Food Categories */}
      <section className="premium-menu-list">
        {menuCategories.map((category) => (
          <div className="premium-menu-category" key={category.title}>

            <div className="premium-category-heading">
              <div>
                <span className="premium-category-number">
                  {category.number} / OUR SELECTION
                </span>
                <h2>{category.title}</h2>
                <p>{category.subtitle}</p>
              </div>

              <span className="premium-category-line"></span>
            </div>

            <div className="premium-food-grid">
              {category.items.map((item) => (
                <article className="premium-food-card" key={item.name}>

                  <div className="premium-food-image">
                    <img src={item.image} alt={item.name} />

                    {item.tag && (
                      <span className="premium-food-tag">
                        {item.tag}
                      </span>
                    )}

                    <span className="premium-food-price">
                      ₹{item.price}
                    </span>
                  </div>

                  <div className="premium-food-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>

                    <div className="premium-food-bottom">
                      <span>
                        <ChefHat size={15} /> PREPARED FRESH
                      </span>
                      <Clock size={15} />
                    </div>
                  </div>

                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Booking CTA */}
      <section className="premium-menu-cta">
        <span>YOUR NEXT FAVOURITE MEAL AWAITS</span>
        <h2>Good food tastes even better together.</h2>
        <p>
          Bring your favourite people and make beautiful memories
          at Cafe Haven.
        </p>
        <Link to="/booking" className="premium-menu-button">
          Book Your Experience <ArrowUpRight size={17} />
        </Link>
      </section>

    </main>
  );
}

export default Menu;

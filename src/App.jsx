function App() {
  return (
    <div>
      <Hero />
      {/* 🎓 NEW: FeatureGrid Demo - View all examples! */}
      {/* Uncomment the line below to see the demo: */}
      {/* <FeatureGridDemo /> */}

      {/* 🎓 NEW: ServicesHero - Ready-to-use implementation */}
      {/* Uncomment to use the new feature grid for services: */}

      <About />
      <ServicesHero />
      {/* <Services /> */}
      <GalleryCarousel3D />
      {/* <GalleryCarousel />
      <Gallery /> */}
      <Reviews />
      <Contact />
      <Footer />
    </div>
  );
}

import "./app/global.css";
import "./app/theme.css";
import About from "./features/About/About";
import Services from "./features/Services/Services";
import Gallery from "./features/Gallery/Gallery";
import Contact from "./features/Contact/Contact";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Hero from "./features/Hero/Hero";
import GalleryCarousel from "./features/Gallery/GalleryCarousel";
import GalleryCarousel3D from "./features/Gallery/GalleryCarousel3D";
// 🎓 NEW COMPONENTS - Uncomment the imports below when you're ready to use them!
import ServicesHero from "./features/ServicesHero/ServicesHero";
import Reviews from "./features/Reviews/Reviews";
// import FeatureGridDemo from "./features/FeatureGridDemo/FeatureGridDemo";
export default App;

import Featured from "../../components/featured/Featured";
import FeaturedProperties from "../../components/featuredProperties/FeaturedProperties";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import Navbar from "../../components/navbar/Navbar";
import PropertyList from "../../components/propertyList/PropertyList";
import ReviewBox from "../../components/reviewBox/ReviewBox";
import "./home.css";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Header/>
      <div className="homeContainer">
      <h1 className="homeTitle">Browse by gender</h1>
        <Featured/>
        <h1 className="homeTitle">Browse by category</h1>
        <PropertyList/>
        <h1 className="homeTitle">Restaurants near college</h1>
        <FeaturedProperties/>
        <ReviewBox />
        <Footer/>
      </div>
    </div>
  );
};

export default Home;

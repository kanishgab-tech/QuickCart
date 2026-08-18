'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from '@/components/Titlebar';
import Media from '@/components/Media';

const Home = () => {
  return (
    <>
      <Navbar />
      <Titlebar />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <HomeProducts />
        <FeaturedProduct />
        <Banner />
        {/*<NewsLetter />*/}
      </div>
      <Footer />
      <Media />
    </>
  );
};

export default Home;

import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const products = [
  {
    id: 1,
    image: assets.family_in_clebration_night,
    title: "Celebrate Your Way",
    description: "Pick the perfect spark for weddings, festivals, and family gatherings",
    category: "Sparklers"
  },
  {
    id: 2,
    image: assets.SessionalNightLights,
    title: "Season's Favourites",
    description: "Explore the season’s absolute best-sellers before they run out.",
    category: "Rockets" 
  },
  {
    id: 3,
    image: assets.FamilyGiftboxes,
    title: "One Gift Box for All",
    description: "Explore our diverse selections. The Premium Box That Satisfies All.",
    category: "Gift Boxes"
  },
];

const FeaturedProduct = () => {
    const { router } = useAppContext();
  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Featured Product</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, image, title, description,category  }) => (
          <div key={id} className="relative group">
                {/* FIXED HEADING LAYOUT: Set as a prominent, professional heading text block above the graphic */}
            <h3 className="font-medium text-lg lg:text-xl  tracking-tight group-hover:text-orange-600 transition-colors duration-200">
              {title}
            </h3>
            <Image
              src={image}
              alt={title}
              className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {description}
              </p>
            <button 
                type="button"
                onClick={() => {
                  const encodedCategory = encodeURIComponent(category || "All");
                  router.push(`/all-products?category=${encodedCategory}`);
                  if (typeof window !== "undefined") window.scrollTo(0, 0);
                }}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs px-4 py-2.5 rounded shadow-sm transition-all duration-150 cursor-pointer select-none uppercase tracking-wider"
              >
                <span>shop now</span>
                <Image className="h-3 w-3 invert brightness-200" src={assets.redirect_icon} alt="Redirect Icon" width={12} height={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;


import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-48 gap-10 py-14 border-b border-gray-500/30 text-gray-500">
        <div className="w-4/5.5">
          <Image className="w-28 md:w-28" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
            We are <b>KanSan Crackers</b> wholesale dealer of fireworks and crackers owning a shop in Sivakasi, Tamilnadu.
            we sell crackers for your special events and celebrations throughout the year.We are into this business from past few years and has been successfully running our company with selling fireworks in Sivakasi and crackers in Sivakasi. Since the day of our initiation, we have anticipated largely in making millions of lives happier and lightened up.
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="/">Home</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">About us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="/contact-enquiry">Contact us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Blog</a>
              </li>
              
              <li>
                <a className="hover:underline transition" href="#">Bank Detail</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Customer Service</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="./terms-conditions">Term and Conditions</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Return policy</a>
              </li>
              <li>
                <a className="hover:underline transition" href="./faq">FAQ</a>
              </li>
              <li>
                <a className="hover:underline transition" href="./privacy-policy">Privacy policy</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Disclaimer</a>
              </li>
            </ul>
          </div>
        </div>


        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+1-234-567-890</p>
              <p>KanSanCrackers@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
   <div className="bg-orange-500 text-white border-t-2 border-orange-600">
    <p className="py-1 text-center text-xs md:text-sm">
      Copyright 2026 © KanSan Crackers All Right Reserved.
    </p>
  </div>

    </footer>
    
    
  );
};

export default Footer;
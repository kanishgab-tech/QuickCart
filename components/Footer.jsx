import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-48 gap-10 py-14 border-b border-gray-500/30 text-gray-500">
        <div className="w-4/5.5">
          <Image className="w-36 md:w-28" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
            We are the wholesale dealer of fireworks and crackers owning a shop in Sivakasi, Tamilnadu.
            We sell crackers for your special events and celebrations throughout the year. 
           </p>
           <p className="mt-6 text-sm">
            At < b> KanSan Crackers</b>, we are delighted to bring the joy, excitement, and vibrant colors of celebrations to families across India. With a wide range of quality fireworks and festive products, we are committed to making every celebration brighter, happier, and more memorable.
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="/">Home</a>
              </li>
              <li>
                <a className="hover:underline hover:text-orange-600  transition" href="/about">About</a>
              </li>
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="/contact-enquiry">Contact us</a>
              </li>
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="#">Explore</a>
              </li>
              
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="#">Bank Detail</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Customer Service</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="./terms-conditions">Terms</a>
              </li>
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="./faq">FAQ</a>
              </li>
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="./privacy-policy">Privacy policy</a>
              </li>
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="#">Disclaimer</a>
              </li>
              <li>
                <a className="hover:underline hover:text-orange-600 transition" href="#">Return policy</a>
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
'use client'
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";   
import axios from "axios";
import { useAppContext } from "@/context/AppContext";

const ContactEnquiry = () => {

    const {showToast } = useAppContext();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        message: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Construct your backend API form processing logic here
          try {
                    
                       const { data } = await axios.post('/api/contact',formData)
                       if (data.success) {
                            showToast(data.message);
                            // Only clear the form if sending was a success
                            setFormData({ firstName: "", lastName: "", email: "", mobile: "", message: "" });
                        } else {
                            showToast(data.message, 'error');
                        }  
                }              
                catch (error) {
                    console.log('Error adding address:', error.message);
                }
        

        console.log("Enquiry Form Submitted Data:", formData);
        alert("Thank you! Your enquiry has been received successfully.");
        setFormData({ firstName: "", lastName: "", email: "", mobile: "", message: "" });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-gray-800">
            <Navbar />
            
            <main className="flex-grow px-6 md:px-16 lg:px-32 py-12">
                {/* Heading Structure */}
                <div className="flex flex-col items-start mb-12">
                    <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-2"></div>
                    <p className="text-gray-500 mt-3 text-sm">Have an inquiry? Fill out the details below or visit our office location.</p>
                </div>

                {/* Two-Column Responsive Grid Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Column 1: Customer Enquiry Form Container */}
                    <section className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">Send an Enquiry</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John" 
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe" 
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com" 
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        name="mobile"
                                        required
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="+91 1234567890" 
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Enquiry / Question</label>
                                <textarea 
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Type your message details clearly here..." 
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all resize-y min-h-[120px]"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm px-8 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                            >
                                Submit Enquiry
                            </button>
                        </form>
                    </section>

                    {/* Column 2: Corporate Info & Map Visualizer Block */}
                    <section className="space-y-8 lg:pl-4">
                        
                        {/* Information Row Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="border border-gray-200 p-5 rounded-xl">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">Company Headquarters</h3>
                                <p className="text-sm font-medium text-gray-900">TechSpace Solutions Pvt Ltd</p>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    102-104 Corporate Towers, Phase 4,<br />
                                    Udyog Vihar, Sector 18,<br />
                                    Gurugram, Haryana 122015, India
                                </p>
                            </div>

                            <div className="border border-gray-200 p-5 rounded-xl">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">Working Hours</h3>
                                <ul className="text-sm text-gray-600 space-y-1.5 font-medium">
                                    <li className="flex justify-between border-b border-gray-100 pb-1">
                                        <span>Monday - Friday:</span> 
                                        <span className="text-gray-900">09:00 AM - 06:00 PM</span>
                                    </li>
                                    <li className="flex justify-between border-b border-gray-100 pb-1">
                                        <span>Saturday:</span> 
                                        <span className="text-gray-900">10:00 AM - 02:00 PM</span>
                                    </li>
                                    <li className="flex justify-between text-gray-400">
                                        <span>Sunday:</span> 
                                        <span>Closed</span>
                                    </li>
                                </ul>
                            </div>
                            

                        </div>
                        </section>

                        {/* Interactive UI Placeholder Area for Map Engine Integration */}
                         Office Location Map
                            
                            <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative group"> </div>
                            <div className="absolute inset-0 bg-gray-200 animate-pulse hidden group-data-[loading=true]:block" /></div>
                           
                            {/*Corporate Office Location MapMap viewport interactive module mounted underneath tracking view.);*/}
                    </main>
            </div>
         
        );
        };
export default ContactEnquiry;
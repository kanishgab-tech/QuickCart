import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast"; 
import { useAppContext } from "@/context/AppContext"; 

const OrderSummary = () => {
  const { 
    currency, 
    router, 
    getCartCount, 
    getCartAmount, 
    getToken, 
    user, 
    cartItems, 
    setCartItems, 
    getTaxAmount 
  } = useAppContext();

  // Address states
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  
  // Guest input states
  const [guestEmail, setGuestEmail] = useState("");
  const [guestTextAddress, setGuestTextAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guestFullName, setGuestFullName] = useState("");
const [guestArea, setGuestArea] = useState("");
const [guestCity, setGuestCity] = useState("");
const [guestState, setGuestState] = useState("");
const [guestPincode, setGuestPincode] = useState("");
const [guestPhone, setGuestPhone] = useState("");

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-address', {
        headers: { Authorization: `Bearer ${token}` },
      });     
      if (data.success) {
        const addresses = data.addresses || [];
        setUserAddresses(addresses);
        if (addresses.length > 0) {
          // Set the first item as the default selection
          setSelectedAddress(addresses[0]);  
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log('Error fetching user addresses:', error);
    }
  };

  const handleNumericInput = (val, setter) => {
    const cleanNumeric = val.replace(/\D/g, ""); // Strips away all non-digits
    setter(cleanNumeric);
};

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

 const formatAddressDisplay = (addr) => {
  if (!addr) return "Choose an Address";
  if (typeof addr === 'string') return addr;
  
  const { fullName, phoneNumber, area, city, state, pincode } = addr;

  if (area || city || state || pincode) {
    const nameLine = fullName ? fullName : "";
    const locationLine = [area, city, state].filter(Boolean).join(", ");
    const zipLine = pincode ? ` - ${pincode}` : "";
    const phoneLine = phoneNumber ? `Phone: ${phoneNumber}` : "";

    // Returns a string containing true newline breaks
    return `${nameLine}
            ${locationLine}${zipLine}
            ${phoneLine}`.trim();
  }
  
  return Object.values(addr)
    .filter(val => typeof val === 'string' && val.length < 100 && !val.match(/^[0-9a-fA-F]{24}$/))
    .join('\n');
};

  const createOrder = async () => {
    if (isSubmitting) return;

    try {
      let finalAddressValue = "";

      if (user) {
        if (!selectedAddress) {
          return toast.error("Please select an address before placing the order.");
        }
        // Send the specific relational ID or string fallback to the backend API endpoint
        finalAddressValue = selectedAddress._id || formatAddressDisplay(selectedAddress);
      } else {
        if (!guestEmail.trim()) return toast.error("Email address is required.");
        if (!/\S+@\S+\.\S+/.test(guestEmail)) return toast.error("Please enter a valid email address.");
        if (!guestFullName.trim()) return toast.error("Full Name is required.");
        if (!guestArea.trim()) return toast.error("Address Area details are required.");
        if (!guestCity.trim()) return toast.error("City is required.");
        if (!guestState.trim()) return toast.error("State is required.");
        if (!guestPincode.trim()) return toast.error("Pincode is required.");
        if (!guestPhone.trim()) return toast.error("Phone number is required.");
        }
         finalAddressValue = `${guestFullName}
        ${guestArea.trim()}, ${guestCity.trim()}, ${guestState.trim()} - ${guestPincode.trim()}
        Phone: ${guestPhone.trim()}`;
    

      let cartItemsArray = Object.keys(cartItems || {}).map((key) => ({
        product: key,
        quantity: cartItems[key]
      })).filter(item => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error("Your cart is empty.");
      }

      setIsSubmitting(true);

      let requestHeaders = {};
      if (user) {
        const token = await getToken();
        requestHeaders = { Authorization: `Bearer ${token}` };
      }

      const payload = {
        address: finalAddressValue,
        items: cartItemsArray,
        guestEmail: user ? null : guestEmail.trim()
      };

      const { data } = await axios.post('/api/order/create', payload, {
        headers: requestHeaders
      });

      if (data.success) {
        toast.success(data.message || "Order Placed Successfully!");
        if (!user) {
          localStorage.removeItem("guest_cart"); 
        }
        setCartItems({});
        router.push('/order-placed');
      } else {
        toast.error(data.message || "Failed to process order.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log("Error creating order:", error.message);
      toast.error(error.response?.data?.message || "Checkout failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  const subtotal = getCartAmount() || 0;
  const tax = getTaxAmount() || 0;
  const grandTotal = subtotal + tax;

  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3">Order Summary</h3>

      {user ? (
      <div className="relative">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Select Delivery Address</label>
      
      {/* Changing the button to a div container styled with whitespace-pre-line for explicit multiline heights */}
      <div 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full border border-gray-300 rounded-lg p-4 text-sm text-left flex justify-between items-start bg-gray-50 hover:bg-gray-100 transition focus:outline-none cursor-pointer whitespace-pre-line leading-relaxed"
      >
        <span className="flex-1 text-gray-700">
          {formatAddressDisplay(selectedAddress)}
        </span>
        <span className="text-xs text-gray-400 ml-2 mt-1 shrink-0">▼</span>
      </div>
      
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto divide-y">
          {userAddresses.length > 0 ? (
            userAddresses.map((addr, idx) => (
              <div 
                key={addr._id || idx} 
                onClick={() => handleAddressSelect(addr)}
                className="p-4 text-sm hover:bg-orange-50 cursor-pointer transition text-gray-700 whitespace-pre-line leading-relaxed"
              >
                {formatAddressDisplay(addr)}
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-gray-400 text-center">No saved addresses found.</div>
          )}
        </div>
      )}
    </div>
    ) : (
  /* --- REWRITTEN SEPARATE GUEST INPUT PANEL --- */
      <div className="space-y-4">
        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
          <input 
            type="email"
            placeholder="name@example.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 bg-gray-50/50"
          />
        </div>

        {/* Full Name Field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
          <input 
            type="text"
            placeholder="First and last name"
            value={guestFullName}
            onChange={(e) => setGuestFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 bg-gray-50/50"
          />
        </div>

        {/* Area Multiline Field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider"> Address</label>
          <textarea 
            rows="3"
            placeholder="Flat No, Building, Street details..."
            value={guestArea}
            onChange={(e) => setGuestArea(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 bg-gray-50/50 resize-none"
          />
        </div>

        {/* Two-Column Responsive Layout Grid (City and State) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
            <input 
              type="text"
              placeholder="e.g. Chennai"
              value={guestCity}
              onChange={(e) => setGuestCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 bg-gray-50/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">State</label>
            <input 
              type="text"
              placeholder="e.g. MH"
              value={guestState}
              onChange={(e) => setGuestState(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Two-Column Layout Grid (Pincode and Phone) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pin Code</label>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="6-digit code"
              maxLength={6}
              value={guestPincode}
              onChange={(e) => handleNumericInput(e.target.value, setGuestPincode)} // Force digits only
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 bg-gray-50/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="10-digit mobile"
              maxLength={15}
              value={guestPhone}
              onChange={(e) => handleNumericInput(e.target.value, setGuestPhone)} // Force digits only
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 bg-gray-50/50"
            />
          </div>
        </div>
      </div>
    )}
      {/* Bill Matrix Display Grid */}
      <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Items Selected:</span>
          <span className="font-semibold text-gray-800">{getCartCount()}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{currency}{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (2%):</span>
          <span>{currency}{tax.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2.5 text-base font-black text-gray-900">
          <span>Grand Total:</span>
          <span>{currency}{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={createOrder}
        className={`w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow transition duration-150 text-center flex items-center justify-center gap-2 ${
          isSubmitting ? "opacity-75 cursor-not-allowed bg-orange-700" : "cursor-pointer"
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing Order...</span>
          </>
        ) : (
          "Place Order"
        )}
      </button>
    </div>
  );
};

export default OrderSummary;

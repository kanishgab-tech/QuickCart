import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast"; 
import { useAppContext } from "@/context/AppContext"; 


const OrderSummary = () => {
  const { 
    router, 
    getCartCount, 
    getToken, 
    products,
    user, 
    cartItems, 
    setCartItems, 
    showToast,
    
    //Financials
    currency,
    subtotal, 
    totalTaxAmount,
    taxBreakdown,
    shippingCharges,
    grandTotal,
    // Discounts
    couponCode,
    setCouponCode,
    isCouponApplied,
    activeCouponLabel,
    appliedDiscount,
    applyCouponGlobal,
    removeCouponGlobal
  
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


  const onSubmitCoupon = (e) => {
        e.preventDefault();
        applyCouponGlobal(couponCode); // Call the context processing engine
    };
    
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
  
  const { fullName, area, city, state, pincode, phoneNumber } = addr;

  if (area || city || state || pincode) {
    const nameLine = fullName ? fullName : "";
    const locationLine = [area, city, state].filter(Boolean).join(", ");
    const zipLine = pincode ? ` - ${pincode}` : "";
    const phoneLine = phoneNumber ? `Phone: ${phoneNumber}` : "";

    console.log(`${nameLine}
            ${locationLine}${zipLine}
            ${phoneLine}`.trim())
    // Returns a string containing true newline breaks
    return `${nameLine}
            ${locationLine}${zipLine}
            ${phoneLine}`.trim();
  }
  
  return Object.values(addr)
    .filter(val => typeof val === 'string' && val.length < 200 && !val.match(/^[0-9a-fA-F]{24}$/))
    .join('\n');
};

  const createOrder = async () => {
    if (isSubmitting) return;
    let cleanAddressValue=""
    let finalAddressValue = "";
    try {
      
      if (user) {
        if (!selectedAddress) {
          return toast.error("Please select an address before placing the order.");
        }
        // Send the specific relational ID or string fallback to the backend API endpoint

        finalAddressValue =  formatAddressDisplay(selectedAddress)||selectedAddress._id;
        cleanAddressValue=formatAddressDisplay(selectedAddress)||selectedAddress._id;
        //console.log("Got address-", finalAddressValue)

      } else {
        if (!guestEmail.trim()) return toast.error("Email address is required.");
        if (!/\S+@\S+\.\S+/.test(guestEmail)) return toast.error("Please enter a valid email address.");
        if (!guestFullName.trim()) return toast.error("Full Name is required.");
        if (!guestArea.trim()) return toast.error("Address Area details are required.");
        if (!guestCity.trim()) return toast.error("City is required.");
        if (!guestState.trim()) return toast.error("State is required.");
        if (!guestPincode.trim()) return toast.error("Pincode is required.");
        if (!guestPhone.trim()) return toast.error("Phone number is required.");
        
        finalAddressValue = `${guestFullName}
        ${guestArea.trim()}, ${guestCity.trim()}, ${guestState.trim()} - ${guestPincode.trim()}
        Phone: ${guestPhone.trim()}`;
        
        }
      

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
      console.log("clean address",cleanAddressValue)
      console.log("final address",finalAddressValue)

      const payload = {
        address: finalAddressValue,
        items: cartItemsArray,
        amount: grandTotal,           // grandTotal
        shippingCharges: shippingCharges, // Captured from your state logic
        discountAmount: appliedDiscount,   // Captured from your state logic
        couponCode: activeCouponLabel || "", // Captured from your state logic
        guestEmail: user ? null : guestEmail.trim(),
        tax:totalTaxAmount,
        notes: `Tax breakdown: ${Object.values(taxBreakdown).map(t => `${t.label}:${t.amount}`).join(", ")}`
      };

      const { data } = await axios.post('/api/order/create', payload, {
        headers: requestHeaders
      });

      if (data &&data.success) {
        toast.success(data.message || "Order Placed Successfully!");
        if (!user) {
          localStorage.removeItem("guest_cart"); 
        }
        setCartItems({});
        const confirmedNumber = data.orderNumber || `ORD-${Date.now()}`;
        
        router.push(`/order-placed?orderNumber=${encodeURIComponent(confirmedNumber)}`);

      } else {
        toast.error(data.message || "Failed to process order.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log("Error creating order:", error.message);
      showToast(error.response?.data?.message || "Checkout failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

   return (
    <div className="w-full max-w-sm bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3">Order Summary</h3>

      {user ? (
     <div className="flex flex-col gap-2 w-full max-w-md">
  <label className="text-sm font-semibold text-gray-700" htmlFor="address-select">
    Shipping Address
  </label>
  
  <select
    id="address-select"
    value={selectedAddress?._id || ""}
    onChange={(e) => {
      const val = e.target.value;
      if (val === "ADD_NEW_ADDRESS") {
        // Option A: Open your inline creation modal workspace
        // setIsAddressModalOpen(true);
        
        // Option B: Redirect the logged-in user to their profile dashboard setup page
        router.push('/add-address');
      } else {
        const foundAddress = userAddresses.find(addr => addr._id === val);
        setSelectedAddress(foundAddress || null);
      }
    }}
    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 cursor-pointer text-gray-800"
  >
    <option value=""  disabled>-- Select a Saved Address --</option>
    
    {/* 1. Map through the customer's pre-saved database locations */}
    {userAddresses && userAddresses.map((addr) => (
      <option key={addr._id} value={addr._id}>
        {addr.fullName} - {addr.area} - {addr.city}, {addr.state}
      </option>
      
    ))}

    {/* 2. FIXED: Injected actionable item block permanently sitting at the base track */}
    <option 
      value="ADD_NEW_ADDRESS" 
      className="text-orange-600 font-semibold bg-orange-50/50"
    >
      ➕ Add New Address...
    </option>
  </select>
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

         {isCouponApplied === false ? (
                <form onSubmit={onSubmitCoupon} className="flex gap-2 w-full pt-2">
                    <input 
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="PROMO CODE"
                        className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50/50"
                    />
                    <button 
                        type="submit"
                        className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                        Apply
                    </button>
                </form>
            ) : (
                /* Active Promo Badge & Removal Trigger */
                <div className="bg-orange-50 border border-orange-200 px-4 py-3 rounded-xl flex items-center justify-between gap-3 animate-fade-in pt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-base">🎉</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-orange-800 tracking-wide font-mono">{activeCouponLabel}</span>
                            <span className="text-[10px] text-orange-600/90 font-medium">Promo code applied successfully.</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={removeCouponGlobal}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600 underline cursor-pointer p-1"
                    >
                        Remove
                    </button>
                </div>
            )}
           
        <div className="flex justify-between">
          <span>Items Selected:</span>
          <span className="font-semibold text-gray-800">{getCartCount()}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{currency}{subtotal.toLocaleString('en-IN')}</span>
        </div>
         <div className="flex justify-between">
          <span>Discount Applied</span>
          <span>{currency}-{appliedDiscount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between">
                    <span>Shipping Charges:</span>
                    <span className="text-gray-900 font-semibold">
                        {shippingCharges === 0 ? (
                            <span className="text-green-600 font-bold uppercase tracking-wider text-xs bg-green-50 px-2 py-0.5 rounded">Free</span>
                        ) : (
                            `${currency}${shippingCharges}`
                        )}
                    </span>
         </div>
         
             {/* Dynamic Multi-Component Tax Allocation Rows */}
              {/* FIXED: Added defensive fallback short circuit (taxBreakdown || {}) to bypass Null Reference errors safely */}
              {taxBreakdown && Object.entries(taxBreakdown || {}).map(([taxKey, tax]) => (
                <div key={taxKey} className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>{tax?.label} ({tax?.rate}%):</span>
                  <span className="text-gray-800 font-semibold">
                    {currency}{tax?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}


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

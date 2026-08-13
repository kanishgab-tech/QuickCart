'use client'
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";


export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()
   
    const {user}=useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

    const [toasts, setToasts] = useState([]);   
    const [coupon, setCoupon] = useState(null); 

    const [couponCode, setCouponCode] = useState("");
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [activeCouponLabel, setActiveCouponLabel] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);

    const [dbCoupons, setDbCoupons] = useState({});
    const [dbTaxes, setDbTaxes] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchProductData = async () => {
        //setProducts(productsDummyData)
        try
        {
            const { data } = await axios.get('/api/product/list')

            if(data.success) {
                setProducts(data.products)
            }else
            {
                showToast(data.message, 'error')
            }
        }
        catch(error)
        {
            toast.error(error.message)
        }

    }
    
     // REUSABLE TOAST TRIGGER FUNCTION
 const showToast = (message, type = "success") => {
    // FIXED: Appending a randomized micro-hash completely eliminates standard millisecond key collisions
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
};

    const fetchUserData = async () => {
      try {

        if(user.publicMetadata.role === 'seller')
        {    
            setIsSeller(true) 
        }
        //setUserData(userDummyData)
         const token = await getToken()
         console.log("datastart");

         const {data} = await axios.get('/api/user/data',{headers: {Authorization: `Bearer ${token}`}, withCredentials: true})
         //const {data}=axios.get('/api/user/data')
        //.then(response => console.log(response.data));   

         console.log("data"); 
         if(data.success) {

            setUserData(data.user)
            setCartItems(data.user?.cartItems || {})
        }
        else
        {  
           toast.error(data.message)
        }

      }
      catch(error) {

        toast.error(error.message)

      }
    }

    const addToCart = async (itemId) => {

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        
        if (user) {

            try{
                const token = await getToken()
                await axios.post('/api/cart/update', {cartData}, {headers: {Authorization: `Bearer ${token}`}})
                showToast('Item added to cart')

            }
            catch(error) {
                toast.error(error.message)
            }
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

          if (user) {
            try{
                const token = await getToken()
                await axios.post('/api/cart/update', {cartData}, {headers: {Authorization: `Bearer ${token}`}})
                showToast('Cart updated')
            }
            catch(error) {
                toast.error(error.message)
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const quantity = cartItems[itemId];
            if (quantity <= 0) continue;

            const itemInfo = products.find((product) => product._id === itemId);
            if (!itemInfo) continue;

            const price = Number(itemInfo.offerPrice);
            if (!Number.isFinite(price)) continue;

            totalAmount += price * quantity;
        }
        return (totalAmount * 100) / 100;
    }

     useEffect(() => {
        const fetchConfigurations = async () => {
            try {
                const [couponsRes, taxesRes] = await Promise.all([
                    axios.get('/api/coupon'),
                    axios.get('/api/tax')
                ]);
                
                // Transform arrays from MongoDB back into your lookup maps if needed
                setDbCoupons(couponsRes.data); 
                setDbTaxes(taxesRes.data);
            } catch (error) {
                console.error("Failed to load configurations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfigurations();
    }, []);


    const subtotal = Object.entries(cartItems || {}).reduce((acc, [id, qty]) => {
    const product = products.find(p => (p.id || p._id) === id);
    return acc + (product ? product.offerPrice * qty : 0);
    }, 0);


   
     // Calculate Dynamic Shipping Logistics
    const shippingCharges = (() => {
        if (subtotal === 0) return 0;
        
        // FIXED: Check against isCouponApplied and activeCouponLabel context tracking parameters
        const currentCoupon = dbCoupons[activeCouponLabel];
        if (isCouponApplied && currentCoupon?.type === "shipping") {
            return 0; // Explicitly forces delivery fees to zero
        }
        
        return subtotal >= 2000 ? 0 : 150; // Free shipping over ₹2000 tier rule
    })();

    // Recalculate promo discounts automatically if cart items change after a code is applied
    useEffect(() => {
        if (!isCouponApplied || !activeCouponLabel) {
            setAppliedDiscount(0);
            return;
        }
        const couponMeta = dbCoupons[activeCouponLabel];
        if (couponMeta.type === "percentage") {
            setAppliedDiscount((subtotal * couponMeta.value) / 100);
        } else if (couponMeta.type === "fixed") {
            setAppliedDiscount(Math.min(couponMeta.value, subtotal));
        } else if (couponMeta.type === "shipping") {
            // FIXED: Free shipping coupon deducts 0 from item prices; it only overrides shippingCharges
            setAppliedDiscount(0); 
        } else {
            setAppliedDiscount(0);
        }
    }, [subtotal, isCouponApplied, activeCouponLabel]);

    // Global Action Handlers moved into context scope
    const applyCouponGlobal = (inputCode) => {
        const codeInput = inputCode.trim().toUpperCase();

        if (!codeInput) {
            toast.error("Please type a coupon code before hitting apply.");
            return false;
        }

        const couponMeta = dbCoupons[codeInput];

        if (couponMeta) {
            let discountAmount = 0;
            if (couponMeta.type === "percentage") {
                discountAmount = (subtotal * couponMeta.value) / 100;
            } else if (couponMeta.type === "fixed") {
                discountAmount = Math.min(couponMeta.value, subtotal);
            } else if (couponMeta.type === "shipping") {
                // FIXED: Free shipping coupon deducts 0 from items price
                discountAmount = 0; 
            }
            
            setAppliedDiscount(discountAmount);
            setActiveCouponLabel(codeInput);
            setIsCouponApplied(true);
            toast.success(`Coupon "${codeInput}" applied successfully!`);
            return true;
        } else {
            toast.error("Invalid coupon code. Please check your spelling.");
            removeCouponGlobal();
            return false;
        }
    };

    const removeCouponGlobal = () => {
        setCouponCode("");
        setIsCouponApplied(false);
        setActiveCouponLabel("");
        setAppliedDiscount(0);
        toast.success("Coupon code removed successfully.");
    };

    // Calculate Tax Metrics (e.g. 5% GST/Sales Tax calculated after promotional discounts)
    // A. Calculate the taxable basis amount after cash coupons are applied
    const taxableBasis = Math.max(0, subtotal - appliedDiscount);
    const taxBreakdown = (() => {
    if (subtotal === 0) return {};
    
    const breakdown = {};
        Object.entries(dbTaxes).forEach(([key, meta]) => {
            // Calculates tax value based on the post-discount taxable basis
            breakdown[key] = {
                label: meta.type,
                rate: meta.value,
                amount: (taxableBasis * meta.value) / 100
            };
            //console.log(taxableBasis)
            //console.log(breakdown)
        });
        return breakdown;
    })();
    // C. Aggregate total cumulative tax value for grand total evaluation
    const totalTaxAmount = Object.values(taxBreakdown).reduce((acc, tax) => acc + tax.amount, 0);
    const grandTotal = Math.max(0, (subtotal + shippingCharges + totalTaxAmount) - appliedDiscount);

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if(user) {
            fetchUserData()
        }
        
   // },[])
        },[user])
    
    useEffect(() => {
    // Only execute if a user session is absent
    if (!user) {
        const savedGuestCart = localStorage.getItem("guest_cart");
        if (savedGuestCart) {
            try {
                setCartItems(JSON.parse(savedGuestCart));
            } catch (e) {
                console.error("Error parsing guest cart cache:", e);
            }
        }
    }
    }, [user]); // Automatically re-evaluates if a user logs in or logs out

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, subtotal,
        taxBreakdown, totalTaxAmount,
        showToast,
        shippingCharges, appliedDiscount,
        grandTotal, applyCouponGlobal,
        removeCouponGlobal,activeCouponLabel,isCouponApplied,setCouponCode,couponCode
    }

    
    return (
        <AppContext.Provider value={value}>
            {props.children}

            {/* Toast Notification Overlay System */}
                        {/* 4. MASTER GLOBAL TOAST NOTIFICATION VIEWPORT CONTAINER OVERLAY */}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border text-sm font-semibold animate-[slideIn_0.2s_ease-out] transition-all duration-300 ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-100/50'
                                : 'bg-red-50 text-red-900 border-red-200 shadow-red-100/50'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            {/* Dynamic Icon Anchor Vector Components */}
                            {toast.type === 'success' ? (
                                <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                            <span>{toast.message}</span>
                        </div>

                        {/* Dismiss layout click trigger controller override */}
                        <button
                            type="button"
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </AppContext.Provider>
    )
}
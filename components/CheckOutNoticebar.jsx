import React from 'react'
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";


const CheckoutNotice = () => {
    const {currency,STORE_POLICIES} = useAppContext();

    return (
                       <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 mb-8 flex items-start gap-3 text-xs text-amber-900 leading-normal animate-fade-in shadow-3xs">
                        <span className="text-base select-none mt-0.5">📋</span>
                        <div className="space-y-1">
                            <h4 className="font-normal text-gray-700"><strong>Important Checkout & Order Requirements</strong></h4>
                            <ul className="list-disc list-inside space-y-1 pl-1 pt-1 font-normal text-gray-600">
                                <li>
                                    <strong className="text-gray-700">Minimum Order Threshold:</strong> The grand total must be at least <span className="text-orange-600 font-bold">{currency || '₹'}{STORE_POLICIES.MINIMUM_ORDER_AMOUNT.toLocaleString('en-IN')}</span> to proceed.
                                </li>
                                <li>
                                    <strong className="text-gray-700">Logistics Restrictions:</strong> Product package physical shipment is strictly limited to addresses located inside <span className="text-orange-600 font-bold">{STORE_POLICIES.ALLOWED_STATES_DISPLAY}</span> only.
                                </li>
                            </ul>
                        </div>
                    </div>

    )   
};

export default CheckoutNotice;
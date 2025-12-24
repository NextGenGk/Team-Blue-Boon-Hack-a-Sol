"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Receipt, Download, DollarSign } from "lucide-react";

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/patient-history');
                const data = await res.json();
                setReceipts(data.receipts || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <SidebarLayout>
            <div className="w-full px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Payment Receipts</h1>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading receipts...</div>
                ) : receipts.length > 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-6 font-semibold text-gray-600">Receipt #</th>
                                    <th className="p-6 font-semibold text-gray-600">Date</th>
                                    <th className="p-6 font-semibold text-gray-600">Doctor</th>
                                    <th className="p-6 font-semibold text-gray-600">Amount</th>
                                    <th className="p-6 font-semibold text-gray-600 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {receipts.map((rcpt) => (
                                    <tr key={rcpt.receipt_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 font-medium text-gray-900">{rcpt.receipt_number}</td>
                                        <td className="p-6 text-gray-500">{new Date(rcpt.receipt_date).toLocaleDateString()}</td>
                                        <td className="p-6 text-gray-900 font-medium">{rcpt.doctor_name}</td>
                                        <td className="p-6 font-bold text-emerald-600">${rcpt.total_amount}</td>
                                        <td className="p-6 text-right">
                                            <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 justify-end">
                                                <Download className="w-4 h-4" /> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <Receipt className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No receipts found</h3>
                        <p className="text-gray-400 mt-2">Your payment history will appear here.</p>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}

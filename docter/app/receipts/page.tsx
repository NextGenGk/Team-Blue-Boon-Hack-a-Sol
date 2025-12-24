"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { supabase } from "@/lib/supabase";
import { Receipt, DollarSign, Download, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function ReceiptsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Get Doctor DI
                const { data: doctor } = await supabase.from('doctors').select('did').eq('uid', user.id).single();

                if (doctor) {
                    // Try to fetch from finance_transactions first
                    const { data: trans } = await supabase
                        .from('finance_transactions') // Assuming this table exists
                        .select('*')
                        .eq('user_id', user.id) // Or link via provider_id? Schema might vary.
                        .order('created_at', { ascending: false });

                    // Fallback to Appointments if finance_transactions is empty/undefined (likely)
                    const { data: appts } = await supabase
                        .from('appointments')
                        .select(`
                            aid,
                            payment_amount,
                            payment_status,
                            updated_at,
                            start_time,
                            patients (users (name))
                        `)
                        .eq('did', doctor.did)
                        .eq('payment_status', 'completed')
                        .order('updated_at', { ascending: false });

                    if (appts) {
                        const formatted = appts.map(a => ({
                            id: a.aid,
                            description: `Consultation - ${a.patients?.users?.name}`,
                            amount: a.payment_amount,
                            date: new Date(a.updated_at || a.start_time).toLocaleDateString(),
                            status: 'Completed',
                            type: 'Credit'
                        }));
                        setTransactions(formatted);
                        // @ts-ignore
                        setTotalEarnings(formatted.reduce((sum, t) => sum + (t.amount || 0), 0));
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarLayout>
            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Finance Logs & Receipts</h1>
                        <p className="text-gray-500">Track your earnings and transaction history</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Earnings</p>
                            <p className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-gray-400" /> Recent Transactions
                        </h2>
                        <button className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm">
                                    <th className="p-4 font-medium first:pl-6">Description</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right last:pr-6">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading finance data...</td></tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 first:pl-6 font-medium text-gray-900">
                                                {t.description}
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                {t.date}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase">
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right last:pr-6 font-bold text-emerald-600">
                                                +${t.amount}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}

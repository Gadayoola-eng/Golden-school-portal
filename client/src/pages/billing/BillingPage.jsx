import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuthStore } from '../../store/useAuthStore';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Download,
  Building,
  User,
  ExternalLink,
  Sparkles,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';

export default function BillingPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null);

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [payerNameInput, setPayerNameInput] = useState(user?.name || '');

  // Query billing data
  const { data, isLoading, error } = useQuery({
    queryKey: ['billing-data'],
    queryFn: async () => {
      const res = await api.get('/billing');
      return res.data;
    },
  });

  // Mutation to pay bill
  const payMutation = useMutation({
    mutationFn: async ({ billId, method, payer }) => {
      const res = await api.post(`/billing/pay/${billId}`, {
        paymentMethod: method === 'card' ? `Credit Card (ending ${cardNumber.slice(-4) || '4242'})` : method === 'bank' ? 'Direct Bank Transfer' : 'Digital Mobile Wallet',
        payerName: payer || user?.name,
      });
      return res.data;
    },
    onSuccess: (resData, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing-data'] });
      queryClient.invalidateQueries({ queryKey: ['parent-overview'] });
      toast.success(resData.message || 'Payment successfully settled!');
      setSelectedBillForPayment(null);
      // Automatically open receipt for the paid bill
      if (resData.bill) {
        setSelectedBillForReceipt(resData.bill);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Payment failed. Please try again.');
    },
  });

  const handleOpenPayment = (bill) => {
    setSelectedBillForPayment(bill);
    setPayerNameInput(user?.name || bill.studentName || '');
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    payMutation.mutate({
      billId: selectedBillForPayment.id,
      method: paymentMethod,
      payer: payerNameInput,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        Failed to load invoices and payment records.
      </div>
    );
  }

  const { bills, summary, student } = data;

  const filteredBills = bills.filter((b) => {
    if (activeTab === 'unpaid' && b.status === 'PAID') return false;
    if (activeTab === 'paid' && b.status !== 'PAID') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchInv = b.invoiceNumber.toLowerCase().includes(q);
      const matchCategory = b.category?.toLowerCase().includes(q);
      return matchTitle || matchInv || matchCategory;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Golden International Primary School Bursar Office
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Tuition & Fee Payment Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review invoices, settle outstanding fees online, and print official tax-compliant receipts anytime.
          </p>
        </div>

        {student && (
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs">
            <img
              src="/logo.png"
              alt="Golden International School"
              className="w-10 h-10 object-contain drop-shadow-sm shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">{student.name}</p>
              <p className="text-[11px] text-amber-600 font-bold">{student.studentCode} • {student.grade}</p>
            </div>
          </div>
        )}
      </div>

      {/* Financial Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Due Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Outstanding Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            ₦{summary.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.unpaidCount} pending invoice{summary.unpaidCount !== 1 ? 's' : ''}
          </span>
          {summary.totalOutstanding > 0 && (
            <div className="absolute right-0 bottom-0 w-24 h-2 bg-gradient-to-r from-amber-400 to-rose-500" />
          )}
        </div>

        {/* Total Paid Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Settled to Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            ₦{summary.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.paidCount} cleared invoice{summary.paidCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Next Due Date Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Next Due Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-800 mt-2">
            {summary.nextDueDate
              ? new Date(summary.nextDueDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'No Upcoming Due'}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.nextDueDate ? 'Standard billing term' : 'All fees up to date'}
          </span>
        </div>

        {/* Total Invoices Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Bills Issued
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {summary.totalBillsCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Academic Session 2025/2026
          </span>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-slate-200/60 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Bills ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'unpaid'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unpaid & Pending
            {summary.unpaidCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px]">
                {summary.unpaidCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'paid'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paid History ({summary.paidCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No invoices match your selection.</p>
            <p className="text-xs text-slate-400">
              Try choosing another filter tab or clearing your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-4">Fee Description</th>
                  <th className="py-3.5 px-4">Term / Session</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBills.map((bill) => {
                  const isPaid = bill.status === 'PAID';
                  const isPastDue = !isPaid && new Date() > new Date(bill.dueDate);

                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Invoice No */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-800">
                        {bill.invoiceNumber}
                      </td>

                      {/* Description & Category */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{bill.title}</span>
                          <span className="text-[11px] text-slate-400 block max-w-xs truncate">
                            {bill.description}
                          </span>
                        </div>
                      </td>

                      {/* Term */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {bill.term || 'Term 2 (2025/2026)'}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${isPastDue ? 'text-rose-600' : 'text-slate-700'}`}>
                          {new Date(bill.dueDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {isPastDue && (
                          <span className="text-[10px] text-rose-500 font-bold block">Overdue</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-black text-slate-900 text-sm">
                        ₦{Number(bill.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right space-x-2">
                        {isPaid ? (
                          <button
                            onClick={() => setSelectedBillForReceipt(bill)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors shadow-2xs"
                            title="View and print official payment receipt"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            Print Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayment(bill)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Checkout Modal */}
      {selectedBillForPayment && (
        <Modal
          isOpen={!!selectedBillForPayment}
          onClose={() => setSelectedBillForPayment(null)}
          title="Settle Fee Invoice"
        >
          <form onSubmit={handleProcessPayment} className="space-y-5">
            {/* Invoice Summary Box */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  {selectedBillForPayment.invoiceNumber}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                  {selectedBillForPayment.title}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Beneficiary: Golden International School Bursary (Ido-Ekiti)
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Amount Due
                </span>
                <span className="text-xl font-black text-amber-700">
                  ₦{Number(selectedBillForPayment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Credit / Debit
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Bank Transfer
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Mobile / PayPal
                </button>
              </div>
            </div>

            {/* Payer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payer Full Name
              </label>
              <input
                type="text"
                required
                value={payerNameInput}
                onChange={(e) => setPayerNameInput(e.target.value)}
                placeholder="Guardian / Payer Name"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Dynamic fields based on method */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900">Golden International School Official Account</p>
                <p><span className="text-slate-400">Bank:</span> First Bank of Nigeria Plc</p>
                <p><span className="text-slate-400">Account Name:</span> Golden International School</p>
                <p><span className="text-slate-400">Account Number:</span> 3128940120</p>
                <p><span className="text-slate-400">Reference:</span> {selectedBillForPayment.invoiceNumber}</p>
                <p className="text-[11px] text-amber-700 font-semibold pt-1">
                  *Please send payment evidence to WhatsApp: 09120771514
                </p>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Digital checkout simulation. Click 'Confirm Payment' to authorize through Golden School Pay gateway.
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedBillForPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payMutation.isPending}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {payMutation.isPending ? 'Authorizing Payment...' : `Confirm & Pay ₦${Number(selectedBillForPayment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Receipt Modal */}
      {selectedBillForReceipt && (
        <Modal
          isOpen={!!selectedBillForReceipt}
          onClose={() => setSelectedBillForReceipt(null)}
          title="Official Fee Payment Receipt"
        >
          <div className="space-y-6">
            {/* Print Container for @media print */}
            <div
              id="printable-receipt"
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-900 print:border-none print:shadow-none print:p-0"
            >
              {/* Receipt Header with School Crest */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <img src="/logo.png" alt="GIS Logo" className="w-10 h-10 object-contain drop-shadow" />
                    <div>
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        Golden International School
                      </h2>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        The Word: Psalm 119:105
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">Odo - Iro Street, Ido-Ekiti, Ekiti State, Nigeria</p>
                  <p className="text-[11px] text-slate-500">Tel: 08062392750, 07069591713 • bursar@goldeninternationalschool.com</p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-300">
                    Paid in Full ✓
                  </span>
                  <p className="text-xs font-bold text-slate-700 mt-2 font-mono">
                    REC: GIS-REC-{selectedBillForReceipt.invoiceNumber?.replace('GIS-INV-', '')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Date: {new Date(selectedBillForReceipt.paidAt || Date.now()).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Student & Payer Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs py-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Student Details
                  </span>
                  <p className="font-bold text-slate-900">{selectedBillForReceipt.studentName || 'Alex Mercer'}</p>
                  <p className="text-slate-500">ID: {selectedBillForReceipt.studentCode || 'GIPS-PUPIL-2026'}</p>
                  <p className="text-slate-500">{selectedBillForReceipt.grade || 'Primary 4 Gold (Basic 4)'}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Payment Method & Reference
                  </span>
                  <p className="font-bold text-slate-900">
                    {selectedBillForReceipt.payerName || user?.name || 'Authorized Guardian'}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Ref: {selectedBillForReceipt.transactionRef || 'TXN-98421045'}
                  </p>
                  <p className="text-slate-500">
                    Via: {selectedBillForReceipt.paymentMethod || 'Bank Transfer (First Bank Plc)'}
                  </p>
                </div>
              </div>

              {/* Itemized Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <th className="py-2.5 px-4">Item Description</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Term</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {selectedBillForReceipt.title}
                        <span className="text-[11px] text-slate-400 block font-normal">
                          {selectedBillForReceipt.description}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{selectedBillForReceipt.category}</td>
                      <td className="py-3 px-4 text-slate-600">{selectedBillForReceipt.term || 'Term 2'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₦{Number(selectedBillForReceipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50 font-bold">
                      <td colSpan={3} className="py-3 px-4 text-right text-slate-700">
                        Total Amount Paid:
                      </td>
                      <td className="py-3 px-4 text-right text-base text-emerald-700">
                        ₦{Number(selectedBillForReceipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} NGN
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Signature & Seal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                <div>
                  <p>Computer generated official Nigerian educational bursary receipt.</p>
                  <p>Golden International School, Ido-Ekiti • Accounts & Bursary Division</p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-b border-slate-400 pb-0.5 mb-1 font-serif italic text-slate-700">
                    Bursar Office Stamp
                  </div>
                  <p>Authorized Signature</p>
                </div>
              </div>
            </div>

            {/* Print and Close Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBillForReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Print / Download PDF Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

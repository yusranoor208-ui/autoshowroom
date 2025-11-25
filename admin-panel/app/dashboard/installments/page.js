'use client';

import { useEffect, useState } from 'react';
import { getAllInstallments, updateInstallmentStatus } from '@/lib/adminHelper';
import { Search, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    try {
      const data = await getAllInstallments();
      setInstallments(data);
    } catch (error) {
      console.error('Error loading installments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (installmentId, amount) => {
    if (confirm('Mark this installment as paid?')) {
      try {
        await updateInstallmentStatus(installmentId, 'paid', amount);
        loadInstallments();
      } catch (error) {
        alert('Error updating installment status');
      }
    }
  };

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = 
      installment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || installment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const totalPending = installments.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPaid = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const overdueCount = installments.filter(i => {
    if (i.status === 'paid') return false;
    const dueDate = i.dueDate?.toDate();
    return dueDate && dueDate < new Date();
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Installment Management</h1>
        <p className="text-gray-600 mt-1">Track and manage payment installments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Pending', 
            value: `PKR ${totalPending.toLocaleString()}`, 
            color: 'bg-yellow-500',
            icon: Clock
          },
          { 
            label: 'Total Collected', 
            value: `PKR ${totalPaid.toLocaleString()}`, 
            color: 'bg-green-500',
            icon: DollarSign
          },
          { 
            label: 'Overdue', 
            value: overdueCount, 
            color: 'bg-red-500',
            icon: Calendar
          },
          { 
            label: 'Completed', 
            value: installments.filter(i => i.status === 'paid').length, 
            color: 'bg-blue-500',
            icon: CheckCircle
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search installments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Order ID</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map((installment) => {
              const dueDate = installment.dueDate?.toDate();
              const isOverdue = dueDate && dueDate < new Date() && installment.status !== 'paid';
              
              return (
                <tr key={installment.id} className={isOverdue ? 'bg-red-50' : ''}>
                  <td>
                    <div>
                      <p className="font-medium">{installment.customerName || 'N/A'}</p>
                      <p className="text-xs text-gray-600">{installment.customerEmail || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{installment.orderId?.slice(0, 8) || 'N/A'}</td>
                  <td className="font-semibold">PKR {(installment.amount || 0).toLocaleString()}</td>
                  <td className="text-sm">
                    {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'N/A'}
                    {isOverdue && (
                      <span className="block text-xs text-red-600 font-medium">Overdue</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      installment.status === 'paid' ? 'badge-success' :
                      isOverdue ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {installment.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {installment.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkAsPaid(installment.id, installment.amount)}
                        className="btn-success text-sm px-3 py-1"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {installment.status === 'paid' && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Paid on {installment.paidAt ? format(installment.paidAt.toDate(), 'MMM dd') : 'N/A'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

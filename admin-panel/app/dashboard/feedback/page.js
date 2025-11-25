'use client';

import { useEffect, useState } from 'react';
import { getAllFeedback, updateFeedbackStatus } from '@/lib/adminHelper';
import { Search, Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await getAllFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await updateFeedbackStatus(feedbackId, newStatus);
      loadFeedbacks();
    } catch (error) {
      alert('Error updating feedback status');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || feedback.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : 0;

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
        <h1 className="text-3xl font-bold text-gray-800">Feedback Management</h1>
        <p className="text-gray-600 mt-1">Review customer feedback and ratings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Feedback', value: feedbacks.length, color: 'bg-blue-500', icon: MessageSquare },
          { label: 'Average Rating', value: averageRating, color: 'bg-yellow-500', icon: Star },
          { label: 'Pending Review', value: feedbacks.filter(f => f.status === 'pending').length, color: 'bg-orange-500', icon: MessageSquare },
          { label: 'Resolved', value: feedbacks.filter(f => f.status === 'resolved').length, color: 'bg-green-500', icon: MessageSquare },
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
              placeholder="Search feedback..."
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
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {feedback.customerName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{feedback.customerName || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-600">{feedback.customerEmail || 'N/A'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(feedback.rating || 0)}
                    <span className="text-sm text-gray-600">
                      {feedback.createdAt 
                        ? format(feedback.createdAt.toDate(), 'MMM dd, yyyy')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <select
                value={feedback.status || 'pending'}
                onChange={(e) => handleStatusChange(feedback.id, e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <p className="text-gray-700 leading-relaxed">{feedback.message || 'No message provided'}</p>
            {feedback.productName && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Product: <span className="font-medium">{feedback.productName}</span>
                </span>
              </div>
            )}
          </div>
        ))}

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-12 card">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No feedback found</p>
          </div>
        )}
      </div>
    </div>
  );
}

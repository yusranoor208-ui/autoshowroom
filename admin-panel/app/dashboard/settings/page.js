'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Save, 
  Database, 
  Palette, 
  Globe, 
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Settings as SettingsIcon
} from 'lucide-react';

export default function SettingsPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [editableName, setEditableName] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    userNotifications: true,
    systemNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
  });
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Vehicle Management System',
    siteUrl: 'https://your-domain.com',
    contactEmail: 'admin@your-domain.com',
    phoneNumber: '+1234567890',
    address: '123 Business St, City, State 12345',
    currency: 'USD',
    timezone: 'UTC',
    language: 'English',
    maintenanceMode: false,
    debugMode: false,
  });
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#7b2ff7',
    darkMode: false,
    compactMode: false,
    animations: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    const name = localStorage.getItem('adminName') || 'Admin';
    if (email) {
      setAdminEmail(email);
    }
    setAdminName(name);
    setEditableName(name);
    
    // Load saved settings from localStorage
    const savedNotifications = localStorage.getItem('notificationSettings');
    const savedSystem = localStorage.getItem('systemSettings');
    const savedTheme = localStorage.getItem('themeSettings');
    
    if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
    if (savedSystem) setSystemSettings(JSON.parse(savedSystem));
    if (savedTheme) setThemeSettings(JSON.parse(savedTheme));
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleNameUpdate = async () => {
    if (!editableName.trim()) {
      showMessage('error', 'Name cannot be empty!');
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem('adminName', editableName);
      setAdminName(editableName);
      showMessage('success', 'Name updated successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showMessage('error', 'Failed to update name!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('error', 'Passwords do not match!');
      return;
    }

    if (formData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Password updated successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showMessage('error', 'Failed to update password!');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsChange = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSystemSettingsChange = (key, value) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeSettingsChange = (key, value) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveNotificationSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      showMessage('success', 'Notification settings saved successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save notification settings!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      showMessage('success', 'System settings saved successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save system settings!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThemeSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
      showMessage('success', 'Theme settings saved successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save theme settings!');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const backupData = {
        notificationSettings,
        systemSettings,
        themeSettings,
        adminName,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', 'Backup created successfully!');
    } catch (error) {
      showMessage('error', 'Failed to create backup!');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      if (backupData.notificationSettings) {
        setNotificationSettings(backupData.notificationSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(backupData.notificationSettings));
      }
      
      if (backupData.systemSettings) {
        setSystemSettings(backupData.systemSettings);
        localStorage.setItem('systemSettings', JSON.stringify(backupData.systemSettings));
      }
      
      if (backupData.themeSettings) {
        setThemeSettings(backupData.themeSettings);
        localStorage.setItem('themeSettings', JSON.stringify(backupData.themeSettings));
      }
      
      if (backupData.adminName) {
        setAdminName(backupData.adminName);
        setEditableName(backupData.adminName);
        localStorage.setItem('adminName', backupData.adminName);
      }
      
      showMessage('success', 'Settings restored successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showMessage('error', 'Failed to restore backup!');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Manage your account settings and preferences</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        } animate-fadeIn`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Account Information</h2>
                      <p className="text-sm text-gray-500">Your admin account details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-purple-600" />
                        Admin Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editableName}
                          onChange={(e) => setEditableName(e.target.value)}
                          className="input-field flex-1"
                          placeholder="Enter your name"
                        />
                        <button
                          onClick={handleNameUpdate}
                          disabled={loading || editableName === adminName}
                          className="btn-primary px-4"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-purple-600" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        disabled
                        className="input-field bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        Role
                      </label>
                      <input
                        type="text"
                        value="Administrator"
                        disabled
                        className="input-field bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                      <p className="text-sm text-gray-500">Update your password</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="input-field pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="input-field pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="input-field pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
                    <p className="text-sm text-gray-500">Manage how you receive notifications</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Receive {key.replace('Notifications', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()} notifications
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveNotificationSettings}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">System Configuration</h2>
                    <p className="text-sm text-gray-500">Manage system-wide settings</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={systemSettings.siteName}
                        onChange={(e) => handleSystemSettingsChange('siteName', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Site URL
                      </label>
                      <input
                        type="url"
                        value={systemSettings.siteUrl}
                        onChange={(e) => handleSystemSettingsChange('siteUrl', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={systemSettings.contactEmail}
                        onChange={(e) => handleSystemSettingsChange('contactEmail', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={systemSettings.phoneNumber}
                        onChange={(e) => handleSystemSettingsChange('phoneNumber', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Address
                      </label>
                      <textarea
                        value={systemSettings.address}
                        onChange={(e) => handleSystemSettingsChange('address', e.target.value)}
                        className="input-field"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Currency
                      </label>
                      <select
                        value={systemSettings.currency}
                        onChange={(e) => handleSystemSettingsChange('currency', e.target.value)}
                        className="input-field"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="PKR">PKR - Pakistani Rupee</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Timezone
                      </label>
                      <select
                        value={systemSettings.timezone}
                        onChange={(e) => handleSystemSettingsChange('timezone', e.target.value)}
                        className="input-field"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Asia/Karachi">Pakistan Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Language
                      </label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => handleSystemSettingsChange('language', e.target.value)}
                        className="input-field"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="Urdu">Urdu</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-800">Maintenance Mode</p>
                      <p className="text-xs text-gray-500 mt-1">Put site in maintenance mode</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingsChange('maintenanceMode', !systemSettings.maintenanceMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.maintenanceMode ? 'bg-orange-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-800">Debug Mode</p>
                      <p className="text-xs text-gray-500 mt-1">Enable debug logging</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingsChange('debugMode', !systemSettings.debugMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.debugMode ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveSystemSettings}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Appearance Settings</h2>
                    <p className="text-sm text-gray-500">Customize the look and feel</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Primary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={themeSettings.primaryColor}
                          onChange={(e) => handleThemeSettingsChange('primaryColor', e.target.value)}
                          className="w-16 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={themeSettings.primaryColor}
                          onChange={(e) => handleThemeSettingsChange('primaryColor', e.target.value)}
                          className="input-field flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">Dark Mode</p>
                        <p className="text-xs text-gray-500 mt-1">Enable dark theme</p>
                      </div>
                      <button
                        onClick={() => handleThemeSettingsChange('darkMode', !themeSettings.darkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          themeSettings.darkMode ? 'bg-gray-800' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            themeSettings.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">Compact Mode</p>
                        <p className="text-xs text-gray-500 mt-1">Reduce spacing and padding</p>
                      </div>
                      <button
                        onClick={() => handleThemeSettingsChange('compactMode', !themeSettings.compactMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          themeSettings.compactMode ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            themeSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">Animations</p>
                        <p className="text-xs text-gray-500 mt-1">Enable UI animations</p>
                      </div>
                      <button
                        onClick={() => handleThemeSettingsChange('animations', !themeSettings.animations)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          themeSettings.animations ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            themeSettings.animations ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-4">Preview</h3>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: themeSettings.primaryColor + '20', border: `2px solid ${themeSettings.primaryColor}` }}>
                          <p className="font-semibold" style={{ color: themeSettings.primaryColor }}>Primary Color Sample</p>
                        </div>
                        <button className="btn-primary" style={{ backgroundColor: themeSettings.primaryColor }}>
                          Sample Button
                        </button>
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600">This is how your theme will appear throughout the application.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveThemeSettings}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Backup & Restore Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Backup & Restore</h2>
                    <p className="text-sm text-gray-500">Manage your settings backups</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-600" />
                      Create Backup
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download a backup of all your settings and preferences
                    </p>
                    <button
                      onClick={handleBackup}
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {loading ? 'Creating...' : 'Download Backup'}
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-green-600" />
                      Restore Backup
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a backup file to restore your settings
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      className="hidden"
                      id="restore-file"
                    />
                    <label
                      htmlFor="restore-file"
                      className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Backup File
                    </label>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <SettingsIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Backups include all settings, preferences, and admin information</li>
                        <li>• Keep your backup files in a secure location</li>
                        <li>• Regular backups are recommended</li>
                        <li>• Restoring will overwrite current settings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

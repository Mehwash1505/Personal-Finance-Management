import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast'; // Import toast
import API_BASE_URL from '../config/api'; // Import API_BASE_URL
import Message from '../components/Message'; // Import Message for errors

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);

  // Profile Form state
  const [name, setName] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');

  // NEW STATE: Notification Preferences
  const [preferences, setPreferences] = useState({
    sendBillAlerts: true,
    sendBudgetAlerts: true,
  });

  // Password Form state
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [qrCode, setQrCode] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');

  // Jab user data load ho, toh name field ko populate karo
  useEffect(() => {
    if (user) {
      setName(user.name);

      if(user.notificationPreferences){
        setPreferences(user.notificationPreferences);
      }
    }
  }, [user]);

  // Submit handler for Profile Update (Name update)
  const onProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    setProfileError('');
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/profile`, { name }, config);
      login(res.data); // Update global context and localStorage
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      setProfileError(message);
      toast.error(message);
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Handler for password form input changes
  const onPasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Submit handler for Password Change
  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordSubmitting(true);
    setPasswordError('');

    // Client-side check for password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const message = 'New passwords do not match';
      setPasswordError(message);
      toast.error(message);
      setIsPasswordSubmitting(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/profile/change-password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }, config);
      
      toast.success(res.data.message || 'Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Form clear karo
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handlePrefChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.checked,
    });
  };

  const handleGenerate2FA = async () => {
    setIs2FALoading(true);
    setTwoFactorError('');
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/2fa/generate`, {}, config);
      setQrCode(res.data.qrCodeUrl); // QR code image data
    } catch (error) {
      toast.error('Failed to generate QR code.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setIs2FALoading(true);
    setTwoFactorError('');
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/2fa/verify`, { token: twoFactorToken }, config);
      toast.success(res.data.message);
      setQrCode(null);
      login(res.data.user); // Context ko updated user data se update karo
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid token';
      setTwoFactorError(message);
      toast.error(message);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable 2FA?')) {
      setIs2FALoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const res = await axios.post(`${API_BASE_URL}/api/users/2fa/disable`, {}, config);
        toast.success(res.data.message);
        login(res.data.user); // Context ko updated user data se update karo
      } catch (error) {
        toast.error('Failed to disable 2FA.');
      } finally {
        setIs2FALoading(false);
      }
    }
  };

  if (!user) {
    return null; // Ya <Spinner />
  }

  return (
    <motion.div
      className="container mx-auto p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-text-light my-6">My Profile</h1>
      
      <div className="max-w-lg mx-auto bg-surface/80 backdrop-blur-xl border border-border p-8 rounded-xl shadow-2xl">
        
        {/* --- PROFILE UPDATE FORM --- */}
        <form onSubmit={onProfileSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-text-light mb-4">Update Details</h2>
          {profileError && <Message>{profileError}</Message>}
          
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
              disabled={isProfileSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              className="w-full p-2 bg-border border-border text-text-muted rounded-lg"
              disabled 
            />
          </div>
          {/* Checkboxes */}

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Notification Preferences</label>
            <div className="space-y-2">
              <label className="flex items-center text-text-light">
                <input
                  type="checkbox"
                  name="sendBillAlerts"
                  checked={preferences.sendBillAlerts}
                  onChange={handlePrefChange}
                  className="h-4 w-4 rounded text-primary bg-background border-border focus:ring-primary"
                  disabled={isProfileSubmitting}
                />
                <span className="ml-2">Email me for bill reminders</span>
              </label>
              <label className="flex items-center text-text-light">
                <input
                  type="checkbox"
                  name="sendBudgetAlerts"
                  checked={preferences.sendBudgetAlerts}
                  onChange={handlePrefChange}
                  className="h-4 w-4 rounded text-primary bg-background border-border focus:ring-primary"
                  disabled={isProfileSubmitting}
                />
                <span className="ml-2">Email me for budget alerts</span>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProfileSubmitting}
          >
            {isProfileSubmitting ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        {/* --- DIVIDER --- */}
        <hr className="my-8 border-border" />

        {/* --- CHANGE PASSWORD FORM --- */}
        <h2 className="text-2xl font-bold text-text-light mb-4">Change Password</h2>
        {passwordError && <Message>{passwordError}</Message>}
        <form onSubmit={onPasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={onPasswordChange}
              className="w-full p-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
              disabled={isPasswordSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={onPasswordChange}
              className="w-full p-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
              disabled={isPasswordSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={onPasswordChange}
              className="w-full p-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
              disabled={isPasswordSubmitting}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-danger text-white font-bold rounded-lg hover:bg-opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPasswordSubmitting}
          >
            {isPasswordSubmitting ? 'Saving...' : 'Change Password'}
          </button>
        </form>

        <hr classname="my-10 border-border" />

        <div>
          <h2 className="text-2xl font-bold text-text-light mb-4">Two-Factor Authentication (2FA)</h2>
          <div className="space-y-4">
            {user.isTwoFactorEnabled ? (
              <div>
                <p className="text-text-muted mb-4">2FA is currently <span className="text-secondary font-bold">ENABLED</span> on your account.</p>
                <button
                  onClick={handleDisable2FA}
                  disabled={is2FALoading}
                  className="w-full py-3 bg-danger text-white font-bold rounded-lg hover:bg-opacity-90 shadow-lg disabled:opacity-50"
                >
                  {is2FALoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-text-muted mb-4">Scan the QR code with your authenticator app (like Google Authenticator), then enter the 6-digit code to enable 2FA.</p>
                <button
                  onClick={handleGenerate2FA}
                  disabled={is2FALoading || qrCode}
                  className="w-full py-3 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-90 shadow-lg disabled:opacity-50"
                >
                  {is2FALoading ? 'Generating...' : '1. Generate 2FA Secret'}
                </button>

                {qrCode && (
                  <motion.div 
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-text-muted mb-2">2. Scan this QR Code:</p>
                    <img src={qrCode} alt="2FA QR Code" className="mx-auto bg-white p-2 rounded-lg" />

                    <div className="mt-4">
                      {twoFactorError && <Message>{twoFactorError}</Message>}
                      <label className="block text-sm font-medium text-text-muted mb-1">3. Enter 6-Digit Code</label>
                      <input
                        type="text"
                        value={twoFactorToken}
                        onChange={(e) => setTwoFactorToken(e.target.value)}
                        className="w-full p-2 bg-background border border-border text-text-light rounded-lg"
                        maxLength={6}
                        disabled={is2FALoading}
                      />
                    </div>
                    <button
                      onClick={handleVerify2FA}
                      disabled={is2FALoading || twoFactorToken.length < 6}
                      className="w-full mt-4 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg disabled:opacity-50"
                    >
                      {is2FALoading ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                  </motion.div>
                )}  
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
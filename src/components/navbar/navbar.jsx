import React, { useState } from 'react';
import axiosApi from "../axios";
import "./navbar.css";
import eyeIcon from './assets/eye-open.png'; // Adjust the path as necessary
import eyeOffIcon from './assets/eye-close.png'; // Adjust the path as necessary

const Navbar = ({ userInfo, onLogout }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // For current password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // For new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirm password visibility
  const [showToast, setShowToast] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState(false);
  const [passwordERROR, setPasswordERROR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const evaluatePasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);

    if (hasUpper && hasLower && hasNumber && hasSpecial && password.length >= 8) {
      return "Strong";
    }
    return "Moderate";
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(evaluatePasswordStrength(password));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordERROR(false);
    setPasswordConfirmation(false);

    if (newPassword !== newPasswordConfirmation) {
      setPasswordConfirmation(true);
      return;
    }

    try {
      setIsLoading(true);
      await axiosApi.put('/update-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      setShowToast(true);
      setShowChangePassword(false);
      setNewPassword('');
      setCurrentPassword('');
      setNewPasswordConfirmation('');
      setPasswordStrength('');

      setTimeout(() => {
        setShowToast(false);
      }, 3000);

    } catch (err) {
      console.error('Password update error:', err);
      setPasswordERROR(true);
      if (err.response?.status === 401) {
        alert('Current password is incorrect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowChangePassword(false);
    setIsLoading(false);
    setPasswordERROR(false);
    setPasswordConfirmation(false);
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirmation('');
    setPasswordStrength('');
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout(); // Call the provided logout handler
    } else {
      // Default logout logic, clear token or user session
      localStorage.clear(); // Example: Clear localStorage
      window.location.href = '/login'; // Redirect to login page
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        Welcome, {userInfo?.userfirstname} {userInfo?.userlastname}
      </div>
      <div className="nav-links">
        <button 
          className="nav-link"
          onClick={() => setShowChangePassword(!showChangePassword)}
        >
          Change Password
        </button>
        <button 
          className="nav-link"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {showChangePassword && (
        <>
          <div className="backdrop" onClick={handleCloseModal}></div>
          <div className="password-modal">
            <form onSubmit={handleChangePassword}>
              <h2>Change Password</h2>
              <div className="input-group">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <img src={showCurrentPassword ? eyeOffIcon : eyeIcon} alt="Toggle Password" />
                </span>
              </div>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <img src={showNewPassword ? eyeOffIcon : eyeIcon} alt="Toggle Password" />
                </span>
              </div>
              {passwordStrength && (
                <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                  Password Strength: {passwordStrength}
                </p>
              )}
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  placeholder="Confirm New Password"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <img src={showConfirmPassword ? eyeOffIcon : eyeIcon} alt="Toggle Password" />
                </span>
              </div>
              {passwordConfirmation && (
                <p className="error">Passwords do not match!</p>
              )}
              {passwordERROR && (
                <p className="error">Failed to update password</p>
              )}
              <div className="button-group">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Change Password'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      
      {showToast && (
        <div className="toast">Password updated successfully!</div>
      )}
    </nav>
  );
};

export default Navbar;

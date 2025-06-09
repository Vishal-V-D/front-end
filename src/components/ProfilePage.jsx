import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Upload, UserCircle, LogOut, Edit, Save } from 'lucide-react';
import { db } from '../firebase'; // Adjust if your Firebase file is in a different path

const ProfilePage = () => {
  const auth = getAuth();
 const user = auth.currentUser;
  const [userName, setUserName] = useState(user ? user.displayName || 'Add Name' : 'Add Name');
  const [userEmail, setUserEmail] = useState('');
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [membership, setMembership] = useState('Premium User');
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(true);
  const [profileImage, setProfileImage] = useState('https://placehold.co/120x120/4A90E2/FFFFFF?text=JD');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUserName, setTempUserName] = useState(userName);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const user = auth.currentUser;
        setUserName(user ? user.displayName || 'John Doe' : 'John Doe');
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserEmail(data.email || user.email);
          } else {
            setUserEmail(user.email);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserEmail();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    setUserName(tempUserName);
    setIsEditingName(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
    setError(null);
  };

  const doLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutConfirm(false);
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 animate-fade-in max-w-3xl mx-auto my-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center">
          <UserCircle className="mr-3 text-blue-600" size={30} /> Your Profile
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="flex-shrink-0 relative">
            <img
              src={profileImage}
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-md"
            />
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition duration-200 shadow-md"
            >
              <Upload size={18} />
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <div className="flex-grow text-center md:text-left">
            {isEditingName ? (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <input
                  type="text"
                  value={tempUserName}
                  onChange={(e) => setTempUserName(e.target.value)}
                  className="text-2xl font-semibold text-gray-900 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-200"
                >
                  <Save size={18} />
                </button>
              </div>
            ) : (
              <h3 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2">
                {userName}
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition duration-200"
                >
                  <Edit size={16} />
                </button>
              </h3>
            )}

            {loadingUserData ? (
              <p className="text-gray-400 mb-1">Loading email...</p>
            ) : (
              <p className="text-gray-600 mb-1">{userEmail}</p>
            )}

            <p className="text-blue-600 font-medium">{membership}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-700 border-b pb-3 mb-4">Account Settings</h3>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 bg-white"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Email Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button
            onClick={confirmLogout}
            className="w-full mt-8 px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200 flex items-center justify-center font-bold"
          >
            <LogOut className="mr-2" size={20} /> Log Out
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Logout</h3>
            <p className="mb-6 text-gray-700">Are you sure you want to log out?</p>

            {error && (
              <p className="text-red-600 mb-4 font-semibold">{error}</p>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={doLogout}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;

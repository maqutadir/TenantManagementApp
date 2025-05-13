// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/LoginPage';
import LandlordDashboardPage from './pages/LandlordDashboardPage';
import TenantDashboardPage from './pages/TenantDashboardPage';

// Import Services
import { onAuthStateChange, signOutUser } from './services/authService';
import { getProfileById, getAllProfiles } from './services/profileService';
import { getHousesByLandlord } from './services/houseService';
import { getLeasesByLandlord } from './services/leaseService';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); // Global loading for initial auth check & data fetch

  // Data states - populated based on the logged-in user
  const [housesData, setHousesData] = useState([]);
  const [profilesData, setProfilesData] = useState([]); // All profiles (used by landlord)
  const [leasesData, setLeasesData] = useState([]);

  const clearUserData = useCallback(() => {
    setHousesData([]);
    setProfilesData([]);
    setLeasesData([]);
  }, []);

  // fetchLandlordSpecificData is part of the initial loading sequence for landlords.
  // It will use the app-level setIsLoading passed to it.
  const fetchLandlordSpecificData = useCallback(async (userId, appIsLoadingSetter) => {
    if (appIsLoadingSetter) appIsLoadingSetter(true); // Signal start of this specific data fetch
    try {
      const [housesRes, leasesRes, allProfilesRes] = await Promise.all([
        getHousesByLandlord(userId),
        getLeasesByLandlord(userId),
        getAllProfiles()
      ]);

      if (housesRes.error) console.error("Error fetching houses:", housesRes.error.message);
      else setHousesData(housesRes.data || []);

      if (leasesRes.error) console.error("Error fetching landlord leases:", leasesRes.error.message);
      else setLeasesData(leasesRes.data || []);

      if (allProfilesRes.error) console.error("Error fetching all profiles:", allProfilesRes.error.message);
      else setProfilesData(allProfilesRes.data || []);

    } catch (error) {
      console.error("Error fetching landlord data bundle:", error);
      clearUserData(); 
    } finally {
      // This specifically sets the app-level isLoading to false after landlord data is fetched
      if (appIsLoadingSetter === setIsLoading && typeof appIsLoadingSetter === 'function') { 
        appIsLoadingSetter(false); 
      }
    }
  }, [clearUserData, setIsLoading]); // setIsLoading is a stable reference from useState
  

  useEffect(() => {
    let isMounted = true;
    // Set loading true at the beginning of the effect, as we are about to check auth state.
    if (isMounted) setIsLoading(true); 

    const processAuthState = async (session) => {
      const authUser = session?.user || null; 
      let appLevelLoadingShouldBeFalse = true; // Assume we will set isLoading to false unless landlord data fetch starts

      try {
        if (authUser) {
          const { data: profile, error: profileError } = await getProfileById(authUser.id);

          if (!isMounted) return;

          if (profileError && profileError.code !== 'PGRST116') { 
              console.error("Error fetching profile on auth change:", profileError.message);
              setCurrentUser({ ...authUser, profile: null });
              setCurrentPage('login');
          } else if (profile) {
              const userWithProfile = { ...authUser, profile: profile };
              setCurrentUser(userWithProfile);
              if (profile.role === 'landlord') {
                  // For landlords, fetchLandlordSpecificData will handle setting app-level setIsLoading to false.
                  appLevelLoadingShouldBeFalse = false; // Don't set it in the finally block yet
                  await fetchLandlordSpecificData(authUser.id, setIsLoading); 
              }
              // For tenants, their dashboard handles its own data loading. App loading is done for auth/profile.
              setCurrentPage('dashboard');
          } else { 
              console.warn("Profile not found for user:", authUser.id, ". User might need to complete profile or trigger is pending/failed.");
              setCurrentUser({ ...authUser, profile: null }); 
              setCurrentPage('login'); 
          }
        } else { 
          setCurrentUser(null);
          setCurrentPage('login');
          clearUserData();
        }
      } catch (error) { 
        console.error("Critical error in processAuthState:", error);
        if (isMounted) {
          setCurrentUser(null);
          setCurrentPage('login');
          clearUserData();
        }
      } finally {
        // Set app-level isLoading to false if it wasn't deferred to fetchLandlordSpecificData
        // and the component is still mounted.
        if (isMounted && appLevelLoadingShouldBeFalse) {
            setIsLoading(false);
        }
      }
    };
    
    const subscription = onAuthStateChange((_event, session) => {
      if (isMounted) {
        processAuthState(session);
      }
    });

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [fetchLandlordSpecificData, clearUserData]); // Removed setIsLoading from here as it's passed to fetchLandlordSpecificData


  const handleLogout = async () => {
    // App-level isLoading will be set to true by onAuthStateChange when user becomes null
    // and then false after processing.
    const { error } = await signOutUser();
    if (error) {
      console.error('Error logging out:', error);
      alert('Logout failed: ' + error.message);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modal-scale-up {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .animate-modal-scale-up { animation: modal-scale-up 0.2s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Display "Loading Application..." only during the very initial phase before currentUser state is resolved.
  if (isLoading && currentUser === null) { 
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sky-600"><p>Loading Application...</p></div>;
  }

  const renderPage = () => {
    // If app-level isLoading is true (e.g., landlord data is being fetched as part of initial load)
    // and we are supposed to be on the dashboard, show "Initializing Dashboard..."
    if (isLoading && currentPage === 'dashboard') {
        return <div className="min-h-screen flex items-center justify-center"><p>Initializing Dashboard...</p></div>;
    }

    // If not loading at app-level, but trying to access dashboard without full user/profile info, redirect.
    if (!isLoading && currentPage === 'dashboard' && (!currentUser || !currentUser.profile)) {
        console.warn("Dashboard access attempted without user/profile after initial load. Redirecting to login.");
        // This state change will cause a re-render, and the logic below will show LoginPage.
        if(currentPage !== 'login') setCurrentPage('login'); 
        return null; // Or <LoginPage setIsLoading={setIsLoading} /> if direct render is preferred over state change
    }
    
    // If no user is authenticated and not on login page (should be rare after initial load), go to login.
    if (!currentUser && currentPage !== 'login') {
      console.warn("No current user and not on login page post-initial load. Forcing login page.");
      if(currentPage !== 'login') setCurrentPage('login');
      return null;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage setIsLoading={setIsLoading} />; 
      case 'dashboard':
        // This check is now more robust due to the isLoading and profile checks above.
        if (currentUser && currentUser.profile) {
            if (currentUser.profile.role === 'landlord') {
              return <LandlordDashboardPage 
                        currentUser={currentUser} 
                        houses={housesData} 
                        tenants={profilesData} 
                        leases={leasesData} 
                        // Pass a function that uses the app-level setIsLoading for a full refresh if needed
                        fetchAllDataForUser={() => fetchLandlordSpecificData(currentUser.id, setIsLoading)} 
                        // Individual views within LandlordDashboardPage should manage their own loading for tab-specific data
                        setIsLoading={setIsLoading} // This prop can be used by LandlordDashboardPage for its *own* loading states if needed
                     />;
            } else if (currentUser.profile.role === 'tenant') {
              return <TenantDashboardPage 
                        currentUser={currentUser}
                        // TenantDashboardPage should manage its own internal loading state for its data
                        setIsLoading={setIsLoading} // This prop can be used by TenantDashboardPage for its *own* loading states
                     />;
            }
            console.error("Unknown user role:", currentUser.profile.role, "Redirecting to login.");
        }
        // Fallback if somehow currentUser or profile is still missing at this point despite checks
        if(currentPage !== 'login') setCurrentPage('login');
        return null; 
      default:
        console.warn("Unknown page state, redirecting to login.");
        if(currentPage !== 'login') setCurrentPage('login');
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar setCurrentPage={setCurrentPage} currentUser={currentUser} handleLogout={handleLogout} />
      <main className="flex-grow relative">
        {renderPage()}
      </main>
      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        TenantFlow Demo &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;

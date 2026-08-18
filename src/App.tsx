import React, { useState, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { FlavorBuilder } from './components/FlavorBuilder';
import { WhySection } from './components/WhySection';
import { LocationsSection } from './components/LocationsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CartItem, AdminUser } from './types';
import { getStoredMenuItems, getStoredCurrentUser, saveStoredCurrentUser, clearStoredCurrentUser, SYSTEM_ALL_TABS, getStoredAdmins, saveAdmins } from './utils';
import { startPerUserFirestoreSync, pushAllLocalDataToFirestore } from './lib/firebaseServices';

// Lazy loaded heavy portal components
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const GasScriptModal = lazy(() => import('./components/GasScriptModal').then(module => ({ default: module.GasScriptModal })));
const EmployeeAttendanceModal = lazy(() => import('./components/EmployeeAttendanceModal').then(module => ({ default: module.EmployeeAttendanceModal })));

const ComponentLoader = ({ label }: { label?: string }) => (
  <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-purple-950/80 backdrop-blur-sm text-white p-4">
    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="font-extrabold text-sm font-baloo text-amber-300">
      {label || 'Memuat Modul Steak 11...'}
    </span>
  </div>
);

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; allowedTabs?: string[] } | null>(() => getStoredCurrentUser());
  const [adminDashboardOpen, setAdminDashboardOpen] = useState<boolean>(false);
  const [employeeAttendanceOpen, setEmployeeAttendanceOpen] = useState(false);
  const [gasModalOpen, setGasModalOpen] = useState(false);

  const [authStaffId, setAuthStaffId] = useState('');
  const [authStaffPin, setAuthStaffPin] = useState('');
  const isLoggingOutRef = React.useRef(false);

  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isLoggingOutRef.current) return;

      if (user && user.emailVerified) {
        const isGoogleUser = user.providerData.some((p) => p.providerId === 'google.com');
        const userRole = isGoogleUser ? 'Pengunjung' : 'Super Admin';
        const userAllowedTabs = isGoogleUser
          ? SYSTEM_ALL_TABS.map((t) => t.id).filter((id) => id !== 'admin')
          : SYSTEM_ALL_TABS.map((t) => t.id);
        const userData = {
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'Pengunjung Google'),
          role: userRole,
          allowedTabs: userAllowedTabs,
        };
        setCurrentUser(userData);
        saveStoredCurrentUser(userData);

        // Sync authenticated Firebase Auth user into Admin System table
        try {
          const currentAdmins = getStoredAdmins();
          const existingIdx = currentAdmins.findIndex(
            (a) => a.id === user.uid || (user.email && a.email?.toLowerCase() === user.email.toLowerCase())
          );

          if (existingIdx >= 0) {
            const updated = [...currentAdmins];
            updated[existingIdx] = {
              ...updated[existingIdx],
              id: user.uid,
              fullName: user.displayName || updated[existingIdx].fullName || (user.email ? user.email.split('@')[0] : 'Firebase Auth User'),
              email: user.email || updated[existingIdx].email,
              lastLogin: new Date().toLocaleString('id-ID'),
              status: 'Aktif',
              allowedTabs: updated[existingIdx].allowedTabs && updated[existingIdx].allowedTabs!.length > 0
                ? updated[existingIdx].allowedTabs
                : userAllowedTabs
            };
            saveAdmins(updated);
          } else {
            const newAuthAdmin: AdminUser = {
              id: user.uid,
              username: (user.email ? user.email.split('@')[0] : 'pengunjung_' + user.uid.slice(0, 4)).toLowerCase(),
              fullName: user.displayName || (user.email ? user.email.split('@')[0] : 'Pengunjung Google'),
              role: userRole,
              phone: user.phoneNumber || '081211111111',
              email: user.email || '',
              status: 'Aktif',
              passwordPin: 'Google Auth',
              createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              lastLogin: new Date().toLocaleString('id-ID'),
              allowedTabs: userAllowedTabs
            };
            saveAdmins([newAuthAdmin, ...currentAdmins]);
          }
        } catch (e) {
          console.warn('Error syncing auth user to admins list:', e);
        }

        setTimeout(() => {
          pushAllLocalDataToFirestore().catch(() => {});
        }, 100);
      } else {
        if (user && !user.emailVerified) {
          signOut(auth).catch(() => {});
        }

        const storedUser = getStoredCurrentUser();
        if (storedUser) {
          setCurrentUser(storedUser);
        } else {
          setCurrentUser(null);
          clearStoredCurrentUser();
        }
      }
    });

    unsubFirestore = startPerUserFirestoreSync();

    return () => {
      unsubscribe();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  const handleLogout = async () => {
    isLoggingOutRef.current = true;
    setCurrentUser(null);
    clearStoredCurrentUser();
    setAdminDashboardOpen(false);
    setAdminLoginOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 500);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToastNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCart = (itemId: string) => {
    const currentMenuItems = getStoredMenuItems();
    const item = currentMenuItems.find((i) => i.id === itemId);
    if (!item) return;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === itemId && !i.specialNotes);
      if (existing) {
        return prevCart.map((i) =>
          i.id === itemId && !i.specialNotes
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [
          ...prevCart,
          { id: item.id, name: item.name, price: item.price, quantity: 1 },
        ];
      }
    });

    showToastNotification(`🛒 ${item.name} berhasil ditambahkan ke keranjang!`);
  };

  const handleAddToCartDirect = (name: string, price: number) => {
    const newItem: CartItem = {
      id: 'direct-' + Date.now(),
      name,
      price,
      quantity: 1,
    };
    setCart((prev) => [...prev, newItem]);
    showToastNotification(`🛒 ${name} berhasil ditambahkan ke keranjang!`);
  };

  const handleAddCustomSteak = (customItem: CartItem) => {
    setCart((prev) => [...prev, customItem]);
    showToastNotification('🥩 Rakitan Steak berhasil ditambahkan ke keranjang!');
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => setCart([]);

  const handleOpenAdminClick = () => {
    setAdminLoginOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-[#FAF9F6] text-slate-800 dark:bg-[#12071B] dark:text-slate-100 min-h-screen antialiased selection:bg-amber-400 selection:text-purple-950 transition-colors duration-300">
      {/* Header / Navbar */}
      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenCart={() => setCartModalOpen(true)}
        onOpenAdminLogin={handleOpenAdminClick}
        cartCount={totalCartCount}
      />

      {/* Main Page Content */}
      <main>
        <Hero onAddToCartDirect={handleAddToCartDirect} />
        <MenuSection onAddToCart={handleAddToCart} />
        <FlavorBuilder onAddCustomSteak={handleAddCustomSteak} />
        <WhySection />
        <LocationsSection />
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer 
        onOpenAdminLogin={handleOpenAdminClick} 
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderSubmitted={() => {}}
      />

      {/* Admin / Staff Portal Login Modal */}
      {adminLoginOpen && (
        <AdminLoginModal
          isOpen={adminLoginOpen}
          onClose={() => setAdminLoginOpen(false)}
          currentUser={currentUser}
          onOpenDashboard={() => setAdminDashboardOpen(true)}
          onSuccessLogin={(userData) => {
            if (userData) {
              setCurrentUser(userData);
              saveStoredCurrentUser(userData);
              setAdminDashboardOpen(true);
              setAdminLoginOpen(false);
            } else {
              setCurrentUser(null);
              clearStoredCurrentUser();
              setAdminDashboardOpen(false);
            }
          }}
          onSuccessStaffLogin={(empId, pin) => {
            setAuthStaffId(empId);
            setAuthStaffPin(pin);
            setEmployeeAttendanceOpen(true);
          }}
        />
      )}

      {/* Admin Dashboard (Lazy Loaded with Error Boundary & Suspense) */}
      {adminDashboardOpen && (
        <ErrorBoundary fallbackTitle="Terjadi Kendala pada Admin Dashboard">
          <Suspense fallback={<ComponentLoader label="Memuat Admin Dashboard Steak 11..." />}>
            <AdminDashboard
              isOpen={adminDashboardOpen}
              onClose={handleLogout}
              onOpenGasModal={() => setGasModalOpen(true)}
              currentUser={currentUser}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Google Apps Script Modal */}
      {gasModalOpen && (
        <ErrorBoundary fallbackTitle="Terjadi Kendala pada Modal Google Apps Script">
          <Suspense fallback={<ComponentLoader label="Memuat Panduan Google Script..." />}>
            <GasScriptModal
              isOpen={gasModalOpen}
              onClose={() => setGasModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-100 max-w-md bg-[#250838] text-amber-300 font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center gap-2.5 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Employee Attendance Modal */}
      {employeeAttendanceOpen && (
        <ErrorBoundary fallbackTitle="Terjadi Kendala pada Portal Absensi Staf">
          <Suspense fallback={<ComponentLoader label="Memuat Portal Absensi..." />}>
            <EmployeeAttendanceModal
              isOpen={employeeAttendanceOpen}
              onClose={() => setEmployeeAttendanceOpen(false)}
              initialEmpId={authStaffId}
              initialPin={authStaffPin}
              onOpenAdmin={() => {
                setEmployeeAttendanceOpen(false);
                setAdminLoginOpen(true);
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}

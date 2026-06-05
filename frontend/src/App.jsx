import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider }          from './context/CartContext';
import { WishlistProvider }      from './context/WishlistContext';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

// ── Eagerly loaded (small / critical path) ───────────────
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ResetPassword  from './pages/ResetPassword';
import ProductList    from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart           from './pages/Cart';
import Wishlist       from './pages/Wishlist';

// ── Lazy loaded (heavier pages — only fetched when needed) ─
const Checkout          = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Orders            = lazy(() => import('./pages/Orders'));
const OrderTracking     = lazy(() => import('./pages/OrderTracking'));
const Profile           = lazy(() => import('./pages/Profile'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));

// ── Shared loading spinner ────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
    <div className="w-10 h-10 border-4 border-flipkart-blue border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Unified route guard ───────────────────────────────────
// - requiredRole="admin" → blocks non-admins
// - requiredRole not set  → just requires login
const RouteGuard = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
};

// ── App ───────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">

              <Navbar />

              <main className="flex-1">
                {/* Suspense wraps lazy routes — shows spinner while chunk loads */}
                <Suspense fallback={<Spinner />}>
                  <Routes>
                    {/* ── Public routes ─────────────────── */}
                    <Route path="/"                     element={<Home />} />
                    <Route path="/search"               element={<ProductList />} />
                    <Route path="/product/:id"          element={<ProductDetails />} />
                    <Route path="/cart"                 element={<Cart />} />
                    <Route path="/wishlist"             element={<Wishlist />} />
                    <Route path="/login"                element={<Login />} />
                    <Route path="/register"             element={<Register />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* ── Protected routes (login required) */}
                    <Route path="/checkout" element={
                      <RouteGuard><Checkout /></RouteGuard>
                    } />
                    <Route path="/order-confirmation/:id" element={
                      <RouteGuard><OrderConfirmation /></RouteGuard>
                    } />
                    <Route path="/orders" element={
                      <RouteGuard><Orders /></RouteGuard>
                    } />
                    <Route path="/order-tracking/:id" element={
                      <RouteGuard><OrderTracking /></RouteGuard>
                    } />
                    <Route path="/profile" element={
                      <RouteGuard><Profile /></RouteGuard>
                    } />

                    {/* ── Admin-only route ───────────────── */}
                    <Route path="/admin" element={
                      <RouteGuard requiredRole="admin"><AdminDashboard /></RouteGuard>
                    } />

                    {/* ── 404 fallback ───────────────────── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />

            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

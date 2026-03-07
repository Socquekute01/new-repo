import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ManagerRoute from "./components/ManagerRoute";
import StaffRoute from "./components/StaffRoute";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
import HomePage from "../pages/homepage/Homepage";
import AuthPage from "../pages/auth/AuthPage";
import NotFound from "../pages/NotFound";
import Detailcard from "../pages/Detail-card/Detailcard";
import Cart from "./components/cart/Cart";
import Order from "../pages/order/Order";
import Shop from "../pages/shop/shop";
import BestSeller from "../pages/bestseller/BestSeller";
import Profile from "../pages/profile/Profile";
import About from "../pages/about/About";
import Contact from "../pages/contact/contact";
import VnpayReturn from "../pages/payment/VnpayReturn";
import AdminDashboard from "../pages/admin/Dashboard";
import ProductManagement from "../pages/admin/ProductManagement";
import UserManagement from "../pages/admin/UserManagement";
import OrderManagement from "../pages/admin/OrderManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import ReportsAnalytics from "../pages/admin/ReportsAnalytics";
import AIBehaviorLogs from "../pages/admin/AIBehaviorLogs";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerOrders from "../pages/manager/ManagerOrders";
import ManagerProducts from "../pages/manager/ManagerProducts";
import ManagerReports from "../pages/manager/ManagerReports";
import ManagerCategories from "../pages/manager/ManagerCategories";
import StaffDashboard from "../pages/staff/StaffDashboard";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/bestseller" element={<BestSeller />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<Detailcard />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              }
            />
            <Route path="/payment/vnpay-return" element={<VnpayReturn />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <ProductManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <CategoryManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <OrderManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <ReportsAnalytics />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ai-behavior-logs"
              element={
                <AdminRoute>
                  <AIBehaviorLogs />
                </AdminRoute>
              }
            />
            <Route
              path="/manager/dashboard"
              element={
                <ManagerRoute>
                  <ManagerDashboard />
                </ManagerRoute>
              }
            />
            <Route
              path="/manager/orders"
              element={
                <ManagerRoute>
                  <ManagerOrders />
                </ManagerRoute>
              }
            />
            <Route
              path="/manager/products"
              element={
                <ManagerRoute>
                  <ManagerProducts />
                </ManagerRoute>
              }
            />
            <Route
              path="/manager/categories"
              element={
                <ManagerRoute>
                  <ManagerCategories />
                </ManagerRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ManagerRoute>
                  <ManagerReports />
                </ManagerRoute>
              }
            />
            <Route
              path="/staff/dashboard"
              element={
                <StaffRoute>
                  <StaffDashboard />
                </StaffRoute>
              }
            />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            {/* <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

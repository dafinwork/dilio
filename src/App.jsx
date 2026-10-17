import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import KoleksiKaosPage from './pages/KoleksiKaosPage';
import BikinKaosCustomPage from './pages/BikinKaosCustomPage';
import DesainEksklusifPage from './pages/DesainEksklusifPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { ProductProvider } from './context/ProductContext';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/koleksi-kaos" element={<KoleksiKaosPage />} />
          <Route path="/bikin-kaos-custom" element={<BikinKaosCustomPage />} />
          <Route path="/desain-eksklusif" element={<DesainEksklusifPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <Router>
        <ScrollToTop />
        <AppLayout />
      </Router>
    </ProductProvider>
  );
}

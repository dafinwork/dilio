import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import KoleksiKaosPage from './pages/KoleksiKaosPage';
import BikinKaosCustomPage from './pages/BikinKaosCustomPage';
import DesainEksklusifPage from './pages/DesainEksklusifPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ProductProvider } from './context/ProductContext';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCustomStudio =
    location.pathname.startsWith('/bikin-kaos-custom') ||
    location.pathname.startsWith('/design') ||
    location.pathname.startsWith('/studio') ||
    location.pathname.startsWith('/mockup');
  const isCleanLayout = isAdmin || isCustomStudio;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!isCleanLayout && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/koleksi-kaos" element={<KoleksiKaosPage />} />
          <Route path="/bikin-kaos-custom" element={<BikinKaosCustomPage />} />
          <Route path="/design" element={<BikinKaosCustomPage />} />
          <Route path="/design-custom" element={<BikinKaosCustomPage />} />
          <Route path="/studio" element={<BikinKaosCustomPage />} />
          <Route path="/mockup" element={<BikinKaosCustomPage />} />
          <Route path="/mockup-studio" element={<BikinKaosCustomPage />} />
          <Route path="/desain-eksklusif" element={<DesainEksklusifPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isCleanLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProductProvider>
        <Router>
          <ScrollToTop />
          <AppLayout />
        </Router>
      </ProductProvider>
    </ErrorBoundary>
  );
}

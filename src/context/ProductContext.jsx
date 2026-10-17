import { createContext, useContext, useState, useEffect } from 'react';
import initialProductsData from '../data/products.json';
import { supabase } from '../lib/supabase';
import { safeColors } from '../utils/helpers';

const ProductContext = createContext();

const STORAGE_KEY = 'kaos_dilio_catalog_products';
const AUTH_KEY = 'kaos_dilio_admin_session';
const PWD_HASH_KEY = 'kaos_dilio_admin_pwd_hash';
const ATTEMPTS_KEY = 'kaos_dilio_admin_attempts';
const LOCKOUT_KEY = 'kaos_dilio_admin_lockout';

// Default password hash for "admin123" with salt "_kaos_dilio_secure_salt_2026"
const DEFAULT_PASSWORD_HASH = '66e3c12c368201c2e53d0f300581cca4aa8275bbcec0fd31a301ecdb319a2044';
const SALT = '_kaos_dilio_secure_salt_2026';

// Cryptographic hash using Web Crypto API
async function hashPassword(plainText) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const sanitizeProduct = (p) => ({
  ...p,
  price: Number(p.price) || 0,
  extra_colors_count: Number(p.extra_colors_count) || 0,
  colors: safeColors(p.colors),
  is_new: Boolean(p.is_new),
  is_exclusive: Boolean(p.is_exclusive),
});

export function ProductProvider({ children }) {
  // Load products from localStorage, or fallback to default products.json
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProduct);
        }
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return initialProductsData.map(sanitizeProduct);
  });

  const [cloudStatus, setCloudStatus] = useState('connecting'); // 'connected' | 'connecting' | 'offline'

  // Fetch live products from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCloudProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const sanitized = data.map(sanitizeProduct);
          if (isMounted) {
            setProducts(sanitized);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
            setCloudStatus('connected');
          }
        } else {
          if (isMounted) {
            setCloudStatus('offline');
          }
        }
      } catch (err) {
        console.warn('Supabase fetch notice (fallback to local cache):', err);
        if (isMounted) setCloudStatus('offline');
      }
    }

    loadCloudProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Admin authentication state with session expiration (1 hour)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const sessionRaw = sessionStorage.getItem(AUTH_KEY);
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session.expiresAt && Date.now() < session.expiresAt) {
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  });

  // Save products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage:', e);
    }
  }, [products]);

  // Secure Admin Login with Brute-Force Rate Limiting
  const loginAdmin = async (passwordInput) => {
    // 1. Check if currently locked out
    const lockoutUntil = Number(localStorage.getItem(LOCKOUT_KEY) || 0);
    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return {
        success: false,
        message: `Terlalu banyak percobaan salah! Akun terkunci demi keamanan. Coba lagi dalam ${remainingSeconds} detik.`,
      };
    }

    // 2. Compute input hash
    const inputHash = await hashPassword(passwordInput);
    const storedHash = localStorage.getItem(PWD_HASH_KEY) || DEFAULT_PASSWORD_HASH;

    if (inputHash === storedHash) {
      // Success: Reset failed attempts & lockout
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);

      // Create session valid for 1 hour
      const sessionData = {
        authenticated: true,
        expiresAt: now + 60 * 60 * 1000,
      };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
      setIsAdminAuthenticated(true);
      return { success: true };
    } else {
      // Failed: Increase attempt counter
      let attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || 0) + 1;
      localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

      if (attempts >= 5) {
        // Lock out for 5 minutes
        const lockDuration = 5 * 60 * 1000;
        localStorage.setItem(LOCKOUT_KEY, (now + lockDuration).toString());
        return {
          success: false,
          message: 'Akun dikunci selama 5 menit karena 5 kali percobaan password salah berturut-turut.',
        };
      }

      return {
        success: false,
        message: `Password salah! Sisa percobaan: ${5 - attempts} kali sebelum akun dikunci.`,
      };
    }
  };

  // Change Admin Password
  const changeAdminPassword = async (oldPassword, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal harus 6 karakter.' };
    }

    const oldHash = await hashPassword(oldPassword);
    const currentStoredHash = localStorage.getItem(PWD_HASH_KEY) || DEFAULT_PASSWORD_HASH;

    if (oldHash !== currentStoredHash) {
      return { success: false, message: 'Password lama salah.' };
    }

    const newHash = await hashPassword(newPassword);
    localStorage.setItem(PWD_HASH_KEY, newHash);
    return { success: true, message: 'Password admin berhasil diganti!' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
  };

  // Format and sanitize object strictly for public.products database columns
  const toDatabasePayload = (p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || `prod-${Date.now()}`,
    description: p.description || '',
    price: Number(p.price) || 0,
    image_url: p.image_url || '',
    material: p.material || '',
    colors: safeColors(p.colors),
    is_new: Boolean(p.is_new),
    is_exclusive: Boolean(p.is_exclusive),
    product_group: p.product_group || 'harian',
    cutting_type: p.product_group === 'harian' ? (p.cutting_type || 'oversized') : null,
    sablon_type: p.product_group === 'custom' ? (p.sablon_type || 'dtf') : null,
    exclusive_category: p.product_group === 'eksklusif' ? (p.exclusive_category || 'dilio') : null,
    category_label: p.category_label || '',
    placeholder_title: p.placeholder_title || p.name,
    placeholder_bg: p.placeholder_bg || '#E5E7EB',
    placeholder_text_color: p.placeholder_text_color || '#374151',
    extra_colors_count: Number(p.extra_colors_count) || 0,
    created_at: p.created_at || new Date().toISOString(),
  });

  // Add new product
  const addProduct = async (productData) => {
    const slug = productData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProduct = toDatabasePayload({
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      slug: slug || `product-${Date.now()}`,
      created_at: new Date().toISOString(),
    });

    // Optimistic local state update
    setProducts((prev) => [newProduct, ...prev]);

    // Save to localStorage immediately
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newProduct, ...parsed]));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    // Direct sync to Supabase Cloud
    try {
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) {
        console.error('Supabase insert error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true, data: newProduct };
    } catch (err) {
      console.error('Supabase insert error:', err);
      return { success: false, error: err.message };
    }
  };

  // Update existing product
  const updateProduct = async (id, updatedFields) => {
    let finalUpdated = null;
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          finalUpdated = toDatabasePayload({
            ...item,
            ...updatedFields,
          });
          return finalUpdated;
        }
        return item;
      })
    );

    // Direct sync to Supabase Cloud
    try {
      if (finalUpdated) {
        const { error } = await supabase.from('products').update(finalUpdated).eq('id', id);
        if (error) {
          console.error('Supabase update warning:', error.message);
          return { success: false, error: error.message };
        }
        return { success: true };
      }
    } catch (err) {
      console.error('Supabase update error:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  };

  // Reset to default sample data
  const resetToDefault = () => {
    setProducts(initialProductsData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProductsData));
  };

  // Export current products as JSON file
  const exportProductsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `products-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import products from JSON object/array
  const importProductsJSON = (newProductsList) => {
    if (Array.isArray(newProductsList) && newProductsList.length > 0) {
      setProducts(newProductsList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProductsList));
      return true;
    }
    return false;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        cloudStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefault,
        exportProductsJSON,
        importProductsJSON,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect } from 'react';
import initialProductsData from '../data/products.json';

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

export function ProductProvider({ children }) {
  // Load products from localStorage, or fallback to default products.json
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return initialProductsData;
  });

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

  // Add new product
  const addProduct = (productData) => {
    const slug = productData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProduct = {
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      slug: slug || `product-${Date.now()}`,
      price: Number(productData.price) || 0,
      created_at: new Date().toISOString(),
      extra_colors_count: Number(productData.extra_colors_count) || 0,
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  // Update existing product
  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields,
            price: Number(updatedFields.price !== undefined ? updatedFields.price : item.price),
            extra_colors_count: Number(
              updatedFields.extra_colors_count !== undefined
                ? updatedFields.extra_colors_count
                : item.extra_colors_count
            ),
          };
        }
        return item;
      })
    );
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
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

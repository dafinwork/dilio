import { createContext, useContext, useState, useEffect } from 'react';
import initialProductsData from '../data/products.json';

const ProductContext = createContext();

const STORAGE_KEY = 'kaos_dilio_catalog_products';
const AUTH_KEY = 'kaos_dilio_admin_auth';

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

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  // Save products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage:', e);
    }
  }, [products]);

  // Admin login helper (default PIN: 123456 or admin)
  const loginAdmin = (password) => {
    if (password === 'admin123' || password === '123456') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      return { success: true };
    }
    return { success: false, message: 'Password / PIN salah (Gunakan: admin123 atau 123456)' };
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

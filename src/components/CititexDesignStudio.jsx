import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Canvas, FabricImage, Textbox } from 'fabric';
import { getWhatsAppUrl, getClosestColorId } from '../utils/helpers';
import {
  BASE_URL,
  CITITEX_CATEGORIES,
  PRODUCT_COLORS,
  BADGE_STYLES,
  APPAREL_MODELS,
  ANGLES,
  CLIPART_CATEGORIES,
  CLIPARTS,
  FONTS,
  CITITEX_TEMPLATES,
  SIZE_CHART_ROWS,
} from '../data/cititexData';

// SVG Tabler Icons matching Cititex 1:1
const Icons = {
  Cart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-shopping-cart">
      <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 17h-11v-14h-2" />
      <path d="M6 5l14 1l-1 7h-13" />
    </svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-photo-down">
      <path d="M15 8h.01" />
      <path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" />
      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4" />
      <path d="M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559" />
      <path d="M19 16v6" />
      <path d="M22 19l-3 3l-3 -3" />
    </svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-download">
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
      <path d="M7 11l5 5l5 -5" />
      <path d="M12 4l0 12" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-arrow-left">
      <path d="M5 12l14 0" />
      <path d="M5 12l6 6" />
      <path d="M5 12l6 -6" />
    </svg>
  ),
  Shirt: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-shirt">
      <path d="M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0" />
    </svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-upload">
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
      <path d="M7 9l5 -5l5 5" />
      <path d="M12 4l0 12" />
    </svg>
  ),
  Typography: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-typography">
      <path d="M4 20l3 0" />
      <path d="M14 20l7 0" />
      <path d="M6.9 15l6.9 0" />
      <path d="M10.2 6.3l5.8 13.7" />
      <path d="M5 20l6 -16l2 0l7 16" />
    </svg>
  ),
  Sticker: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-sticker">
      <path d="M20 12l-2 .5a6 6 0 0 1 -6.5 -6.5l.5 -2l8 8" />
      <path d="M20 12a8 8 0 1 1 -8 -8" />
    </svg>
  ),
  Layer: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-stack-front">
      <path d="M12 4l-8 4l8 4l8 -4l-8 -4" fill="currentColor" />
      <path d="M8 14l-4 2l8 4l8 -4l-4 -2" />
      <path d="M8 10l-4 2l8 4l8 -4l-4 -2" />
    </svg>
  ),
  Photo: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-photo">
      <path d="M15 8h.01" />
      <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
      <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
    </svg>
  ),
  TemplateFilled: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="tabler-icon tabler-icon-template-filled">
      <path d="M19 3a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2z" />
      <path d="M9 11a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2z" />
      <path d="M20 11a1 1 0 0 1 0 2h-6a1 1 0 0 1 0 -2z" />
      <path d="M20 15a1 1 0 0 1 0 2h-6a1 1 0 0 1 0 -2z" />
      <path d="M20 19a1 1 0 0 1 0 2h-6a1 1 0 0 1 0 -2z" />
    </svg>
  ),
  Help: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-help">
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 17l0 .01" />
      <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
    </svg>
  ),
  Undo: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-arrow-back-up">
      <path d="M9 14l-4 -4l4 -4" />
      <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
    </svg>
  ),
  Redo: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-arrow-forward-up">
      <path d="M15 14l4 -4l-4 -4" />
      <path d="M19 10h-11a4 4 0 1 0 0 8h1" />
    </svg>
  ),
  ZoomIn: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-zoom-in">
      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M7 10l6 0" />
      <path d="M10 7l0 6" />
      <path d="M21 21l-6 -6" />
    </svg>
  ),
  ZoomOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-zoom-out">
      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M7 10l6 0" />
      <path d="M21 21l-6 -6" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64686D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-search">
      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M21 21l-6 -6" />
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-x">
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  ),
  Bold: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-bold">
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
      <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
    </svg>
  ),
  Italic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-italic">
      <path d="M11 5l6 0" />
      <path d="M7 19l6 0" />
      <path d="M14 5l-4 14" />
    </svg>
  ),
  AlignLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-align-left">
      <path d="M4 6l16 0" />
      <path d="M4 12l10 0" />
      <path d="M4 18l14 0" />
    </svg>
  ),
  AlignCenter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-align-center">
      <path d="M4 6l16 0" />
      <path d="M8 12l8 0" />
      <path d="M6 18l12 0" />
    </svg>
  ),
  AlignRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-align-right">
      <path d="M4 6l16 0" />
      <path d="M10 12l10 0" />
      <path d="M6 18l14 0" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7l16 0" />
      <path d="M10 11l0 6" />
      <path d="M14 11l0 6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
      <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
    </svg>
  ),
  EyeOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
      <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
      <path d="M3 3l18 18" />
    </svg>
  ),
};

export default function CititexDesignStudio() {
  // 3-step state matching Cititex (/id/design):
  // 1. 'categories' -> Mulai Design Custom (4 category cards)
  // 2. 'products'   -> Category product grid (e.g., T-Shirts Produk)
  // 3. 'editor'     -> Interactive Studio Canvas
  const [step, setStep] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState('T-Shirts');

  // Studio Editor state
  const [activeTab, setActiveTab] = useState('product'); // 'product', 'upload', 'text', 'clipart', 'layer', 'myimages', 'template', 'help'
  const [currentProduct, setCurrentProduct] = useState(APPAREL_MODELS[0]);
  const [currentColor, setCurrentColor] = useState(PRODUCT_COLORS[0]); // default Black
  const [currentAngle, setCurrentAngle] = useState('front'); // 'front', 'back', 'left', 'right', 'label'
  const [zoomLevel, setZoomLevel] = useState(1);

  // Undo/Redo stack per angle
  const historyRef = useRef({
    front: { undo: [], redo: [] },
    back: { undo: [], redo: [] },
    left: { undo: [], redo: [] },
    right: { undo: [], redo: [] },
    label: { undo: [], redo: [] },
  });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Canvas ref
  const canvasElRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const isInternalModRef = useRef(false);

  // Saved multi-angle states
  const designsRef = useRef({
    front: null,
    back: null,
    left: null,
    right: null,
    label: null,
  });

  // Layer list & selection state
  const [layersList, setLayersList] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  // Text tool state
  const [textInput, setTextInput] = useState('DILIO');
  const [fontSize, setFontSize] = useState(24);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textColor, setTextColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('center');

  // Clipart state
  const [clipartSearch, setClipartSearch] = useState('');
  const [activeClipartCategory, setActiveClipartCategory] = useState('All');

  // User images & Crop modal
  const [myImages, setMyImages] = useState([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingCropImage, setPendingCropImage] = useState(null);
  const fileInputRef = useRef(null);

  // Modals
  const [sizeGuideModalOpen, setSizeGuideModalOpen] = useState(false);
  const [productDetailsModalOpen, setProductDetailsModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [sizeQuantities, setSizeQuantities] = useState({ S: 0, M: 0, L: 2, XL: 1, '2XL': 0 });
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Entry lewat tombol "Desain Custom" di katalog/modal detail:
  // /bikin-kaos-custom?model=dilio-boxy&warna=%23181818&produk=Nama%20Kaos
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (step !== 'categories') return;
    const modelParam = searchParams.get('model');
    const colorParam = searchParams.get('warna');
    if (!modelParam) return;

    const model =
      APPAREL_MODELS.find((m) => m.id === modelParam || m.slug === modelParam) ||
      APPAREL_MODELS.find((m) => m.category === 'T-Shirts' && m.slug.includes(modelParam)) ||
      null;
    if (!model) return;

    setCurrentProduct(model);

    let matchedColor = PRODUCT_COLORS.find((c) => c.id === model.defaultColor) || PRODUCT_COLORS[0];
    if (colorParam) {
      const upper = colorParam.toUpperCase();
      const exact = PRODUCT_COLORS.find((c) => String(c.hex).toUpperCase() === upper);
      if (exact) {
        matchedColor = exact;
      } else {
        // Fallback: keluarga warna terdekat hex katalog -> warna studio
        const BASE_TO_STUDIO = {
          hitam: 'black',
          putih: 'white',
          navy: 'navy',
          abu: 'sport_grey',
          biru: 'royal_blue',
          hijau: 'irish_green',
          merah: 'red',
          kuning: 'daisy',
          coklat: 'sand',
        };
        const baseId = getClosestColorId(colorParam);
        matchedColor = PRODUCT_COLORS.find((c) => c.id === BASE_TO_STUDIO[baseId]) || matchedColor;
      }
    }
    setCurrentColor(matchedColor);
    setStep('editor');
    // Hapus params agar refresh tidak mengulang step hop
    const cleaned = new URLSearchParams(searchParams);
    cleaned.delete('model');
    cleaned.delete('warna');
    cleaned.delete('produk');
    setSearchParams(cleaned, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to sync layer list & Undo stack
  const syncCanvasState = useCallback((canvas, pushHistory = true) => {
    if (!canvas) return;
    const objs = canvas.getObjects();
    setLayersList(
      objs
        .map((o, idx) => ({
          id: o.__id || `layer-${idx}`,
          name: o.__name || (o.type === 'textbox' ? o.text : 'Gambar Desain'),
          type: o.type,
          visible: o.visible !== false,
          obj: o,
        }))
        .reverse()
    );

    if (pushHistory && !isInternalModRef.current) {
      const json = canvas.toJSON();
      const currentHistory = historyRef.current[currentAngle];
      currentHistory.undo.push(JSON.stringify(json));
      if (currentHistory.undo.length > 25) currentHistory.undo.shift();
      currentHistory.redo = []; // Clear redo upon new change
      setCanUndo(currentHistory.undo.length > 1);
      setCanRedo(false);
    }
  }, [currentAngle]);

  // Initialize Fabric Canvas on Editor mount
  useEffect(() => {
    if (step !== 'editor' || !canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: 420,
      height: 560,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;

    canvas.selectionColor = 'rgba(47, 49, 51, 0.12)';
    canvas.selectionBorderColor = '#2F3133';
    canvas.selectionLineWidth = 1.5;

    // Selection handlers
    const handleSelection = (e) => {
      const active = e.selected?.[0];
      if (active) {
        setSelectedObjectId(active.__id);
        if (active.type === 'textbox') {
          setTextInput(active.text || '');
          if (active.fontSize) setFontSize(active.fontSize);
          if (active.fill) setTextColor(active.fill);
          if (active.charSpacing !== undefined) setLetterSpacing(Math.round(active.charSpacing / 50));
          setIsBold(active.fontWeight === 'bold');
          setIsItalic(active.fontStyle === 'italic');
          if (active.textAlign) setTextAlign(active.textAlign);
        }
      }
    };
    const handleDeselection = () => setSelectedObjectId(null);

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleDeselection);
    canvas.on('object:modified', () => syncCanvasState(canvas, true));
    canvas.on('object:added', () => syncCanvasState(canvas, false));
    canvas.on('object:removed', () => syncCanvasState(canvas, true));

    // Restore design for current angle if exists
    if (designsRef.current[currentAngle]) {
      isInternalModRef.current = true;
      canvas.loadFromJSON(designsRef.current[currentAngle]).then(() => {
        canvas.renderAll();
        isInternalModRef.current = false;
        syncCanvasState(canvas, false);
      });
    } else {
      // Seed initial history
      historyRef.current[currentAngle].undo = [JSON.stringify(canvas.toJSON())];
      setCanUndo(false);
      setCanRedo(false);
    }

    return () => {
      if (fabricCanvasRef.current) {
        designsRef.current[currentAngle] = fabricCanvasRef.current.toJSON();
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [step, currentAngle, syncCanvasState]);

  // Angle switching handler
  const handleSwitchAngle = (angleId) => {
    if (angleId === currentAngle) return;
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      designsRef.current[currentAngle] = canvas.toJSON();
    }
    setCurrentAngle(angleId);
    const hist = historyRef.current[angleId];
    setCanUndo(hist ? hist.undo.length > 1 : false);
    setCanRedo(hist ? hist.redo.length > 0 : false);
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    const hist = historyRef.current[currentAngle];
    if (!canvas || !hist || hist.undo.length <= 1) return;

    const currentJSON = hist.undo.pop();
    hist.redo.push(currentJSON);
    const prevJSON = hist.undo[hist.undo.length - 1];

    isInternalModRef.current = true;
    canvas.loadFromJSON(JSON.parse(prevJSON)).then(() => {
      canvas.renderAll();
      isInternalModRef.current = false;
      syncCanvasState(canvas, false);
      setCanUndo(hist.undo.length > 1);
      setCanRedo(true);
    });
  };

  const handleRedo = () => {
    const canvas = fabricCanvasRef.current;
    const hist = historyRef.current[currentAngle];
    if (!canvas || !hist || hist.redo.length === 0) return;

    const nextJSON = hist.redo.pop();
    hist.undo.push(nextJSON);

    isInternalModRef.current = true;
    canvas.loadFromJSON(JSON.parse(nextJSON)).then(() => {
      canvas.renderAll();
      isInternalModRef.current = false;
      syncCanvasState(canvas, false);
      setCanUndo(true);
      setCanRedo(hist.redo.length > 0);
    });
  };

  // Zoom handlers
  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(1.5, Number((prev + delta).toFixed(2)))));
  };

  // Add Text Handler
  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const id = `txt-${Date.now()}`;
    const textbox = new Textbox(textInput || 'TEKS', {
      left: 210,
      top: 255,
      originX: 'center',
      originY: 'center',
      fill: textColor,
      fontFamily: selectedFont.family,
      fontSize: fontSize,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign: textAlign,
      charSpacing: letterSpacing * 50,
      cornerColor: '#2F3133',
      cornerSize: 8,
      transparentCorners: false,
      cornerStyle: 'circle',
      padding: 6,
    });
    textbox.__id = id;
    textbox.__name = textInput || 'Teks';

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    syncCanvasState(canvas, true);
    showToast('Teks berhasil ditambahkan ke desain!');
  };

  // File Upload & Crop Handler
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      if (dataUrl) {
        setPendingCropImage(dataUrl);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyCroppedImage = async (dataUrl) => {
    setCropModalOpen(false);
    const canvas = fabricCanvasRef.current;
    if (!canvas || !dataUrl) return;

    try {
      const imgObj = await FabricImage.fromURL(dataUrl);
      imgObj.scaleToWidth(140);
      imgObj.set({
        left: 210,
        top: 255,
        originX: 'center',
        originY: 'center',
        cornerColor: '#2F3133',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'circle',
        padding: 4,
      });
      imgObj.__id = `img-${Date.now()}`;
      imgObj.__name = 'Gambar Upload';

      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
      canvas.renderAll();
      syncCanvasState(canvas, true);

      // Save to My Images history
      setMyImages((prev) => [{ id: Date.now(), url: dataUrl }, ...prev]);
      showToast('Gambar berhasil ditempel ke kaos!');
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat gambar.');
    }
  };

  // Add Clipart Handler
  const handleAddClipart = async (clipart) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      const url = `${BASE_URL}/mockup-assets/clipart/${clipart.file}`;
      const imgObj = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      imgObj.scaleToWidth(130);
      imgObj.set({
        left: 210,
        top: 255,
        originX: 'center',
        originY: 'center',
        cornerColor: '#2F3133',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'circle',
        padding: 4,
      });
      imgObj.__id = `clip-${Date.now()}`;
      imgObj.__name = clipart.name;

      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
      canvas.renderAll();
      syncCanvasState(canvas, true);
      showToast(`Clipart "${clipart.name}" ditambahkan!`);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat clipart.');
    }
  };

  // Apply Template Handler
  const handleApplyTemplate = async (tmpl) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.clear();

      // Clipart
      const url = `${BASE_URL}/mockup-assets/clipart/${tmpl.clipart}`;
      const imgObj = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      imgObj.scaleToWidth(110);
      imgObj.set({
        left: 210,
        top: 180,
        originX: 'center',
        originY: 'center',
        cornerColor: '#2F3133',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'circle',
      });
      imgObj.__id = `tmpl-img-${Date.now()}`;
      imgObj.__name = tmpl.title;
      canvas.add(imgObj);

      // High-contrast text color when shirt is dark
      const resolvedTextColor =
        currentColor.isDark && ['#2F3133', '#3A2A22', '#1F4591'].includes(tmpl.textColor)
          ? '#FFFFFF'
          : tmpl.textColor;

      // Text
      const textbox = new Textbox(tmpl.text, {
        left: 210,
        top: 360,
        originX: 'center',
        originY: 'center',
        fill: resolvedTextColor,
        fontFamily: tmpl.font,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        cornerColor: '#2F3133',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'circle',
      });
      textbox.__id = `tmpl-txt-${Date.now()}`;
      textbox.__name = tmpl.text;
      canvas.add(textbox);

      canvas.renderAll();
      syncCanvasState(canvas, true);
      showToast(`Template "${tmpl.title}" diterapkan!`);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat template.');
    }
  };

  // Layer manipulations
  const handleToggleLayerVisibility = (item) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !item.obj) return;
    item.obj.set('visible', !item.obj.visible);
    canvas.renderAll();
    syncCanvasState(canvas, true);
  };

  const handleBringLayerForward = (item) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !item.obj) return;
    canvas.bringObjectForward(item.obj);
    canvas.renderAll();
    syncCanvasState(canvas, true);
  };

  const handleSendLayerBackward = (item) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !item.obj) return;
    canvas.sendObjectBackwards(item.obj);
    canvas.renderAll();
    syncCanvasState(canvas, true);
  };

  const handleDeleteActiveObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
      syncCanvasState(canvas, true);
      showToast('Objek dihapus.');
    }
  };

  // Real photoshoot cutout URL (uses Dilio cutting photo without neck label when applicable)
  const activeAssetFolder = currentAngle === 'label' ? 'front' : currentAngle;
  const activeAssetColor = currentColor.assetId || 'black';
  const isUsingCuttingPhoto = Boolean(
    currentAngle === 'front' && currentProduct.cuttingImage && activeAssetColor === 'black'
  );
  const shirtPhotoUrl = isUsingCuttingPhoto
    ? `${BASE_URL}${currentProduct.cuttingImage}`
    : `${BASE_URL}/mockup-assets/${activeAssetFolder}/${activeAssetColor}.jpg`;

  // WhatsApp order calculation
  const totalQty = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
  const totalPrice = totalQty * currentProduct.price;

  const handleSendWhatsAppOrder = () => {
    if (totalQty === 0) {
      showToast('Pilih minimal 1 ukuran kaos!');
      return;
    }
    const sizesSummary = Object.entries(sizeQuantities)
      .filter(([_, q]) => q > 0)
      .map(([s, q]) => `${s}: ${q} pcs`)
      .join(', ');

    const text = `Halo Admin Kaos Dilio, saya ingin memesan kaos custom hasil desain di website:

*Rincian Kaos:*
- Model: ${currentProduct.name}
- Kategori: ${currentProduct.category}
- Warna: ${currentColor.name} (${currentColor.hex})
- Rincian Ukuran: ${sizesSummary}
- Total Kuantitas: ${totalQty} pcs
- Estimasi Harga Bahan: Rp ${totalPrice.toLocaleString('id-ID')}
- Sisi Sablon: ${currentAngle === 'front' ? 'Depan' : currentAngle === 'back' ? 'Belakang' : 'Multi-Sisi'}

*Pemesan:*
- Nama: ${customerName || '-'}
- Catatan Khusus: ${customerNotes || '-'}

Mohon konfirmasi ketersediaan stok & estimasi pengerjaan sablonnya ya, terima kasih!`;

    window.open(getWhatsAppUrl(text), '_blank');
    setCartModalOpen(false);
  };

  // Download Mockup Kaos Utuh (Proporsional & Tidak Terpotong) - Req 10
  const handleDownloadFullMockup = async () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    setDownloadDropdownOpen(false);
    showToast('Menyiapkan gambar mockup...');

    try {
      // Deselect active object so selection handles are not rendered in the export
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();

      const targetWidth = 980; // 490 * 2
      const targetHeight = 1280; // 640 * 2
      const pad = 40;
      const boxW = targetWidth - pad * 2; // 900
      const boxH = targetHeight - pad * 2; // 1200

      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetWidth;
      offCanvas.height = targetHeight;
      const ctx = offCanvas.getContext('2d');

      // 1. Transparent PNG canvas (no white fill, background remains transparent)

      // 2. Load and draw full t-shirt photo with object-contain scaling (never cropped or stretched)
      const shirtImg = new Image();
      shirtImg.crossOrigin = 'anonymous';
      shirtImg.src = shirtPhotoUrl;

      await new Promise((resolve) => {
        shirtImg.onload = resolve;
        shirtImg.onerror = () => resolve();
      });

      const natW = shirtImg.naturalWidth || shirtImg.width || 490;
      const natH = shirtImg.naturalHeight || shirtImg.height || 640;

      let drawW = boxW;
      let drawH = boxH;
      if (natW > 0 && natH > 0) {
        const scale = Math.min(boxW / natW, boxH / natH);
        drawW = Math.round(natW * scale);
        drawH = Math.round(natH * scale);
        const drawX = Math.round((targetWidth - drawW) / 2);
        const drawY = Math.round((targetHeight - drawH) / 2);

        ctx.drawImage(shirtImg, drawX, drawY, drawW, drawH);
      }

      // 3. Draw fabric artwork scaled proportionally inside the chest printable area (1:1 with editor stage)
      const artworkDataUrl = fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
      const artworkImg = new Image();
      artworkImg.src = artworkDataUrl;

      await new Promise((resolve) => {
        artworkImg.onload = resolve;
        artworkImg.onerror = () => resolve();
      });

      const stageScale = isUsingCuttingPhoto ? 0.66 * (drawW / 980) : drawH / 1280;
      const artW = Math.round(840 * stageScale);
      const artH = Math.round(1120 * stageScale);
      const artX = Math.round((targetWidth - artW) / 2);
      const artY = Math.round((targetHeight - artH) / 2);

      ctx.drawImage(artworkImg, artX, artY, artW, artH);

      // 4. Download file
      const link = document.createElement('a');
      link.download = `mockup-${currentProduct.slug || currentProduct.id || 'kaos'}-${currentColor.id}-${currentAngle}.png`;
      link.href = offCanvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Mockup berhasil diunduh!');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Gagal mengunduh mockup.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F5] text-[#2F3133] font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2F3133] text-white px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-150">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CITITEX HEADER (h-[64px] border-b border-[#E6E6E6] bg-white) */}
      {/* ========================================================================= */}
      <header className="flex items-center h-[64px] border-b border-[#E6E6E6] sticky top-0 bg-white z-20">
        <div className="flex items-center max-w-[1400px] w-full mx-auto px-3 sm:px-4 h-full gap-[12px]">
          {/* Logo & CustomApparel title */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90">
            <span className="font-extrabold text-xl text-[#2F3133] tracking-tight">Kaos Dilio</span>
          </Link>
          <div className="border-r border-[#E6E6E6] h-[28px] hidden xl:block" />
          <div className="text-[24px] hidden xl:flex items-center">
            <span className="font-black text-[#2F3133]">Custom</span>
            <span className="font-normal text-[#2F3133]">Apparel</span>
          </div>

          {/* Right Header Controls */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3 h-full">
            {step === 'editor' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const canvas = fabricCanvasRef.current;
                    if (canvas) {
                      localStorage.setItem('cititex_saved_design', JSON.stringify(canvas.toJSON()));
                      showToast('Template desain berhasil disimpan!');
                    }
                  }}
                  className="flex-col justify-center w-[64px] xl:w-auto xl:flex-row xl:rounded-[8px] xl:px-[20px] xl:py-[12px] border-l xl:border border-[#E6E6E6] font-medium xl:font-semibold text-[9px] xl:text-[14px] text-[#2F3133] flex gap-[4px] xl:gap-[8px] items-center cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <Icons.Save />
                  <span>Simpan Template</span>
                </button>

                {/* Direct Download Mockup Button (Req 10) */}
                <button
                  type="button"
                  onClick={handleDownloadFullMockup}
                  className="flex-col justify-center w-[64px] xl:w-auto xl:flex-row xl:rounded-[8px] xl:px-[20px] xl:py-[12px] border-l xl:border border-[#E6E6E6] bg-white font-medium xl:font-semibold text-[9px] xl:text-[14px] text-[#2F3133] flex gap-[4px] xl:gap-[8px] items-center cursor-pointer hover:bg-neutral-50 shadow-2xs transition-all"
                >
                  <Icons.Download />
                  <span>Download Mockup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCartModalOpen(true)}
                  className="justify-center flex-col xl:flex-row w-[64px] xl:w-auto bg-[#F7D163] hover:bg-[#F0C542] xl:rounded-[8px] xl:px-[24px] xl:py-[12px] font-medium xl:font-semibold text-[9px] xl:text-[14px] text-[#2F3133] flex gap-[4px] xl:gap-[8px] items-center cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <Icons.Cart />
                  <span>Masukkan ke Keranjang</span>
                </button>
              </>
            ) : null}

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setCartModalOpen(true)}
              className="relative p-[8px] cursor-pointer text-[#2F3133] hover:bg-[#F4F5F5] rounded-full transition-colors"
              aria-label="Shopping Cart"
            >
              <Icons.Cart />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* STEP 1: MULAI DESIGN CUSTOM (5 MODEL CUTTING RESMI KAOS DILIO) */}
      {/* ========================================================================= */}
      {step === 'categories' && (
        <main className="min-h-[calc(100dvh-64px)] bg-[#F4F5F5] flex justify-center items-center">
          <div className="py-[32px] w-full px-[12px] xl:px-4">
            <div className="w-full max-w-[1280px] mx-auto rounded-[16px] sm:rounded-[24px] px-[16px] sm:px-[32px] py-[32px] bg-white shadow-sm flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[8px]">
                <div className="font-semibold text-[18px] sm:text-[24px] text-[#2F3133]">Mulai Design Custom</div>
                <div className="text-[14px] sm:text-[16px] text-[#64686D]">
                  Pilih model cutting kaos Dilio yang ingin kamu custom (5 Cutting)
                </div>
              </div>

              {/* 5 Cutting Kaos Dilio Cards (Regular, Oversize, Boxy, Fitted, Long Sleeve) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-[16px] gap-y-[24px] sm:gap-[20px]">
                {APPAREL_MODELS.filter((p) => p.category === 'T-Shirts').map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setCurrentProduct(product);
                      const matchingCol =
                        PRODUCT_COLORS.find((c) => c.id === product.defaultColor) || PRODUCT_COLORS[0];
                      setCurrentColor(matchingCol);
                      setStep('editor');
                    }}
                    className="flex flex-col gap-[14px] cursor-pointer text-left group"
                  >
                    <div className="w-full aspect-square relative rounded-[12px] overflow-hidden bg-white border border-[#E6E6E6] flex items-center justify-center p-3 group-hover:border-[#2F3133] transition-colors">
                      <img
                        src={
                          product.cuttingImage
                            ? `${BASE_URL}${product.cuttingImage}`
                            : `${BASE_URL}/mockup-assets/front/${product.defaultColor}.jpg`
                        }
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col gap-[4px] text-left">
                      <div className="font-semibold text-[15px] sm:text-[16px] text-[#2F3133] group-hover:text-black">
                        {product.name.replace(/^Dilio\s+/i, '').replace(/\s+T-Shirt$/i, '')}
                      </div>
                      <div className="text-[12px] text-[#64686D] line-clamp-2">{product.desc}</div>
                      <div className="text-[13px] font-bold text-[#2F3133] mt-1">
                        Rp {product.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CATEGORY PRODUCT GRID (e.g. T-Shirts Produk) */}
      {/* ========================================================================= */}
      {step === 'products' && (
        <main className="h-[calc(100dvh-64px)] bg-[#F4F5F5] flex justify-center items-center">
          <div className="py-[32px] w-full h-full px-[12px] xl:px-0 overflow-auto">
            <div className="max-w-[1400px] mx-auto rounded-[16px] xl:rounded-[24px] px-[16px] xl:px-[32px] py-[32px] bg-white shadow-sm flex flex-col gap-[24px]">
              {/* Back button & Category title */}
              <div className="flex gap-[16px] items-center">
                <button
                  type="button"
                  onClick={() => setStep('categories')}
                  className="p-1 hover:bg-[#F4F5F5] rounded-full transition-colors cursor-pointer text-[#2F3133]"
                  title="Kembali ke kategori"
                >
                  <Icons.ArrowLeft />
                </button>
                <div className="text-[18px] xl:text-[24px] text-[#2F3133] font-semibold">
                  {selectedCategory} Produk
                </div>
              </div>

              {/* 4-Column Product Grid with Cititex exact classes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[32px]">
                {APPAREL_MODELS.filter((p) => p.category === selectedCategory).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setCurrentProduct(product);
                      const matchingCol = PRODUCT_COLORS.find((c) => c.id === product.defaultColor) || PRODUCT_COLORS[0];
                      setCurrentColor(matchingCol);
                      setStep('editor');
                    }}
                    className="flex md:flex-col gap-[20px] relative text-left group cursor-pointer"
                  >
                    {/* Floating badges on top */}
                    <div className="absolute hidden xl:flex p-[4px] gap-[2px] xl:p-[12px] xl:gap-[6px] font-bold z-10 flex-wrap left-0 right-0 w-full">
                      {product.badges?.map((b) => {
                        const style = BADGE_STYLES[b];
                        if (!style) return null;
                        return (
                          <div
                            key={b}
                            className="rounded-[4px] px-[5px] py-[2px] xl:px-[10px] xl:py-[4px] uppercase text-[10px] xl:text-[12px]"
                            style={{ backgroundColor: style.bg, color: style.color }}
                          >
                            {style.label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Image Area with hover transition */}
                    <div className="md:w-full rounded-[12px] h-fit w-[124px] min-w-[124px] relative overflow-hidden aspect-[335/440] bg-white border border-[#E6E6E6]/60">
                      <img
                        src={
                          product.cuttingImage
                            ? `${BASE_URL}${product.cuttingImage}`
                            : `${BASE_URL}/mockup-assets/front/${product.defaultColor}.jpg`
                        }
                        alt={product.name}
                        className={`${
                          product.cuttingImage ? 'object-contain p-2' : 'object-cover'
                        } absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105`}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col gap-[12px] text-left flex-1">
                      {/* Mobile badges */}
                      <div className="flex gap-[4px] xl:hidden flex-wrap">
                        {product.badges?.map((b) => {
                          const style = BADGE_STYLES[b];
                          if (!style) return null;
                          return (
                            <div
                              key={b}
                              className="rounded-[4px] px-[5px] py-[2px] uppercase text-[10px]"
                              style={{ backgroundColor: style.bg, color: style.color }}
                            >
                              {style.label}
                            </div>
                          );
                        })}
                      </div>

                      {/* Spec pills */}
                      <div className="flex gap-[4px] flex-wrap">
                        {product.pills.map((pill, idx) => (
                          <div key={idx} className="px-[5px] py-[2px] bg-[#F4F5F5] rounded-[4px] text-[#64686D] text-[10px] xl:text-[13px]">
                            {pill}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <div className="text-[13px] font-medium xl:text-[16px] text-[#2F3133] leading-[20px] group-hover:text-black">
                          {product.name}
                        </div>
                        <div className="text-[13px] xl:text-[14px] text-[#64686D] leading-[20px] line-clamp-2">
                          {product.desc}
                        </div>
                      </div>

                      <div className="text-[13px] xl:text-[16px] font-semibold text-[#2F3133]">
                        Rp {product.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: STUDIO EDITOR (8 TABS + CONTEXTUAL PANEL + CANVAS + ANGLE SWITCHER) */}
      {/* ========================================================================= */}
      {step === 'editor' && (
        <main className="h-[calc(100dvh-64px)] bg-[#F4F5F5] flex justify-center items-center">
          <div className="h-[calc(100dvh-64px)] w-full max-w-[1400px] flex flex-col xl:flex-row">
            
            {/* LEFT SIDEBAR (Icon Rail + 350px Contextual Panel) */}
            <div className="border-x border-[#E6E6E6] h-full bg-white flex shrink-0">
              
              {/* 1. 72px Icon Rail matching Cititex 8 tools */}
              <div className="w-[72px] border-r border-[#E6E6E6] flex h-full flex-col p-[4px] gap-[4px] items-center">
                {[
                  { id: 'product', label: 'Product', icon: Icons.Shirt },
                  { id: 'upload', label: 'Upload Image', icon: Icons.Upload },
                  { id: 'text', label: 'Add Text', icon: Icons.Typography },
                  { id: 'clipart', label: 'Add Clip Art', icon: Icons.Sticker },
                  { id: 'layer', label: 'Layer', icon: Icons.Layer },
                  { id: 'myimages', label: 'My Images', icon: Icons.Photo },
                  { id: 'template', label: 'Template', icon: Icons.TemplateFilled },
                  { id: 'help', label: 'Help', icon: Icons.Help },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col gap-[4px] items-center justify-center w-[62px] py-[8px] cursor-pointer rounded-[8px] transition-colors ${
                        isActive
                          ? 'bg-[#F4F5F5] text-[#2F3133] font-semibold'
                          : 'hover:bg-[#F4F5F5] text-[#64686D] font-normal'
                      }`}
                    >
                      <IconComp />
                      <div className="text-[11px] text-center leading-[13px]">{item.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* 2. 350px Contextual Panel */}
              <div className="h-full w-[350px] overflow-hidden bg-white">
                
                {/* TAB 1: PRODUCT */}
                {activeTab === 'product' && (
                  <div className="flex flex-col h-full overflow-y-auto">
                    <div className="flex items-center px-[16px] py-[12px] gap-[12px]">
                      <h2 className="font-semibold text-[#2F3133]">Produk</h2>
                    </div>

                    <div className="px-[16px] pb-[16px] flex flex-col gap-[20px]">
                      <div className="rounded-[12px] p-[12px] bg-[#FAFAFA] flex flex-col gap-[20px]">
                        <div className="flex flex-col gap-[6px]">
                          <div className="font-semibold text-[#2F3133]">{currentProduct.name}</div>
                          <div className="text-[13px] text-[#64686D]">
                            {currentProduct.editorDesc || currentProduct.desc}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-[8px]">
                          <button
                            type="button"
                            onClick={() => setProductDetailsModalOpen(true)}
                            className="border border-[#E6E6E6] rounded-[4px] p-[8px] font-semibold text-[13px] text-[#2F3133] cursor-pointer hover:shadow-sm transition-shadow text-center bg-white"
                          >
                            Product Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setStep('categories')}
                            className="bg-[#2F3133] text-white rounded-[4px] p-[8px] font-semibold text-[13px] cursor-pointer hover:shadow-sm transition-shadow"
                          >
                            Ganti Produk
                          </button>
                        </div>
                      </div>

                      {/* Ukuran & Size Guide */}
                      <div className="flex flex-col gap-[8px]">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-[13px] text-[#2F3133]">Ukuran:</div>
                          <button
                            type="button"
                            onClick={() => setSizeGuideModalOpen(true)}
                            className="cursor-pointer whitespace-nowrap font-medium text-[13px] text-[#2F3133] underline decoration-1.5 decoration-[#F9BC0B]"
                          >
                            Panduan Ukuran
                          </button>
                        </div>
                        <div className="text-[13px] text-[#64686D]">
                          {currentProduct.sizes.join(' - ')}
                        </div>
                      </div>

                      {/* Warna & 28x28 Circular Swatches */}
                      <div className="flex flex-col gap-[8px]">
                        <div className="flex gap-[5px] items-center">
                          <div className="font-medium text-[13px] text-[#2F3133]">Warna:</div>
                          <div className="text-[13px] text-[#64686D]">{currentColor.name}</div>
                        </div>
                        <div className="flex flex-wrap gap-[10px]">
                          {PRODUCT_COLORS.map((col) => {
                            const isSelected = currentColor.id === col.id;
                            return (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => setCurrentColor(col)}
                                className={`h-[28px] w-[28px] rounded-full overflow-hidden ring-[1.5px] ring-offset-white ring-offset-[1.5px] cursor-pointer transition-all ${
                                  isSelected ? 'ring-[#2F3133]' : 'ring-[#E6E6E6] hover:ring-[#2F3133]'
                                }`}
                                style={{ backgroundColor: col.hex }}
                                title={col.name}
                                aria-label={col.name}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Spesifikasi */}
                      <div className="flex flex-col gap-[8px]">
                        <div className="font-medium text-[13px] text-[#2F3133]">Spesifikasi</div>
                        <div className="text-[13px] text-[#64686D] leading-[18px]">
                          <ul className="list-disc pl-5 space-y-1">
                            {currentProduct.specs.map((sp, idx) => (
                              <li key={idx}>{sp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: UPLOAD IMAGE */}
                {activeTab === 'upload' && (
                  <div className="flex flex-col h-full">
                    <h2 className="px-[16px] py-[12px] font-semibold text-[#2F3133]">Unggah Gambar</h2>
                    <div className="h-full p-[16px] flex flex-col justify-between">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-[8px] bg-[#FAFAFA] border border-dashed border-[#E6E6E6] p-[24px] gap-[24px] flex flex-col h-full justify-center items-center cursor-pointer transition-colors hover:bg-neutral-50"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div className="flex flex-col gap-[12px] items-center w-full">
                          <div className="rounded-full h-[56px] w-[56px] bg-[#E6E6E6] flex items-center justify-center text-[#9DA0A4]">
                            <Icons.Photo />
                          </div>
                          <div className="font-semibold text-[14px] text-[#2F3133]">
                            Tarik dan taruh gambarmu disini
                          </div>
                          <div className="flex gap-[8px] items-center w-full">
                            <div className="border-t border-[#E6E6E6] flex-1" />
                            <div className="text-xs text-[#64686D]">atau</div>
                            <div className="border-t border-[#E6E6E6] flex-1" />
                          </div>
                          <button
                            type="button"
                            className="rounded-[4px] bg-[#2F3133] text-white font-semibold text-[13px] p-[8px] w-full hover:shadow-sm transition-shadow cursor-pointer"
                          >
                            Cari file
                          </button>
                        </div>

                        <div className="rounded-[8px] p-[12px] bg-[#ECEDEE] w-full text-left">
                          <div className="font-semibold text-[13px] text-[#2F3133] mb-1">
                            Persyaratan file cetak
                          </div>
                          <ul className="list-disc pl-5 text-[13px] text-[#64686D] space-y-1">
                            <li>JPG, JPEG, PNG, AI, PSD, PDF, EPS, SVG didukung</li>
                            <li>Ukuran file maksimal 10 MB</li>
                            <li>Ukuran area cetak 3951 × 4919 px (300 DPI)</li>
                            <li>Resolusi maksimal 3000 × 3000px</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: ADD TEXT */}
                {activeTab === 'text' && (
                  <div className="flex flex-col h-full overflow-y-auto">
                    <h2 className="px-[16px] py-[12px] font-semibold text-[#2F3133]">Tambahkan Teks</h2>
                    <div className="flex flex-col px-[16px] gap-[12px] pb-[16px]">
                      {/* Multiline textarea */}
                      <div className="flex flex-col gap-[6px]">
                        <div className="font-medium text-[13px] text-[#2F3133]">Teks</div>
                        <textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Teks"
                          rows="3"
                          className="w-full border border-[#E6E6E6] rounded-[4px] p-[8px] text-[13px] focus:outline-none focus:border-[#2F3133]"
                        />
                      </div>

                      {/* Ukuran Font */}
                      <div className="flex items-center">
                        <div className="w-[80px] text-[12px] text-[#64686D]">Ukuran Font</div>
                        <div className="flex flex-1 px-[12px]">
                          <input
                            type="range"
                            min="8"
                            max="144"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full accent-[#2F3133]"
                          />
                        </div>
                        <input
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-[60px] border border-[#E6E6E6] rounded-[4px] p-[4px] text-center text-[12px]"
                        />
                      </div>

                      {/* Spasi */}
                      <div className="flex items-center">
                        <div className="w-[80px] text-[12px] text-[#64686D]">Spasi</div>
                        <div className="flex flex-1 px-[12px]">
                          <input
                            type="range"
                            min="-5"
                            max="30"
                            value={letterSpacing}
                            onChange={(e) => setLetterSpacing(Number(e.target.value))}
                            className="w-full accent-[#2F3133]"
                          />
                        </div>
                        <input
                          type="number"
                          value={letterSpacing}
                          onChange={(e) => setLetterSpacing(Number(e.target.value))}
                          className="w-[60px] border border-[#E6E6E6] rounded-[4px] p-[4px] text-center text-[12px]"
                        />
                      </div>

                      {/* Warna */}
                      <div className="flex items-center">
                        <div className="w-[80px] text-[12px] text-[#64686D]">Warna</div>
                        <div className="pl-[12px] flex items-center w-full gap-[6px]">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-[25px] h-[25px] rounded-[4px] border border-[#E6E6E6] cursor-pointer"
                          />
                          <input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1 border border-[#E6E6E6] rounded-[4px] px-[8px] py-[4px] text-[12px] font-mono"
                          />
                        </div>
                      </div>

                      {/* Font */}
                      <div className="flex items-center">
                        <div className="w-[80px] text-[12px] text-[#64686D]">Font</div>
                        <div className="pl-[12px] flex-1">
                          <select
                            value={selectedFont.name}
                            onChange={(e) => {
                              const found = FONTS.find((f) => f.name === e.target.value);
                              if (found) setSelectedFont(found);
                            }}
                            className="w-full border border-[#E6E6E6] rounded-[4px] p-[6px] text-[12px]"
                          >
                            {FONTS.map((f) => (
                              <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Gaya Font */}
                      <div className="flex items-center">
                        <div className="w-[80px] text-[12px] text-[#64686D]">Gaya Font</div>
                        <div className="pl-[12px] flex items-center gap-[6px]">
                          <div className="bg-[#F4F5F5] p-[2px] gap-[2px] flex rounded-[4px]">
                            <button
                              type="button"
                              onClick={() => setIsBold(!isBold)}
                              className={`w-[22px] h-[22px] flex items-center justify-center cursor-pointer rounded-[3px] ${
                                isBold ? 'bg-white shadow-xs text-[#2F3133]' : 'text-[#64686D]'
                              }`}
                            >
                              <Icons.Bold />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsItalic(!isItalic)}
                              className={`w-[22px] h-[22px] flex items-center justify-center cursor-pointer rounded-[3px] ${
                                isItalic ? 'bg-white shadow-xs text-[#2F3133]' : 'text-[#64686D]'
                              }`}
                            >
                              <Icons.Italic />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Perataan */}
                      <div className="flex items-center">
                        <div className="w-[80px] text-[12px] text-[#64686D]">Perataan</div>
                        <div className="pl-[12px] flex items-center gap-[6px]">
                          <div className="bg-[#F4F5F5] p-[2px] gap-[2px] flex rounded-[4px]">
                            <button
                              type="button"
                              onClick={() => setTextAlign('left')}
                              className={`w-[22px] h-[22px] flex items-center justify-center cursor-pointer rounded-[3px] ${
                                textAlign === 'left' ? 'bg-white shadow-xs text-[#2F3133]' : 'text-[#64686D]'
                              }`}
                            >
                              <Icons.AlignLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextAlign('center')}
                              className={`w-[22px] h-[22px] flex items-center justify-center cursor-pointer rounded-[3px] ${
                                textAlign === 'center' ? 'bg-white shadow-xs text-[#2F3133]' : 'text-[#64686D]'
                              }`}
                            >
                              <Icons.AlignCenter />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextAlign('right')}
                              className={`w-[22px] h-[22px] flex items-center justify-center cursor-pointer rounded-[3px] ${
                                textAlign === 'right' ? 'bg-white shadow-xs text-[#2F3133]' : 'text-[#64686D]'
                              }`}
                            >
                              <Icons.AlignRight />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={handleAddText}
                        className="p-[8px] rounded-[4px] font-semibold text-[13px] cursor-pointer transition-all bg-[#2F3133] text-white hover:bg-[#1a1b1c] mt-2"
                      >
                        Tambahkan ke Desain
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: ADD CLIP ART */}
                {activeTab === 'clipart' && (
                  <div className="flex h-full flex-col">
                    <div className="flex gap-[4px] px-[16px] py-[11px] items-center">
                      <h2 className="font-semibold text-[#2F3133]">Tambahkan Clip Art</h2>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col gap-[8px] px-[16px]">
                      {/* Search Bar */}
                      <div className="flex items-center border border-[#E6E6E6] rounded-[4px] px-[8px] py-[6px] gap-[8px]">
                        <Icons.Search />
                        <input
                          type="text"
                          value={clipartSearch}
                          onChange={(e) => setClipartSearch(e.target.value)}
                          placeholder="Search Clip Art"
                          className="w-full text-[13px] focus:outline-none"
                        />
                      </div>

                      {/* Category Chips matching Cititex 1:1 */}
                      <div className="flex flex-wrap gap-[6px] max-h-[85px] overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => setActiveClipartCategory('All')}
                          className={`rounded-full px-[10px] py-[4px] text-[11px] font-medium border cursor-pointer ${
                            activeClipartCategory === 'All'
                              ? 'bg-[#2F3133] text-white border-[#2F3133]'
                              : 'border-[#E6E6E6] text-[#64686D] hover:bg-[#F4F5F5]'
                          }`}
                        >
                          Semua
                        </button>
                        {CLIPART_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveClipartCategory(cat)}
                            className={`rounded-full px-[10px] py-[4px] text-[11px] font-medium border cursor-pointer ${
                              activeClipartCategory === cat
                                ? 'bg-[#2F3133] text-white border-[#2F3133]'
                                : 'border-[#E6E6E6] text-[#64686D] hover:bg-[#F4F5F5]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Clipart Grids */}
                      <div className="flex flex-col gap-[16px] flex-1 min-h-0 overflow-auto pb-[12px] mt-2">
                        {CLIPART_CATEGORIES.filter(
                          (c) => activeClipartCategory === 'All' || activeClipartCategory === c
                        ).map((categoryName) => {
                          const items = CLIPARTS.filter(
                            (item) =>
                              item.category === categoryName &&
                              item.name.toLowerCase().includes(clipartSearch.toLowerCase())
                          );
                          if (items.length === 0) return null;

                          return (
                            <div key={categoryName} className="flex flex-col gap-[8px]">
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-[13px] text-[#2F3133]">{categoryName}</div>
                                <span className="font-medium text-[13px] text-[#2F3133] underline decoration-2 decoration-[#F9BC0B]">
                                  Tampilkan Semua
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-[4px]">
                                {items.map((art) => (
                                  <button
                                    key={art.id}
                                    type="button"
                                    onClick={() => handleAddClipart(art)}
                                    className="relative w-full aspect-square rounded-[8px] cursor-pointer border border-[#E6E6E6] hover:border-[#2F3133] p-1 flex items-center justify-center bg-white"
                                    title={art.name}
                                  >
                                    <img
                                      src={`${BASE_URL}/mockup-assets/clipart/${art.file}`}
                                      alt={art.name}
                                      className="w-full h-full object-contain rounded-[6px]"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: LAYER */}
                {activeTab === 'layer' && (
                  <div className="flex flex-col h-full">
                    <h2 className="px-[16px] py-[12px] font-semibold text-[#2F3133]">Layer</h2>
                    <div className="flex flex-col p-[4px] gap-[4px] max-h-[calc(100dvh-112px)] overflow-y-auto px-[16px]">
                      {layersList.length === 0 ? (
                        <div className="flex items-center justify-center py-[40px] text-[#64686D] text-[14px]">
                          Tidak ada object
                        </div>
                      ) : (
                        layersList.map((item) => (
                          <div
                            key={item.id}
                            className={`p-[8px] rounded-[6px] border flex items-center justify-between text-xs transition-colors ${
                              selectedObjectId === item.id
                                ? 'bg-[#F4F5F5] border-[#2F3133] font-semibold'
                                : 'border-[#E6E6E6] text-[#2F3133]'
                            }`}
                          >
                            <span className="truncate max-w-[140px]">{item.name}</span>
                            <div className="flex items-center gap-[4px]">
                              <button
                                type="button"
                                onClick={() => handleToggleLayerVisibility(item)}
                                className="p-1 text-[#64686D] hover:text-[#2F3133] cursor-pointer"
                                title="Tampilkan / Sembunyikan"
                              >
                                {item.visible ? <Icons.Eye /> : <Icons.EyeOff />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBringLayerForward(item)}
                                className="p-1 text-[#64686D] hover:text-[#2F3133] cursor-pointer"
                                title="Ke Atas"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendLayerBackward(item)}
                                className="p-1 text-[#64686D] hover:text-[#2F3133] cursor-pointer"
                                title="Ke Bawah"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  fabricCanvasRef.current?.remove(item.obj);
                                  syncCanvasState(fabricCanvasRef.current, true);
                                }}
                                className="p-1 text-[#64686D] hover:text-red-600 cursor-pointer"
                                title="Hapus"
                              >
                                <Icons.Trash />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 6: MY IMAGES (GAMBARKU) */}
                {activeTab === 'myimages' && (
                  <div className="flex h-full flex-col">
                    <h2 className="px-[16px] py-[12px] font-semibold text-[#2F3133]">Gambarku</h2>
                    <div className="flex gap-[12px] min-h-0 flex-1 flex-col px-[16px]">
                      {myImages.length === 0 ? (
                        <div className="pb-[12px] grid grid-cols-2 gap-[8px] min-h-0 overflow-auto">
                          <div className="w-full text-center col-span-2 text-[14px] text-[#64686D] py-12">
                            Gambar Kosong
                          </div>
                        </div>
                      ) : (
                        <div className="pb-[12px] grid grid-cols-2 gap-[8px] min-h-0 overflow-auto">
                          {myImages.map((img) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => handleApplyCroppedImage(img.url)}
                              className="aspect-square border border-[#E6E6E6] hover:border-[#2F3133] rounded-[8px] p-2 flex items-center justify-center cursor-pointer bg-[#FAFAFA]"
                            >
                              <img src={img.url} alt="My uploaded" className="max-w-full max-h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 7: TEMPLATE */}
                {activeTab === 'template' && (
                  <div className="flex h-full flex-col">
                    <h2 className="px-[16px] py-[12px] font-semibold text-[#2F3133]">Template</h2>
                    <div className="flex min-h-0 flex-1 flex-col px-[16px] gap-[8px]">
                      <div className="flex items-center border border-[#E6E6E6] rounded-[4px] px-[8px] py-[6px] gap-[8px]">
                        <Icons.Search />
                        <input
                          type="text"
                          placeholder="Cari Template"
                          className="w-full text-[13px] focus:outline-none"
                        />
                      </div>

                      {/* Cititex Template tab indicator */}
                      <div className="border-b border-[#E6E6E6] flex">
                        <button className="py-2 px-3 font-semibold text-[13px] text-[#2F3133] border-b-2 border-[#2F3133]">
                          Cititex Template
                        </button>
                      </div>

                      <div className="py-[12px] grid grid-cols-2 gap-[8px] min-h-0 overflow-auto">
                        {CITITEX_TEMPLATES.map((tmpl) => (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => handleApplyTemplate(tmpl)}
                            className="flex flex-col gap-[8px] text-left border border-[#E6E6E6] hover:border-[#2F3133] rounded-[8px] p-2 cursor-pointer bg-white group"
                          >
                            <div className="relative w-full aspect-[490/640] rounded-[6px] bg-[#F4F5F5] flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                              <img
                                src={`${BASE_URL}/mockup-assets/clipart/${tmpl.clipart}`}
                                alt={tmpl.title}
                                className="w-12 h-12 object-contain mb-1"
                              />
                              <span className="text-[10px] font-bold uppercase text-[#2F3133] leading-tight line-clamp-2">
                                {tmpl.text}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-[#2F3133] truncate group-hover:text-black">
                              {tmpl.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: HELP (BANTUAN) */}
                {activeTab === 'help' && (
                  <div className="flex h-full flex-col">
                    <h2 className="px-[16px] py-[12px] font-semibold text-[#2F3133]">Bantuan</h2>
                    <div className="flex min-h-0 flex-1 flex-col px-[16px] py-[12px] gap-[12px] overflow-y-auto text-xs text-[#64686D]">
                      <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E6E6E6]">
                        <h4 className="font-semibold text-[#2F3133] mb-1">Cara Mendesain Kaos</h4>
                        <p>1. Pilih produk &amp; warna kaos yang diinginkan.</p>
                        <p>2. Gunakan tab Unggah Gambar atau Tambahkan Teks.</p>
                        <p>3. Geser dan ubah ukuran objek langsung pada area cetak kaos.</p>
                        <p>4. Klik "Masukkan ke Keranjang" untuk checkout via WhatsApp.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E6E6E6]">
                        <h4 className="font-semibold text-[#2F3133] mb-1">Area Sablon Tersedia</h4>
                        <p>Gunakan tombol sisi di sebelah kanan layar untuk mendesain Depan, Belakang, Lengan Kiri, Lengan Kanan, hingga Label Kerah.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E6E6E6]">
                        <h4 className="font-semibold text-[#2F3133] mb-2">Konsultasi Gratis</h4>
                        <a
                          href={getWhatsAppUrl('Halo Admin Kaos Dilio, saya ingin bantuan desain sablon')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-3 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded font-bold text-xs"
                        >
                          Chat WhatsApp Admin
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER CANVAS STAGE */}
            <div className="h-[calc(100dvh-166px)] w-full xl:h-full relative flex justify-center xl:py-[24px]">
              
              {/* Floating Top-Left Pill: Undo, Redo, Zoom In, Zoom Out matching Cititex 1:1 */}
              <div className="flex flex-col bg-white shadow-md w-fit absolute top-[12px] left-[12px] rounded-[8px] gap-[4px] p-[4px] z-10">
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={handleUndo}
                  className="text-[#2F3133] disabled:text-[#9DA0A4] hover:bg-[#F6F6F6] rounded-[4px] py-[5px] flex flex-col items-center w-[28px] h-[28px] xl:w-[55px] xl:h-[55px] cursor-pointer disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Icons.Undo />
                  <div className="font-medium text-[11px] hidden xl:block">Undo</div>
                </button>

                <button
                  type="button"
                  disabled={!canRedo}
                  onClick={handleRedo}
                  className="text-[#2F3133] disabled:text-[#9DA0A4] hover:bg-[#F6F6F6] rounded-[4px] py-[5px] flex flex-col items-center w-[55px] h-[55px] cursor-pointer disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Icons.Redo />
                  <div className="font-medium text-[11px] hidden xl:block">Redo</div>
                </button>

                <div className="border-t border-[#E6E6E6]" />

                <button
                  type="button"
                  onClick={() => handleZoom(0.1)}
                  className="text-[#2F3133] hover:bg-[#F6F6F6] rounded-[4px] py-[5px] flex flex-col items-center w-[28px] h-[28px] xl:w-[55px] xl:h-[55px] cursor-pointer"
                  title="Perbesar"
                >
                  <Icons.ZoomIn />
                  <div className="font-medium text-[11px] hidden xl:block">Perbesar</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleZoom(-0.1)}
                  className="text-[#2F3133] hover:bg-[#F6F6F6] rounded-[4px] py-[5px] flex flex-col items-center w-[55px] h-[55px] cursor-pointer"
                  title="Perkecil"
                >
                  <Icons.ZoomOut />
                  <div className="font-medium text-[11px] hidden xl:block">Perkecil</div>
                </button>
              </div>

              {/* Floating Delete Active Object pill */}
              {selectedObjectId && (
                <div className="absolute top-[12px] left-[85px] z-10 bg-white shadow-md rounded-[8px] p-[4px] flex items-center">
                  <button
                    type="button"
                    onClick={handleDeleteActiveObject}
                    className="p-2 hover:bg-[#F6F6F6] text-red-600 rounded-[4px] flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <Icons.Trash />
                    <span>Hapus Objek</span>
                  </button>
                </div>
              )}

              {/* Center Canvas Container with Cititex exact aspect-[490/640] ratio */}
              <div className="w-full h-full items-center sm:justify-center flex overflow-x-auto">
                <div
                  id="canvas-container"
                  className="relative bg-white h-[640px] xl:h-full aspect-[490/640] max-h-[1000px] shadow-sm flex items-center justify-center overflow-hidden transition-transform duration-150"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {/* Real studio photoshoot backdrop */}
                  <img
                    src={shirtPhotoUrl}
                    alt={`${currentProduct.name} ${currentColor.name}`}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    onError={(e) => {
                      e.currentTarget.src = `${BASE_URL}/mockup-assets/${activeAssetFolder}/black.jpg`;
                    }}
                  />

                  {/* Design area boundary (dashed) & Fabric.js Canvas — full-garment coverage */}
                  <div
                    className="absolute flex items-center justify-center transition-transform duration-150"
                    style={{
                      width: 420,
                      height: 560,
                      transform: isUsingCuttingPhoto ? 'scale(0.66)' : 'scale(1)',
                    }}
                  >
                    <div
                      className="absolute inset-0 border border-dashed border-[#9DA0A4] pointer-events-none rounded-[2px] z-10"
                    />
                    <canvas ref={canvasElRef} width={420} height={560} />
                  </div>
                </div>
              </div>

              {/* Floating Right 5-Angle Selector matching Cititex 1:1 */}
              <div className="right-[12px] bg-white shadow-md p-[4px] gap-[4px] rounded-[6px] flex flex-col absolute top-1/2 transform -translate-y-1/2 z-10">
                {ANGLES.map((ang) => {
                  const isSelected = currentAngle === ang.id;
                  const folder = ang.assetFolder;
                  const thumbSrc =
                    ang.id === 'front' && currentProduct.cuttingImage && activeAssetColor === 'black'
                      ? `${BASE_URL}${currentProduct.cuttingImage}`
                      : `${BASE_URL}/mockup-assets/${folder}/${activeAssetColor}.jpg`;

                  return (
                    <div
                      key={ang.id}
                      onClick={() => handleSwitchAngle(ang.id)}
                      className={`cursor-pointer p-[2px] flex flex-col items-center gap-[2px] rounded-[4px] transition-all ${
                        isSelected ? 'border-2 border-[#2F3133] bg-[#ECEDEE]' : 'border-2 border-transparent'
                      }`}
                    >
                      <div className="w-[64px] aspect-[490/640] relative overflow-hidden rounded-[4px] bg-[#F4F5F5] flex items-center justify-center">
                        <img
                          src={thumbSrc}
                          alt={ang.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `${BASE_URL}/mockup-assets/${folder}/black.jpg`;
                          }}
                        />
                      </div>
                      <div className="font-medium text-[11px] text-[#64686D] text-center">
                        {ang.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PANDUAN UKURAN (SIZE CHART) MATCHING CITITEX 1:1 */}
      {/* ========================================================================= */}
      {sizeGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-black/50">
          <div className="relative bg-white rounded-[12px] xl:rounded-[16px] w-full max-h-[90dvh] xl:max-h-[80dvh] overflow-hidden flex flex-col max-w-[600px] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-[16px] py-[16px] xl:px-[24px] xl:py-[20px] border-b border-[#E6E6E6]">
              <div className="text-[18px] xl:text-[20px] font-semibold text-[#2F3133]">Panduan Ukuran</div>
              <button
                type="button"
                onClick={() => setSizeGuideModalOpen(false)}
                className="p-[4px] hover:bg-[#F5F5F5] rounded-[4px] transition-colors cursor-pointer"
              >
                <Icons.X />
              </button>
            </div>

            <div className="overflow-y-auto p-[16px] xl:p-[24px]">
              <div className="flex flex-col gap-[12px]">
                <table className="w-full border-collapse border border-[#E6E6E6] rounded-[12px] overflow-hidden">
                  <thead>
                    <tr>
                      <th className="bg-[#2F3133] text-white font-medium text-[13px] px-[12px] py-[8px] text-center">Size</th>
                      <th className="bg-[#2F3133] text-white font-medium text-[13px] px-[12px] py-[8px] text-center">Lebar Dada (cm)</th>
                      <th className="bg-[#2F3133] text-white font-medium text-[13px] px-[12px] py-[8px] text-center">Panjang (cm)</th>
                      <th className="bg-[#2F3133] text-white font-medium text-[13px] px-[12px] py-[8px] text-center">Lengan (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART_ROWS.map((row) => (
                      <tr key={row.size}>
                        <td className="px-[12px] py-[8px] text-[14px] text-[#2F3133] text-center border-b border-[#E6E6E6] font-semibold">{row.size}</td>
                        <td className="px-[12px] py-[8px] text-[14px] text-[#2F3133] text-center border-b border-[#E6E6E6]">{row.width}</td>
                        <td className="px-[12px] py-[8px] text-[14px] text-[#2F3133] text-center border-b border-[#E6E6E6]">{row.length}</td>
                        <td className="px-[12px] py-[8px] text-[14px] text-[#2F3133] text-center border-b border-[#E6E6E6]">{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right text-xs text-[#64686D]">Toleransi ukuran 1 - 2.5 cm</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRODUCT DETAILS */}
      {/* ========================================================================= */}
      {productDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-black/50">
          <div className="relative bg-white rounded-[16px] w-full max-w-[500px] p-[24px] shadow-2xl flex flex-col gap-[16px]">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-[18px] text-[#2F3133]">{currentProduct.name}</div>
              <button
                type="button"
                onClick={() => setProductDetailsModalOpen(false)}
                className="p-1 hover:bg-[#F5F5F5] rounded-full cursor-pointer"
              >
                <Icons.X />
              </button>
            </div>
            <p className="text-[13px] text-[#64686D] leading-relaxed">
              {currentProduct.editorDesc || currentProduct.desc}
            </p>
            <div className="text-[13px] text-[#2F3133] font-semibold">Spesifikasi Lengkap:</div>
            <ul className="list-disc pl-5 text-[13px] text-[#64686D] space-y-1">
              {currentProduct.specs.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
            <div className="pt-2 flex justify-between items-center border-t border-[#E6E6E6]">
              <span className="text-base font-semibold text-[#2F3133]">
                Rp {currentProduct.price.toLocaleString('id-ID')}
              </span>
              <button
                type="button"
                onClick={() => setProductDetailsModalOpen(false)}
                className="bg-[#2F3133] text-white px-5 py-2 rounded text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CROP IMAGE (MATCHING CITITEX MUI DIALOG WITH #F7D163 BUTTON) */}
      {/* ========================================================================= */}
      {cropModalOpen && pendingCropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-black/50">
          <div className="bg-white rounded-[24px] w-[420px] max-w-[90vw] p-[24px] shadow-2xl flex flex-col gap-[16px]">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-[18px] text-[#2F3133]">Crop Image</div>
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="cursor-pointer text-[#2F3133] hover:bg-[#F5F5F5] p-1 rounded-full"
              >
                <Icons.X />
              </button>
            </div>
            <div className="flex justify-center border border-[#E0E0E0] rounded-[8px] p-2 bg-[#FAFAFA] max-h-[300px] overflow-hidden">
              <img
                src={pendingCropImage}
                alt="Crop preview"
                className="max-h-[280px] max-w-full object-contain"
              />
            </div>
            <div className="flex gap-[12px] justify-end">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="cursor-pointer border border-[#E6E6E6] hover:bg-[#F4F5F5] text-[#2F3133] py-[12px] px-[20px] rounded-[6px] text-[14px] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplyCroppedImage(pendingCropImage)}
                className="cursor-pointer bg-[#F7D163] hover:bg-[#E29F00] text-[#2F3133] font-semibold py-[12px] px-[20px] rounded-[6px] text-[14px] transition-all"
              >
                Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHECKOUT / CART (MASUKKAN KE KERANJANG -> WHATSAPP) */}
      {/* ========================================================================= */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-black/50">
          <div className="relative bg-white rounded-[16px] xl:rounded-[24px] w-full max-w-[520px] p-[24px] shadow-2xl flex flex-col gap-[20px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div className="text-[18px] xl:text-[20px] font-semibold text-[#2F3133]">Konfirmasi Pemesanan</div>
              <button
                type="button"
                onClick={() => setCartModalOpen(false)}
                className="p-1 hover:bg-[#F5F5F5] rounded-full cursor-pointer"
              >
                <Icons.X />
              </button>
            </div>

            {/* Product Summary */}
            <div className="p-3 rounded-[12px] bg-[#FAFAFA] border border-[#E6E6E6] flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-[8px] border border-[#E6E6E6] p-1 flex items-center justify-center">
                <img src={shirtPhotoUrl} alt={currentProduct.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[14px] text-[#2F3133]">{currentProduct.name}</div>
                <div className="text-[12px] text-[#64686D]">
                  Warna: <span className="font-medium text-[#2F3133]">{currentColor.name}</span>
                </div>
                <div className="text-[12px] text-[#2F3133] font-semibold">
                  Rp {currentProduct.price.toLocaleString('id-ID')} / pcs
                </div>
              </div>
            </div>

            {/* Sizes matrix */}
            <div>
              <div className="font-semibold text-[13px] text-[#2F3133] mb-2">Pilih Jumlah per Ukuran:</div>
              <div className="grid grid-cols-5 gap-2">
                {currentProduct.sizes.map((s) => (
                  <div key={s} className="border border-[#E6E6E6] rounded-[8px] p-2 text-center bg-white">
                    <span className="block text-xs font-semibold text-[#2F3133]">{s}</span>
                    <input
                      type="number"
                      min="0"
                      value={sizeQuantities[s] || 0}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setSizeQuantities((prev) => ({ ...prev, [s]: val }));
                      }}
                      className="w-full text-center text-xs font-bold border border-[#E6E6E6] rounded mt-1 py-1 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Customer info */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#2F3133] mb-1">Nama Pemesan (Opsional):</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full border border-[#E6E6E6] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-[#2F3133]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#2F3133] mb-1">Catatan Tambahan (Opsional):</label>
                <textarea
                  rows="2"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Contoh: Tanggal pakai, alamat kirim, dsb..."
                  className="w-full border border-[#E6E6E6] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-[#2F3133]"
                />
              </div>
            </div>

            {/* Summary & Order button */}
            <div className="pt-3 border-t border-[#E6E6E6] flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#64686D]">Total Kuantitas:</span>
                <span className="font-bold text-[#2F3133]">{totalQty} pcs</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-[#2F3133]">Estimasi Total Bahan:</span>
                <span className="text-base font-bold text-[#2F3133]">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSendWhatsAppOrder}
                className="w-full py-3 bg-[#F7D163] hover:bg-[#E29F00] text-[#2F3133] font-bold text-sm rounded-[8px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Icons.Cart />
                <span>Pesan Sekarang via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

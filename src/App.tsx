import React, { useState, useEffect } from 'react';
import { AppLanguage, DigitalPassportLot, NavigationTab, ProductItem, ScreenView, OrderReceipt } from './types';
import { sanitizeProductName } from './utils/productUtils';
import { INITIAL_PRODUCTS, INITIAL_VERIFIED_LOTS } from './data/mockData';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { MainMenuScreen } from './components/MainMenuScreen';
import { ChatScreen } from './components/ChatScreen';
import { ProductTypeCatalogScreen } from './components/ProductTypeCatalogScreen';
import { RegisterCoffeeLotScreen } from './components/RegisterCoffeeLotScreen';
import { DigitalPassportScreen } from './components/DigitalPassportScreen';
import { BuyerShowcaseScreen } from './components/BuyerShowcaseScreen';
import { MyLotsModal } from './components/MyLotsModal';
import { MyPaymentsModal } from './components/MyPaymentsModal';
import { NormativeCertificateModal } from './components/NormativeCertificateModal';
import { ArtisanQrTagModal } from './components/ArtisanQrTagModal';
import { CartModal, CartItem } from './components/CartModal';
import { RegionalMapModal } from './components/RegionalMapModal';
import { MicrophoneDiagnosticModal } from './components/MicrophoneDiagnosticModal';
import { ExplainerVideoModal } from './components/ExplainerVideoModal';
import { RaizAuthModal } from './components/RaizAuthModal';
import { HybridArchitectureModal } from './components/HybridArchitectureModal';
import { ProtocolInfrastructureModal } from './components/ProtocolInfrastructureModal';
import { ResearchPresentationModal } from './components/ResearchPresentationModal';
import { BuyerResearchIssueModal, purgeLegacyBuyerLeads } from './components/BuyerResearchIssueModal';
import { RaizLandingPage } from './components/RaizLandingPage';
import { RaizAuthEngine, UserProfile } from './core/auth/RaizAuthEngine';
import { RaizCore } from './core';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('menu');
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('menu_principal');
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('es');
  const [elderMode, setElderMode] = useState<boolean>(false);

  // Active User & Identity (Account Abstraction & Stellar Keypair)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => RaizAuthEngine.getActiveUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

  // Active data
  const [lots, setLots] = useState<DigitalPassportLot[]>(INITIAL_VERIFIED_LOTS);
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedLot, setSelectedLot] = useState<DigitalPassportLot>(INITIAL_VERIFIED_LOTS[0]);
  const [selectedProductType, setSelectedProductType] = useState<string>('Café');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals
  const [isLotsModalOpen, setIsLotsModalOpen] = useState(false);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [isDictamenModalOpen, setIsDictamenModalOpen] = useState(false);
  const [isQrTagModalOpen, setIsQrTagModalOpen] = useState(false);
  const [qrLot, setQrLot] = useState<DigitalPassportLot | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMicDiagnosticModalOpen, setIsMicDiagnosticModalOpen] = useState(false);
  const [isExplainerVideoOpen, setIsExplainerVideoOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [isBuyerIssueModalOpen, setIsBuyerIssueModalOpen] = useState(false);
  const [passportViewMode, setPassportViewMode] = useState<'productor' | 'comprador'>('productor');
  const [targetChatProducer, setTargetChatProducer] = useState<string | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);
  const [lastOrderReceipt, setLastOrderReceipt] = useState<OrderReceipt | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network status for Modo Parcela (Offline Mode) & Initialize RaizCore
  useEffect(() => {
    RaizCore.init();
    purgeLegacyBuyerLeads();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Deep-linking from shared certificate links (e.g., ?cert=MX-2024-984 or ?cert=lot-984)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const rawParam = urlParams.get('cert') || urlParams.get('lote') || urlParams.get('dictamen');
      if (rawParam) {
        const cleanParam = rawParam.replace(/^(MX-)+/i, '').toLowerCase();
        const found = lots.find(
          (l) =>
            l.code.toLowerCase() === rawParam.toLowerCase() ||
            l.code.toLowerCase() === cleanParam ||
            l.code.toLowerCase() === `mx-${cleanParam}` ||
            l.id.toLowerCase() === rawParam.toLowerCase() ||
            l.id.toLowerCase() === cleanParam ||
            l.code.toLowerCase().includes(cleanParam)
        );
        if (found) {
          setSelectedLot(found);
          const showDictamen = urlParams.get('dictamen') === 'true' || urlParams.get('pdf') === 'true';
          if (showDictamen) {
            setIsDictamenModalOpen(true);
          }
          const roleParam = urlParams.get('role') || urlParams.get('modo');
          const isProducer = roleParam === 'productor' || roleParam === 'campesino';
          setPassportViewMode(isProducer ? 'productor' : 'comprador');
          setCurrentTab('productos');
          setCurrentScreen('pasaporte_digital');
        }
      }

      const viewParam = urlParams.get('view') || urlParams.get('screen');
      if (viewParam === 'landing' || viewParam === 'landing_page') {
        setCurrentScreen('landing_page');
      }

      const presParam = urlParams.get('presentacion') || urlParams.get('presentation') || urlParams.get('dossier');
      if (presParam === 'true' || presParam === '1') {
        setIsPresentationModalOpen(true);
      }

      const issueParam = urlParams.get('issue') || urlParams.get('comprador') || urlParams.get('ux');
      if (issueParam === 'true' || issueParam === '1' || issueParam === 'buyer' || issueParam === 'comprador') {
        setIsBuyerIssueModalOpen(true);
      }
    } catch (err) {
      console.error('Error procesando enlace de certificado:', err);
    }
  }, [lots]);

  // Tab change handler
  const handleTabChange = (tab: NavigationTab) => {
    setCurrentTab(tab);
    if (tab === 'landing') {
      setCurrentScreen('landing_page');
    } else if (tab === 'menu') {
      setCurrentScreen('menu_principal');
    } else if (tab === 'chat') {
      setCurrentScreen('registro_productor');
    } else if (tab === 'productos') {
      setCurrentScreen('vitrina_productos');
    }
  };

  // Screen navigation handler
  const handleNavigateScreen = (screen: ScreenView, productType?: string) => {
    if (productType) {
      setSelectedProductType(sanitizeProductName(productType));
    }
    setCurrentScreen(screen);
    if (screen === 'vitrina_productos' || screen === 'pasaporte_digital') {
      setCurrentTab('productos');
    } else if (screen === 'registro_productor') {
      setCurrentTab('chat');
    } else if (screen === 'landing_page') {
      setCurrentTab('landing');
    } else {
      setCurrentTab('menu');
    }
  };

  // Open QR Tag Modal handler
  const handleOpenQrTag = (lot?: DigitalPassportLot) => {
    if (lot) {
      setQrLot(lot);
    } else {
      setQrLot(selectedLot);
    }
    setIsQrTagModalOpen(true);
  };

  // Cart operations
  const handleAddToCart = (item: CartItem, openModal: boolean = false) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    if (openModal) {
      setIsCartModalOpen(true);
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Direct Contact handler from Vitrina / Pasaporte
  const handleDirectContact = (artisanName: string, productTitle?: string) => {
    setTargetChatProducer(artisanName);
    if (productTitle) {
      setChatInitialMessage(`Hola ${artisanName}, me interesa conocer más sobre "${productTitle}".`);
    } else {
      setChatInitialMessage(`Hola ${artisanName}, me pongo en contacto directo por su producto.`);
    }
    setCurrentTab('chat');
    setCurrentScreen('registro_productor');
  };

  // Navigate from Vitrina product directly to its certified Digital Passport
  const handleSelectProductPassport = (product: ProductItem) => {
    const matchingLot =
      lots.find(
        (l) =>
          l.productType.toLowerCase().includes(product.category.toLowerCase()) ||
          product.title.toLowerCase().includes(l.productType.toLowerCase()) ||
          l.title.toLowerCase().includes(product.title.toLowerCase())
      ) || lots[0];

    setSelectedLot(matchingLot);
    setPassportViewMode('comprador');
    setCurrentTab('productos');
    setCurrentScreen('pasaporte_digital');
  };

  // New lot creation after Step 3
  const handleLotCreated = (customLot?: Partial<DigitalPassportLot>) => {
    const timestamp = new Date().toISOString();
    const mockLedger = Math.floor(52490000 + Math.random() * 10000);
    const mockTxHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const prodType = customLot?.productType || selectedProductType || 'Café de Especialidad';
    const isTenate = prodType.toLowerCase().includes('tenate') || prodType.toLowerCase().includes('tanate');
    const isChapulines = prodType.toLowerCase().includes('chapulin') || prodType.toLowerCase().includes('chapulines') || prodType.toLowerCase().includes('chicatana');
    const isMole = prodType.toLowerCase().includes('mole') || prodType.toLowerCase().includes('coloradito');
    const isChocolate = prodType.toLowerCase().includes('chocolate') || prodType.toLowerCase().includes('cacao');
    const isPulque = prodType.toLowerCase().includes('pulque') || prodType.toLowerCase().includes('aguamiel') || prodType.toLowerCase().includes('tinacal');
    const isTextil = prodType.toLowerCase().includes('textil');
    const isPalma = !isTenate && (prodType.toLowerCase().includes('sombrero') || prodType.toLowerCase().includes('palma'));
    const isMiel = prodType.toLowerCase().includes('miel');
    const isMaiz = prodType.toLowerCase().includes('maíz') || prodType.toLowerCase().includes('maiz');
    const isTomate = prodType.toLowerCase().includes('jitomate') || prodType.toLowerCase().includes('tomate');

    const defaultImg = customLot?.imageUrl
      ? customLot.imageUrl
      : isTenate
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuADMzysc8buYnt4_J6N6fK3aJOpQwIXmK6rDrxaTI_kI2QHwPZaveZN-R-YpdSXJl83jv428Yd5_IFDtytjOVkkte6-yB6pXskpvxdiTLt3gQ4EoFSAS1SzELEaKKIDGkkY-oWJOM68851O2vaSsz92iubLVZ69vQp19ZYBqh38PsSqvSJ-_I0vXR4ZpTDTgoRrmCS2f5HnSOLlMZWIdp0uyeXZVn1fkdUzQelGLAyhj_tOsM-t8ikpbQ'
      : isChapulines
      ? 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Chapulines_de_Oaxaca.jpg'
      : isMole
      ? 'https://upload.wikimedia.org/wikipedia/commons/5/59/Mole_negro_de_Oaxaca_con_arroz.jpg'
      : isChocolate
      ? 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chocolate_mayordomo_oaxaca_%28cropped%29.jpg'
      : isPulque
      ? 'https://images.unsplash.com/photo-1546853020-ca4909aef454?w=800&auto=format&fit=crop&q=80'
      : isTextil
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Ch3EnTKfOPzLhJvKhO3lCcPIUAE3hVVkfX5Im0s-WO1vCixJXClxdVdruWiPRqr3ZuxAzdlH3yAof7r8gqeX3gu9Ib76kDaeSl6pOyNhXt8PsFUfn2Jc7_xqUysoYwZ8H3nJ1yfgy2pOSZt3H-5XCr1VJuyIa-sigPM_rzR4gUCUs1ekNF4IJND5FqstPVswevuKVBQzWO0uds-_-hVuY5mZRW5VnjA9Ovw00rmRFDxpZZ5yIbtMBA'
      : isPalma
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQ_T-4HkMOGbUXCEL4WB3G-nckbk4y8MBXaW8RROxSTNJ7CpRum4bbwbnLCoYIsiGQouYyMcMM8EHk1DzR9XrOLMdVSb-RqJUa1aBk1p6JnwmWpKfFndzgY1CS6A1wg_wb_ZV0zrKj5zVgEEMN7Z3_m97Xx-9YigQ14ZAHHNVhaRXXI0nBiVqxjMXJ8MLMVi_gKnPRfs1qzravdO-6Uv0M8q2gl5pOM-K5nYvOyXYJ1GfD99czI_Ltw'
      : isMiel
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg'
      : isMaiz
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx4jUpQopozBH8CYGA3m-Tfhex_UjwxY-4UKei8h4QhxSSmzObP9OdoONSXqi0XITG11whMMoDAOmA4bw0hSNWommPAh4F1D5ffA86lEaxrdfmf3kJ11rzljgIJllTeHX25OBP5QgRG79YiKsHHOLHgZPBf6D-AEEoGtbjiemIcHXuuXj7ZM1cyu0e6F19V9rkEX4nPjc7Dsc2w4tfJ_eHgPoPJzpuWKstIg6jmmd_4HM4ixO1PrSK4Q'
      : isTomate
      ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
      : 'https://upload.wikimedia.org/wikipedia/commons/1/17/Tlacolula_Market_230122_1.jpg';

    const evidencePhotos = isChapulines
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chapulines_Oaxaca.jpg',
          foliarHealthUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Small_chapulines_basket.JPG'
        }
      : isMole
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Mole_negro_mexicano.jpg',
          foliarHealthUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Mole_negro_de_Oaxaca_con_arroz.jpg'
        }
      : isChocolate
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Cocoa_beans.jpg',
          foliarHealthUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Cacao-pod-k4636-14.jpg'
        }
      : isPulque
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://images.unsplash.com/photo-1546853020-ca4909aef454?w=600&auto=format&fit=crop&q=80',
          foliarHealthUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80'
        }
      : isTextil
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
          foliarHealthUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&auto=format&fit=crop&q=80'
        }
      : isPalma
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADMzysc8buYnt4_J6N6fK3aJOpQwIXmK6rDrxaTI_kI2QHwPZaveZN-R-YpdSXJl83jv428Yd5_IFDtytjOVkkte6-yB6pXskpvxdiTLt3gQ4EoFSAS1SzELEaKKIDGkkY-oWJOM68851O2vaSsz92iubLVZ69vQp19ZYBqh38PsSqvSJ-_I0vXR4ZpTDTgoRrmCS2f5HnSOLlMZWIdp0uyeXZVn1fkdUzQelGLAyhj_tOsM-t8ikpbQ',
          foliarHealthUrl: 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&auto=format&fit=crop&q=80'
        }
      : isMiel
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
          foliarHealthUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&auto=format&fit=crop&q=80'
        }
      : isMaiz
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
          foliarHealthUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80'
        }
      : isTomate
      ? {
          grainGridSampleUrl: defaultImg,
          humidityGaugeUrl: 'https://images.unsplash.com/photo-1546470427-227c7369a9b2?w=600&auto=format&fit=crop&q=80',
          foliarHealthUrl: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80'
        }
      : {
          grainGridSampleUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Tlacolula_Market_230122_1.jpg',
          humidityGaugeUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
          foliarHealthUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
        };

    // Base template
    const baseLot: DigitalPassportLot = {
      id: `lot-${Date.now()}`,
      code: `MX-2024-${Math.floor(900 + Math.random() * 99)}`,
      title: customLot?.title
        ? customLot.title
        : isTenate
        ? 'Tenate Ceremonial de Palma Dulce'
        : isChapulines
        ? 'Chapulines Tostados al Comal de Oaxaca'
        : isMole
        ? 'Mole Negro Auténtico Oaxaqueño'
        : isChocolate
        ? 'Chocolate Criollo Tradicional de la Mixteca'
        : isPulque
        ? 'Pulque Tradicional de Maguey Mixteco'
        : isTextil
        ? 'Rebozo Tradicional en Telar'
        : isPalma
        ? 'Sombrero Costeño de Palma Fina'
        : isMiel
        ? 'Miel Virgen de Abeja de la Mixteca'
        : isMaiz
        ? 'Maíz Azul Criollo Nativo'
        : isTomate
        ? 'Jitomate Saladette Agroecológico'
        : 'Café Arábica Pluma Hidalgo Lavado',
      productType: prodType,
      imageUrl: customLot?.imageUrl || defaultImg,
      imageAlt: isTenate ? 'Tenate tradicional mixteco tejido con palma' : 'Muestra de cosecha o artesanía',
      producerName: isTenate
        ? 'Doña María Guzmán Bautista'
        : isChapulines
        ? 'Doña Francisca López Bautista'
        : isMole
        ? 'Doña Josefina Hernández'
        : isChocolate
        ? 'Doña Esperanza Morales Bautista'
        : isPulque
        ? 'Don Aurelio López'
        : 'Don Efraín Bautista Santiago',
      producerInitials: isTenate ? 'MG' : isChapulines ? 'FL' : isMole ? 'JH' : isChocolate ? 'EM' : isPulque ? 'AL' : 'EB',
      location: isTenate
        ? 'Santa María Cuquila / Tlaxiaco, Oax.'
        : isChapulines
        ? 'Tlacolula / Valles Centrales y Mixteca, Oax.'
        : isMole
        ? 'Zaachila / Mixteca Oaxaqueña'
        : isChocolate
        ? 'Putla Villa de Guerrero / Mixteca Oaxaqueña'
        : isPulque
        ? 'San Mateo Peñasco, Tlaxiaco, Oax.'
        : 'Magdalena Peñasco, Tlaxiaco, Oax.',
      volumeKg: isTenate ? 3 : isChapulines ? 15 : isMole ? 25 : isChocolate ? 45 : isPulque ? 80 : 680,
      verifiedStatus: isTenate
        ? '100% Palma Dulce Tejida a Mano (Doble Nudo)'
        : isChapulines
        ? '100% Chapulín de Milpa Limpio (Tostado Tradicional)'
        : isMole
        ? 'Pasta Tradicional de Mole Negro en Metate'
        : isChocolate
        ? '100% Cacao Criollo Puro (Molienda Ancestral)'
        : isPulque
        ? '100% Aguamiel Puro (Tinacal Tradicional)'
        : 'Calidad Comunitaria Aprobada (Sello Tec)',
      evaluatorOrg: 'Laboratorio de Calidad Mixteco & Tec Hub',
      tags: isTenate
        ? ['Tenate tradicional', 'Palma dulce', 'Doble nudo', 'Mixteca Alta']
        : isChapulines
        ? ['Chapulín de milpa', 'Tostado al comal', 'Ajo, chile y limón', '100% Oaxaqueño']
        : isMole
        ? ['Chilhuacle negro', 'Receta tradicional', 'Cacao y especias', 'Sin conservadores']
        : isChocolate
        ? ['Cacao criollo nativo', 'Molienda en metate', '100% artesanal', 'Sin adulterar']
        : isPulque
        ? ['100% Aguamiel', 'Tinacal Artesanal', 'Sin Adulterar', 'Maguey Manso']
        : ['Cero intermediarios', 'Origen Mixteca Alta', 'Precio Justo Directo'],
      timeline: [
        {
          title: isTenate
            ? 'Corte de Palma Dulce de Cueva y Tejido de Doble Nudo'
            : isMole
            ? 'Selección de Chiles Nativos y Molienda Ancestral'
            : isChapulines
            ? 'Recolección en Milpa y Tostado en Comal de Barro'
            : isChocolate
            ? 'Tueste de Cacao Criollo y Molienda en Metate'
            : isTextil
            ? 'Urdido de Hilos y Tejido en Telar de Cintura'
            : isPalma
            ? 'Recolección de Palma Dulce y Tejido a Mano'
            : isPulque
            ? 'Raspado de Maguey y Fermentación en Tinacal'
            : 'Registro y Cosecha en Parcela',
          dateAndLocation: isTenate
            ? 'Hace 4 días · Taller de Palma, Santa María Cuquila'
            : isMole
            ? 'Hace 3 días · Cocina Tradicional, Zaachila / Mixteca'
            : isChapulines
            ? 'Hace 3 días · Milpa Comunitaria, Tlacolula / Mixteca'
            : isChocolate
            ? 'Hace 3 días · Taller de Molienda, Putla Villa de Guerrero'
            : isTextil
            ? 'Hace 5 días · Taller de Telar, Mixteca Alta'
            : 'Hace 5 días · Magdalena Peñasco, Oax.',
          color: '#032517'
        },
        {
          title: isTenate
            ? 'Inspección de Flexibilidad de Fibra y Remate de Tapa'
            : isMole
            ? 'Evaluación Sensorial, Textura y Sazón Tradicional'
            : isChapulines
            ? 'Inspección de Limpieza de Milpa y Grado de Tueste'
            : isChocolate
            ? 'Inspección de Pureza de Grano de Cacao (< 1% cascarilla)'
            : 'Inspección de Calidad y Muestra de Origen',
          dateAndLocation: 'Hace 2 días · Laboratorio del TecNM Tlaxiaco',
          color: '#032517'
        },
        {
          title: 'Emisión de Sello Digital Comunitario',
          dateAndLocation: `Hoy · Folio Digital #${mockLedger.toLocaleString()}`,
          color: '#a73918'
        }
      ],
      pricePerKg: isTenate ? 380.0 : isChapulines ? 280.0 : isMole ? 240.0 : isChocolate ? 180.0 : isPulque ? 115.0 : 115.0,
      hash: mockTxHash.slice(0, 10) + '...' + mockTxHash.slice(-13),
      variety: isChapulines
        ? 'Chapulín de Milpa (Sphenarium purpurascens) Sazonado Tradicional'
        : isMole
        ? 'Mole Negro Ancestral con Chilhuacle'
        : isChocolate
        ? 'Cacao Criollo Fino de Aroma'
        : 'Pluma Hidalgo / Arabica',
      altitude: isChapulines
        ? '1,550 msnm (Valles y Cañadas Mixtecas)'
        : isChocolate
        ? '850 msnm (Región Putla-Mixteca)'
        : '1,650 msnm (Estricta Altura)',
      process: isChapulines
        ? 'Recolección en Milpa, Lavado, Hervido y Tueste en Comal de Barro'
        : isChocolate
        ? 'Fermentación en Cajón y Molienda en Metate'
        : 'Lavado Tradicional Artesanal',
      notes: isChapulines
        ? 'Lote registrado de chapulines de milpa recolectados artesanalmente y tostados en comal de barro con sal marina, ajo criollo y limón.'
        : isChocolate
        ? 'Lote registrado de chocolate artesanal elaborado a base de cacao criollo con molienda ancestral en metate y canela.'
        : 'Lote registrado con trazabilidad de origen y respaldo comunitario de la Mixteca Alta.',
      nomCompliance: {
        standard: isChapulines
          ? 'Norma Sanitaria Tradicional Oaxaqueña / Sello Yucu'
          : isChocolate
          ? 'NOM-186-SSA1/SCFI-2013 / Sello Mixteca'
          : 'NOM-255-SCFI / Sello Mixteca',
        humidity: isChapulines ? '3.5%' : isChocolate ? '6.8%' : '11.4%',
        humidityCompliant: true,
        defectPercentage: isChapulines ? 0.2 : isChocolate ? 0.8 : 1.1,
        defectClassification: isChapulines
          ? 'Grado Gourmet Ancestral / Selección Manual Limpia'
          : isChocolate
          ? 'Grado Gourmet / Artesanal Ancestral (< 1% defectos)'
          : 'Grado Especialidad / Exportación (< 2% defectos)',
        altitudeMeters: isChapulines ? 1550 : isChocolate ? 850 : 1650,
        strictAltitude: !isChocolate && !isChapulines,
        botanicalPurity: isChapulines
          ? '100% Silvestre de Milpa libre de Agroquímicos'
          : isChocolate
          ? '100% Cacao Criollo Nativo libre OGM'
          : '100% Nativo de la Mixteca libre OGM',
        agroecologicalFreePesticides: true,
        evidencePhotos,
        stellarTxLedger: mockLedger,
        stellarTxHash: mockTxHash,
        stellarTimestamp: timestamp,
        immutableSealStatus: 'Sellado Inmutable'
      }
    };

    const newLot: DigitalPassportLot = {
      ...baseLot,
      ...(customLot || {})
    };

    setLots((prev) => [newLot, ...prev]);
    setSelectedLot(newLot);
  };

  const handleToggleLotVisibility = (lotId: string, visible: boolean) => {
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id === lotId) {
          const updatedConsent = lot.informedConsent
            ? {
                ...lot.informedConsent,
                isPubliclyVisible: visible,
                revocationTimestamp: visible ? undefined : new Date().toISOString()
              }
            : {
                granted: true,
                visibilityLevel: 'nombre_completo' as const,
                consentTimestamp: new Date().toISOString(),
                isPubliclyVisible: visible,
                revocationTimestamp: visible ? undefined : new Date().toISOString()
              };
          const updatedLot: DigitalPassportLot = {
            ...lot,
            informedConsent: updatedConsent
          };
          return updatedLot;
        }
        return lot;
      })
    );

    setSelectedLot((prev) => {
      if (prev.id === lotId) {
        return {
          ...prev,
          informedConsent: {
            ...(prev.informedConsent || {
              granted: true,
              visibilityLevel: 'nombre_completo',
              consentTimestamp: new Date().toISOString()
            }),
            isPubliclyVisible: visible,
            revocationTimestamp: visible ? undefined : new Date().toISOString()
          }
        };
      }
      return prev;
    });
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className={`min-h-screen bg-[#fcf9f3] text-[#1c1c18] flex flex-col justify-between selection:bg-[#ffdbd1] selection:text-[#3b0900] ${
        elderMode ? 'text-[17px]' : ''
      }`}
    >
      {/* Top Application Bar */}
      <TopAppBar
        currentTab={currentTab}
        currentScreen={currentScreen}
        onNavigateScreen={handleNavigateScreen}
        onOpenCart={() => setIsCartModalOpen(true)}
        onOpenMicDiagnostic={() => setIsMicDiagnosticModalOpen(true)}
        onOpenExplainerVideo={() => setIsExplainerVideoOpen(true)}
        onOpenProtocolModal={() => setIsProtocolModalOpen(true)}
        onOpenPresentation={() => setIsPresentationModalOpen(true)}
        cartCount={totalCartCount}
        appLanguage={appLanguage}
        onToggleLanguage={() => setAppLanguage((prev) => (prev === 'es' ? 'mix' : 'es'))}
        elderMode={elderMode}
        onToggleElderMode={() => setElderMode((prev) => !prev)}
        isOnline={isOnline}
      />

      {/* Persistent Offline Banner: Only rendered when there is NO internet */}
      {!isOnline && (
        <div className="w-full bg-[#a73918] text-white px-3.5 py-2 text-[12px] font-extrabold flex items-center justify-between shadow-md border-b-2 border-amber-300 z-30 animate-pulse">
          <div className="flex items-center gap-2 max-w-[85%]">
            <span className="material-symbols-outlined text-[20px] text-amber-200">wifi_off</span>
            <span>
              <strong>Modo Parcela Activo:</strong> Sin conexión a internet. Tus cosechas, notas de voz y fotos se guardan en la memoria de este teléfono.
            </span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
            Offline
          </span>
        </div>
      )}

      {/* Screen Routing */}
      {currentTab === 'menu' && currentScreen === 'menu_principal' && (
        <MainMenuScreen
          onNavigateScreen={handleNavigateScreen}
          onOpenLots={() => setIsLotsModalOpen(true)}
          onOpenPayments={() => setIsPaymentsModalOpen(true)}
          onOpenMap={() => setIsMapModalOpen(true)}
          onOpenMicDiagnostic={() => setIsMicDiagnosticModalOpen(true)}
          onOpenExplainerVideo={() => setIsExplainerVideoOpen(true)}
          onOpenProtocolModal={() => setIsProtocolModalOpen(true)}
          onOpenPresentation={() => setIsPresentationModalOpen(true)}
          currentUser={currentUser}
          appLanguage={appLanguage}
          elderMode={elderMode}
          isOnline={isOnline}
          onOpenTechHelp={() => {
            setTargetChatProducer('Equipo de Asistencia Técnica');
            setCurrentTab('chat');
            setCurrentScreen('registro_productor');
          }}
        />
      )}

      {currentScreen === 'catalogo_producto' && (
        <ProductTypeCatalogScreen
          onSelectProduct={(name) => {
            setSelectedProductType(sanitizeProductName(name));
          }}
          onNavigateScreen={handleNavigateScreen}
          elderMode={elderMode}
          appLanguage={appLanguage}
        />
      )}

      {currentScreen === 'registrar_lote_cafe' && (
        <RegisterCoffeeLotScreen
          selectedProductType={selectedProductType}
          onNavigateScreen={handleNavigateScreen}
          onLotCreated={handleLotCreated}
          elderMode={elderMode}
          appLanguage={appLanguage}
          isOnline={isOnline}
        />
      )}

      {currentScreen === 'pasaporte_digital' && (
        <DigitalPassportScreen
          lot={selectedLot}
          onNavigateScreen={handleNavigateScreen}
          onOpenDictamen={() => setIsDictamenModalOpen(true)}
          onOpenQrTag={handleOpenQrTag}
          onOpenLotsModal={() => setIsLotsModalOpen(true)}
          onDirectMessageProducer={handleDirectContact}
          onAddToCart={handleAddToCart}
          onToggleVisibility={handleToggleLotVisibility}
          elderMode={elderMode}
          appLanguage={appLanguage}
          initialViewMode={passportViewMode}
        />
      )}

      {currentTab === 'chat' && currentScreen === 'registro_productor' && (
        <ChatScreen
          onNavigateScreen={handleNavigateScreen}
          targetProducer={targetChatProducer}
          initialCustomMessage={chatInitialMessage}
          onOpenDictamenModal={() => setIsDictamenModalOpen(true)}
          onOpenLotsModal={() => setIsLotsModalOpen(true)}
          onOpenPaymentsModal={() => setIsPaymentsModalOpen(true)}
          onOpenCartModal={() => setIsCartModalOpen(true)}
          onOpenMapModal={() => setIsMapModalOpen(true)}
          onOpenMicDiagnosticModal={() => setIsMicDiagnosticModalOpen(true)}
          onAddToCart={handleAddToCart}
          selectedLot={selectedLot}
          lastOrderReceipt={lastOrderReceipt}
          onClearOrderReceipt={() => setLastOrderReceipt(null)}
        />
      )}

      {currentTab === 'productos' && currentScreen === 'vitrina_productos' && (
        <BuyerShowcaseScreen
          products={products}
          onNavigateScreen={handleNavigateScreen}
          onAddToCart={handleAddToCart}
          onDirectContact={handleDirectContact}
          onOpenBuyerIssueModal={() => setIsBuyerIssueModalOpen(true)}
          onViewPassport={handleSelectProductPassport}
        />
      )}

      {currentScreen === 'landing_page' && (
        <RaizLandingPage
          onNavigateScreen={handleNavigateScreen}
          onOpenExplainerVideo={() => setIsExplainerVideoOpen(true)}
          onOpenProtocolModal={() => setIsProtocolModalOpen(true)}
          onOpenPresentation={() => setIsPresentationModalOpen(true)}
          onSelectLot={(lot) => setSelectedLot(lot)}
          lots={lots}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar currentTab={currentTab} onSelectTab={handleTabChange} />

      {/* Modals */}
      <ResearchPresentationModal
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
      />
      <MyLotsModal
        isOpen={isLotsModalOpen}
        onClose={() => setIsLotsModalOpen(false)}
        lots={lots}
        onSelectLot={(lot) => {
          setSelectedLot(lot);
          setCurrentTab('productos');
          setCurrentScreen('pasaporte_digital');
        }}
        onRegisterNewLot={() => handleNavigateScreen('catalogo_producto')}
        onOpenQrTag={handleOpenQrTag}
      />

      <MyPaymentsModal
        isOpen={isPaymentsModalOpen}
        onClose={() => setIsPaymentsModalOpen(false)}
        initialCountry={currentUser.country}
        onRequestWithdrawal={(amount) => {
          setTargetChatProducer('Yucu - Tesorería');
          setChatInitialMessage(
            `Hola, solicito formalmente el retiro de mis $${amount.toLocaleString('es-MX', {
              minimumFractionDigits: 2
            })} MXN de saldo acumulado de cosechas para cobro en Tlaxiaco.`
          );
          setCurrentTab('chat');
          setCurrentScreen('registro_productor');
        }}
        onNavigateToLots={() => setIsLotsModalOpen(true)}
      />

      <NormativeCertificateModal
        isOpen={isDictamenModalOpen}
        lot={selectedLot}
        onClose={() => setIsDictamenModalOpen(false)}
        onShareInChat={(lot) => {
          setTargetChatProducer('Asesoría Técnica Yucu');
          setChatInitialMessage(
            `Hola equipo técnico, tengo una consulta sobre el Dictamen Normativo del lote ${lot.title} (Folio #${lot.code}).`
          );
          setCurrentTab('chat');
          setCurrentScreen('registro_productor');
        }}
        onOpenQrTag={handleOpenQrTag}
      />

      <ArtisanQrTagModal
        isOpen={isQrTagModalOpen}
        onClose={() => setIsQrTagModalOpen(false)}
        lot={qrLot || selectedLot}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={handleClearCart}
        onOrderConfirmed={(receipt) => {
          setLastOrderReceipt(receipt);
          setTargetChatProducer(receipt.artisanName);
          setChatInitialMessage(null);
          setCurrentTab('chat');
          setCurrentScreen('registro_productor');
        }}
        onExploreProducts={() => handleNavigateScreen('vitrina_productos')}
      />

      <RegionalMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectCommunity={(name) => {
          setIsLotsModalOpen(true);
        }}
      />

      <MicrophoneDiagnosticModal
        isOpen={isMicDiagnosticModalOpen}
        onClose={() => setIsMicDiagnosticModalOpen(false)}
      />

      <ExplainerVideoModal
        isOpen={isExplainerVideoOpen}
        onClose={() => setIsExplainerVideoOpen(false)}
        onNavigateScreen={handleNavigateScreen}
      />

      {/* Identidad Yucu Modal (Acceso Soberano sin Contraseñas) */}
      <RaizAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      {/* Arquitectura Híbrida Trilateral Modal (Etherfuse + Polar + PIX + MicoPay) */}
      <HybridArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        onOpenPayments={() => setIsPaymentsModalOpen(true)}
      />

      {/* Consola de Infraestructura Yucu & 4 Oráculos de IA Modal */}
      <ProtocolInfrastructureModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
      />

      {/* Modal de Plantilla de Issue GitHub para Entrevistas a Compradores y Usabilidad UX (TecNM) */}
      <BuyerResearchIssueModal
        isOpen={isBuyerIssueModalOpen}
        onClose={() => setIsBuyerIssueModalOpen(false)}
      />
    </div>
  );
}

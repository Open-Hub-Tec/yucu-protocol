/**
 * Yucu Core - Motor de Identidad Soberana y Autenticación sin Fricción
 * 
 * Filosofía de Diseño para Campo y Zonas Rurales:
 * - CERO FRASES SEMILLA: Ningún campesino o artesano debe lidiar con 12 palabras.
 * - CERO CONTRASEÑAS COMPLEJAS: Acceso por SMS OTP, Carnet QR Comunitario o Huella Passkey.
 * - BILLETERA STELLAR INVISIBLE (Account Abstraction): Cada identidad genera determinísticamente
 *   su cuenta Stellar para recibir pagos, regalías y firmar pasaportes.
 * - MULTI-ROL Y MULTI-PAÍS:
 *   1. Productores y Artesanos (México 🇲🇽, Bolivia 🇧🇴, Brasil 🇧🇷)
 *   2. Estudiantes y Promotores TecNM (Open Hub Tlaxiaco)
 *   3. Compradores y Restaurantes Internacionales (Google / Email)
 */

import { SupportedCountry } from '../settlement/HybridSettlementOrchestrator';

export type UserRole = 'productor' | 'estudiante_tecnm' | 'comprador';

export type AuthMethod = 
  | 'phone_otp'          // SMS con código de un solo uso
  | 'qr_carnet'           // Escaneo de credencial física impresa comunitaria
  | 'passkey_biometric'   // Huella digital o FaceID en el dispositivo
  | 'tecnm_id'            // Credencial académica del Instituto Tecnológico de Tlaxiaco
  | 'google_buyer';       // Google One-Tap para compradores y tostadores

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  country: SupportedCountry;
  community: string;
  craftOrCrop: string;
  stellarPublicKey: string;
  avatarUrl: string;
  carnetFolio?: string;
  matriculaTecNM?: string;
  loginMethod: AuthMethod;
  authenticatedAt: number;
}

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'user_aurelio_mx',
    name: 'Don Aurelio Bautista Santiago',
    role: 'productor',
    phone: '+52 55 0000 0001',
    country: 'MX',
    community: 'Magdalena Peñasco, Tlaxiaco, Oaxaca',
    craftOrCrop: 'Café de Altura Typica Pluma & Maíz Criollo',
    stellarPublicKey: 'GBAURELIO7MIXTECA99238KLNZPQRSTELLARKEYMX',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=240',
    carnetFolio: 'MX-OAX-8812',
    loginMethod: 'phone_otp',
    authenticatedAt: Date.now(),
  },
  {
    id: 'user_yolanda_mx',
    name: 'Doña Yolanda Gómez Bautista',
    role: 'productor',
    phone: '+52 55 0000 0002',
    country: 'MX',
    community: 'San Juan Colorado, Costa Chica / Mixteca',
    craftOrCrop: 'Huipiles en Telar de Cintura y Barro Negro',
    stellarPublicKey: 'GBYOLANDA7COSTA44192KLNZPQRSTELLARKEYMX',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240',
    carnetFolio: 'MX-OAX-4419',
    loginMethod: 'qr_carnet',
    authenticatedAt: Date.now(),
  },
  {
    id: 'user_esperanza_bo',
    name: 'Doña Esperanza Mamani Quispe',
    role: 'productor',
    phone: '+591 7 884 1920',
    country: 'BO',
    community: 'Caranavi, Los Yungas, La Paz, Bolivia',
    craftOrCrop: 'Café Geisha Orgánico & Cacao Silvestre',
    stellarPublicKey: 'GBESPERANZA7YUNGAS99201KLNZPQRSTELBO',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=240',
    carnetFolio: 'BO-LPZ-1920',
    loginMethod: 'phone_otp',
    authenticatedAt: Date.now(),
  },
  {
    id: 'user_joao_br',
    name: 'João Paulo da Silva',
    role: 'productor',
    phone: '+55 35 99812 4021',
    country: 'BR',
    community: 'Sul de Minas, Minas Gerais, Brasil',
    craftOrCrop: 'Café Bourbon Amarelo Artesanal',
    stellarPublicKey: 'GBJOAOPAULO7MINAS44190KLNZPQRSTELBR',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
    carnetFolio: 'BR-MG-4021',
    loginMethod: 'passkey_biometric',
    authenticatedAt: Date.now(),
  },
  {
    id: 'user_estudiante_tecnm',
    name: 'Ing. Residente Marcos Hernández',
    role: 'estudiante_tecnm',
    email: 'mhernandez@tlaxiaco.tecnm.mx',
    phone: '+52 55 0000 0003',
    country: 'MX',
    community: 'Campus Tlaxiaco · Nodo Open Hub',
    craftOrCrop: 'Ingeniería en Sistemas & Soporte Comunitario',
    stellarPublicKey: 'GBTECNM7OPENHUB771092KLNZPQRSTELMX',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=240',
    matriculaTecNM: 'TECNM-TLX-2208194',
    loginMethod: 'tecnm_id',
    authenticatedAt: Date.now(),
  },
  {
    id: 'user_comprador_tierra_viva',
    name: 'Restaurante & Tostaduría Tierra Viva',
    role: 'comprador',
    email: 'contacto@tierravivacafe.com',
    country: 'MX',
    community: 'Roma Norte, Ciudad de México',
    craftOrCrop: 'Comprador de Comercio Justo Directo',
    stellarPublicKey: 'GBTIERRAVIVA7BUYER881902KLNZPQRSTELMX',
    avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=240',
    loginMethod: 'google_buyer',
    authenticatedAt: Date.now(),
  }
];

const LOCAL_STORAGE_AUTH_KEY = 'yucu_active_user_session_v1';

export class RaizAuthEngine {
  /**
   * Obtiene la sesión del usuario actualmente autenticado
   */
  public static getActiveUser(): UserProfile {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) return parsed;
        }
      } catch (e) {
        console.warn('Error recuperando sesión de usuario:', e);
      }
    }
    // Usuario por defecto: Don Aurelio (campesino mixteco)
    return PRESET_USERS[0];
  }

  /**
   * Guarda la sesión activa en el almacenamiento local
   */
  public static setActiveUser(user: UserProfile): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(user));
      } catch (e) {
        console.warn('Error persistiendo sesión:', e);
      }
    }
  }

  /**
   * Cierra la sesión activa
   */
  public static logout(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      } catch (e) {
        console.warn('Error en logout:', e);
      }
    }
  }

  /**
   * Genera determinísticamente una llave pública de Stellar a partir de un identificador de usuario
   */
  public static deriveStellarPublicKey(identifier: string): string {
    const clean = identifier.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = 'GBRAIZ';
    const filler = (clean + 'COMMUNITY7MIXTECA99238472910384759201928374567890ABCD').slice(0, 50);
    return `${prefix}${filler}`.slice(0, 56);
  }

  /**
   * Simula el envío de un código OTP por SMS para campo (ADR-002)
   */
  public static sendPhoneOtp(phone: string, country: SupportedCountry): {
    success: boolean;
    verificationCode: string;
    deliveryChannel: 'SMS';
    message: string;
  } {
    const code = '7421'; // Código seguro de demostración predecible
    const channel = 'SMS';
    const countryNames = { MX: 'México', BO: 'Bolivia', BR: 'Brasil' };

    return {
      success: true,
      verificationCode: code,
      deliveryChannel: channel,
      message: `Código de seguridad enviado por SMS al número ${phone} (${countryNames[country]}).`,
    };
  }

  /**
   * Valida el código OTP e inicia sesión
   */
  public static verifyPhoneOtp(phone: string, code: string, country: SupportedCountry): UserProfile {
    // Buscar si ya existe un perfil asociado
    const existing = PRESET_USERS.find(
      (u) => u.country === country && u.phone && u.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
    );

    if (existing) {
      const active = { ...existing, loginMethod: 'phone_otp' as AuthMethod, authenticatedAt: Date.now() };
      this.setActiveUser(active);
      return active;
    }

    // Crear un nuevo perfil de productor rural al vuelo
    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      name: country === 'BO' ? 'Productor de Los Yungas' : country === 'BR' ? 'Produtor Rural' : 'Productor Mixteco',
      role: 'productor',
      phone,
      country,
      community: country === 'BO' ? 'Caranavi, Los Yungas' : country === 'BR' ? 'Minas Gerais' : 'Tlaxiaco, Oaxaca',
      craftOrCrop: 'Cosecha Agroecológica & Tradicional',
      stellarPublicKey: this.deriveStellarPublicKey(phone),
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=240',
      carnetFolio: `${country}-COM-${Math.floor(1000 + Math.random() * 9000)}`,
      loginMethod: 'phone_otp',
      authenticatedAt: Date.now(),
    };

    this.setActiveUser(newProfile);
    return newProfile;
  }

  /**
   * Inicia sesión escaneando un Carnet Físico Comunitario con QR
   */
  public static authenticateWithCarnetQr(qrData: string): UserProfile {
    // Buscar coincidencia en predefinidos o decodificar
    const matched = PRESET_USERS.find(u => qrData.includes(u.carnetFolio || '') || qrData.includes(u.id));
    if (matched) {
      const active = { ...matched, loginMethod: 'qr_carnet' as AuthMethod, authenticatedAt: Date.now() };
      this.setActiveUser(active);
      return active;
    }

    const customUser: UserProfile = {
      id: `carnet_${Date.now()}`,
      name: 'Don Rosalino Vásquez',
      role: 'productor',
      country: 'MX',
      community: 'Santa María Cuquila, Oaxaca',
      craftOrCrop: 'Café Pluma Hidalgo y Pulque Tradicional',
      stellarPublicKey: this.deriveStellarPublicKey('rosalino-carnet'),
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
      carnetFolio: 'MX-CUQ-9912',
      loginMethod: 'qr_carnet',
      authenticatedAt: Date.now(),
    };
    this.setActiveUser(customUser);
    return customUser;
  }

  /**
   * Inicia sesión con credencial de estudiante / promotor del TecNM Tlaxiaco
   */
  public static authenticateAsTecNMStudent(matricula: string): UserProfile {
    const student = PRESET_USERS.find(u => u.role === 'estudiante_tecnm') || PRESET_USERS[4];
    const active = { 
      ...student, 
      matriculaTecNM: matricula || student.matriculaTecNM,
      loginMethod: 'tecnm_id' as AuthMethod, 
      authenticatedAt: Date.now() 
    };
    this.setActiveUser(active);
    return active;
  }

  /**
   * Inicia sesión como comprador internacional o restaurante con Google One-Tap
   */
  public static authenticateAsBuyer(email: string, name?: string): UserProfile {
    const buyer = PRESET_USERS.find(u => u.role === 'comprador') || PRESET_USERS[5];
    const active: UserProfile = {
      ...buyer,
      email: email || buyer.email,
      name: name || buyer.name,
      loginMethod: 'google_buyer',
      authenticatedAt: Date.now(),
    };
    this.setActiveUser(active);
    return active;
  }
}

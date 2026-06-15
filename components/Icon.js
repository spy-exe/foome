// Camada única de ícones do Foome — tudo passa por lucide-react-native.
//
// As telas foram migradas de @expo/vector-icons (Feather/Ionicons) para lucide.
// Para manter um diff mínimo e seguro, este módulo reexporta componentes com a
// mesma API `name="kebab-case"` que as telas já usavam, resolvendo cada nome
// para o ícone lucide correspondente. Não há mais dependência de @expo/vector-icons.
import React from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, Bell, Camera, CameraOff, Check,
  CheckCircle2, ChevronLeft, ChevronRight, Clock, Copy, Crosshair, Edit2,
  Eye, Fingerprint, Grid, Lock, LogOut, Mail, Map, MapPin, Minus, Moon,
  Navigation, Package, Pencil, Plus, Repeat, Search, Settings, Shield,
  ShoppingBag, SlidersHorizontal, Star, Tag, Trash2, Truck, User, Utensils,
  X, HelpCircle,
} from 'lucide-react-native';

// kebab-case (Feather/Ionicons) -> componente lucide.
const MAP = {
  'alert-circle': AlertCircle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'bell': Bell,
  'camera': Camera,
  'camera-off': CameraOff,
  'check': Check,
  'check-circle': CheckCircle2,
  'checkmark': Check,
  'checkmark-circle': CheckCircle2,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'clock': Clock,
  'close': X,
  'copy': Copy,
  'crosshair': Crosshair,
  'edit-2': Edit2,
  'eye': Eye,
  'finger-print': Fingerprint,
  'grid': Grid,
  'lock': Lock,
  'log-out': LogOut,
  'mail': Mail,
  'map': Map,
  'map-pin': MapPin,
  'minus': Minus,
  'moon': Moon,
  'navigation': Navigation,
  'package': Package,
  'pencil': Pencil,
  'plus': Plus,
  'repeat': Repeat,
  'restaurant-outline': Utensils,
  'search': Search,
  'settings': Settings,
  'shield': Shield,
  'shopping-bag': ShoppingBag,
  'sliders': SlidersHorizontal,
  'star': Star,
  'tag': Tag,
  'trash-2': Trash2,
  'truck': Truck,
  'user': User,
  'x': X,
};

function makeIconComponent(displayName) {
  function IconShim({ name, size = 24, color, style, strokeWidth = 2, ...rest }) {
    const Cmp = MAP[name] || HelpCircle;
    return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} {...rest} />;
  }
  IconShim.displayName = displayName;
  return IconShim;
}

// Mesmos nomes de import que as telas já usavam, agora 100% lucide por baixo.
export const Feather = makeIconComponent('Feather');
export const Ionicons = makeIconComponent('Ionicons');

export default Feather;

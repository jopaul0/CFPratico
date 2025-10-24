// src/utils/CategoryIcons.ts
import {
  LucideIcon,
  DollarSign, // Padrão
  Wallet, 
  Receipt, 
  Move, 
  Truck, 
  LandPlot, 
  Briefcase, 
  CreditCard, 
  Plug, 
  Droplet, 
  Wifi, 
  Phone, 
  Wrench, 
  Megaphone, 
  Fuel, 
  HardHat, 
  MoreHorizontal,
} from 'lucide-react-native';

// NOVO: Mapeia o NOME do ícone (string) para o Componente
const iconMap: Record<string, LucideIcon> = {
    "DollarSign": DollarSign,
    "Wallet": Wallet,
    "Receipt": Receipt,
    "Move": Move,
    "Truck": Truck,
    "LandPlot": LandPlot,
    "Briefcase": Briefcase,
    "CreditCard": CreditCard,
    "Plug": Plug,
    "Droplet": Droplet,
    "Wifi": Wifi,
    "Phone": Phone,
    "Wrench": Wrench,
    "Megaphone": Megaphone,
    "Fuel": Fuel,
    "HardHat": HardHat,
    "MoreHorizontal": MoreHorizontal,
};

/**
 * ATUALIZADO: Busca um componente de ícone Lucide pelo seu nome (string).
 * @param iconName O nome do ícone (ex: "Wallet", "Truck")
 * @returns O componente LucideIcon, ou DollarSign como padrão.
 */
export const getCategoryIcon = (iconName: string | null | undefined): LucideIcon => {
    if (!iconName) {
        return DollarSign; // Padrão se for nulo ou indefinido
    }
    return iconMap[iconName] || DollarSign; // Padrão se o nome não for encontrado
};

// Removemos o ALL_CATEGORIES daqui, pois agora ele vive em initialize.ts
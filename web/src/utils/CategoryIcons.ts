// src/utils/CategoryIcons.ts
// IMPORTANTE: Troque 'lucide-react-native' por 'lucide-react'
import {
  LucideIcon,
  DollarSign,
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
} from 'lucide-react'; // <-- MUDANÇA AQUI

// O resto do arquivo é idêntico
export const iconMap: Record<string, LucideIcon> = {
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

export const ICON_TRANSLATIONS: Record<string, string> = {
    "DollarSign": "Dinheiro / Padrão",
    "Wallet": "Carteira",
    "Receipt": "Recibo / Venda",
    "Move": "Transferência",
    "Truck": "Caminhão / Transporte",
    "LandPlot": "Terreno / Aluguel",
    "Briefcase": "Maleta / Honorários",
    "CreditCard": "Cartão de Crédito",
    "Plug": "Energia / Eletricidade",
    "Droplet": "Água",
    "Wifi": "Internet",
    "Phone": "Telefone",
    "Wrench": "Manutenção / Ferramenta",
    "Megaphone": "Marketing",
    "Fuel": "Combustível",
    "HardHat": "Equipamentos / Obras",
    "MoreHorizontal": "Outros",
};

export const getCategoryIcon = (iconName: string | null | undefined): LucideIcon => {
    if (!iconName) {
        return DollarSign;
    }
    return iconMap[iconName] || DollarSign;
};
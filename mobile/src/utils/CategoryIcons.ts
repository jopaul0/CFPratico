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

// Mapeia o NOME do ícone (string) para o Componente
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

// --- NOVO: Mapa de Traduções para o Picker ---
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

/**
 * Busca um componente de ícone Lucide pelo seu nome (string).
 * (Sem alteração)
 */
export const getCategoryIcon = (iconName: string | null | undefined): LucideIcon => {
    if (!iconName) {
        return DollarSign; // Padrão se for nulo ou indefinido
    }
    return iconMap[iconName] || DollarSign; // Padrão se o nome não for encontrado
};
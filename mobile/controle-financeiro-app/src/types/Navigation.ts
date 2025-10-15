export type RootStackParamList = {
  // Tela principal, que é o Drawer Navigator inteiro
  HomeDrawer: undefined; 
  // Futuras telas que fariam parte do Stack principal (ex: Settings)
};

// Parâmetros para o Drawer (Barra Lateral)
export type DrawerParamList = {
  Dashboard: undefined; // Sua HomeScreen será o dashboard
  Form: undefined;      // Tela para Nova Movimentação (se for separada)
  Reports: undefined;   // Tela de Relatórios/Busca (Sua tela atual)
  // Outras seções...
};

// Tipos para as rotas dentro do Stack Navigator (as telas em si)
export type HomeStackParamList = {
  HomeMain: undefined; // A tela principal com Cards, Filtros e Tabela
  // Futuras telas que seriam acessadas a partir da Home (ex: Detalhes da Movimentação)
};
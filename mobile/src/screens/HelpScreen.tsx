import React from 'react';
import { Text } from 'react-native';
import { MainContainer } from '../components/MainContainer';
import { FaqItem } from '../components/FaqItem'; //

interface FaqEntry {
    q: string; // Pergunta
    a: string; // Resposta
}

// --- ARRAY DE DADOS ATUALIZADO ---
export const FAQ_DATA: FaqEntry[] = [
    {
        q: "Guia Rápido: Como adiciono uma transação?",
        a: "Na tela 'Resumo' ou 'Movimentação', clique no botão azul com o ícone '+' no canto inferior direito. Isso abrirá a tela 'Adicionar Transação'. Preencha os campos (Data, Descrição, Valor, Tipo, etc.) e clique em 'Salvar'."
    },
    {
        q: "Guia Rápido: Como edito uma transação?",
        a: "1. Vá para a tela 'Movimentação'.\n2. Encontre e toque na transação que deseja alterar.\n3. Na tela de 'Detalhe da Transação', clique no botão 'Editar'.\n4. Altere os campos que precisar e clique em 'Salvar'."
    },
    {
        q: "Guia Rápido: Como excluo uma transação?",
        a: "1. Vá para a tela 'Movimentação'.\n2. Toque na transação que deseja apagar.\n3. Na tela de 'Detalhe da Transação', clique no botão vermelho 'Excluir' e confirme na caixa de diálogo."
    },
    {
        q: "Como excluir VÁRIAS transações de uma vez?",
        a: "Na tela 'Movimentação', pressione e segure qualquer item da lista. Isso ativará o 'modo de seleção'. Toque em todas as transações que deseja apagar e, em seguida, clique no botão flutuante vermelho (que agora terá um ícone de lixeira)."
    },
    {
        q: "Para que serve cada tela principal?",
        a: "O app tem três seções no menu:\n1. 'Resumo': Mostra seu saldo atual total, gráficos e um resumo financeiro do período filtrado.\n2. 'Movimentação': É a lista completa de TODAS as suas transações, permitindo busca e filtros avançados.\n3. 'Configurações': Onde você gerencia seu saldo inicial, categorias, formas de pagamento e backups."
    },
    {
        q: "Como funcionam os filtros?",
        a: "Tanto no 'Resumo' quanto na 'Movimentação', você pode filtrar por período (Data Inicial/Final). Na 'Movimentação', você pode ser ainda mais específico, filtrando por tipo (receita/despesa), categoria, forma de pagamento e até buscando por texto na barra de busca."
    },
    {
        q: "O que é o Saldo Inicial e por que meu saldo está estranho?",
        a: "O 'Saldo Inicial' (em 'Configurações' > 'Dados da Empresa') é o valor que você tinha em caixa/banco ANTES de começar a usar o app. Se seu saldo total parece errado, provavelmente é porque este valor não foi configurado. Todos os cálculos de saldo partem dele."
    },
    {
        q: "Como funciona o 'Puxar para Atualizar'?",
        a: "Em qualquer tela com dados (Resumo, Movimentação, etc.), puxe a tela para baixo até o indicador de carregamento aparecer. Isso força o aplicativo a recarregar os dados mais recentes do banco de dados."
    },
    {
        q: "Para que servem as telas de Gerenciamento?",
        a: "Em 'Configurações', você pode 'Gerenciar Categorias' e 'Gerenciar Formas de Pagamento'. Isso permite que você personalize as listas de seleção que aparecem ao adicionar ou editar uma transação, incluindo os ícones das categorias."
    },
    {
        q: "Qual a diferença entre 'Exportar Dados' e 'Exportar Relatório'?",
        a: "1. 'Exportar Dados' (em Configurações): Cria um backup técnico (.json) de TUDO. É usado com o 'Importar Dados' para restaurar o app.\n2. 'Exportar Relatório' (no Resumo): Cria um relatório visual (PDF ou Excel) apenas dos dados que você filtrou na tela, ideal para compartilhar ou imprimir."
    },
    {
        q: "O que faz o 'Resetar Aplicativo'?",
        a: "CUIDADO. Esta opção (em 'Configurações') apaga ABSOLUTAMENTE TUDO: suas transações, categorias, formas de pagamento e saldo inicial, restaurando o app ao estado de fábrica. Use apenas se tiver certeza ou se já tiver um backup."
    }
];

export const HelpScreen: React.FC = () => {
    return (
        <MainContainer>
            <Text className="text-2xl font-bold text-gray-800 mb-6">Central de Ajuda (FAQ)</Text>

            {FAQ_DATA.map((item, index) => (
                <FaqItem
                    key={index}
                    q={item.q}
                    a={item.a}
                />
            ))}

        </MainContainer>
    );
};
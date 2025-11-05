// ========================= Config & Utils =========================
const STORAGE_KEY = 'fluxo_caixa_itens_v2';
const CATEGORIES_URL = 'categories.json';
const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Mapeamento dos novos valores de "Conta" (agora Formas de Pagamento)
const CONTA_OPTIONS = {
    'pix': 'Pix',
    'cartao': 'Cartão de Crédito',
    'ted': 'Transferência TED',
    'boleto': 'Boleto',
    'cheque': 'Cheque',
    'dinheiro': 'Dinheiro',
};

// Mapeamento dos novos valores de "Forma" (agora Condição)
const FORMA_OPTIONS = {
    'avista': 'À vista',
    'parcelado': 'Parcelado',
};

function parseValor(input) {
    if (typeof input === 'number') return input;
    if (!input) return 0;
    const s = String(input).trim();
    if (s === '') return 0;
    const normalized = s.replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return isNaN(n) ? 0 : n;
}

function saveItens(itens){ localStorage.setItem(STORAGE_KEY, JSON.stringify(itens)); }
function loadItens(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }

let itens = loadItens();
let editId = null;
let categories = [];

// --- UTILITY: Cria um objeto Date seguro para o fuso horário local (evita desvio de um dia) ---
function getSafeDate(dateString) {
    if (!dateString) return null;
    // Cria uma string de data formatada como YYYY/MM/DD e assume 12:00:00 para evitar desvios de fuso horário.
    const parts = dateString.split('-');
    if (parts.length === 3) {
        // Ano, Mês (base 1), Dia, Meio-dia (12:00:00)
        return new Date(parts[0], parts[1] - 1, parts[2], 12);
    }
    return new Date(dateString); // Fallback
}

// ========================= DOM Ready =========================
window.addEventListener('DOMContentLoaded', async () => {
    // Inputs de Filtros
    const filtroDataInicial = document.getElementById('filtroDataInicial');
    const filtroDataFinal = document.getElementById('filtroDataFinal');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroTipo = document.getElementById('filtroTipo');
    const filtroConta = document.getElementById('filtroConta'); // Formas de Pagamento
    const filtroForma = document.getElementById('filtroForma'); // Condição
    const filtroBusca = document.getElementById('filtroBusca');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');

    // Elementos de Resumo e Tabela
    const totalReceitasEl = document.getElementById('totalReceitas');
    const totalDespesasEl = document.getElementById('totalDespesas');
    const saldoPeriodoEl = document.getElementById('saldoPeriodo');
    const contagem = document.getElementById('contagem');
    const tbody = document.getElementById('tbody');

    // Inputs de Formulário
    const form = document.getElementById('formMov');
    const movData = document.getElementById('movData');
    const movTipo = document.getElementById('movTipo');
    const movConta = document.getElementById('movConta'); // Formas de Pagamento
    const movCategoria = document.getElementById('movCategoria');
    const movHistorico = document.getElementById('movHistorico');
    const movValor = document.getElementById('movValor');
    const movForma = document.getElementById('movForma'); // Condição
    const movParcelas = document.getElementById('movParcelas');
    const parcelasWrap = document.getElementById('parcelasWrap');

    // Botões de Ação
    const btnExportCSV = document.getElementById('btnExportCSV');
    const fileImport = document.getElementById('fileImport');
    const btnPrint = document.getElementById('btnPrint');
    const btnExportPDF = document.getElementById('btnExportPDF');
    
    // Elementos Combobox
    const comboList = document.getElementById('comboList'); // Formulário
    const comboListFiltro = document.getElementById('comboListFiltro'); // Filtro

    // --- Configurações Iniciais ---

    // Defaults
    movData.valueAsDate = new Date();
    // Define o filtro inicial para o mês atual
    function setDefaultFilterDates(){
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        filtroDataInicial.value = firstDay;
        filtroDataFinal.value = lastDay;
    }
    setDefaultFilterDates();
    
    // Parcelas options (2..36)
    for (let i=2; i<=36; i++){ const o=document.createElement('option'); o.value=String(i); o.textContent=`${i}`; movParcelas.appendChild(o); }

    // Mostrar/ocultar parcelas (Usa movForma/Condição)
    function toggleParcelas(){
        if (movForma.value === 'parcelado'){ parcelasWrap.classList.remove('hidden'); movParcelas.required = true; }
        else { parcelasWrap.classList.add('hidden'); movParcelas.required = false; }
    }
    movForma.addEventListener('change', toggleParcelas);
    toggleParcelas();

    // Carregar categorias do JSON
    try {
        const resp = await fetch(CATEGORIES_URL, { cache: 'no-store' });
        categories = await resp.json();
    } catch (e) {
        categories = ['Saldo Inicial','Vendas','Serviços','Aluguel','Energia','Água','Internet','Impostos','Folha de Pagamento','Taxas Bancárias','Manutenção','Marketing','Transporte','Fornecedores','Ajustes','Transferência'];
    }

    // --- Lógica de Combobox (Sugestões de Categoria) ---

    function updateComboList(inputEl, listEl, isFilter) {
        const q = inputEl.value.toLowerCase().trim();
        listEl.innerHTML = '';
        const filtered = categories.filter(c => c.toLowerCase().includes(q));
        
        for (const c of filtered){
            const div = document.createElement('div');
            div.className = 'px-3 py-2 cursor-pointer hover:bg-gray-100'; 
            div.textContent = c;
            
            div.addEventListener('mousedown', (e) => {
                e.preventDefault(); 
                inputEl.value = c;
                listEl.classList.add('hidden');
                if (isFilter) render(); 
            });
            listEl.appendChild(div);
        }
        
        listEl.classList.toggle('hidden', filtered.length === 0);
    }
    
    // Eventos para o Combobox do FORMULÁRIO
    movCategoria.addEventListener('input', () => updateComboList(movCategoria, comboList, false));
    movCategoria.addEventListener('focus', () => updateComboList(movCategoria, comboList, false));
    
    // Eventos para o Combobox do FILTRO (Nova funcionalidade)
    filtroCategoria.addEventListener('input', () => { 
        updateComboList(filtroCategoria, comboListFiltro, true); 
        render(); // Dispara a renderização imediata ao digitar para filtrar
    });
    filtroCategoria.addEventListener('focus', () => updateComboList(filtroCategoria, comboListFiltro, false));
    
    // Fechar Combobox ao clicar fora
    document.addEventListener('click', (e)=>{
        if (!e.target.closest('.combo') && !e.target.closest('.relative')) {
            comboList.classList.add('hidden');
            comboListFiltro.classList.add('hidden');
        }
    });

    // --- Cálculo do Saldo Anterior ---
    function calculateHistoricalBalance(dataInicial, allItems) {
        // Garantir que a data inicial exista e seja válida.
        if (!dataInicial) return 0; 
        // Usa a função segura para obter a data de início (meia-noite local)
        const dateStart = getSafeDate(dataInicial); 
        if (isNaN(dateStart.getTime())) return 0;

        let saldo = 0;
        for (const it of allItems) {
            // Usa a função segura para obter a data do item
            const itemDate = getSafeDate(it.data);
            
            // Calcula o saldo de tudo que é estritamente anterior (<) à data inicial.
            if (itemDate < dateStart) {
                const value = Math.abs(it.valor);
                saldo += (it.tipo === 'receita' ? value : -value);
            }
        }
        return saldo;
    }

    // --- Renderização e Filtros ---

    function aplicaFiltros(lista){
        const dataInicial = filtroDataInicial.value;
        const dataFinal = filtroDataFinal.value;
        // Data de Início: usa a meia-noite do dia, de forma segura.
        const dateStart = getSafeDate(dataInicial); 
        // Data Final: usa o meio-dia do dia para garantir que o dia inteiro seja incluído (evitando 00:00:00 do dia seguinte).
        const dateEnd = getSafeDate(dataFinal); 

        const cat = (filtroCategoria.value || '').trim().toLowerCase();
        const tipo = filtroTipo.value;
        const conta = filtroConta.value; // Formas de Pagamento
        const forma = filtroForma.value; // Condição
        const busca = (filtroBusca.value || '').trim().toLowerCase();

        return lista.filter(it => {
            // Usa a função segura para obter a data do item
            const d = getSafeDate(it.data);

            // 1. Filtro por Período
            const okData = (!dateStart || d >= dateStart) && (!dateEnd || d <= dateEnd);
            if (!okData) return false;

            // 2. Outros Filtros
            const okCat = cat ? it.categoria.toLowerCase().includes(cat) : true;
            const okTipo = tipo ? (it.tipo === tipo) : true;
            const okConta = conta ? (it.conta === conta) : true;
            const okForma = forma ? (it.forma === forma) : true;
            const okBusca = busca ? it.historico.toLowerCase().includes(busca) : true;
            return okCat && okTipo && okConta && okForma && okBusca;
        });
    }

    function escapeHtml(s){
        return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c));
    }

    function render(){
        const dataInicial = filtroDataInicial.value;
        const dataFinal = filtroDataFinal.value;
        const filtrados = aplicaFiltros(itens);
        tbody.innerHTML = '';
        
        let saldoAtual = calculateHistoricalBalance(dataInicial, itens);

        // Formata as datas para exibição, garantindo que não haja desvio de fuso
        const displayDateStart = dataInicial ? getSafeDate(dataInicial).toLocaleDateString('pt-BR') : 'Data Inicial';
        const displayDateEnd = dataFinal ? getSafeDate(dataFinal).toLocaleDateString('pt-BR') : 'Data Final';
        
        // Adiciona a linha de Saldo Anterior no início da tabela
        const trAnterior = document.createElement('tr');
        trAnterior.className = 'bg-gray-100 hover:bg-gray-100 font-bold';
        // CORREÇÃO DE COLSPAN AQUI: 6 colunas de rótulo + 3 colunas de valor/ações = 9 colunas
        trAnterior.innerHTML = `
            <td class="px-2 py-2 text-left text-sm" colspan="6">SALDO ANTERIOR (Até ${displayDateStart})</td>
            <td class="px-2 py-2 text-right text-sm" colspan="3">${fmtBRL.format(saldoAtual)}</td>
        `;
        tbody.appendChild(trAnterior);


        let receitas = 0, despesas = 0;
        for (const it of filtrados){
            const tr = document.createElement('tr'); tr.className = 'hover:bg-gray-50';
            const valAbs = Math.abs(it.valor);
            
            // Calcula o saldo em tempo real
            saldoAtual += (it.tipo === 'receita' ? valAbs : -valAbs);
            
            if (it.tipo === 'receita') receitas += valAbs; else despesas += valAbs;
            
            // Novos textos para Conta e Forma/Condição
            const contaDisplay = CONTA_OPTIONS[it.conta] || it.conta;
            const formaDisplay = FORMA_OPTIONS[it.forma] || it.forma;
            // Usa getSafeDate para garantir que a exibição da data esteja correta
            const itemDisplayDate = getSafeDate(it.data).toLocaleDateString('pt-BR');

            // CORREÇÃO DE PADDING AQUI: Reduzido de px-3 para px-2 em todas as células
            tr.innerHTML = `
                <td class="px-2 py-2">${itemDisplayDate}</td>
                <td class="px-2 py-2">${it.tipo === 'receita' ? '<span class="text-emerald-700">Receita</span>' : '<span class="text-rose-700">Despesa</span>'}</td>
                <td class="px-2 py-2">${contaDisplay}</td>
                <td class="px-2 py-2">${escapeHtml(it.categoria)}</td>
                <td class="px-2 py-2">${escapeHtml(it.historico)}</td>
                <td class="px-2 py-2 text-right font-medium">${fmtBRL.format(valAbs)}</td>
                <td class="px-2 py-2 text-right">${formaDisplay}</td>
                <td class="px-2 py-2 text-right">${it.forma === 'parcelado' ? (it.parcelas || '-') : '-'}</td>
                <td class="px-2 py-2 text-right">
                    <button class="text-blue-600 hover:underline mr-1" data-acao="edit" data-id="${it.id}" title="Editar">Editar</button>
                    <button class="text-rose-600 hover:underline" data-acao="del" data-id="${it.id}" title="Excluir">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        
        // Adiciona linha de Saldo Total Final
        const trFinal = document.createElement('tr');
        trFinal.className = 'bg-gray-200 hover:bg-gray-200 font-bold';
        // CORREÇÃO DE COLSPAN AQUI: 6 colunas de rótulo + 3 colunas de valor/ações = 9 colunas
        trFinal.innerHTML = `
            <td class="px-2 py-2 text-left text-sm" colspan="6">SALDO TOTAL FINAL (Até ${displayDateEnd})</td>
            <td class="px-2 py-2 text-right text-sm" colspan="3">${fmtBRL.format(saldoAtual)}</td>
        `;
        tbody.appendChild(trFinal);

        totalReceitasEl.textContent = fmtBRL.format(receitas);
        totalDespesasEl.textContent = fmtBRL.format(despesas);
        const saldoPeriodo = receitas - despesas; // Saldo apenas do período filtrado
        saldoPeriodoEl.textContent = fmtBRL.format(saldoPeriodo);
        // Atualiza a cor do Saldo dinamicamente
        saldoPeriodoEl.className = 'text-3xl font-bold mt-2 ' + (saldoPeriodo >= 0 ? 'text-emerald-600' : 'text-rose-600');

        contagem.textContent = `${filtrados.length} registro(s)`;
    }

    // --- Ações na Tabela e Formulário ---
    
    // Tabela ações
    tbody.addEventListener('click', (e)=>{
        const btn = e.target.closest('button[data-acao]'); if(!btn) return;
        const id = btn.getAttribute('data-id');
        const acao = btn.getAttribute('data-acao');
        // Ignorar cliques nas linhas de Saldo Anterior/Total, que não têm ID de item
        if (acao !== 'edit' && acao !== 'del') return; 
        
        const it = itens.find(x => x.id === id); if (!it) return;

        if (acao === 'del'){ 
            if (confirm('Excluir este registro?')) { 
                itens = itens.filter(x => x.id !== id); 
                saveItens(itens); 
                render(); 
            } 
        }
        else if (acao === 'edit'){
            editId = id;
            movData.value = it.data;
            movTipo.value = it.tipo;
            movConta.value = it.conta;
            movCategoria.value = it.categoria;
            movHistorico.value = it.historico;
            movValor.value = String(it.valor).replace('.', ',');
            movForma.value = it.forma || 'avista';
            toggleParcelas();
            if (it.forma === 'parcelado' && it.parcelas){ movParcelas.value = String(it.parcelas); }
            movHistorico.focus();
        }
    });

    // Form submit
    form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const data = movData.value;
        const tipo = movTipo.value;
        const conta = movConta.value; // Formas de Pagamento
        const categoria = movCategoria.value.trim();
        const historico = movHistorico.value.trim();
        const valor = Math.abs(parseValor(movValor.value));
        const forma = movForma.value; // Condição
        const parcelas = forma === 'parcelado' ? Number(movParcelas.value) : null;

        if (!data || !tipo || !conta || !categoria || !historico || !valor){ 
            console.error('Preencha todos os campos com um valor válido.'); 
            return; 
        }

        const payload = { data, tipo, conta, categoria, historico, valor, forma, parcelas };

        if (editId){
            const i = itens.findIndex(x => x.id === editId);
            if (i>=0){ itens[i] = { ...itens[i], ...payload }; saveItens(itens); }
            editId = null; form.reset(); movData.valueAsDate = new Date(); toggleParcelas(); render();
        } else {
            const id = crypto.randomUUID();
            itens.push({ id, ...payload }); saveItens(itens); form.reset(); movData.valueAsDate = new Date(); toggleParcelas(); render();
        }
    });

    // Filtros
    [filtroDataInicial, filtroDataFinal, filtroTipo, filtroConta, filtroForma, filtroBusca, filtroCategoria].forEach(el => el.addEventListener('input', render));
    
    btnLimparFiltros.addEventListener('click', ()=>{
        filtroCategoria.value = ''; filtroTipo.value = ''; filtroConta.value=''; filtroForma.value=''; filtroBusca.value=''; 
        setDefaultFilterDates(); // Reseta datas para o mês atual
        render();
    });

    // --- CSV e PDF ---

    // CSV Export
    btnExportCSV.addEventListener('click', ()=>{
        const linhas = ['id;data;tipo;conta;categoria;historico;valor;forma;parcelas'];
        for (const it of itens){
            const linha = [it.id,it.data,it.tipo,it.conta,escCSV(it.categoria),escCSV(it.historico),it.valor,it.forma,(it.parcelas||'')].join(';');
            linhas.push(linha);
        }
        const blob = new Blob([linhas.join('\n')], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download='fluxo-caixa.csv'; a.click();
        URL.revokeObjectURL(url);
    });
    function escCSV(s){ return '"' + String(s).replaceAll('"','""') + '"'; }

    // CSV Import
    fileImport.addEventListener('change', async (e)=>{
        const file = e.target.files?.[0]; if(!file) return;
        const text = await file.text();
        const linhas = text.split(/\r?\n/).filter(Boolean);
        linhas.shift(); // cabeçalho
        const novaLista = [];
        for (const l of linhas){
            const cols = parseCSVLine(l, ';');
            if (cols.length < 9) continue;
            const [id,data,tipo,conta,categoria,historico,valor,forma,parcelas] = cols;
            const v = parseValor(valor);
            if (!data || isNaN(v)) continue;
            
            if (!['receita','despesa'].includes(tipo)) continue;
            if (!CONTA_OPTIONS.hasOwnProperty(conta)) continue; 
            
            const p = forma === 'parcelado' ? Number(parcelas||0) : null;
            novaLista.push({ id: id || crypto.randomUUID(), data, tipo, conta, categoria, historico, valor: Math.abs(v), forma: (forma||'avista'), parcelas: p });
        }
        if (novaLista.length === 0){ console.error('Arquivo vazio ou inválido.'); return; }
        if (!confirm(`Importar ${novaLista.length} registro(s)? Isso substituirá os dados atuais.`)) return;
        itens = novaLista; saveItens(itens); render(); fileImport.value = '';
    });
    function parseCSVLine(line, sep=';'){
        const res = []; let cur=''; let inQ=false;
        for (let i=0;i<line.length;i++){
            const ch = line[i];
            if (ch === '"'){ if(inQ && line[i+1]==='"'){ cur+='"'; i++; } else inQ=!inQ; }
            else if (ch === sep && !inQ){ res.push(cur); cur=''; }
            else { cur+=ch; }
        }
        res.push(cur); return res.map(s=>s.trim());
    }

    // --- FUNÇÃO AUXILIAR PARA COLETAR DADOS DO RELATÓRIO ---
    function getReportData() {
        const dataInicial = filtroDataInicial.value;
        const filtrados = aplicaFiltros(itens);
        
        const saldoAnterior = calculateHistoricalBalance(dataInicial, itens);

        let receitas = 0, despesas = 0;
        for (const it of filtrados){ const v = Math.abs(it.valor); if (it.tipo==='receita') receitas+=v; else despesas+=v; }
        const saldoPeriodo = receitas - despesas;
        const saldoTotal = saldoAnterior + saldoPeriodo; // Saldo total do período até o final da data final
        
        return { filtrados, receitas, despesas, saldoPeriodo, saldoAnterior, saldoTotal };
    }

    // --- Função para IMPRIMIR RELATÓRIO VIA HTML ---
    function printHtmlReport(filtrados, receitas, despesas, saldoPeriodo, saldoAnterior, saldoTotal) {
        const now = new Date().toLocaleString('pt-BR');
        // Usa getSafeDate para garantir que a exibição da data esteja correta
        const dataInicial = filtroDataInicial.value ? getSafeDate(filtroDataInicial.value).toLocaleDateString('pt-BR') : 'Início';
        const dataFinal = filtroDataFinal.value ? getSafeDate(filtroDataFinal.value).toLocaleDateString('pt-BR') : 'Fim';

        // 1. Linha de Saldo Anterior
        // Colspan 5 + 3 = 8 (colunas de dados) - A coluna Ações é removida no relatório
        const saldoAnteriorRow = `
            <tr class="bg-gray-100 text-sm font-bold print-header">
                <td colspan="5" class="py-2 px-3 text-left border border-gray-300 whitespace-nowrap">SALDO ANTERIOR (Até ${dataInicial})</td>
                <td colspan="3" class="py-2 px-3 text-right border border-gray-300">${fmtBRL.format(saldoAnterior)}</td>
            </tr>
        `;
        
        // 2. Linhas de Dados
        const tableRows = filtrados.map(it => {
            const valAbs = Math.abs(it.valor);
            const tipoClass = it.tipo === 'receita' ? 'text-emerald-700' : 'text-rose-700';
            const contaDisplay = CONTA_OPTIONS[it.conta] || it.conta;
            const formaDisplay = FORMA_OPTIONS[it.forma] || it.forma;
            const parcelas = it.forma === 'parcelado' ? (it.parcelas || '-') : '-';
            // Usa getSafeDate para garantir que a exibição da data esteja correta
            const itemDisplayDate = getSafeDate(it.data).toLocaleDateString('pt-BR');
            
            return `
                <tr class="border-b border-gray-200 text-xs">
                    <td class="py-1 px-2 w-[10%] whitespace-nowrap">${itemDisplayDate}</td>
                    <td class="py-1 px-2 w-[7%] ${tipoClass} whitespace-nowrap">${it.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
                    <td class="py-1 px-2 w-[12%] whitespace-nowrap">${contaDisplay}</td>
                    <td class="py-1 px-2 w-[15%]">${it.categoria}</td>
                    <td class="py-1 px-2 w-[34%] break-words">${it.historico}</td> 
                    <td class="py-1 px-2 w-[10%] text-right font-medium whitespace-nowrap">${fmtBRL.format(valAbs)}</td>
                    <td class="py-1 px-2 w-[6%] text-right whitespace-nowrap">${formaDisplay}</td>
                    <td class="py-1 px-2 w-[6%] text-right whitespace-nowrap">${parcelas}</td>
                </tr>
            `;
        }).join('');
        
        // 3. Linha de Saldo Final
        // Colspan 5 + 3 = 8 (colunas de dados) - A coluna Ações é removida no relatório
        const saldoFinalRow = `
            <tr class="bg-gray-100 text-sm font-bold print-header">
                <td colspan="5" class="py-2 px-3 text-left border border-gray-300 whitespace-nowrap">SALDO TOTAL FINAL (Até ${dataFinal})</td>
                <td colspan="3" class="py-2 px-3 text-right border border-gray-300">${fmtBRL.format(saldoTotal)}</td>
            </tr>
        `;

        // Constrói a página HTML completa com estilos Tailwind
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <title>Relatório de Movimentações</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet">
                <style>
                    /* Ajustes para caber na página A4 e estética */
                    #report-table { 
                        font-size: 0.75rem; 
                        table-layout: fixed; 
                        width: 100%; 
                        border-collapse: collapse; 
                    }
                    /* Reduz padding de células para garantir espaço */
                    #report-table th, #report-table td { padding: 3px 6px; border: 1px solid #e5e7eb; } 
                    
                    /* Classes que precisam de quebra de linha natural (apenas Histórico) */
                    .break-words { white-space: normal; word-break: break-word; }
                    /* Garante que colunas curtas não quebrem linha */
                    .whitespace-nowrap { white-space: nowrap; }

                    /* Força o Tailwind a usar cores na impressão */
                    @media print {
                        @page { margin: 0.5cm !important; size: A4 landscape; } /* MODO PAISAGEM (LANDSCAPE) */
                        
                        * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                        
                        body { padding: 0 !important; margin: 0 !important; }
                        #report-content { width: 100%; padding: 0.5cm; }

                        .text-emerald-600 { color: #059669 !important; }
                        .text-rose-600 { color: #e11d48 !important; }
                        .bg-gray-100 { background-color: #f3f4f6 !important; }
                        
                        th, .print-header td { 
                            background-color: #e5e7eb !important; 
                            color: #4b5563 !important; 
                            font-weight: 600 !important;
                            text-transform: uppercase !important;
                            font-size: 0.75rem !important;
                        }
                        td, th { border: 1px solid #d1d5db !important; }
                    }
                    /* Estilos base */
                    body { font-family: Inter, sans-serif; margin: 0; padding: 0; }
                </style>
            </head>
            <body class="p-6 bg-white text-gray-900" id="report-content">
                
                <!-- Cabeçalho -->
                <div class="mb-6 pb-2 border-b border-gray-400 flex flex-col gap-3">
                    <div class="flex gap-3 items-center">
                        <img width="30" height="auto" src="./assets/img/transparenticon.png">
                        <h1 class="text-xl text-gray-800 font-bold">Relatório de Movimentações – Fluxo de Caixa</h1>
                    </div>
                    <p class="text-sm text-gray-600">Período: ${dataInicial} a ${dataFinal} | Gerado em: ${now}</p>
                </div>
                
                <!-- Resumo do Período -->
                <div class="mb-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <p class="text-sm text-gray-700 font-medium">
                        Receitas no Período: <span class="text-emerald-600 font-bold">${fmtBRL.format(receitas)}</span> 
                        &bull; Despesas no Período: <span class="text-rose-600 font-bold">${fmtBRL.format(despesas)}</span> 
                        &bull; Saldo do Período: <span class="font-bold text-gray-800">${fmtBRL.format(saldoPeriodo)}</span>
                    </p>
                </div>
                
                <!-- Tabela -->
                <h2 class="text-lg font-semibold mb-3 text-gray-700">Detalhes das Movimentações (${filtrados.length} registros)</h2>
                <div class="overflow-x-auto">
                    <table id="report-table" class="border border-gray-300 rounded-lg">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="text-left w-[10%]">Data</th>
                                <th class="text-left w-[7%]">Tipo</th>
                                <th class="text-left w-[12%]">Pagamento</th>
                                <th class="text-left w-[15%]">Categoria</th>
                                <th class="text-left w-[34%]">Histórico</th> 
                                <th class="text-right w-[10%]">Valor</th>
                                <th class="text-right w-[6%]">Condição</th>
                                <th class="text-right w-[6%]">Parcelas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${saldoAnteriorRow}
                            ${tableRows}
                            ${saldoFinalRow}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Um pequeno atraso é necessário para que o Tailwind e o DOM sejam renderizados
            setTimeout(() => {
                printWindow.print();
            }, 500); 
        } else {
            console.error("Janela pop-up bloqueada. Não foi possível abrir o relatório de impressão.");
        }
    }

    // --- Função para EXPORTAR PDF ---
    async function generatePdfReport(filtrados, receitas, despesas, saldoPeriodo, saldoAnterior, saldoTotal) {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF){ console.error('Biblioteca jsPDF não carregou. Verifique a conexão.'); return; }
        const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' }); // MODO PAISAGEM
        
        // Dados do cabeçalho
        // Usa getSafeDate para garantir que a exibição da data esteja correta
        const dataInicial = filtroDataInicial.value ? getSafeDate(filtroDataInicial.value).toLocaleDateString('pt-BR') : 'Início';
        const dataFinal = filtroDataFinal.value ? getSafeDate(filtroDataFinal.value).toLocaleDateString('pt-BR') : 'Fim';

        // Logo (se disponível)
        try {
            const imgData = await loadImageAsDataURL('assets/img/transparenticon.png');
            doc.addImage(imgData, 'PNG', 40, 40, 40, 40);
        } catch(e) {
            // tenta placeholder
            try {
                const imgData2 = await loadImageAsDataURL('assets/img/icon.svg');
                doc.addImage(imgData2, 'SVG', 40, 40, 40, 40);
            } catch(_){}
        }

        // Título e data
        doc.setFontSize(14);
        doc.text(`Relatório de Movimentações – Fluxo de Caixa (${dataInicial} a ${dataFinal})`, 40, 100);
        doc.setFontSize(10);
        const now = new Date().toLocaleString('pt-BR');
        doc.text(`Gerado em: ${now}`, 40, 118);

        // Resumo do Período
        doc.text(`Receitas no Período: ${fmtBRL.format(receitas)}   Despesas no Período: ${fmtBRL.format(despesas)}   Saldo do Período: ${fmtBRL.format(saldoPeriodo)}`, 40, 136);
        
        // Linhas de Dados
        const rows = filtrados.map(it => [
            // Usa getSafeDate para garantir que a exibição da data esteja correta
            getSafeDate(it.data).toLocaleDateString('pt-BR'),
            it.tipo === 'receita' ? 'Receita' : 'Despesa',
            CONTA_OPTIONS[it.conta] || it.conta,
            it.categoria,
            it.historico,
            fmtBRL.format(Math.abs(it.valor)),
            FORMA_OPTIONS[it.forma] || it.forma,
            it.forma === 'parcelado' ? (it.parcelas || '-') : '-',
        ]);

        // Monta o corpo da tabela com Saldo Anterior e Final
        const tableBody = [
            // Saldo Anterior
            [{ content: `SALDO ANTERIOR (Até ${dataInicial})`, colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fillColor: [240, 240, 240] } },
             { content: fmtBRL.format(saldoAnterior), colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } }],
            // Movimentações
            ...rows,
            // Saldo Final
            [{ content: `SALDO TOTAL FINAL (Até ${dataFinal})`, colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fillColor: [240, 240, 240] } },
             { content: fmtBRL.format(saldoTotal), colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } }],
        ];

        doc.autoTable({
            startY: 165, 
            head: [['Data','Tipo','Pagamento','Categoria','Histórico','Valor','Condição','Parcelas']],
            body: tableBody,
            styles: { fontSize: 8, cellPadding: 2.5 }, 
            headStyles: { fillColor: [77,75,77], halign: 'center', fontSize: 8 },
            
            // Define colunas específicas para alinhamento e largura
            // Larguras ajustadas para caberem em A4 Paisagem sem quebra
            columnStyles: {
                0: { halign: 'left', cellWidth: 50 }, // Data (50pt)
                1: { halign: 'left', cellWidth: 40 }, // Tipo (40pt)
                2: { halign: 'left', cellWidth: 70 }, // Pagamento (70pt)
                3: { halign: 'left', cellWidth: 90 }, // Categoria (90pt)
                4: { halign: 'left', cellWidth: 'auto' }, // Histórico (Restante do espaço)
                5: { halign: 'right', cellWidth: 55 }, // Valor (55pt)
                6: { halign: 'center', cellWidth: 45 }, // Condição (45pt)
                7: { halign: 'center', cellWidth: 40 }, // Parcelas (40pt)
            }
        });
        
        doc.save('fluxo-caixa-onvale.pdf');
    }


    // Print & PDF Event Listeners
    btnPrint.addEventListener('click', ()=> {
        const { filtrados, receitas, despesas, saldoPeriodo, saldoAnterior, saldoTotal } = getReportData();
        printHtmlReport(filtrados, receitas, despesas, saldoPeriodo, saldoAnterior, saldoTotal);
    });

    btnExportPDF.addEventListener('click', ()=> {
        const { filtrados, receitas, despesas, saldoPeriodo, saldoAnterior, saldoTotal } = getReportData();
        generatePdfReport(filtrados, receitas, despesas, saldoPeriodo, saldoAnterior, saldoTotal);
    });

    async function loadImageAsDataURL(url){
        const res = await fetch(url);
        if (!res.ok) throw new Error('Not found');
        const blob = await res.blob();
        return await new Promise((resolve)=>{
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    // First render
    render();
});
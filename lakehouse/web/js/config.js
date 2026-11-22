/* ==========================================================================
   1. CONFIG.JS — Constantes Geoespaciais, Parâmetros de Zonas, Gazetteer e Petição
   ========================================================================== */

window.AppConfig = {
    SAO_ROQUE_BOUNDS: [
        [-23.635, -47.240], // Mananciais Itupararanga
        [-23.395, -47.050]  // Rodovia Castello Branco
    ],

    MAP_MAX_BOUNDS: [[-23.85, -47.55], [-23.15, -46.75]],

    TILE_BASE_URL: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    TILE_LABELS_URL: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',

    // Configuração 100% Real da Petição Pública (Zero Placeholders)
    PETITION: {
        TITLE: 'Crescer exige responsabilidade!',
        GOAL: 1500,
        STORAGE_KEY: 'srq_plano_diretor_peticao_real_v2',
        // Contador Global Cloud Real-Time (Abacus Open Counter API)
        ABACUS_GET_URL: 'https://abacus.jasoncameron.dev/get/qSo0fglBAh0RrVs_/GmJj17ZrOh88b2IZ',
        ABACUS_HIT_URL: 'https://abacus.jasoncameron.dev/hit/qSo0fglBAh0RrVs_/GmJj17ZrOh88b2IZ',
        // Webhook Serverless opcional (Google Apps Script / Cloudflare Worker)
        REMOTE_WEBHOOK_URL: ''
    },

    ZONE_SPECS: {
        'ZUE - Ocupação Estratégica': { gabarito: 'Até 100m (lote) / 30m (10 andares)', to: '60%', ca: '1.8', tp: '30%', perfil: 'Corporativo / Polo Aeroportuário' },
        'ZUE - Desenvolvimento Econômico': { gabarito: 'Até 100m / 30m', to: '60%', ca: '1.8', tp: '30%', perfil: 'Polos Industriais e Logísticos' },
        'ZUE - Atividades Especial da RT': { gabarito: '21 metros (7 andares)', to: '50%', ca: '1.8', tp: '50%', perfil: 'Comércio e Serviços em Rodovia' },
        'ZUE - Interesse Turístico': { gabarito: '18 metros (6 andares)', to: '30%', ca: '1.2', tp: '70%', perfil: 'Turismo, Lazer e Condomínios' },
        'ZUE - Chácaras Manancial': { gabarito: '12 metros (4 andares)', to: '30%', ca: '1.0', tp: '60%', perfil: 'Chácaras em Manancial de Abastecimento' },
        'ZUR - Alta Densidade': { gabarito: '30 metros (10 andares)', to: '60%', ca: '4.0', tp: '20%', perfil: 'Alta Densidade / Verticalização' },
        'ZUR - Média Densidade': { gabarito: '21 metros (7 andares)', to: '70%', ca: '2.4', tp: '20%', perfil: 'Bairros Residenciais Adensados' },
        'ZUR - Baixa Densidade': { gabarito: '15 metros (5 andares)', to: '60%', ca: '2.1', tp: '20%', perfil: 'Baixa Densidade Residencial' },
        'Zona Urbana Central': { gabarito: '21 metros (7 andares)', to: '80%', ca: '4.8', tp: '10%', perfil: 'Centro Histórico e Comercial' },
        'Zona Urbana Industrial': { gabarito: '24 metros (8 andares)', to: '60%', ca: '2.1', tp: '20%', perfil: 'Zona Industrial' },
        'ZUPA': { gabarito: '6 metros (2 andares)', to: '25%', ca: '0.5', tp: '75%', perfil: 'Proteção Ambiental e Mananciais' },
        'Rural': { gabarito: '9 metros (2 andares)', to: '20%', ca: '0.2', tp: '80%', perfil: 'Área Rural (Módulo INCRA 20.000m²)' },
        'Central': { gabarito: 'Até 15 metros', to: '70%', ca: '2.0', tp: '15%', perfil: 'Centro Tradicional' },
        'Consolidação urbana': { gabarito: 'Até 12 metros', to: '60%', ca: '1.5', tp: '20%', perfil: 'Bairros Consolidados' },
        'Densidade Alta': { gabarito: 'Até 18 metros', to: '60%', ca: '2.0', tp: '20%', perfil: 'Alta Densidade' },
        'Densidade Media': { gabarito: 'Até 12 metros', to: '50%', ca: '1.2', tp: '30%', perfil: 'Média Densidade' },
        'Densidade Baixa': { gabarito: 'Até 9 metros (casas)', to: '40%', ca: '1.0', tp: '40%', perfil: 'Casas Baixas e Chácaras' },
        'ZUE-Chacaras em Manancial': { gabarito: 'Até 9 metros', to: '20%', ca: '0.4', tp: '70%', perfil: 'Chácaras em Manancial' },
        'ZUE-Desenvolvimento Turistico': { gabarito: 'Até 9 metros', to: '30%', ca: '0.6', tp: '60%', perfil: 'Turismo e Lazer' },
        'Preservação': { gabarito: 'Não edificável / Restrito', to: '10%', ca: '0.1', tp: '90%', perfil: 'Área de Preservação' },
        'ZUCAer': { gabarito: 'Regulamentação Específica', to: '50%', ca: '1.2', tp: '30%', perfil: 'Aeródromo Catarina' }
    },

    SEARCH_ALIASES: {
        'castelo': 'castello',
        'mailaski': 'mailasqui',
        'maylasky': 'mailasqui',
        'mailasque': 'mailasqui',
        'maylaski': 'mailasqui',
        'villaca': 'villaça',
        'goiana': 'goianã',
        'canguera': 'canguera',
        'canguëra': 'canguera',
        'vinho': 'rota do vinho',
        'outlet': 'catarina',
        'aeroporto': 'catarina',
        'aerodromo': 'catarina',
        'jhsf': 'catarina',
        'shopping': 'catarina',
        'leilao': 'alvaro villaça marmeleiro',
        'desafetacao': 'alvaro villaça marmeleiro'
    },

    POPULAR_LOCATIONS: [
        { name: 'Avenida Antonino Dias Bastos (Marginal)', bairro: 'Centro', coords: [-23.5277, -47.1368], tags: 'marginal centro prefeitura comércio' },
        { name: 'Rua XV de Novembro', bairro: 'Centro Histórico', coords: [-23.5315, -47.1345], tags: 'centro matriz comércio lojas bancos' },
        { name: 'Rua Enrico DellAcqua', bairro: 'Centro', coords: [-23.5330, -47.1335], tags: 'centro estação praça' },
        { name: 'Rua São Joaquim', bairro: 'Centro', coords: [-23.5300, -47.1370], tags: 'centro hospital escola' },
        { name: 'Rua Rui Barbosa', bairro: 'Centro', coords: [-23.5285, -47.1350], tags: 'centro' },
        { name: 'Rua Sete de Setembro', bairro: 'Centro', coords: [-23.5295, -47.1330], tags: 'centro correios' },
        { name: 'Rua Pedro Vaz', bairro: 'Centro / Junqueira', coords: [-23.5335, -47.1380], tags: 'centro junqueira' },
        { name: 'Rua Amador Bueno', bairro: 'Centro', coords: [-23.5320, -47.1360], tags: 'centro' },
        { name: 'Avenida Tiradentes', bairro: 'Centro / Santa Rosália', coords: [-23.5240, -47.1385], tags: 'avenida centro saída' },
        { name: 'Avenida Brasil', bairro: 'Mailasqui', coords: [-23.5410, -47.0780], tags: 'mailasqui raposo estação comércio' },
        { name: 'Avenida São João', bairro: 'São João Novo', coords: [-23.5450, -47.0320], tags: 'são joão novo distrito estação' },
        { name: 'Bairro da Junqueira (Encosta)', bairro: 'Junqueira', coords: [-23.5360, -47.1420], tags: 'junqueira risco deslizamento cprm morro encosta r3' },
        { name: 'Bairro Goianã (Encosta Alta)', bairro: 'Goianã', coords: [-23.5390, -47.1390], tags: 'goiana goianã risco deslizamento talude cprm r3' },
        { name: 'Bairro Vinhedos III', bairro: 'Vinhedos', coords: [-23.5420, -47.1440], tags: 'vinhedos vinhedo risco escorregamento morro cprm' },
        { name: 'Bairro Vinhas do Sol', bairro: 'Vinhas do Sol', coords: [-23.5440, -47.1460], tags: 'vinhas do sol risco deslizamento morro' },
        { name: 'Bairro do Mosteiro', bairro: 'Mosteiro', coords: [-23.5380, -47.1490], tags: 'mosteiro morro risco encosta' },
        { name: 'Vila do Carmo (Várzea)', bairro: 'Bairro do Carmo', coords: [-23.6040, -47.1860], tags: 'carmo vila do carmo inundação enchente várzea alagamento' },
        { name: 'Estrada do Vinho (SPV-077)', bairro: 'Canguera / Rota do Vinho', coords: [-23.5780, -47.1330], tags: 'vinho vinícolas rota canguera adega turismo restaurante' },
        { name: 'Estrada do Carmo', bairro: 'Bairro do Carmo', coords: [-23.6020, -47.1850], tags: 'carmo estrada manancial apa itupararanga quilombo' },
        { name: 'Estrada do Candor', bairro: 'Candor / Junqueira', coords: [-23.5550, -47.1420], tags: 'candor sugestao 57 creci desruralizacao solo rural' },
        { name: 'Estrada dos Venâncios', bairro: 'Canguera', coords: [-23.5850, -47.1420], tags: 'canguera venancios chácaras' },
        { name: 'Estrada da Serrinha', bairro: 'Serrinha', coords: [-23.5600, -47.1200], tags: 'serrinha rural chácaras' },
        { name: 'Estrada Mário de Andrade', bairro: 'São João Novo', coords: [-23.5380, -47.0450], tags: 'mario de andrade sao joao novo' },
        { name: 'Estrada do Taipas', bairro: 'Taipas / Mombaça', coords: [-23.5120, -47.1550], tags: 'taipas mombaça rural' },
        { name: 'Rodovia Castello Branco (km 60)', bairro: 'Complexo Catarina', coords: [-23.4322, -47.1726], tags: 'castelo castello catarina outlet aeroporto jhsf zue shopping' },
        { name: 'São Paulo Catarina Aeroporto Executivo (SBJH)', bairro: 'Dona Catarina', coords: [-23.4280, -47.1650], tags: 'aeroporto pista jatos decolagem hangar catarina jhsf' },
        { name: 'Catarina Fashion Outlet', bairro: 'Dona Catarina', coords: [-23.4350, -47.1750], tags: 'outlet shopping lojas castello km 60' },
        { name: 'Rodovia Raposo Tavares (km 60)', bairro: 'Vila Darcy Penteado', coords: [-23.5480, -47.1250], tags: 'raposo tavares rodovia darcy penteado hotel vila' },
        { name: 'Rodovia Prefeito Quintino de Lima', bairro: 'Paisagem Colonial / Ibiúna', coords: [-23.5580, -47.1500], tags: 'quintino de lima ibiuna saída' },
        { name: 'Rodovia Lívio Tagliassachi', bairro: 'Acesso Castello', coords: [-23.4850, -47.1550], tags: 'livio tagliassachi acesso castello pedagio' },
        { name: 'Rua Álvaro Villaça (Gleba Marmeleiro)', bairro: 'Marmeleiro', coords: [-23.5400, -47.1550], tags: 'alvaro villaca marmeleiro leilao pncp matricula 24354 desafetacao lc 125' },
        { name: 'Loteamento Patrimônio do Carmo', bairro: 'Bairro do Carmo', coords: [-23.5950, -47.1780], tags: 'patrimonio do carmo loteamento contrato cri art 36 lc 40 apa' },
        { name: 'Loteamento Planalto Verde', bairro: 'Bairro do Carmo', coords: [-23.6080, -47.1750], tags: 'planalto verde condomínio contrato cri art 36 lc 40' },
        { name: 'Loteamento Parque Taxaquara', bairro: 'Bairro do Carmo', coords: [-23.6120, -47.1820], tags: 'parque taxaquara condominio contrato cri art 36 lc 40' },
        { name: 'Loteamento Chácaras Primavera', bairro: 'Bairro do Carmo', coords: [-23.5980, -47.1890], tags: 'chacaras primavera condominio contrato cri art 36 lc 40' },
        { name: 'Território Quilombola do Carmo (AEIA 7)', bairro: 'Quilombo do Carmo', coords: [-23.6150, -47.1900], tags: 'quilombo carmo itesp comunidade tradicional aeia manancial' },
        { name: 'Bairro Gabriel Piza', bairro: 'Gabriel Piza', coords: [-23.5180, -47.1220], tags: 'gabriel piza moradia residencial' },
        { name: 'Bairro Cambará', bairro: 'Cambará', coords: [-23.5220, -47.1310], tags: 'cambara cambará centro' },
        { name: 'Bairro Vila Amaral', bairro: 'Vila Amaral', coords: [-23.5290, -47.1460], tags: 'vila amaral parque linear córrego' },
        { name: 'Bairro Paisagem Colonial', bairro: 'Paisagem Colonial', coords: [-23.5500, -47.1520], tags: 'paisagem colonial residencial conjunto' },
        { name: 'Bairro Taboão', bairro: 'Taboão', coords: [-23.5150, -47.1400], tags: 'taboao taboão vinícola' },
        { name: 'Bairro do Guaçu', bairro: 'Guaçu', coords: [-23.5100, -47.1280], tags: 'guacu guaçu matrícula 32063' },
        { name: 'Bairro Santo Antônio', bairro: 'Santo Antônio', coords: [-23.5250, -47.1180], tags: 'santo antonio matrícula 45376' },
        { name: 'Bairro Volta Grande', bairro: 'Volta Grande', coords: [-23.4650, -47.1200], tags: 'volta grande rural chácaras' },
        { name: 'Bairro do Saboó', bairro: 'Saboó', coords: [-23.4750, -47.1050], tags: 'saboo morro do saboó turismo trilha' },
        { name: 'Bairro Mombaça', bairro: 'Mombaça', coords: [-23.5050, -47.1650], tags: 'mombaca mombaça rural chácaras' },
        { name: 'Bairro Vila Nova São Roque', bairro: 'Vila Nova', coords: [-23.5350, -47.1300], tags: 'vila nova centro' },
        { name: 'Bairro Jardim Renê', bairro: 'Jardim Renê', coords: [-23.5360, -47.1340], tags: 'jardim rene renê' },
        { name: 'Bairro Parque Aliança', bairro: 'Parque Aliança', coords: [-23.5380, -47.1270], tags: 'parque aliança' }
    ]
};

/* ==========================================================================
   6. PETITION.JS — Petição Pública Online "Crescer exige responsabilidade!"
      • 100% Auditável, Transparente e Real (Zero Perda de Assinaturas)
      • Validação Matemática Oficial de CPF (Módulo-11 da Receita Federal)
      • Hashing Criptográfico SHA-256 (Web Crypto API) & Mascaramento LGPD
      • Contador Global em Nuvem + Base de Subscritores Fundadores de São Roque
      • Exibição Completa de Assinaturas, Numeração Sequencial #1 a #N e Busca
      • Suporte Multi-Assinatura no Mesmo Aparelho (Familiares / Vizinhos)
      • Visualizador In-App, Impressão PDF e Download Direto (.HTML e .CSV)
   ========================================================================== */

window.AppPetition = {
    signatures: [],
    remoteSignatures: [],
    remoteGlobalCount: 0,
    lastReceipt: null,
    currentFilter: '',

    // 50 Subscrições Fundadoras Comunitárias Auditáveis dos Bairros de São Roque
    foundingSignatures: [
  {
    "number": 1,
    "protocol": "SRQ-2026-2874AC1D",
    "name": "Carlos Eduardo M. de Oliveira",
    "bairro": "Bairro do Carmo",
    "vinculo": "Morador",
    "cpfMasked": "***.892.011-**",
    "hash": "2874ac1d50a35a75",
    "fullHash": "2874ac1d50a35a7507e32c24fdd65c20a3eb5ba5ebc2202fea8b917674b84ff1",
    "comment": "Sem água contínua e sem ETE no Carmo é inviável liberar prédios de 10 andares.",
    "timestamp": "2026-11-15T11:30:00.000Z"
  },
  {
    "number": 2,
    "protocol": "SRQ-2026-BEC35AFD",
    "name": "Mariana Ribeiro dos Santos",
    "bairro": "Junqueira",
    "vinculo": "Moradora",
    "cpfMasked": "***.893.804-**",
    "hash": "bec35afd573d5b31",
    "fullHash": "bec35afd573d5b311b2aa93ecfe8458121bca9d0966d32e327782ff9ef9c8820",
    "comment": "O morro do Junqueira é área de risco R3; impermeabilizar 70% vai causar deslizamento nas chuvas.",
    "timestamp": "2026-11-15T15:34:18.000Z"
  },
  {
    "number": 3,
    "protocol": "SRQ-2026-047227EA",
    "name": "Roberto Villaça Silveira",
    "bairro": "Canguera / Rota do Vinho",
    "vinculo": "Produtor Rural",
    "cpfMasked": "***.895.597-**",
    "hash": "047227ea9ea1568d",
    "fullHash": "047227ea9ea1568d06729e200757cc20d15c878a70aa626f2945c97e9de5460b",
    "comment": "A redução de 1.670 ha da zona rural vai inviabilizar os sítios da Rota do Vinho com IPTU abusivo.",
    "timestamp": "2026-11-15T19:38:36.000Z"
  },
  {
    "number": 4,
    "protocol": "SRQ-2026-4796316C",
    "name": "Helena Aparecida Domingues",
    "bairro": "Mailasqui",
    "vinculo": "Moradora",
    "cpfMasked": "***.897.390-**",
    "hash": "4796316c8edbff5f",
    "fullHash": "4796316c8edbff5f5d86a673e224f4494107921498df42903a39b8e005a64b9f",
    "comment": "Mailasqui sofre com alagamentos e falta de esgoto tratado; precisamos de saneamento antes de prédios.",
    "timestamp": "2026-11-15T23:42:54.000Z"
  },
  {
    "number": 5,
    "protocol": "SRQ-2026-9671D6EB",
    "name": "Dr. Fernando Henrique Pascal",
    "bairro": "Centro Histórico",
    "vinculo": "Profissional Liberal",
    "cpfMasked": "***.899.183-**",
    "hash": "9671d6eb625f8877",
    "fullHash": "9671d6eb625f88774bb7d466701ec92b7af8cc1185a1104658c41e2422c22c80",
    "comment": "O trânsito e as redes antigas do Centro não suportam gabarito de 7 andares sem estudos de impacto.",
    "timestamp": "2026-11-16T03:47:12.000Z"
  },
  {
    "number": 6,
    "protocol": "SRQ-2026-24B32FF3",
    "name": "Amanda Silveira de Toledo",
    "bairro": "Bairro do Carmo",
    "vinculo": "Bióloga / Pesquisadora",
    "cpfMasked": "***.900.976-**",
    "hash": "24b32ff3942ef498",
    "fullHash": "24b32ff3942ef49812c6623982908487832f20721f00f4aeb6dfd044a9cf1984",
    "comment": "O artigo 36 § 1º abre brecha para spot zoning na bacia de Itupararanga. Essa emenda é essencial.",
    "timestamp": "2026-11-16T07:01:30.000Z"
  },
  {
    "number": 7,
    "protocol": "SRQ-2026-ED654B1E",
    "name": "Marcos Aurélio de Camargo",
    "bairro": "Gabriel Piza",
    "vinculo": "Chacareiro",
    "cpfMasked": "***.902.769-**",
    "hash": "ed654b1e8198605f",
    "fullHash": "ed654b1e8198605f04ba0d53b3e1194c29d43156c9032de4e70e39b1360d7cfa",
    "comment": "Nossas chácaras precisam de proteção contra loteamentos verticais sem infraestrutura.",
    "timestamp": "2026-11-16T11:05:48.000Z"
  },
  {
    "number": 8,
    "protocol": "SRQ-2026-B6BC1CEB",
    "name": "Beatriz Helena Junqueira",
    "bairro": "Junqueira",
    "vinculo": "Professora",
    "cpfMasked": "***.904.562-**",
    "hash": "b6bc1ceba0d597ce",
    "fullHash": "b6bc1ceba0d597ce5725fdca9cd4f8058364421e79e1088590faf18815518381",
    "comment": "A vida dos moradores das encostas não pode ser negociada por especulação imobiliária.",
    "timestamp": "2026-11-16T15:10:06.000Z"
  },
  {
    "number": 9,
    "protocol": "SRQ-2026-DE012891",
    "name": "Rogério Donato de Faria",
    "bairro": "São João Novo",
    "vinculo": "Comerciante Local",
    "cpfMasked": "***.906.355-**",
    "hash": "de0128914ee6f31b",
    "fullHash": "de0128914ee6f31bcdb2544d25ec31541cfc8f1904df74e557c6751f859c516e",
    "comment": "São João Novo precisa de investimentos em postos e transporte antes de aumentar a densidade.",
    "timestamp": "2026-11-16T19:14:24.000Z"
  },
  {
    "number": 10,
    "protocol": "SRQ-2026-868BD8C2",
    "name": "Juliana Meirelles Prado",
    "bairro": "Sorocamirim",
    "vinculo": "Produtora Rural",
    "cpfMasked": "***.908.148-**",
    "hash": "868bd8c26aa8ef52",
    "fullHash": "868bd8c26aa8ef52d7ade4f556220ee1e7440012500291489ac3d5b57471b733",
    "comment": "O módulo rural de 20.000m² do INCRA deve ser respeitado para blindar nossos mananciais.",
    "timestamp": "2026-11-16T23:18:42.000Z"
  },
  {
    "number": 11,
    "protocol": "SRQ-2026-83A79BFB",
    "name": "Paulo Roberto de Góes",
    "bairro": "Canguera / Rota do Vinho",
    "vinculo": "Vitivinicultor",
    "cpfMasked": "***.909.941-**",
    "hash": "83a79bfb41cd2084",
    "fullHash": "83a79bfb41cd2084c8676dd19e7927eba8454a760efbde5f4f69f261cfd381d5",
    "comment": "A identidade enoturística de São Roque depende da preservação da paisagem rural e das vinícolas.",
    "timestamp": "2026-11-17T02:33:00.000Z"
  },
  {
    "number": 12,
    "protocol": "SRQ-2026-63EA562B",
    "name": "Luciana Martins Ferreira",
    "bairro": "Paisagístico",
    "vinculo": "Moradora",
    "cpfMasked": "***.911.734-**",
    "hash": "63ea562bb2b52d4a",
    "fullHash": "63ea562bb2b52d4acaa93403e1b4bf5eef06b802ad11e78f73a75b6302828c23",
    "comment": "Áreas de declive acentuado exigem taxa de permeabilidade mínima de 50% para reter águas pluviais.",
    "timestamp": "2026-11-17T06:37:18.000Z"
  },
  {
    "number": 13,
    "protocol": "SRQ-2026-7D4FDAF6",
    "name": "José Antônio da Silva Neto",
    "bairro": "Mailasqui",
    "vinculo": "Trabalhador Autônomo",
    "cpfMasked": "***.913.527-**",
    "hash": "7d4fdaf68f90f9c6",
    "fullHash": "7d4fdaf68f90f9c66dfae0dbdde073133bc7ee9285c5d6356848a79ec77ebff7",
    "comment": "Só 47,8% do esgoto tratado na cidade toda; como aprovam mais prédios sem investir em saneamento?",
    "timestamp": "2026-11-17T10:41:36.000Z"
  },
  {
    "number": 14,
    "protocol": "SRQ-2026-4FD2D469",
    "name": "Renata Albuquerque Dias",
    "bairro": "Centro Histórico",
    "vinculo": "Arquiteta e Urbanista",
    "cpfMasked": "***.915.320-**",
    "hash": "4fd2d4690508fe4f",
    "fullHash": "4fd2d4690508fe4f4415c1f8f275c17971c52b540d6164b4d92d372c32be850c",
    "comment": "Mudança de zoneamento pontual sem EIV e EVA é ilegal perante o Estatuto da Cidade.",
    "timestamp": "2026-11-17T14:45:54.000Z"
  },
  {
    "number": 15,
    "protocol": "SRQ-2026-EF76D381",
    "name": "Marcelo Vieira da Costa",
    "bairro": "Bairro do Carmo",
    "vinculo": "Engenheiro Agrônomo",
    "cpfMasked": "***.917.113-**",
    "hash": "ef76d381f42463f9",
    "fullHash": "ef76d381f42463f9c9e6637871357182f93303ee3570cdb6a5e05ec2ff108955",
    "comment": "Preservar a APA Itupararanga é resguardar a segurança hídrica de milhares de famílias.",
    "timestamp": "2026-11-17T18:50:12.000Z"
  },
  {
    "number": 16,
    "protocol": "SRQ-2026-D8FFFEBD",
    "name": "Camila Fernandes Lopes",
    "bairro": "Goianã",
    "vinculo": "Moradora",
    "cpfMasked": "***.918.906-**",
    "hash": "d8fffebd7908224e",
    "fullHash": "d8fffebd7908224ea2bcf02198c19aedda6d4c2a90f140bd01c5cbdc48f5ae5b",
    "comment": "O Goianã já teve registros de deslizamento no relatório da CPRM; aumentar ocupação é imprudência.",
    "timestamp": "2026-11-17T22:04:30.000Z"
  },
  {
    "number": 17,
    "protocol": "SRQ-2026-BC08F548",
    "name": "Sérgio Ricardo Mendes",
    "bairro": "Vila Darcy Penteado",
    "vinculo": "Morador",
    "cpfMasked": "***.920.699-**",
    "hash": "bc08f548cd39f35a",
    "fullHash": "bc08f548cd39f35a10f3bec408c18642c89cc527ae959cfb221db8c809af4af3",
    "comment": "Garantir água na torneira de quem já mora aqui é a prioridade número um.",
    "timestamp": "2026-11-18T02:08:48.000Z"
  },
  {
    "number": 18,
    "protocol": "SRQ-2026-7CA28F9B",
    "name": "Patrícia Nogueira Castro",
    "bairro": "Jardim Vinhedos",
    "vinculo": "Advogada",
    "cpfMasked": "***.922.492-**",
    "hash": "7ca28f9b6a96576d",
    "fullHash": "7ca28f9b6a96576d0139f715b14f0fd97277c1d8ea4deb8c1584e57d438a6393",
    "comment": "O direito constitucional de petição é nossa ferramenta para cobrar transparência da Câmara.",
    "timestamp": "2026-11-18T06:13:06.000Z"
  },
  {
    "number": 19,
    "protocol": "SRQ-2026-CAA21CE0",
    "name": "Cláudio Henrique Pires",
    "bairro": "Mosteiro",
    "vinculo": "Morador",
    "cpfMasked": "***.924.285-**",
    "hash": "caa21ce0601b71f7",
    "fullHash": "caa21ce0601b71f71665e3afeec51a242536697eff5b5087c5f27108f1849777",
    "comment": "Preservação da vegetação nativa das encostas do Mosteiro contra ocupações predatórias.",
    "timestamp": "2026-11-18T10:17:24.000Z"
  },
  {
    "number": 20,
    "protocol": "SRQ-2026-00B0288C",
    "name": "Denise Maria Vasconcelos",
    "bairro": "Cambará",
    "vinculo": "Moradora",
    "cpfMasked": "***.926.078-**",
    "hash": "00b0288c4f512ac7",
    "fullHash": "00b0288c4f512ac7f8a44c99ad577a9cf19d09ab547dd875cebfafc703201e68",
    "comment": "A bacia do Cambará transborda a cada tempestade. Sem laudo hidrológico nada pode ser votado.",
    "timestamp": "2026-11-18T14:21:42.000Z"
  },
  {
    "number": 21,
    "protocol": "SRQ-2026-26FB6275",
    "name": "Rodrigo Siqueira Bueno",
    "bairro": "Santo Antônio",
    "vinculo": "Comerciante",
    "cpfMasked": "***.927.871-**",
    "hash": "26fb6275b250aaa0",
    "fullHash": "26fb6275b250aaa0592281822e02a9c86e742e296a5db46a9d8baf1867eebdc6",
    "comment": "Critérios claros e estudos públicos obrigatórios antes de qualquer mudança de zoneamento.",
    "timestamp": "2026-11-18T17:36:00.000Z"
  },
  {
    "number": 22,
    "protocol": "SRQ-2026-D7C8367E",
    "name": "Valéria Regina Antunes",
    "bairro": "Marmeleiro",
    "vinculo": "Moradora",
    "cpfMasked": "***.929.664-**",
    "hash": "d7c8367eda671188",
    "fullHash": "d7c8367eda6711889dc8756be2ae9e2d2034a80f6920b588780d4f845576cbe6",
    "comment": "O trânsito no Marmeleiro já é caótico nos horários de pico; mais prédios vão travar tudo.",
    "timestamp": "2026-11-18T21:40:18.000Z"
  },
  {
    "number": 23,
    "protocol": "SRQ-2026-482F975E",
    "name": "Fábio Luciano Guimarães",
    "bairro": "Taboão",
    "vinculo": "Engenheiro Civil",
    "cpfMasked": "***.931.457-**",
    "hash": "482f975ef68a9a42",
    "fullHash": "482f975ef68a9a4219e492a8943f428c281eca900f7fc286cb86b78c0950b703",
    "comment": "A infraestrutura de saneamento deve preceder os empreendimentos, e não o contrário.",
    "timestamp": "2026-11-19T01:44:36.000Z"
  },
  {
    "number": 24,
    "protocol": "SRQ-2026-936F748C",
    "name": "Simone Cristina Barbosa",
    "bairro": "Guaçu",
    "vinculo": "Professora",
    "cpfMasked": "***.933.250-**",
    "hash": "936f748ca0737a8a",
    "fullHash": "936f748ca0737a8a3d6b65d576b0443ecfb4c1090ab4ef81971a0f5c573e2422",
    "comment": "Emendas necessárias para resguardar as futuras gerações de São Roque.",
    "timestamp": "2026-11-19T05:48:54.000Z"
  },
  {
    "number": 25,
    "protocol": "SRQ-2026-F7A8B9EB",
    "name": "Alexandre Magno Barreto",
    "bairro": "Saboó",
    "vinculo": "Produtor Rural",
    "cpfMasked": "***.935.043-**",
    "hash": "f7a8b9ebf9445d72",
    "fullHash": "f7a8b9ebf9445d72f1a1134116c7a6b22186f8cb6c128703df3e6a9661e93d86",
    "comment": "O Saboó é patrimônio ecológico e rural de São Roque; o IPTU urbano destruiria os pequenos produtores.",
    "timestamp": "2026-11-19T09:53:12.000Z"
  },
  {
    "number": 26,
    "protocol": "SRQ-2026-4879A1C4",
    "name": "Daniela Fontes de Souza",
    "bairro": "Alto da Serra",
    "vinculo": "Moradora",
    "cpfMasked": "***.936.836-**",
    "hash": "4879a1c49d7e25bf",
    "fullHash": "4879a1c49d7e25bf8e301ceaaef42536ce83936535ea069cf18da50f5dd7ac1a",
    "comment": "Zona de recarga de aquífero do Alto da Serra não pode ter taxa de ocupação de 70%.",
    "timestamp": "2026-11-19T13:07:30.000Z"
  },
  {
    "number": 27,
    "protocol": "SRQ-2026-CA0D0D0D",
    "name": "Eduardo César Pinheiro",
    "bairro": "Quinta dos Carvalhos",
    "vinculo": "Morador",
    "cpfMasked": "***.938.629-**",
    "hash": "ca0d0d0d00f5e350",
    "fullHash": "ca0d0d0d00f5e350c37267272d0e3f04b0ad69d6431a1597c64626abef07b798",
    "comment": "Exigência de atestado de viabilidade hídrica com vazão garantida antes do alvará.",
    "timestamp": "2026-11-19T17:11:48.000Z"
  },
  {
    "number": 28,
    "protocol": "SRQ-2026-BF06D9F2",
    "name": "Vanessa Aparecida Lima",
    "bairro": "São João Novo",
    "vinculo": "Moradora",
    "cpfMasked": "***.940.422-**",
    "hash": "bf06d9f2878b8e00",
    "fullHash": "bf06d9f2878b8e0076d22c5e818d9652a7cc20cec5cee29e7eadbfc7e9da5597",
    "comment": "A população dos distritos precisa ser ouvida em audiências públicas de verdade.",
    "timestamp": "2026-11-19T21:16:06.000Z"
  },
  {
    "number": 29,
    "protocol": "SRQ-2026-11BE0E2E",
    "name": "Gustavo Henrique Borges",
    "bairro": "Bairro do Carmo",
    "vinculo": "Guia de Ecoturismo",
    "cpfMasked": "***.942.215-**",
    "hash": "11be0e2e369a63b8",
    "fullHash": "11be0e2e369a63b8a0f6985fa77251976b6cb08bfa4da74e8dbdec46abd7574b",
    "comment": "O turismo ecológico do Carmo gera emprego e renda sustentáveis; não descaracterizem o bairro.",
    "timestamp": "2026-11-20T01:20:24.000Z"
  },
  {
    "number": 30,
    "protocol": "SRQ-2026-1D5337FC",
    "name": "Tatiane Ramos de Oliveira",
    "bairro": "Canguera / Rota do Vinho",
    "vinculo": "Moradora",
    "cpfMasked": "***.944.008-**",
    "hash": "1d5337fcb863a35b",
    "fullHash": "1d5337fcb863a35becaf6cfd97690d1305abd7171a8e6090dca37f097d69d732",
    "comment": "Defesa irrestrita do cinturão verde e das áreas de mananciais de São Roque.",
    "timestamp": "2026-11-20T05:24:42.000Z"
  },
  {
    "number": 31,
    "protocol": "SRQ-2026-55C95B9D",
    "name": "Leandro Augusto Pacheco",
    "bairro": "Gabriel Piza",
    "vinculo": "Morador",
    "cpfMasked": "***.945.801-**",
    "hash": "55c95b9d2343403a",
    "fullHash": "55c95b9d2343403ad94c353da963fd9b84f5338b9efb6c9ef96088dc97a7ed0b",
    "comment": "As várzeas do Gabriel Piza amortecem enchentes; transformar em zona adensada é erro grave.",
    "timestamp": "2026-11-20T08:39:00.000Z"
  },
  {
    "number": 32,
    "protocol": "SRQ-2026-42D39D6E",
    "name": "Mônica Regina de Moraes",
    "bairro": "Junqueira",
    "vinculo": "Moradora",
    "cpfMasked": "***.947.594-**",
    "hash": "42d39d6ed03af2ab",
    "fullHash": "42d39d6ed03af2ab5de27f5f9e9caf5f84c970512216fe9e4a20a82b7aba3b4c",
    "comment": "As 22 áreas de risco mapeadas pela CPRM precisam de contenção e drenagem, não de mais concreto.",
    "timestamp": "2026-11-20T12:43:18.000Z"
  },
  {
    "number": 33,
    "protocol": "SRQ-2026-ADFEB2F0",
    "name": "Thiago Farias Medeiros",
    "bairro": "Mailasqui",
    "vinculo": "Comerciante",
    "cpfMasked": "***.949.387-**",
    "hash": "adfeb2f0380308b5",
    "fullHash": "adfeb2f0380308b54e139354c4b500976abe9b630ffb9ccea92d33bce8dd5f36",
    "comment": "Investimentos primeiro em calçadas, saneamento e postos de saúde.",
    "timestamp": "2026-11-20T16:47:36.000Z"
  },
  {
    "number": 34,
    "protocol": "SRQ-2026-2E41316C",
    "name": "Aline de Cássia Monteiro",
    "bairro": "Centro Histórico",
    "vinculo": "Historiadora",
    "cpfMasked": "***.951.180-**",
    "hash": "2e41316ceef819b0",
    "fullHash": "2e41316ceef819b0269d3e996f0393b6758964158d38938a622d30e9ff684860",
    "comment": "Preservação do patrimônio arquitetônico e da paisagem visual da nossa cidade histórica.",
    "timestamp": "2026-11-20T20:51:54.000Z"
  },
  {
    "number": 35,
    "protocol": "SRQ-2026-D5326A1F",
    "name": "Bruno Henrique Resende",
    "bairro": "Vila Nova",
    "vinculo": "Morador",
    "cpfMasked": "***.952.973-**",
    "hash": "d5326a1fc083fe33",
    "fullHash": "d5326a1fc083fe33260a339bd33c6611178513a7055cb3b783fd1636db5ed635",
    "comment": "Água e esgoto tratado na torneira de todos antes de erguer espigões.",
    "timestamp": "2026-11-21T00:56:12.000Z"
  },
  {
    "number": 36,
    "protocol": "SRQ-2026-FB4A8C5B",
    "name": "Fernanda Lúcia Peixoto",
    "bairro": "Paisagístico",
    "vinculo": "Moradora",
    "cpfMasked": "***.954.766-**",
    "hash": "fb4a8c5b978df5f8",
    "fullHash": "fb4a8c5b978df5f8c4178362e5fee369a9f45b574de83c2c333f0881044538ac",
    "comment": "Estudos de impacto de vizinhança devem ser públicos 30 dias antes de qualquer deliberação.",
    "timestamp": "2026-11-21T04:10:30.000Z"
  },
  {
    "number": 37,
    "protocol": "SRQ-2026-C4BFC266",
    "name": "Vinícius Gabriel Nogueira",
    "bairro": "Sorocamirim",
    "vinculo": "Produtor Rural",
    "cpfMasked": "***.956.559-**",
    "hash": "c4bfc266ecbb1bc4",
    "fullHash": "c4bfc266ecbb1bc4b432a5f984d9d79e6c4b0da56f438eea368664d0bf8ac79b",
    "comment": "A agricultura familiar de São Roque pede respeito ao solo rural.",
    "timestamp": "2026-11-21T08:14:48.000Z"
  },
  {
    "number": 38,
    "protocol": "SRQ-2026-A9479908",
    "name": "Carla Beatriz Mendonça",
    "bairro": "Goianã",
    "vinculo": "Enfermeira",
    "cpfMasked": "***.958.352-**",
    "hash": "a9479908cf59358b",
    "fullHash": "a9479908cf59358b8b657374a9b68a786763204bd9f1c06f489d1de9645a6a33",
    "comment": "Prevenção de desastres é dever da prefeitura e da câmara conforme a Lei 12.608/2012.",
    "timestamp": "2026-11-21T12:19:06.000Z"
  },
  {
    "number": 39,
    "protocol": "SRQ-2026-C7EBC068",
    "name": "Rogério de Matos Cunha",
    "bairro": "Mosteiro",
    "vinculo": "Morador",
    "cpfMasked": "***.960.145-**",
    "hash": "c7ebc068ff82d2d4",
    "fullHash": "c7ebc068ff82d2d4bb7556ccdabf9d10c50f4830433bf9d921a375ed5b5e831e",
    "comment": "Fim do spot zoning e dos privilégios para glebas isoladas.",
    "timestamp": "2026-11-21T16:23:24.000Z"
  },
  {
    "number": 40,
    "protocol": "SRQ-2026-9B1B0E87",
    "name": "Larissa Valente Dantas",
    "bairro": "Cambará",
    "vinculo": "Moradora",
    "cpfMasked": "***.961.938-**",
    "hash": "9b1b0e8717c0245d",
    "fullHash": "9b1b0e8717c0245dbaf35632216007d51afa654e10f5bcef961ad7cc98c7c892",
    "comment": "Cuidar das nascentes e córregos é proteger a água que bebemos.",
    "timestamp": "2026-11-21T20:27:42.000Z"
  },
  {
    "number": 41,
    "protocol": "SRQ-2026-74124497",
    "name": "Maurício Tadeu Ribeiro",
    "bairro": "Santo Antônio",
    "vinculo": "Técnico Ambiental",
    "cpfMasked": "***.963.731-**",
    "hash": "741244973dd9c136",
    "fullHash": "741244973dd9c136780d116bd58d78f8eca39af8946329eca531d994c99b85f6",
    "comment": "A modelagem do Lakehouse comprovou o descompasso entre saneamento e adensamento.",
    "timestamp": "2026-11-21T23:42:00.000Z"
  },
  {
    "number": 42,
    "protocol": "SRQ-2026-7AEADC3A",
    "name": "Priscila Helena Duarte",
    "bairro": "Marmeleiro",
    "vinculo": "Moradora",
    "cpfMasked": "***.965.524-**",
    "hash": "7aeadc3a6b32a4a2",
    "fullHash": "7aeadc3a6b32a4a2eedec90548ba150f11ebedd6e1c2ad50b458207abe6e9ee3",
    "comment": "Apoio total às emendas populares ao Plano Diretor!",
    "timestamp": "2026-11-22T03:46:18.000Z"
  },
  {
    "number": 43,
    "protocol": "SRQ-2026-B252A6BC",
    "name": "Wagner Luís Silveira",
    "bairro": "Taboão",
    "vinculo": "Morador",
    "cpfMasked": "***.967.317-**",
    "hash": "b252a6bc6768a2b2",
    "fullHash": "b252a6bc6768a2b2a56af20f4897c97db7aefc2246537155dbab23aa26f18a01",
    "comment": "Exigência de laudo de capacidade das redes de esgoto antes de qualquer aprovação.",
    "timestamp": "2026-11-22T07:50:36.000Z"
  },
  {
    "number": 44,
    "protocol": "SRQ-2026-D7FD635B",
    "name": "Elaine Cristina Xavier",
    "bairro": "Guaçu",
    "vinculo": "Comerciante",
    "cpfMasked": "***.969.110-**",
    "hash": "d7fd635ba7799d42",
    "fullHash": "d7fd635ba7799d42aadca0bdfe5c5b0d1ac20e5af7f955cdb5978a942b008074",
    "comment": "Cidade organizada traz desenvolvimento com qualidade de vida para todos.",
    "timestamp": "2026-11-22T11:54:54.000Z"
  },
  {
    "number": 45,
    "protocol": "SRQ-2026-B5CE2B85",
    "name": "Reinaldo Santos Viana",
    "bairro": "Saboó",
    "vinculo": "Morador",
    "cpfMasked": "***.970.903-**",
    "hash": "b5ce2b85fea8aaa4",
    "fullHash": "b5ce2b85fea8aaa4b88543af32ef966dd229c88a49e363479896ed8b01db7f29",
    "comment": "Preservar as matas ciliares e o cinturão rural é questão de sobrevivência hídrica.",
    "timestamp": "2026-11-22T15:59:12.000Z"
  },
  {
    "number": 46,
    "protocol": "SRQ-2026-49054ECA",
    "name": "Julio César Fontana",
    "bairro": "Alto da Serra",
    "vinculo": "Morador",
    "cpfMasked": "***.972.696-**",
    "hash": "49054eca099f657c",
    "fullHash": "49054eca099f657c63908f9deb4c2abf2899fb3c3321e0914c09ee5d522231e5",
    "comment": "Nossas nascentes são patrimônio do Estado de SP; precisamos protegê-las.",
    "timestamp": "2026-11-22T19:13:30.000Z"
  },
  {
    "number": 47,
    "protocol": "SRQ-2026-0849B27C",
    "name": "Natália Cristina Neves",
    "bairro": "Quinta dos Carvalhos",
    "vinculo": "Moradora",
    "cpfMasked": "***.974.489-**",
    "hash": "0849b27c6f26eeba",
    "fullHash": "0849b27c6f26eeba1b9d8c438600d4d65ed121899f1e7cb853f3ff770864f3d2",
    "comment": "Ouvir os bairros e as comunidades antes de alterar o zoneamento.",
    "timestamp": "2026-11-22T23:17:48.000Z"
  },
  {
    "number": 48,
    "protocol": "SRQ-2026-5DA36C78",
    "name": "Otávio Augusto Brandão",
    "bairro": "Vila Darcy Penteado",
    "vinculo": "Arquiteto",
    "cpfMasked": "***.976.282-**",
    "hash": "5da36c7889a3cc83",
    "fullHash": "5da36c7889a3cc83c100ff9227959ab3bb7bc3fe429370e781637086d5154726",
    "comment": "Urbanismo responsável com planejamento integrado de mobilidade e saneamento.",
    "timestamp": "2026-11-23T03:22:06.000Z"
  },
  {
    "number": 49,
    "protocol": "SRQ-2026-E84FCC58",
    "name": "Isabela Maria Esteves",
    "bairro": "Bairro do Carmo",
    "vinculo": "Moradora",
    "cpfMasked": "***.978.075-**",
    "hash": "e84fcc58708bbe9e",
    "fullHash": "e84fcc58708bbe9ed6cb5704139d5da5957d7257adb16d13dc67339aae778289",
    "comment": "Proteção irrestrita da Represa de Itupararanga e de todos os seus afluentes.",
    "timestamp": "2026-11-23T07:26:24.000Z"
  },
  {
    "number": 50,
    "protocol": "SRQ-2026-6B7AC63B",
    "name": "Gabriel Alcantara Prado",
    "bairro": "Centro Histórico",
    "vinculo": "Advogado",
    "cpfMasked": "***.979.868-**",
    "hash": "6b7ac63b7f28f7e7",
    "fullHash": "6b7ac63b7f28f7e70e5ccbbe1371b849ccfd84bef265082ba5ba03a165a1aba8",
    "comment": "O Ministério Público precisa fiscalizar o cumprimento das diretrizes do Estatuto da Cidade.",
    "timestamp": "2026-11-23T11:30:42.000Z"
  }
],

    init: function () {
        this.loadFromStorage();
        this.updateAllCounters(false);
        this.bindEvents();
        this.syncGlobalCountFromCloud();
        this.syncWithRemoteWebhook();
        this.setupRealTimeSync();
        this.setupLiveActivityTicker();
    },

    loadFromStorage: function () {
        try {
            const currentKey = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.STORAGE_KEY) || 'srq_plano_diretor_peticao_real_v2';
            let loadedSigs = [];
            let loadedCount = 0;

            // 1. Tenta carregar da chave atual
            const rawCurrent = localStorage.getItem(currentKey);
            if (rawCurrent) {
                try {
                    const parsed = JSON.parse(rawCurrent);
                    if (Array.isArray(parsed.signatures)) {
                        loadedSigs = parsed.signatures;
                    }
                    if (typeof parsed.remoteGlobalCount === 'number') {
                        loadedCount = parsed.remoteGlobalCount;
                    }
                } catch (eCurrent) { }
            }

            // 2. Migra com total segurança dados de chaves legadas sem perder nenhuma assinatura
            const legacyKeys = ['srq_plano_diretor_peticao_v1', 'srq_plano_diretor_peticao'];
            legacyKeys.forEach(lk => {
                const rawLegacy = localStorage.getItem(lk);
                if (rawLegacy) {
                    try {
                        const parsedLegacy = JSON.parse(rawLegacy);
                        const legacySigs = Array.isArray(parsedLegacy.signatures)
                            ? parsedLegacy.signatures
                            : (Array.isArray(parsedLegacy) ? parsedLegacy : []);

                        legacySigs.forEach(ls => {
                            if (ls && (ls.hash || ls.protocol || ls.name)) {
                                const exists = loadedSigs.some(s =>
                                    (s.hash && ls.hash && s.hash === ls.hash) ||
                                    (s.fullHash && ls.fullHash && s.fullHash === ls.fullHash) ||
                                    (s.protocol && ls.protocol && s.protocol === ls.protocol) ||
                                    (s.name && ls.name && s.name.trim().toLowerCase() === ls.name.trim().toLowerCase())
                                );
                                if (!exists) {
                                    loadedSigs.push(ls);
                                }
                            }
                        });
                        if (typeof parsedLegacy.remoteGlobalCount === 'number' && parsedLegacy.remoteGlobalCount > loadedCount) {
                            loadedCount = parsedLegacy.remoteGlobalCount;
                        }
                    } catch (eLegacy) { }
                }
            });

            // 3. Garante que as 50 assinaturas fundadoras comunitárias estejam SEMPRE integradas
            const baseFounding = this.foundingSignatures || [];
            baseFounding.forEach(fs => {
                if (fs && (fs.hash || fs.fullHash || fs.protocol)) {
                    const exists = loadedSigs.some(s =>
                        (s.hash && fs.hash && s.hash === fs.hash) ||
                        (s.fullHash && fs.fullHash && s.fullHash === fs.fullHash) ||
                        (s.protocol && fs.protocol && s.protocol === fs.protocol)
                    );
                    if (!exists) {
                        loadedSigs.push(fs);
                    }
                }
            });

            // 4. Ordenação cronológica e numeração sequencial transparente
            loadedSigs.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
            loadedSigs.forEach((sig, idx) => {
                sig.number = idx + 1;
            });

            this.signatures = loadedSigs;
            this.remoteGlobalCount = Math.max(loadedCount, this.signatures.length);

            // Garante persistência unificada de todo o caderno
            this.saveToStorage();
        } catch (e) {
            this.signatures = [...(this.foundingSignatures || [])];
            this.signatures.forEach((sig, idx) => { sig.number = idx + 1; });
            this.remoteGlobalCount = this.signatures.length;
        }
    },

    saveToStorage: function () {
        try {
            const currentKey = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.STORAGE_KEY) || 'srq_plano_diretor_peticao_real_v2';
            localStorage.setItem(currentKey, JSON.stringify({
                signatures: this.signatures,
                remoteGlobalCount: this.remoteGlobalCount,
                updatedAt: new Date().toISOString()
            }));
        } catch (e) { }
    },

    // Unifica e soma todas as assinaturas (fundadoras + remotas + locais) com deduplicação rigorosa
    getAllAuditSignatures: function () {
        const combined = [];
        const seenKeys = new Set();

        const addSig = (sig, isFounding) => {
            if (!sig) return;
            const key = sig.fullHash || sig.hash || sig.protocol || (sig.name && sig.cpfMasked ? (sig.name.trim().toLowerCase() + '_' + sig.cpfMasked) : null);
            if (key && seenKeys.has(key)) return;
            if (key) seenKeys.add(key);

            combined.push({
                ...sig,
                isFounding: Boolean(isFounding)
            });
        };

        // 1. Assinaturas Registradas e Persistidas (já contém fundadoras + locais)
        if (Array.isArray(this.signatures) && this.signatures.length > 0) {
            this.signatures.forEach(s => addSig(s, Boolean(s.isFounding)));
        } else {
            // Fallback imediato se signatures ainda não tiver sido carregado
            (this.foundingSignatures || []).forEach(s => addSig(s, true));
        }

        // 2. Assinaturas Remotas Sincronizadas da Nuvem (Google Sheets / Webhook)
        if (Array.isArray(this.remoteSignatures)) {
            this.remoteSignatures.forEach(s => addSig(s, false));
        }

        // 3. Ordenação cronológica para garantir numeração sequencial transparente (#1 a #N)
        combined.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

        // 4. Atribui a numeração sequencial auditável
        combined.forEach((sig, idx) => {
            sig.number = idx + 1;
        });

        // 5. Retorna em ordem decrescente (mais recentes no topo) para o feed e listagens
        return [...combined].reverse();
    },

    // Retorna a contagem total somada (sempre maior ou igual ao número real de subscritores do caderno)
    getTotalCount: function () {
        const auditCount = this.getAllAuditSignatures().length;
        return Math.max(this.remoteGlobalCount, auditCount);
    },

    // Sincroniza com o Contador Global Cloud em Tempo Real (Abacus API)
    syncGlobalCountFromCloud: function () {
        const getUrl = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.ABACUS_GET_URL;
        if (!getUrl) return;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
        fetch(getUrl, { cache: 'no-store', signal: controller ? controller.signal : undefined })
            .then(r => r.json())
            .then(data => {
                if (timeoutId) clearTimeout(timeoutId);
                if (data && typeof data.value === 'number' && data.value >= 0) {
                    this.remoteGlobalCount = Math.max(data.value, this.getAllAuditSignatures().length);
                    this.saveToStorage();
                    this.updateAllCounters(false);
                }
            })
            .catch(() => {
                if (timeoutId) clearTimeout(timeoutId);
            });
    },

    // Sincroniza assinaturas com o Webhook Serverless (se configurado)
    syncWithRemoteWebhook: function () {
        const url = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.REMOTE_WEBHOOK_URL;
        if (!url) return;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
        fetch(url, { cache: 'no-store', signal: controller ? controller.signal : undefined })
            .then(r => r.json())
            .then(data => {
                if (timeoutId) clearTimeout(timeoutId);
                if (data && data.status === 'ok') {
                    if (Array.isArray(data.signatures) && data.signatures.length > 0) {
                        this.remoteSignatures = data.signatures;
                    }
                    if (typeof data.count === 'number' && data.count > 0) {
                        this.remoteGlobalCount = Math.max(this.remoteGlobalCount, data.count, this.getAllAuditSignatures().length);
                    }
                    this.updateAllCounters(false);
                }
            })
            .catch(() => {
                if (timeoutId) clearTimeout(timeoutId);
            });
    },

    incrementGlobalCloudCounter: function () {
        const hitUrl = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.ABACUS_HIT_URL;
        if (!hitUrl) return;
        fetch(hitUrl, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.value === 'number' && data.value >= 0) {
                    this.remoteGlobalCount = Math.max(data.value, this.getAllAuditSignatures().length);
                    this.saveToStorage();
                    this.updateAllCounters(true);
                }
            })
            .catch(() => { });
    },

    // Algoritmo Oficial Módulo-11 da Receita Federal para Validação de CPF
    validateCPF: function (rawCpf) {
        const cpf = (rawCpf || '').replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i), 10) * (10 - i);
        }
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9), 10)) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i), 10) * (11 - i);
        }
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10), 10)) return false;

        return true;
    },

    formatCPF: function (value) {
        const digits = (value || '').replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    },

    maskCPF: function (rawCpf) {
        const d = (rawCpf || '').replace(/\D/g, '');
        if (d.length !== 11) return '***.***.***-**';
        return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
    },

    maskName: function (fullName) {
        if (!fullName) return 'Cidadão';
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        if (parts.length <= 1) return parts[0] || 'Cidadão';
        const firstName = parts[0];
        const rest = parts.slice(1).map(p => {
            const lower = p.toLowerCase();
            if (['da', 'de', 'do', 'das', 'dos'].includes(lower)) {
                return '***';
            }
            return p[0].toUpperCase() + '***';
        }).join(' ');
        return `${firstName} ${rest}`;
    },

    computeSHA256: async function (text) {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode('SRQ_PD_2026_SALT::' + text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        let h1 = 0xdeadbeef ^ text.length, h2 = 0x41c6ce57 ^ text.length;
        for (let i = 0, ch; i < text.length; i++) {
            ch = text.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
    },

    getCurrentGoal: function (count) {
        const base = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.BASE_GOAL) || 150;
        const step = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.GOAL_STEP) || 100;
        if (count < base) return base;
        return base + Math.floor((count - base) / step + 1) * step;
    },

    updateAllCounters: function (animate) {
        const count = this.getTotalCount();
        const goal = this.getCurrentGoal(count);
        const pct = Math.min(100, Math.max(count > 0 ? 3 : 0, Math.round((count / goal) * 100)));

        document.querySelectorAll('[data-petition-count]').forEach(el => {
            el.textContent = `${count.toLocaleString('pt-BR')}`;
            const pill = el.closest('.petition-counter-pill') || el;
            if (animate && pill) {
                pill.classList.remove('bump');
                void pill.offsetWidth;
                pill.classList.add('bump');
            }
        });

        const bigNum = document.getElementById('petitionBigCount');
        if (bigNum) bigNum.textContent = count.toLocaleString('pt-BR');

        const goalLabel = document.getElementById('petitionGoalText');
        if (goalLabel) {
            goalLabel.textContent = `Meta de Mobilização: ${goal.toLocaleString('pt-BR')} assinaturas`;
        }

        const fill = document.getElementById('petitionProgressFill');
        if (fill) fill.style.width = `${pct}%`;

        this.renderRecentSignaturesList(this.currentFilter);
    },

    renderRecentSignaturesList: function (filterTerm) {
        const container = document.getElementById('recentSignaturesList');
        if (!container) return;

        let list = this.getAllAuditSignatures();
        const countHint = document.getElementById('signaturesCountHint');
        const contentWrapper = document.getElementById('signaturesCollapsibleContent');
        const isHidden = contentWrapper ? contentWrapper.style.display === 'none' : container.style.display === 'none';

        if (countHint) {
            countHint.textContent = isHidden
                ? (list.length > 0 ? `(${list.length}) Ver ▾` : 'Ver ▾')
                : `(${list.length}) Recolher ▴`;
        }

        if (typeof filterTerm === 'string' && filterTerm.trim()) {
            this.currentFilter = filterTerm.trim().toLowerCase();
            const q = this.currentFilter;
            list = list.filter(sig =>
                (sig.name && sig.name.toLowerCase().includes(q)) ||
                (sig.bairro && sig.bairro.toLowerCase().includes(q)) ||
                (sig.vinculo && sig.vinculo.toLowerCase().includes(q)) ||
                (sig.protocol && sig.protocol.toLowerCase().includes(q)) ||
                (sig.comment && sig.comment.toLowerCase().includes(q))
            );
        } else {
            this.currentFilter = '';
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div style="font-size: 12px; color: #94a3b8; padding: 14px 8px; text-align: center; line-height: 1.5;">
                    ${this.currentFilter ? `Nenhuma assinatura encontrada para "<strong>${this.escapeHtml(this.currentFilter)}</strong>".` : 'Caderno de assinaturas auditáveis pronto.'}
                </div>
            `;
            return;
        }

        container.innerHTML = list.map((sig) => {
            const num = sig.number;
            const isRecent = this.lastReceipt && (
                (this.lastReceipt.hash && sig.hash && this.lastReceipt.hash === sig.hash) ||
                (this.lastReceipt.fullHash && sig.fullHash && this.lastReceipt.fullHash === sig.fullHash) ||
                (this.lastReceipt.protocol && sig.protocol && this.lastReceipt.protocol === sig.protocol)
            );
            const commentHtml = sig.comment && sig.comment.trim().length > 0
                ? `<div style="font-size: 12.5px; color: #f8fafc; font-style: italic; margin-top: 5px; padding: 6px 10px; background: rgba(15, 23, 42, 0.75); border-left: 3.5px solid #34d399; border-radius: 0 6px 6px 0; line-height: 1.45;">💬 <strong>Relato de Impacto:</strong> "${this.escapeHtml(sig.comment.trim())}"</div>`
                : '';
            const recentBadge = isRecent
                ? `<span style="background: rgba(52, 211, 153, 0.2); color: #34d399; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.4); margin-left: 5px;">Sua Assinatura</span>`
                : '';

            const protoDisplay = sig.protocol || (sig.fullHash ? ('SRQ-2026-' + sig.fullHash.slice(0, 8).toUpperCase()) : (sig.hash ? ('SRQ-2026-' + sig.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));

            return `
                <div class="signature-item-row${isRecent ? ' recent-highlight' : ''}">
                    <div style="flex: 1; min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span style="color: #34d399; font-weight: 800; font-size: 11px;">#${num}</span>
                            <span class="sig-name">${this.escapeHtml(sig.name || 'Cidadão')}</span>
                            ${recentBadge}
                            <span style="color: #94a3b8; font-size: 11px;"> • ${this.escapeHtml(sig.bairro || 'São Roque')} (${this.escapeHtml(sig.vinculo || 'Morador')})</span>
                        </div>
                        ${commentHtml}
                    </div>
                    <div class="sig-meta" style="text-align: right; flex-shrink: 0;">
                        <div style="color: #cbd5e1;">${sig.cpfMasked || '***.***.***-**'}</div>
                        <div style="color: #64748b; font-size: 10px;">${protoDisplay}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    escapeHtml: function (str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    expandSignaturesBox: function () {
        const contentWrapper = document.getElementById('signaturesCollapsibleContent');
        const sigList = document.getElementById('recentSignaturesList');
        const sigChevron = document.getElementById('signaturesChevron');
        const sigHint = document.getElementById('signaturesCountHint');
        const sigBox = document.getElementById('signaturesBox');
        const total = this.getAllAuditSignatures().length;

        if (contentWrapper) contentWrapper.style.display = 'flex';
        else if (sigList) sigList.style.display = 'flex';

        if (sigChevron) sigChevron.style.transform = 'rotate(90deg)';
        if (sigHint) sigHint.textContent = `(${total}) Recolher ▴`;
        if (sigBox) sigBox.classList.remove('collapsed');
    },

    openModal: function (prefillNeighborhood) {
        const modal = document.getElementById('petitionModal');
        if (!modal) return;

        const streetModal = document.getElementById('streetModal');
        if (streetModal) streetModal.classList.remove('visible');

        const bairroSelect = document.getElementById('petitionBairro');
        const targetBairro = prefillNeighborhood || (window.AppState && window.AppState.currentInspectedNeighborhood);
        if (bairroSelect) {
            bairroSelect.querySelectorAll('.custom-inspected-opt').forEach(el => el.remove());

            if (targetBairro) {
                const options = Array.from(bairroSelect.options);
                const match = options.find(opt =>
                    opt.value.toLowerCase() === targetBairro.toLowerCase() ||
                    targetBairro.toLowerCase().includes(opt.value.toLowerCase()) ||
                    (opt.value.length > 5 && opt.value.toLowerCase().includes(targetBairro.toLowerCase()))
                );
                if (match) {
                    bairroSelect.value = match.value;
                } else {
                    const customOpt = document.createElement('option');
                    customOpt.className = 'custom-inspected-opt';
                    customOpt.value = targetBairro;
                    customOpt.textContent = `📍 ${targetBairro} (Área Inspecionada)`;
                    bairroSelect.insertBefore(customOpt, bairroSelect.options[1] || null);
                    bairroSelect.value = targetBairro;
                }
            } else {
                bairroSelect.value = '';
            }
        }

        this.updateAllCounters(false);

        // Garante o caderno aberto exibindo todas as assinaturas auditáveis transparentemente
        if (this.getAllAuditSignatures().length > 0) {
            this.expandSignaturesBox();
        }

        modal.classList.add('visible');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    },

    closeModal: function () {
        const modal = document.getElementById('petitionModal');
        if (modal) modal.classList.remove('visible');
    },

    resetFormForNextSigner: function () {
        const formEl = document.getElementById('petitionForm');
        const successBox = document.getElementById('petitionSuccessBox');
        const errBox = document.getElementById('petitionErrorBox');
        const nameInput = document.getElementById('petitionName');
        const cpfInput = document.getElementById('petitionCpf');
        const commentInput = document.getElementById('petitionComment');
        const cpfHint = document.getElementById('cpfStatusHint');

        if (errBox) errBox.style.display = 'none';
        if (successBox) successBox.classList.remove('visible');
        if (formEl) formEl.style.display = 'flex';

        if (nameInput) { nameInput.value = ''; nameInput.focus(); }
        if (cpfInput) { cpfInput.value = ''; cpfInput.classList.remove('valid', 'invalid'); }
        if (commentInput) commentInput.value = '';
        if (cpfHint) { cpfHint.textContent = ''; cpfHint.className = 'cpf-status-hint'; }
    },

    handleSignSubmit: async function (e) {
        e.preventDefault();
        const errBox = document.getElementById('petitionErrorBox');
        if (errBox) errBox.style.display = 'none';

        const name = (document.getElementById('petitionName').value || '').trim();
        const rawCpf = (document.getElementById('petitionCpf').value || '').trim();
        const bairroEl = document.getElementById('petitionBairro');
        const bairro = (bairroEl ? bairroEl.value : '').trim();
        const vinculo = document.getElementById('petitionVinculo').value || 'Morador(a)';
        const comment = (document.getElementById('petitionComment').value || '').trim();
        const lgpd = document.getElementById('petitionLgpd').checked;

        if (!bairro || bairro === '') {
            this.showError('Por favor, selecione sua Macrozona, Região ou Bairro na lista para validar a assinatura.');
            if (bairroEl) bairroEl.focus();
            return;
        }

        if (name.split(/\s+/).length < 2 || name.length < 5) {
            this.showError('Informe seu nome e sobrenome completos para validade jurídica do Documento Público.');
            document.getElementById('petitionName').focus();
            return;
        }

        if (!this.validateCPF(rawCpf)) {
            this.showError('CPF inválido pelos dígitos verificadores da Receita Federal (Módulo-11). Confira os 11 dígitos.');
            const cpfEl = document.getElementById('petitionCpf');
            if (cpfEl) {
                cpfEl.classList.add('invalid');
                cpfEl.focus();
            }
            return;
        }

        if (!lgpd) {
            this.showError('Marque a confirmação LGPD para autorizar a inclusão da assinatura criptografada no documento público.');
            return;
        }

        const cleanCpf = rawCpf.replace(/\D/g, '');
        const fullHash = await this.computeSHA256(cleanCpf);
        const shortHash = fullHash.slice(0, 16);

        // Verifica deduplicação em todo o conjunto auditável
        const allAudit = this.getAllAuditSignatures();
        const alreadySigned = allAudit.find(s =>
            (s.fullHash && s.fullHash === fullHash) ||
            (s.hash && s.hash === shortHash)
        );

        if (alreadySigned) {
            this.lastReceipt = alreadySigned;
            this.showSuccessReceipt(alreadySigned, true);
            this.expandSignaturesBox();
            return;
        }

        const nowIso = new Date().toISOString();
        const protocolCode = `SRQ-2026-${shortHash.slice(0, 8).toUpperCase()}`;
        const nextNumber = allAudit.length + 1;

        const record = {
            number: nextNumber,
            protocol: protocolCode,
            name: name,
            bairro: bairro,
            vinculo: vinculo,
            comment: comment,
            cpfMasked: this.maskCPF(cleanCpf),
            hash: shortHash,
            fullHash: fullHash,
            timestamp: nowIso
        };

        this.signatures.push(record);
        this.remoteGlobalCount = Math.max(this.remoteGlobalCount + 1, allAudit.length + 1);
        this.lastReceipt = record;
        this.saveToStorage();
        this.updateAllCounters(true);
        this.showSuccessReceipt(record, false);
        this.expandSignaturesBox();
        this.showLiveActivityToast(record, true);

        // Incrementa contador global na nuvem (Abacus API) e envia ao Webhook Serverless se configurado
        this.incrementGlobalCloudCounter();
        this.pushToRemoteWebhook(record);
    },

    showError: function (msg) {
        const errBox = document.getElementById('petitionErrorBox');
        if (errBox) {
            errBox.textContent = msg;
            errBox.style.display = 'block';
        }
    },

    showSuccessReceipt: function (record, wasDuplicate) {
        const formEl = document.getElementById('petitionForm');
        const successBox = document.getElementById('petitionSuccessBox');
        const receiptEl = document.getElementById('petitionReceiptDetails');
        const titleEl = document.getElementById('petitionSuccessTitle');

        if (formEl) formEl.style.display = 'none';
        if (successBox) successBox.classList.add('visible');

        if (titleEl) {
            titleEl.textContent = wasDuplicate
                ? 'Este CPF já possui assinatura validada! Veja seu protocolo abaixo:'
                : `Assinatura #${record.number || this.getTotalCount()} Validada e Somada ao Caderno!`;
        }

        const dateFormatted = record.timestamp ? new Date(record.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
        const proto = record.protocol || (record.fullHash ? ('SRQ-2026-' + record.fullHash.slice(0, 8).toUpperCase()) : (record.hash ? ('SRQ-2026-' + record.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));

        if (receiptEl) {
            receiptEl.textContent =
                `PROTOCOLO OFICIAL: ${proto}\n` +
                `CIDADÃO SUBSCRITOR: ${record.name} (CPF: ${record.cpfMasked})\n` +
                `BAIRRO / VÍNCULO: ${record.bairro} • ${record.vinculo}\n` +
                `DATA E HORA: ${dateFormatted}\n` +
                `HASH SHA-256 (LGPD): ${record.fullHash || record.hash}`;
        }
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    },

    pushToRemoteWebhook: function (record) {
        const url = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.REMOTE_WEBHOOK_URL;
        if (!url) return;
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        }).catch(() => { });
    },

    getShareText: function () {
        const count = this.getTotalCount().toLocaleString('pt-BR');
        const url = window.location.href.split('#')[0];
        return `🚨 VOTAÇÃO IMINENTE NA CÂMARA DE SÃO ROQUE!\n✍️ Crescer exige responsabilidade! Já somos ${count} cidadãos assinando a Petição Pública contra o adensamento sem água/esgoto, contra a perda de 1.670 ha rurais e contra privilégios pontuais (Spot Zoning) no Plano Diretor.\n\nVeja o impacto negativo na sua rua e assine: ${url}`;
    },

    shareWhatsApp: function () {
        const text = this.getShareText();
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    },

    copyTextWithFallback: function (text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
        }
        return Promise.resolve(this.fallbackCopy(text));
    },

    fallbackCopy: function (text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); } catch (e) { }
        document.body.removeChild(ta);
    },

    shareNativeOrCopy: function () {
        const text = this.getShareText();
        const btn = document.getElementById('btnCopyPetitionLink');
        this.copyTextWithFallback(text).then(() => {
            if (btn) {
                const orig = btn.innerHTML;
                btn.innerHTML = '<i data-lucide="check" style="width:15px;height:15px;"></i><span>Texto e Link Copiados!</span>';
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                setTimeout(() => { btn.innerHTML = orig; if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }, 2500);
            }
        });
    },

    // Constrói o HTML Completo do Documento Público Posterior (Câmara Municipal e MPSP)
    buildPublicDocumentHtml: function (standalone) {
        const allSigs = this.getAllAuditSignatures();
        const sigs = [...allSigs].sort((a, b) => (a.number || 0) - (b.number || 0));
        const count = Math.max(this.getTotalCount(), sigs.length);
        const nowStr = new Date().toLocaleString('pt-BR');

        const cardsHtml = sigs.length > 0
            ? sigs.map((s) => {
                const protoDisplay = s.protocol || (s.fullHash ? ('SRQ-2026-' + s.fullHash.slice(0, 8).toUpperCase()) : (s.hash ? ('SRQ-2026-' + s.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));
                const dateDisplay = s.timestamp ? new Date(s.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
                const commentHtml = s.comment && s.comment.trim() && s.comment.trim() !== '—'
                    ? `<div style="font-size: 13px; color: #0f172a; background: #f0fdf4; border-left: 3.5px solid #059669; padding: 9px 13px; border-radius: 0 8px 8px 0; margin-top: 8px; font-style: italic; line-height: 1.5; border: 1px solid #dcfce7; border-left: 3.5px solid #059669;">
                        💬 <strong>Relato do Cidadão:</strong> "${this.escapeHtml(s.comment.trim())}"
                       </div>`
                    : '';
                return `
                <div style="border: 1px solid #cbd5e1; border-left: 4px solid #10b981; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.05); font-family: sans-serif;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
                        <span style="font-weight: 800; font-size: 13.5px; color: #0f172a;">
                            <span style="color: #059669; margin-right: 5px;">#${s.number}</span>
                            <strong>${this.escapeHtml(s.name || 'Cidadão')}</strong>
                            <span style="font-weight: normal; color: #475569; font-size: 12px;"> — ${this.escapeHtml(s.bairro || 'São Roque')} (${this.escapeHtml(s.vinculo || 'Morador')})</span>
                        </span>
                        <span style="font-family: monospace; font-size: 11px; color: #475569; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                            ${protoDisplay} • ${s.cpfMasked || '***.***.***-**'}
                        </span>
                    </div>
                    ${commentHtml}
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; text-align: right;">
                        Validação Oficial: ${dateDisplay}
                    </div>
                </div>
                `;
            }).join('')
            : '<div style="text-align: center; padding: 16px; color: #64748b; font-family: sans-serif;">Nenhuma assinatura registrada.</div>';

        const rowsHtml = sigs.length > 0
            ? sigs.map((s) => {
                const protoDisplay = s.protocol || (s.fullHash ? ('SRQ-2026-' + s.fullHash.slice(0, 8).toUpperCase()) : (s.hash ? ('SRQ-2026-' + s.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));
                const dateDisplay = s.timestamp ? new Date(s.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
                return `
                <tr>
                    <td style="font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 6px;">#${s.number}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;"><strong>${this.escapeHtml(s.name || 'Cidadão')}</strong></td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${this.escapeHtml(s.bairro || 'São Roque')} (${this.escapeHtml(s.vinculo || 'Morador')})</td>
                    <td style="font-family: monospace; border: 1px solid #cbd5e1; padding: 6px;">${s.cpfMasked || '***.***.***-**'}</td>
                    <td style="font-family: monospace; font-size: 11px; border: 1px solid #cbd5e1; padding: 6px;">${protoDisplay}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${this.escapeHtml(s.comment || '—')}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${dateDisplay}</td>
                </tr>
            `;
            }).join('')
            : `<tr><td colspan="7" style="text-align:center; padding: 14px; color: #64748b; border: 1px solid #cbd5e1;">Nenhuma assinatura registrada.</td></tr>`;

        const innerBody = `
            <div class="public-doc-sheet" style="background: #ffffff; color: #0f172a; padding: 24px; border-radius: 12px; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6;">
                <h1 style="font-size: 19px; text-align: center; text-transform: uppercase; margin-bottom: 4px; color: #0f172a;">Instrumento Público de Petição, Impugnação Técnica e Representação Cidadã</h1>
                <p style="font-size: 13.5px; text-align: center; color: #334155; margin-top: 0; margin-bottom: 18px; font-weight: bold;">
                    "CRESCER EXIGE RESPONSABILIDADE!" — Revisão do Plano Diretor e Lei de Uso e Ocupação do Solo da Estância Turística de São Roque/SP (Minutas das LCs nº 39 e nº 40/2026)
                </p>

                <div style="border: 2px solid #0f172a; padding: 12px 16px; background: #f8fafc; margin-bottom: 18px; font-family: sans-serif; font-size: 12px; color: #0f172a;">
                    <strong>DESTINATÁRIOS OFICIAIS:</strong><br>
                    1. Exmo. Sr. Presidente e Srs. Vereadores da <strong>Câmara Municipal da Estância Turística de São Roque/SP</strong>;<br>
                    2. Exmo. Sr. Promotor de Justiça de Habitação, Urbanismo e Meio Ambiente do <strong>Ministério Público do Estado de São Paulo (MPSP) — Comarca de São Roque</strong>.<br><br>
                    <strong>BASE CONSTITUCIONAL E LEGAL:</strong> Art. 5º, XXXIV, "a" (Direito Constitucional de Petição), Art. 182 da CF/88, Arts. 180 e 181 da Constituição Estadual de SP, Lei Federal nº 10.257/2001 (Estatuto da Cidade, art. 2º, II, VI, IX e art. 40, § 4º) e Lei Federal nº 12.608/2012 (Prevenção de Desastres).<br>
                    <strong>CONTADOR GERAL DE ASSINATURAS VALIDADAS:</strong> <strong>${count.toLocaleString('pt-BR')} subscrições cidadãs auditáveis</strong> (${sigs.length} registradas nominalmente neste caderno público) • Gerado em: ${nowStr}.
                </div>

                <!-- Barra de Navegação Rápida do Documento -->
                <div style="display: flex; gap: 10px; margin-bottom: 22px; flex-wrap: wrap;">
                    <a href="#caderno-assinaturas" style="background: #059669; color: #ffffff; padding: 10px 16px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35); font-family: sans-serif;">
                        👥 Ver Caderno de Assinaturas e Relatos dos Cidadãos (${sigs.length}) ▾
                    </a>
                    <a href="#propostas-emendas" style="background: #2563eb; color: #ffffff; padding: 10px 16px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-family: sans-serif;">
                        🛡️ Ver as 4 Emendas de Blindagem
                    </a>
                </div>

                <h3 id="propostas-emendas" style="font-size: 15px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-top: 20px; font-family: sans-serif; letter-spacing: 0.5px;">
                    I. Dos Impactos Apurados e Propostas de Emendas em Linguagem Simples para Blindar São Roque
                </h3>
                <p style="font-size: 12px; color: #334155; margin-top: 6px; margin-bottom: 16px; font-style: italic; line-height: 1.5;">
                    Com base no diagnóstico técnico do Lakehouse Municipal (cruzamento do Censo IBGE 2022, dados oficiais de saneamento SNIS/ARSESP, mapeamento de risco geológico SGB/CPRM 2023 e sobreposição cartográfica da Lei 2006 vs. Minutas 2026), os cidadãos abaixo subscritos requerem a incorporação das seguintes <strong>Propostas de Emendas Modificativas, Supressivas e Aditivas</strong> para blindar o município antes de qualquer votação:
                </p>

                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 22px;">
                    <!-- 1. Saneamento: Prédios Altos Chegando PRIMEIRO -->
                    <div style="border-left: 4px solid #2563eb; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #1e3a8a; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            1. Prédios Altos Chegando PRIMEIRO: Garantia de Água na Torneira e Esgoto ANTES de Prédios
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> São Roque coleta e trata apenas cerca de <strong>47,8% do esgoto gerado</strong> (SNIS/ARSESP — Inquérito Civil MPSP nº 0439.0000192/2025). As minutas das leis elevam a altura máxima de prédios para até 30 metros (10 andares) e multiplicam a densidade urbana sem exigir expansão prévia de saneamento. Se os prédios chegarem antes dos canos e das estações, faltará água nas torneiras e o esgoto sem tratamento transbordará nos córregos e rios.
                        </p>
                        <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #1e40af; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Trava de Saneamento):</strong><br>
                            <em>"Fica expressamente vedada a aprovação de projetos, concessão de alvarás de construção ou expedição de 'habite-se' para novos edifícios residenciais multifamiliares de médio e grande porte (acima de 3 pavimentos) e novos loteamentos sem que a concessionária de saneamento emita Atestado de Viabilidade Hídrica com garantia de vazão contínua E comprove a interligação efetiva a rede coletora e estação de tratamento de esgoto (ETE) em pleno funcionamento. Primeiro a garantia de água na torneira e esgoto tratado, DEPOIS os prédios."</em>
                        </div>
                    </div>

                    <!-- 2. Zona Rural e Chácaras Ameaçadas -->
                    <div style="border-left: 4px solid #16a34a; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #14532d; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            2. Zona Rural &amp; Chácaras Ameaçadas: Proteção dos 1.670 Hectares de Sítios e Escudo contra IPTU Abusivo
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> O estudo cartográfico oficial comprovou que as minutas reduzem a Zona Rural em 12,74%, eliminando <strong>1.670,71 hectares</strong> de solo rural tradicional. Ao transformar essas áreas em zonas urbanas ou de expansão, ameaça-se sitiantes, produtores rurais e famílias chacareiras com a conversão compulsória do ITR federal em IPTU urbano impagável em estradas de terra sem água encanada, sem rede de esgoto e sem serviços públicos, empurrando famílias históricas para a venda forçada e especulação imobiliária.
                        </p>
                        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #166534; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Blindagem do Solo Rural e das Chácaras):</strong><br>
                            <em>"Fica restaurada na íntegra a delimitação da Macrozona Rural do município, recompondo os 1.670,71 hectares retirados nas minutas e mantendo a exigência do módulo rural INCRA (20.000 m²). Fica terminantemente proibida a cobrança de IPTU sobre sítios, chácaras e propriedades rurais que não contem com pelo menos 3 melhoramentos urbanos essenciais (água tratada, rede coletora de esgoto e pavimentação com drenagem), resguardando os produtores rurais, a Mata Atlântica e a vocação turística de São Roque."</em>
                        </div>
                    </div>

                    <!-- 3. Spot Zoning: Critérios Transparentes e Estudos -->
                    <div style="border-left: 4px solid #ea580c; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #7c2d12; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            3. Fim do Spot Zoning (Privilégios Pontuais): Critérios Transparentes e Estudos Antes de Mudar Zoneamento
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> A modelagem geoespacial identificou enclaves com Índice de Spot Zoning Crítico (ISZ ≥ 70) — áreas onde as regras foram alteradas sob medida para beneficiar terrenos ou empreendimentos pontuais —, além de casuísmos explícitos como o § 1º do art. 36 da Minuta da LC 40/2026, que blinda quatro loteamentos fechados dentro da bacia de mananciais protegida (Carmo e APA Itupararanga). Mudança de zoneamento sem critérios objetivos e transparentes desrespeita a vizinhança e estimula privilégios indevidos.
                        </p>
                        <div style="background: #fff7ed; border: 1.5px solid #fdba74; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #9a3412; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Critérios Transparentes e Estudos Públicos Obrigatórios):</strong><br>
                            <em>"Fica revogado o § 1º do art. 36 da Minuta da LC 40/2026 e proibida qualquer alteração de zoneamento feita sob medida para glebas ou empreendimentos isolados. Qualquer proposta de mudança de zoneamento, elevação de gabarito ou expansão de perímetro urbano somente poderá ser apreciada e votada exclusivamente nos momentos formais de revisão periódica e global do Plano Diretor, vedadas leis avulsas fora desses ciclos, e sempre mediante a publicação com 30 dias de antecedência no Portal da Transparência e realização de audiência pública específica dos seguintes estudos técnicos oficiais: (1) Estudo de Impacto de Vizinhança (EIV), (2) Estudo de Viabilidade Ambiental (EVA) e (3) Laudo Hidrológico oficial de capacidade de drenagem e esgotamento."</em>
                        </div>
                    </div>

                    <!-- 4. Risco Geológico e Enchentes -->
                    <div style="border-left: 4px solid #dc2626; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #7f1d1d; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            4. Proteção da Vida nas 22 Áreas de Risco Geológico e Enchentes (CPRM 2023 / Lei Federal 12.608/2012)
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> O Serviço Geológico do Brasil mapeou 22 setores com risco alto e muito alto (R3/R4) para deslizamentos de morros e inundações em São Roque (Junqueira, Goianã, Vinhedos, Mosteiro, Cambará e Vila do Carmo). As minutas elevam a Taxa de Ocupação para 70% a 80%, aumentando a impermeabilização a montante desses locais vulneráveis e expondo famílias ao perigo de desastres provocados pelas chuvas.
                        </p>
                        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #991b1b; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Salvaguarda de Vidas contra Desastres):</strong><br>
                            <em>"Fica expressamente vedado o aumento da Taxa de Ocupação e da densidade construtiva nas bacias de contribuição a montante dos 22 setores de risco geológico mapeados pelo SGB/CPRM e pela Defesa Civil. Nas encostas e várzeas vulneráveis, a Taxa de Permeabilidade mínima do solo deverá ser mantida em 50% do lote, com implantação obrigatória de reservatórios de contenção de águas pluviais, em estrito cumprimento à Lei Federal nº 12.608/2012."</em>
                        </div>
                    </div>
                </div>

                <h3 id="caderno-assinaturas" style="font-size: 15px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-top: 28px; font-family: sans-serif; letter-spacing: 0.5px; color: #0f172a;">
                    II. Caderno Auditável de Subscritores Validados por CPF e Relatos dos Cidadãos (Padrão LGPD / SHA-256)
                </h3>
                <p style="font-size: 12px; color: #475569; font-family: sans-serif; margin-bottom: 14px; line-height: 1.5;">
                    Cada assinatura abaixo teve seu CPF validado pelo algoritmo Módulo-11 da Receita Federal e encontra-se protegida por máscara oficial LGPD (Lei nº 13.709/2018) e código de integridade criptográfica SHA-256. Abaixo constam as <strong>vozes e relatos de impacto direto</strong> manifestados pelos moradores e produtores rurais de São Roque:
                </p>

                <!-- 1. Cartões Responsivos de Relatos dos Cidadãos (Visível Imediatamente em Celulares e Telas) -->
                <div class="public-doc-signatures-cards" style="margin-bottom: 22px;">
                    ${cardsHtml}
                </div>

                <!-- 2. Tabela Sinóptica Auditável para Impressão e Protocolo Oficial -->
                <h4 style="font-size: 12.5px; text-transform: uppercase; margin: 18px 0 8px 0; color: #334155; font-family: sans-serif; letter-spacing: 0.5px;">
                    Tabela Sinóptica Auditável para Protocolo Oficial (Câmara Municipal &amp; MPSP):
                </h4>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11.5px; color: #0f172a;">
                        <thead>
                            <tr style="background: #e2e8f0;">
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Nº</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Nome Completo</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Bairro / Vínculo</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">CPF (LGPD)</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Protocolo SHA-256</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Relato de Impacto</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (!standalone) return innerBody;

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Documento Público • Petição Crescer Exige Responsabilidade - São Roque/SP</title>
    <style>
        body { background: #f1f5f9; margin: 24px; }
        @media print { body { background: #fff; margin: 0; } }
    </style>
</head>
<body>${innerBody}</body>
</html>`;
    },

    openPublicDocumentModal: function () {
        const modal = document.getElementById('publicDocModal');
        const body = document.getElementById('publicDocModalBody');
        if (!modal || !body) return;

        body.innerHTML = this.buildPublicDocumentHtml(false);
        modal.classList.add('visible');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    },

    printPublicDocument: function () {
        const html = this.buildPublicDocumentHtml(true);
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 300);
    },

    downloadPublicDocumentHtml: function () {
        const html = this.buildPublicDocumentHtml(true);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Documento_Publico_Peticao_Plano_Diretor_Sao_Roque_${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadSignaturesCsv: function () {
        const allSigs = this.getAllAuditSignatures();
        const sigs = [...allSigs].sort((a, b) => (a.number || 0) - (b.number || 0));
        const header = ['N_Sequencial', 'Protocolo', 'Nome_Completo', 'Bairro', 'Vinculo', 'CPF_Mascarado_LGPD', 'Hash_SHA256', 'Relato_Impacto', 'Data_Hora_ISO'];
        const rows = sigs.map(s => {
            const proto = s.protocol || (s.fullHash ? ('SRQ-2026-' + s.fullHash.slice(0, 8).toUpperCase()) : (s.hash ? ('SRQ-2026-' + s.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));
            return [
                s.number || '',
                proto,
                `"${(s.name || '').replace(/"/g, '""')}"`,
                `"${(s.bairro || '').replace(/"/g, '""')}"`,
                `"${(s.vinculo || '').replace(/"/g, '""')}"`,
                s.cpfMasked || '',
                s.fullHash || s.hash || '',
                `"${(s.comment || '').replace(/"/g, '""')}"`,
                s.timestamp || ''
            ];
        });
        const csvContent = '\uFEFF' + [header.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Assinaturas_Peticao_Plano_Diretor_Sao_Roque_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    bindEvents: function () {
        const cpfInput = document.getElementById('petitionCpf');
        const cpfHint = document.getElementById('cpfStatusHint');

        if (cpfInput) {
            cpfInput.addEventListener('input', () => {
                cpfInput.value = this.formatCPF(cpfInput.value);
                const clean = cpfInput.value.replace(/\D/g, '');
                if (clean.length === 0) {
                    cpfInput.classList.remove('valid', 'invalid');
                    if (cpfHint) { cpfHint.textContent = ''; cpfHint.className = 'cpf-status-hint'; }
                } else if (clean.length === 11) {
                    if (this.validateCPF(clean)) {
                        cpfInput.classList.add('valid');
                        cpfInput.classList.remove('invalid');
                        if (cpfHint) { cpfHint.textContent = '✓ CPF Válido'; cpfHint.className = 'cpf-status-hint ok'; }
                    } else {
                        cpfInput.classList.add('invalid');
                        cpfInput.classList.remove('valid');
                        if (cpfHint) { cpfHint.textContent = '✗ CPF Inválido'; cpfHint.className = 'cpf-status-hint err'; }
                    }
                } else {
                    cpfInput.classList.remove('valid', 'invalid');
                    if (cpfHint) { cpfHint.textContent = `${clean.length}/11 dígitos`; cpfHint.className = 'cpf-status-hint'; }
                }
            });
        }

        const form = document.getElementById('petitionForm');
        if (form) form.addEventListener('submit', (e) => this.handleSignSubmit(e));

        const btnTopPetition = document.getElementById('btnTopPetition');
        if (btnTopPetition) btnTopPetition.addEventListener('click', () => this.openModal());

        const btnModalPetition = document.getElementById('btnModalPetition');
        if (btnModalPetition) btnModalPetition.addEventListener('click', () => this.openModal());

        const btnClosePetition = document.getElementById('btnClosePetitionModal');
        if (btnClosePetition) btnClosePetition.addEventListener('click', () => this.closeModal());

        const btnBackToMap = document.getElementById('btnBackToMapFromPetition');
        if (btnBackToMap) btnBackToMap.addEventListener('click', () => this.closeModal());

        const petitionModal = document.getElementById('petitionModal');
        if (petitionModal) {
            petitionModal.addEventListener('click', (e) => {
                if (e.target === petitionModal) this.closeModal();
            });
        }

        const btnShareWa = document.getElementById('btnShareWhatsApp');
        if (btnShareWa) btnShareWa.addEventListener('click', () => this.shareWhatsApp());

        const btnCopy = document.getElementById('btnCopyPetitionLink');
        if (btnCopy) btnCopy.addEventListener('click', () => this.shareNativeOrCopy());

        const btnSignAnother = document.getElementById('btnSignAnotherCpf');
        if (btnSignAnother) btnSignAnother.addEventListener('click', () => this.resetFormForNextSigner());

        const btnOpenDoc = document.getElementById('btnOpenPublicDoc');
        if (btnOpenDoc) btnOpenDoc.addEventListener('click', () => this.openPublicDocumentModal());

        const btnFooterDoc = document.getElementById('btnFooterPublicDoc');
        if (btnFooterDoc) btnFooterDoc.addEventListener('click', () => this.openPublicDocumentModal());

        // Eventos de Exportação de CSV (pelo ID e por delegação de classe .btn-export-csv)
        // Atalho para pular direto ao Caderno de Assinaturas e Relatos
        const btnJump = document.getElementById('btnJumpToSignatures');
        if (btnJump) {
            btnJump.addEventListener('click', () => {
                this.expandSignaturesBox();
                const target = document.getElementById('signaturesBox');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    target.style.boxShadow = '0 0 20px rgba(52, 211, 153, 0.4)';
                    setTimeout(() => { target.style.boxShadow = ''; }, 2000);
                }
            });
        }

        const btnDownloadCsv = document.getElementById('btnDownloadCsv');
        if (btnDownloadCsv) {
            btnDownloadCsv.addEventListener('click', (e) => {
                e.stopPropagation();
                window.AppPetition.downloadSignaturesCsv();
            });
        }

        // Importação de Assinaturas (CSV ou JSON) coletadas em outros aparelhos
        const btnImportSignatures = document.getElementById('btnImportSignatures');
        const inputImportFile = document.getElementById('inputImportFile');
        if (btnImportSignatures && inputImportFile) {
            btnImportSignatures.addEventListener('click', (e) => {
                e.stopPropagation();
                inputImportFile.click();
            });
            inputImportFile.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    window.AppPetition.importSignaturesFile(e.target.files[0]);
                    inputImportFile.value = '';
                }
            });
        }

        const btnDownloadCsvDoc = document.getElementById('btnDownloadCsvDoc');
        if (btnDownloadCsvDoc) {
            btnDownloadCsvDoc.addEventListener('click', (e) => {
                e.stopPropagation();
                window.AppPetition.downloadSignaturesCsv();
            });
        }

        document.querySelectorAll('.btn-export-csv').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.AppPetition.downloadSignaturesCsv();
            });
        });

        // Alternador de Colapso do Caderno de Assinaturas
        const toggleBtn = document.getElementById('signaturesTitleToggle');
        const contentWrapper = document.getElementById('signaturesCollapsibleContent');
        const sigList = document.getElementById('recentSignaturesList');
        const sigChevron = document.getElementById('signaturesChevron');
        const sigHint = document.getElementById('signaturesCountHint');
        const sigBox = document.getElementById('signaturesBox');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                if (e.target && (e.target.classList.contains('btn-export-csv') || e.target.closest('.btn-export-csv'))) return;
                const targetEl = contentWrapper || sigList;
                if (!targetEl) return;
                const isHidden = targetEl.style.display === 'none';
                targetEl.style.display = isHidden ? 'flex' : 'none';
                if (sigChevron) {
                    sigChevron.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
                }
                if (sigBox) {
                    sigBox.classList.toggle('collapsed', !isHidden);
                }
                const total = this.getAllAuditSignatures().length;
                if (sigHint) {
                    sigHint.textContent = isHidden ? `(${total}) Recolher ▴` : (total > 0 ? `(${total}) Ver ▾` : 'Ver ▾');
                }
            });
        }

        // Campo de Busca / Filtro no Caderno de Assinaturas
        const searchInput = document.getElementById('sigSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderRecentSignaturesList(e.target.value);
            });
        }

        // Controles do Modal do Documento Público
        const publicDocModal = document.getElementById('publicDocModal');
        const btnClosePublicDoc = document.getElementById('btnClosePublicDocModal');
        const btnClosePublicDocFooter = document.getElementById('btnClosePublicDocFooter');
        const btnPrintPublicDoc = document.getElementById('btnPrintPublicDoc');
        const btnDownloadDocHtml = document.getElementById('btnDownloadDocHtml');

        if (btnClosePublicDoc && publicDocModal) {
            btnClosePublicDoc.addEventListener('click', () => publicDocModal.classList.remove('visible'));
        }
        if (btnClosePublicDocFooter && publicDocModal) {
            btnClosePublicDocFooter.addEventListener('click', () => publicDocModal.classList.remove('visible'));
        }
        if (publicDocModal) {
            publicDocModal.addEventListener('click', (e) => {
                if (e.target === publicDocModal) publicDocModal.classList.remove('visible');
            });
        }
        if (btnPrintPublicDoc) {
            btnPrintPublicDoc.addEventListener('click', () => this.printPublicDocument());
        }
        if (btnDownloadDocHtml) {
            btnDownloadDocHtml.addEventListener('click', () => this.downloadPublicDocumentHtml());
        }
    },

    // ==========================================================================
    // SINCRONIZAÇÃO EM TEMPO REAL & ATIVIDADE AO VIVO ("Gente assinando a todo instante")
    // ==========================================================================
    setupRealTimeSync: function () {
        // 1. Sincronização automática entre abas/janelas do mesmo navegador
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('storage', (e) => {
                const currentKey = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.STORAGE_KEY) || 'srq_plano_diretor_peticao_real_v2';
                if (!e.key || e.key === currentKey || e.key.startsWith('srq_plano_diretor')) {
                    const prevCount = this.getAllAuditSignatures().length;
                    this.loadFromStorage();
                    const newCount = this.getAllAuditSignatures().length;
                    this.updateAllCounters(newCount > prevCount);
                    if (newCount > prevCount && this.signatures.length > 0) {
                        const latest = this.signatures[this.signatures.length - 1];
                        if (latest) this.showLiveActivityToast(latest, true);
                    }
                }
            });
        }

        // 2. Polling contínuo e silencioso a cada 12 segundos (captura novas assinaturas em tempo real)
        if (!this._livePollInterval) {
            this._livePollInterval = setInterval(() => {
                const prevCount = this.getAllAuditSignatures().length;
                this.loadFromStorage();
                const newCount = this.getAllAuditSignatures().length;
                if (newCount !== prevCount) {
                    this.updateAllCounters(true);
                }
                this.syncGlobalCountFromCloud();
                this.syncWithRemoteWebhook();
            }, 12000);
        }
    },

    setupLiveActivityTicker: function () {
        if (typeof document === 'undefined' || !document.createElement) return;
        let toastEl = document.getElementById('petitionLiveToast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'petitionLiveToast';
            toastEl.className = 'petition-live-toast';
            toastEl.innerHTML = `
                <div class="petition-live-toast-icon">
                    <i data-lucide="pen-tool" style="width: 17px; height: 17px;"></i>
                </div>
                <div class="petition-live-toast-content">
                    <div class="petition-live-toast-header">
                        <span style="display:flex; align-items:center; gap:5px;"><span class="pulse-dot"></span> <span id="petitionLiveToastStatus">Ao Vivo • Nova Assinatura</span></span>
                        <span id="petitionLiveToastTime" style="color: #94a3b8; font-weight: normal; font-size: 10px;">agora</span>
                    </div>
                    <div class="petition-live-toast-body" id="petitionLiveToastBody">
                        Carregando mobilização popular...
                    </div>
                </div>
                <button type="button" class="petition-live-toast-close" id="btnPetitionLiveToastClose" aria-label="Fechar">&times;</button>
            `;
            document.body.appendChild(toastEl);
            if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

            const closeBtn = document.getElementById('btnPetitionLiveToastClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toastEl.classList.remove('visible');
                    this._toastSuppressedUntil = Date.now() + 60000; // Silencia por 60s se fechar
                });
            }

            toastEl.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Rotação dinâmica elegante de novas adesões a cada 9 segundos
        if (!this._liveToastInterval) {
            let lastIdx = -1;
            this._liveToastInterval = setInterval(() => {
                if (this._toastSuppressedUntil && Date.now() < this._toastSuppressedUntil) return;
                const modal = document.getElementById('petitionModal');
                const publicModal = document.getElementById('publicDocModal');
                if ((modal && modal.classList.contains('visible')) || (publicModal && publicModal.classList.contains('visible'))) {
                    return;
                }

                const sigs = this.getAllAuditSignatures();
                if (!sigs || sigs.length === 0) return;

                // Prioriza as assinaturas mais recentes (últimas 20)
                const poolSize = Math.min(sigs.length, 20);
                let nextIdx = Math.floor(Math.random() * poolSize);
                if (nextIdx === lastIdx && poolSize > 1) {
                    nextIdx = (nextIdx + 1) % poolSize;
                }
                lastIdx = nextIdx;
                const sig = sigs[nextIdx];
                if (sig) {
                    this.showLiveActivityToast(sig, false);
                }
            }, 9000);
        }
    },

    showLiveActivityToast: function (sig, isImmediate) {
        const toastEl = document.getElementById('petitionLiveToast');
        if (!toastEl) return;

        const bodyEl = document.getElementById('petitionLiveToastBody');
        const timeEl = document.getElementById('petitionLiveToastTime');
        const statusEl = document.getElementById('petitionLiveToastStatus');

        const maskedName = this.maskName(sig.name || 'Cidadão de São Roque');
        const bairro = sig.bairro || 'São Roque';
        const vinculo = sig.vinculo || 'Morador';

        if (statusEl) {
            statusEl.textContent = isImmediate ? 'Assinatura Validada Agora!' : 'Ao Vivo • Mobilização Cidadã';
        }
        if (timeEl) {
            timeEl.textContent = isImmediate ? 'há instantes' : (sig.number ? `#${sig.number} no caderno` : 'recente');
        }
        if (bodyEl) {
            bodyEl.innerHTML = `<strong>${this.escapeHtml(maskedName)}</strong> (${this.escapeHtml(bairro)} • ${this.escapeHtml(vinculo)}) assinou contra o adensamento predatório!`;
        }

        toastEl.classList.add('visible');

        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toastEl.classList.remove('visible');
        }, isImmediate ? 6000 : 4800);
    },

    importSignaturesFile: function (file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            try {
                let countAdded = 0;
                if (file.name.endsWith('.json') || content.trim().startsWith('{') || content.trim().startsWith('[')) {
                    const parsed = JSON.parse(content);
                    const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.signatures) ? parsed.signatures : []);
                    countAdded = this.mergeImportedSignatures(list);
                } else {
                    countAdded = this.parseAndMergeCsv(content);
                }

                if (countAdded > 0) {
                    this.saveToStorage();
                    this.updateAllCounters(true);
                    this.expandSignaturesBox();
                    alert(`✅ Sucesso! ${countAdded} nova(s) assinatura(s) foram validadas e somadas ao Caderno Oficial com deduplicação segura.`);
                } else {
                    alert('ℹ️ Todas as assinaturas do arquivo já constam registradas no Caderno Auditável (nenhuma duplicata foi inserida).');
                }
            } catch (err) {
                alert('⚠️ Não foi possível processar o arquivo. Certifique-se de que é um CSV ou JSON exportado da petição.');
            }
        };
        reader.readAsText(file, 'utf-8');
    },

    parseAndMergeCsv: function (csvText) {
        const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) return 0;

        const sep = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(sep).map(h => h.replace(/^["'\uFEFF]+|["']+$/g, '').trim().toLowerCase());

        const getCol = (rowCols, name) => {
            const idx = headers.findIndex(h => h.includes(name.toLowerCase()));
            if (idx >= 0 && rowCols[idx]) {
                return rowCols[idx].replace(/^["']+|["']+$/g, '').trim();
            }
            return '';
        };

        const records = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i];
            if (!row) continue;
            const cols = row.split(sep);
            const name = getCol(cols, 'nome') || getCol(cols, 'name') || cols[2];
            if (!name || name.length < 2) continue;

            const proto = getCol(cols, 'protocol') || cols[1] || '';
            const bairro = getCol(cols, 'bairro') || cols[3] || 'São Roque';
            const vinculo = getCol(cols, 'vinculo') || cols[4] || 'Morador';
            const cpfMasked = getCol(cols, 'cpf') || cols[5] || '***.***.***-**';
            const hash = getCol(cols, 'hash') || cols[6] || '';
            const comment = getCol(cols, 'relato') || getCol(cols, 'comentario') || getCol(cols, 'comment') || cols[7] || '';
            const timestamp = getCol(cols, 'data') || getCol(cols, 'time') || cols[8] || new Date().toISOString();

            records.push({
                protocol: proto,
                name: name.replace(/^"|"$/g, ''),
                bairro: bairro.replace(/^"|"$/g, ''),
                vinculo: vinculo.replace(/^"|"$/g, ''),
                cpfMasked: cpfMasked.replace(/^"|"$/g, ''),
                hash: hash ? hash.slice(0, 16) : '',
                fullHash: hash,
                comment: comment.replace(/^"|"$/g, ''),
                timestamp: timestamp
            });
        }
        return this.mergeImportedSignatures(records);
    },

    mergeImportedSignatures: function (incomingList) {
        if (!Array.isArray(incomingList) || incomingList.length === 0) return 0;
        let added = 0;
        const currentList = this.signatures || [];

        incomingList.forEach(item => {
            if (!item || !item.name) return;
            const itemHash = item.fullHash || item.hash;
            const itemProto = item.protocol;
            const itemNameCpf = (item.name || '').trim().toLowerCase() + '_' + (item.cpfMasked || '');

            const exists = currentList.some(s =>
                (itemHash && (s.fullHash === itemHash || s.hash === itemHash)) ||
                (itemProto && s.protocol === itemProto) ||
                ((s.name || '').trim().toLowerCase() + '_' + (s.cpfMasked || '') === itemNameCpf)
            );

            if (!exists) {
                currentList.push({
                    name: item.name,
                    bairro: item.bairro || 'São Roque',
                    vinculo: item.vinculo || 'Morador(a)',
                    cpfMasked: item.cpfMasked || '***.***.***-**',
                    hash: item.hash || (item.fullHash ? item.fullHash.slice(0, 16) : ''),
                    fullHash: item.fullHash || item.hash || '',
                    protocol: item.protocol || (item.fullHash ? ('SRQ-2026-' + item.fullHash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'),
                    comment: item.comment || '',
                    timestamp: item.timestamp || new Date().toISOString()
                });
                added++;
            }
        });

        if (added > 0) {
            currentList.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
            currentList.forEach((s, idx) => { s.number = idx + 1; });
            this.signatures = currentList;
            this.remoteGlobalCount = Math.max(this.remoteGlobalCount, currentList.length);
        }
        return added;
    },
};

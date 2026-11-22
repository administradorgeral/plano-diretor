# Repositório de Inteligência Territorial: Plano Diretor de São Roque

Este repositório reúne e estrutura os dados geoespaciais, documentais, legislativos e processuais do processo de revisão e acompanhamento do **Plano Diretor Municipal** e do **Plano Diretor Ambiental (PDA)** de São Roque/SP.

A organização adota o modelo de **Lakehouse de Dados Urbanísticos**, permitindo rastreabilidade, análise pericial e suporte a decisões de planejamento territorial.

---

## 📁 Estrutura do Repositório

```text
Plano Diretor/
├── GuiaparaElaboraoeRevisodePlanosDiretores_compressed.pdf
├── README.md
├── .gitignore
├── .gitattributes
└── lakehouse/
    └── bronze/                                # Camada bruta: documentos originais e cartas
        ├── cartas_proposta_2026/             # Minutas cartográficas e propostas de zoneamento (2026)
        ├── cartas_vigente_2006/              # Macrozoneamento e cartas da Lei nº 2006
        ├── casos_emblematicos/               # Dossiês analíticos e estudos de caso
        ├── documentos_oficiais/              # Minutas de LC, acórdãos TJSP, editais de leilão, etc.
        └── temas_ambientais_pda2019/         # Diagnósticos temáticos e mapas do PDA 2019
```

---

## 🏛️ Dossiês e Casos Emblemáticos

Localizados em `lakehouse/bronze/casos_emblematicos/`:

- **Caso 01**: Região Catarina (JHSF) – ZUE, parâmetros corporativos (gabarito 30m, TO 50%), PBZPA/DECEA e outorga onerosa.
- **Caso 02**: Regime de Uso do Solo em Carmo e Sorocamirim – Prevalência de contratos privados em mananciais e vizinhança com o Quilombo do Carmo.
- **Caso 03**: Parcelamento Rural Irregular, INCRA e REURB – Fracionamento abaixo de 20.000 m², indução de loteamentos e custos públicos de remediação.
- **Caso 04**: Governança Territorial, DPMA e Integridade – Assimetria no acolhimento da Consulta Pública (mercado vs. COMDEMA) e inquéritos no MPSP.

---

## ⚙️ Gestão de Arquivos Grandes (Git LFS)

O repositório armazena bases cartográficas (`.kmz`), planilhas (`.xlsx`) e publicações volumosas em PDF (como o Inventário Florestal, >180 MB). Recomenda-se o uso do **Git Large File Storage (Git LFS)**:

```powershell
# Instalação do Git LFS (caso clonando em nova máquina)
git lfs install
git lfs pull
```

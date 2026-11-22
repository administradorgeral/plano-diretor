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

- **Caso 01**: Complexo Catarina (JHSF) – Aeródromo Executivo (SBJH), Outlet, parâmetros e condicionantes.
- **Caso 02**: Desafetações (LC 125) e alienação em leilão público (PNCP).
- **Caso 03**: Regime de uso e ocupação do solo em Carmo e Sorocamirim.
- **Caso 04**: Parcelamento rural irregular, INCRA e diretrizes de REURB.
- **Caso 05**: Governança participativa, DPMA e processo de consulta pública.

---

## ⚙️ Gestão de Arquivos Grandes (Git LFS)

O repositório armazena bases cartográficas (`.kmz`), planilhas (`.xlsx`) e publicações volumosas em PDF (como o Inventário Florestal, >180 MB). Recomenda-se o uso do **Git Large File Storage (Git LFS)**:

```powershell
# Instalação do Git LFS (caso clonando em nova máquina)
git lfs install
git lfs pull
```

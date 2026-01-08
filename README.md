# 📂 Portfolio Suite

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Portfólio profissional fullstack desenvolvido com React e Node.js, apresentando projetos reais de Machine Learning e APIs em produção, com sistema completo de gerenciamento de conteúdo e formulário de contato integrado.**

## 🌟 Destaques

- 🧠 **API REST completa** com arquitetura MVC (controllers + repositories), Prisma ORM, PostgreSQL e autenticação JWT
- 🎨 **Frontend moderno e responsivo** em React 18 + TypeScript + TailwindCSS, com design baseado no template [Atom](https://www.tailawesome.com/resources/atom)
- 📬 **Sistema de contato profissional** com envio de emails via SMTP e cards de informação configuráveis dinamicamente
- 👥 **Arquitetura multiusuário**: cada conta gerencia seu próprio portfólio, projetos, experiências profissionais e serviços oferecidos
- 🐳 **Infraestrutura containerizada** com Docker Compose incluindo frontend, backend, PostgreSQL e Nginx reverso proxy
- 📸 **Galeria de projetos** com suporte a imagens e screenshots dos projetos em destaque
- 🔒 **Segurança robusta** com JWT, validação de dados via Zod e isolamento de dados por usuário

## 🏗️ Arquitetura

```
portfolio-suite/
├── backend/          # API Node.js
│   ├── src/
│   │   ├── controllers/   # regras de negócio (Auth, Profile, Projects etc.)
│   │   ├── repositories/  # Prisma + Postgres
│   │   ├── routes/        # views (Express)
│   │   ├── schemas/       # validações Zod
│   │   └── services/      # integração SMTP, bootstrap
│   └── prisma/       # schema, migrations
├── frontend/         # SPA React (Vite + Tailwind)
├── configs/          # Templates de ambiente
├── docker-compose.yml
├── Makefile
└── README.md
```

### Componentes
- **Backend**: Express, Prisma, Zod, Nodemailer, JWT
- **Frontend**: React, Vite, Tailwind, layout Atom customizado
- **Infra**: Docker Compose, Postgres, Nginx para servir SPA/APIs

## 🚀 Como Executar

### Requisitos
- Node.js 18+
- npm 10+
- Docker Desktop ou Engine + Compose

### 1. Configurar variáveis de ambiente

```bash
cp configs/portfolio.env.example configs/.env
cp configs/portfolio.env.example configs/.env.prod
```

Edite cada arquivo com os valores reais (local e produção). Exemplo de conteúdo:

```
PORT=3001
JWT_SECRET=troque_por_um_segredo_seguro
PORTFOLIO_DEFAULT_EMAIL=lucas.biason@foxcodesoftware.com
PORTFOLIO_DEFAULT_PASSWORD=senha_portfolio
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contato@seuprojeto.com
SMTP_PASS=senha-ou-app-password
CONTACT_EMAIL=destinatario@seuprojeto.com
ASSET_BASE_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001
DATABASE_URL=postgresql://portfolio:portfolio@portfolio-db:5432/portfolio?schema=public
```

> **Como obter dados SMTP?** Consulte o provedor do seu email:
> - Gmail: `smtp.gmail.com`, porta `587`, exige **App Password** (conta > Segurança > App passwords).
> - Outlook/Hotmail: `smtp.office365.com`, porta `587`, Use senha normal ou app password (2FA).
> - Zoho: `smtp.zoho.com`, porta `587`.
> Sempre habilite TLS (`SMTP_SECURE=false` com porta 587) ou SSL (`true` com porta 465) conforme o serviço.

### 2. Instalar dependências (modo dev)

```bash
make install
```

### 3. Aplicar migrations do Prisma

```bash
cd backend
npx prisma migrate deploy
cd ..
```

### 4. Rodar em desenvolvimento

```bash
# Backend + Frontend (dois terminais)
make backend    # http://localhost:3001
make frontend   # http://localhost:5173
```

### 5. Rodar com Docker (produção)

```bash
make up
# Frontend: http://localhost:5173
# API:      http://localhost:3001
```

Parar e limpar:
```bash
make down
make clean
```

## 🔌 Endpoints da API

A especificação completa está em [`docs/API.md`](docs/API.md) e há uma collection Postman pronta em `docs/postman/PortfolioSuite.postman_collection.json`. Principais rotas:

| Método | Rota                    | Descrição                                  | Auth |
|--------|-------------------------|--------------------------------------------|------|
| GET    | `/health`               | Health check                               | Não  |
| POST   | `/api/auth/login`       | Retorna JWT                                | Não  |
| GET    | `/api/user`             | Perfil público (usado no frontend)         | Não  |
| GET    | `/api/projects`         | Projetos públicos (`?featured=true/false`) | Não  |
| GET    | `/api/projects/me`      | Lista projetos do usuário logado           | JWT  |
| POST   | `/api/projects`         | CRUD completo de projetos                  | JWT  |
| GET    | `/api/experience`       | Timeline pública                           | Não  |
| GET    | `/api/services`         | Serviços públicos                          | Não  |
| GET    | `/api/contact/info`     | Conteúdo e cards da seção Contato          | Não  |
| POST   | `/api/contact`          | Envio de mensagem (SMTP)                   | Não  |
| GET    | `/api/admin/stats`      | Métricas gerais                            | JWT  |

### Autenticação
- Fluxo baseado em **JWT** (`/api/auth/login`). Utilize o email/senha definidos em `PORTFOLIO_DEFAULT_*` ou crie usuários via `/api/auth/register`.
- O frontend consome apenas rotas públicas usando o usuário padrão definido em `PORTFOLIO_DEFAULT_EMAIL`.

## 🖥️ Frontend
- Hero com background gradiente, foto, social icons e CTA
- Seções Sobre, Especialidades, Projetos (dinâmico), Experiência e Contato
- Formulário de contato inspirado no layout Atom, alimentando `/api/contact`
- Componentes Tailwind 3.x com tipografia `Raleway` e `Open Sans`

## 🎯 Demo

Acesse o portfólio em produção: **[lucasbiason.com](https://lucasbiason.com)**

## 🛠️ Makefile

```
make install   # instala deps
make backend   # inicia API (nodemon)
make frontend  # inicia SPA
make up        # sobe stack Docker
make down      # derruba stack
make clean     # remove node_modules / dist
```

## 📝 Changelog
Veja [CHANGELOG.md](CHANGELOG.md).

## 📄 Licença
Este projeto está licenciado sob a [MIT License](LICENSE).

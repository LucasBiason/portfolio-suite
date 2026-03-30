# Portfolio Suite

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-Privado-red.svg)

Portfolio profissional completo com painel administrativo, construido com Node.js (Express + Prisma + PostgreSQL) e React 19 (Vite + Tailwind CSS). Deploy em VPS com Docker Compose e nginx.

<p align="center">
  <img src="assets/screenshots/02-dashboard.png" alt="Admin Dashboard" width="90%">
</p>

---

## Funcionalidades

- **4 paginas publicas** - Landing, Projetos, Historico Profissional, Stacks & Ferramentas
- **12 paginas admin** - Dashboard com graficos, CRUD completo de todos os modulos, configuracoes
- **17 modelos Prisma** - Relacoes many-to-many, reordenacao automatica, upload de arquivos
- **Temas dinamicos** - Paleta de cores, tipografia e textos configuraveis pelo admin
- **SMTP integrado** - Formulario de contato com envio de email configuravel

---

## Arquitetura

```mermaid
graph TB
    Browser["Browser"]

    subgraph VPS["VPS Hostinger"]
        Nginx["nginx<br/>:80/:443<br/>Reverse Proxy"]

        subgraph Docker["Docker Network (portfolio-net)"]
            Frontend["Frontend<br/>React 19 + Vite<br/>nginx :80"]
            Backend["Backend<br/>Express + Prisma<br/>:3001"]
            DB["PostgreSQL 16<br/>:5432"]
        end
    end

    Browser --> Nginx
    Nginx -->|"/ (SPA)"| Frontend
    Nginx -->|"/api/*"| Backend
    Nginx -->|"/assets/img/*"| Backend
    Backend --> DB
    Frontend -.->|"fetch /api/*"| Backend

    style Browser fill:#2e3440,stroke:#88c0d0,color:#eceff4
    style Nginx fill:#5e81ac,stroke:#81a1c1,color:#eceff4
    style Frontend fill:#0047AB,stroke:#30A0FF,color:#eceff4
    style Backend fill:#a3be8c,stroke:#8fbcbb,color:#2e3440
    style DB fill:#d08770,stroke:#bf616a,color:#2e3440
```

### Fluxo de Autenticacao

```mermaid
sequenceDiagram
    participant B as Browser
    participant F as Frontend
    participant A as Backend API
    participant D as PostgreSQL

    B->>F: GET /admin/login
    F-->>B: Pagina de Login

    B->>F: POST email + senha
    F->>A: POST /api/auth/login
    A->>D: SELECT User (email)
    D-->>A: passwordHash
    A->>A: bcrypt.compare()
    A-->>F: JWT Token
    F->>F: localStorage.setItem(token)
    F-->>B: Redirect /admin/dashboard

    B->>F: GET /admin/*
    F->>A: GET /api/* (Bearer JWT)
    A->>A: verify JWT
    A->>D: Query dados
    D-->>A: Resultados
    A-->>F: JSON
    F-->>B: Renderiza pagina
```

### Modelo de Dados (simplificado)

```mermaid
erDiagram
    User ||--o| Profile : has
    User ||--o| SiteSettings : has
    User ||--o{ Project : owns
    User ||--o{ CareerEntry : owns
    User ||--o{ StackDetail : owns
    User ||--o{ Category : owns
    User ||--o{ Domain : owns
    User ||--o{ Service : owns
    User ||--o{ ContactInfo : owns
    User ||--o{ Education : owns
    User ||--o{ Experience : owns

    Project }o--o{ Category : "ProjectCategory"
    Project }o--o{ StackDetail : "ProjectStack"
    Project ||--o{ ProjectImage : has

    CareerEntry }o--o{ StackDetail : "CareerStack"
    CareerEntry }o--o{ Domain : "CareerDomain"

    StackDetail }o--|| Category : belongs_to
```

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Node.js 18, Express, Prisma ORM, PostgreSQL 16, JWT, Zod, Multer |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Infra** | Docker Compose, nginx, VPS Hostinger |

---

## Instalacao

### Pre-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento)

### Configuracao

1. Clone o repositorio:
```bash
git clone https://github.com/LucasBiason/portfolio-suite.git
cd portfolio-suite
```

2. Crie o arquivo de variaveis de ambiente:
```bash
cp configs/portfolio.env.example configs/.env
```

3. Edite `configs/.env` com suas credenciais:
```env
ADMIN_USERNAME=seu_usuario
ADMIN_PASSWORD=sua_senha_segura
JWT_SECRET=seu_segredo_jwt_seguro
PORTFOLIO_DEFAULT_EMAIL=seu@email.com
PORTFOLIO_DEFAULT_PASSWORD=sua_senha
DATABASE_URL=postgresql://portfolio:portfolio@database:5432/portfolio
```

### Desenvolvimento

```bash
docker compose up -d
```

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Database | localhost:5434 |

### Producao

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Seed (dados iniciais)

```bash
cd backend
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5434/portfolio" npx prisma db seed
```

---

## Estrutura

```
portfolio-suite/
  backend/
    src/
      controllers/    # 12 controllers
      repositories/   # Repository pattern com Prisma
      routes/         # Express routes
      schemas/        # Zod validation
      utils/          # JWT, password, reorder, slug
    prisma/
      schema.prisma   # 17 modelos
      seed.ts         # Dados iniciais
  frontend/
    src/
      pages/
        admin/        # 12 paginas admin
        *.tsx          # 4 paginas publicas
      components/     # Componentes compartilhados
      hooks/          # Custom hooks
      services/       # API client
  nginx/              # Configuracao nginx (producao)
  configs/            # Variaveis de ambiente (gitignored)
  docs/               # Documentacao e diagramas
  assets/screenshots/ # Screenshots do admin
```

---

## Documentacao

- [Arquitetura](docs/architecture.md) - Diagramas Mermaid detalhados
- [Diagrama de Banco](docs/database.dbml) - Modelo de dados (sintaxe DBML para dbdiagram.io)
- [Colecao Postman](docs/postman/) - 46 requests organizados por dominio

---

## Licenca

Privado - Lucas Biason

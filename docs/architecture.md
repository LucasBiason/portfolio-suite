# Arquitetura - Portfolio Suite

## Visão Geral

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

## Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant B as Browser
    participant F as Frontend
    participant A as Backend API
    participant D as PostgreSQL

    B->>F: GET /admin/login
    F-->>B: Página de Login

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
    F-->>B: Renderiza página
```

## Fluxo Público (sem autenticação)

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as nginx
    participant F as Frontend
    participant A as Backend API

    B->>N: GET /
    N->>F: proxy_pass :80
    F-->>N: index.html (SPA)
    N-->>B: HTML

    B->>N: GET /api/stacks
    N->>A: proxy_pass :3001
    Note over A: Rota pública (sem JWT)
    A-->>N: JSON
    N-->>B: Dados das stacks
```

## Componentes

### Frontend (React 19 + TypeScript + Vite)
- **Páginas públicas**: Landing, Projetos, Histórico, Stacks
- **Painel Admin**: 12 páginas com CRUD completo
- **Autenticação**: JWT salvo em localStorage
- **Temas**: Cores dinâmicas via CSS custom properties

### Backend (Node.js + Express + Prisma)
- **17 modelos** no Prisma schema
- **14+ endpoints** REST
- **JWT** para autenticação de rotas admin
- **Rotas públicas** sem auth para portfólio
- **Upload de arquivos** via Multer
- **Reordenação automática** (`reorderOnSave`)

### Banco de Dados (PostgreSQL 16)
- **Relações many-to-many**: ProjectCategory, ProjectStack, CareerStack, CareerDomain
- **FK**: StackDetail -> Category
- **Diagrama completo**: `docs/database.dbml`

### Infraestrutura
- **Docker Compose** para dev e produção
- **nginx** como reverse proxy (produção)
- **Variáveis de ambiente** em `configs/.env` (gitignored)
- **Multi-serviço**: nginx roteia também para outros projetos no mesmo VPS

## Deployment

```bash
# Produção (VPS)
docker compose -f docker-compose.prod.yml up -d --build

# Desenvolvimento (local)
docker compose up -d
```

### Portas
| Serviço | Dev | Produção |
|---------|-----|----------|
| Frontend | 5173 | 80 (via nginx) |
| Backend | 3001 | 3001 (interno) |
| Database | 5434 | 5432 (interno) |
| nginx | - | 80/443 |

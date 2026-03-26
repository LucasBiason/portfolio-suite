# Portfolio Suite

Portfólio profissional completo com painel administrativo, construído com Node.js (Express + Prisma + PostgreSQL) e React 19 (Vite + Tailwind CSS). Deploy em VPS com Docker Compose e nginx.

![Admin Dashboard](assets/screenshots/02-dashboard.png)

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Node.js 18, Express, Prisma ORM, PostgreSQL 16, JWT, Zod, Multer |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Infra** | Docker Compose, nginx, VPS Hostinger |

## Instalação

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento)

### Configuração

1. Clone o repositório:
```bash
git clone https://github.com/LucasBiason/portfolio-suite.git
cd portfolio-suite
```

2. Crie o arquivo de variáveis de ambiente:
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

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Database | localhost:5434 |

### Produção

1. Crie `configs/.env.prod` com as variáveis de produção

2. Build e deploy:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Seed (dados iniciais)

```bash
cd backend
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5434/portfolio" npx prisma db seed
```

## Arquitetura

![Visão Geral](docs/diagrams/architecture-overview.png)

### Fluxo de Autenticação

![Auth Flow](docs/diagrams/auth-flow.png)

### Modelo de Dados

![Database](docs/diagrams/database-diagram.png)

## Documentação

- [Arquitetura](docs/architecture.md) - Diagramas Mermaid detalhados
- [Diagrama de Banco](docs/database.dbml) - Modelo de dados (sintaxe DBML para dbdiagram.io)
- [Coleção Postman](docs/postman/) - 46 requests organizados por domínio

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
        admin/        # 12 páginas admin
        *.tsx          # 4 páginas públicas
      components/     # Componentes compartilhados
      hooks/          # Custom hooks
      services/       # API client
  nginx/              # Configuração nginx (produção)
  configs/            # Variáveis de ambiente (gitignored)
  docs/               # Documentação e diagramas
  assets/screenshots/ # Screenshots do admin
```

## Licença

Privado - Lucas Biason

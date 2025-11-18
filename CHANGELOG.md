# Changelog

## [1.0.0] - 2025-11-18

### Added
- Sistema completo de autenticação JWT com login automático no frontend
- Upload e download de imagens por usuário e tag (avatar, projetos, etc.)
- Sistema de assets com endpoints `/api/assets/upload`, `/api/assets/:tag`, `/api/assets`
- Seed SQL completo com dados iniciais (usuário, perfil, projetos, experiências, serviços, contatos)
- Deploy automatizado para Hostinger VPS com script Python
- Configuração SSL/HTTPS preparada com Let's Encrypt
- Frontend com autenticação automática e gerenciamento de token
- Nginx configurado para frontend e backend com subdomínios
- Docker Compose para produção com health checks
- Variáveis de ambiente centralizadas em `configs/.env.prod`

### Changed
- Removido sistema público do portfolio (agora requer autenticação)
- Migrado dados padrão de `backend/src/data` para `portfolio_seed.sql`
- Removidos `BootstrapService` e `PublicPortfolioService`
- Todas as rotas agora requerem autenticação JWT
- Frontend atualizado para fazer login automático com credenciais do `.env`
- API base URL configurada dinamicamente baseada no hostname

### Fixed
- Erro "Token not provided" resolvido com login automático
- CORS configurado corretamente no Nginx
- TypeScript errors corrigidos em controllers
- Validação de campos opcionais corrigida no Prisma

### Security
- Senhas do banco de dados e JWT geradas automaticamente com valores seguros
- Configuração SSL/HTTPS preparada para produção
- Variáveis sensíveis movidas para `.env.prod` (não versionado)

## [0.1.0] - 2025-11-12

### Added
- Backend Node.js com rotas de projetos, contato e autenticação básica
- Frontend React com setup TypeScript/Tailwind
- Docker Compose orquestrando frontend e backend
- Templates de ambiente em `configs/`
- Makefile e documentação inicial

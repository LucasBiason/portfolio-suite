# Changelog

## [1.1.0] - 2026-01-09

### Added
- Modal de visualização de imagens dos projetos com suporte a ESC e clique fora
- Componente ImageModal para exibição ampliada de screenshots
- Nova imagem do Engineering Knowledge Base gerada via ChatGPT
- Documentação de assets em `docs/README_ASSETS.md`

### Changed
- Carrossel de projetos com navegação externa (setas fora do card)
- Engineering Knowledge Base: desabilitado clique na imagem (apenas visualização)
- Outros projetos mantêm funcionalidade de clique para abrir modal
- Nginx configurado para servir assets de projetos via proxy do backend
- Hero component com fallback melhorado para avatar

### Fixed
- Corrigido problema de modal abrindo dentro do carrossel
- Corrigido loop infinito de erros ao carregar avatar
- Corrigido 404 de assets JavaScript/CSS no frontend
- Ajustado proxy do Nginx para servir apenas `/assets/img/` e `/assets/projects/` do backend

### Removed
- Scripts temporários removidos do repositório (`backend/scripts/`)
- Arquivos de feedback e documentação temporária removidos
- Pasta `backend/scripts/` adicionada ao `.gitignore`

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

# Changelog

## [2.0.0] - 2026-03-26

### Added
- **StackDetail reestruturado**: `yearsOfUse: String` substituído por `startYear: Int` + `endYear: Int?`, `category: String` substituído por `categoryId` FK para model Category
- **9 categorias de stack** com cores e ícones (Linguagens, Frameworks Backend, Databases, Mensageria/Filas, Cloud/Infra, IA/ML, Frontend, Testes/Qualidade)
- **Dashboard completo** com gráficos interativos: pizza de níveis de stacks, barras de projetos por categoria, stacks por categoria, histórico por domínio, indicadores de saúde do portfólio
- **Tooltips hover** em todos os gráficos (barras e pizza) com percentuais
- **Função genérica `reorderOnSave`** em `utils/reorder.ts` integrada em todos os 8 repositories com campo order
- **Página de Categorias** reescrita: filtro por tipo (Projeto/Stack) com chips coloridos, busca debounced, tabela com sort e paginação
- **Página de Domínios** reescrita: busca, sort, paginação inline (sem DataTable)
- **Contatos**: chips de tipo com cores (Social #b48ead / Contact #5e81ac)
- **Serviços**: coluna de descrição na tabela
- **Login**: interface moderna com ícones de fundo temáticos, glassmorphism, toggle de senha
- **Hints de ícones**: Stacks aponta para devicon.dev, Contatos para lucide.dev/icons
- **Playwright separado** de pytest como stack independente
- **Screenshots** de todas as 12 páginas admin em `assets/screenshots/`
- **Deploy** em VPS Hostinger com Docker Compose e nginx
- **Diagrama de banco** em `docs/database.dbml`
- **Diagrama de arquitetura** em `docs/architecture.md`

### Changed
- Stats de stacks: `totalPatterns`/`totalSolutions` substituídos por `expertCount`, `advancedCount`, `avgYears`, `levelDistribution`
- Dashboard: removido bloco de 4 stats de projetos, removido gráfico de histórico por contrato
- Gráfico pizza de níveis: layout 2 colunas ao lado de projetos por categoria (4 colunas)
- Stacks reescritas: foco em competência técnica (métricas, volume, profundidade) sem repetir histórico profissional
- Correção de acentuação em todos os textos do sistema

### Fixed
- Campo fantasma no formulário de edição de stack removido
- `CareerPage`: `category.includes()` corrigido para `category?.name?.includes()` (category agora é objeto)
- `AdminProjects`: `STACK_CATEGORY_COLORS[category]` corrigido para `category?.color`
- nginx: `threat-modeling-frontend` adicionado ao `extra_hosts` no compose prod

### Security
- **Removido auto-login** com credenciais no frontend (VITE_DEFAULT_EMAIL/PASSWORD)
- Credenciais de banco movidas para variáveis de ambiente nos docker-compose
- Senha do admin alterada
- `getAuthHeaders` agora usa apenas token JWT do localStorage
- Redirect automático para `/admin/login` em caso de 401

## [1.1.0] - 2026-01-09

### Added
- Modal de visualização de imagens dos projetos com suporte a ESC e clique fora
- Componente ImageModal para exibição ampliada de screenshots
- Nova imagem do Engineering Knowledge Base gerada via ChatGPT
- Documentação de assets em `docs/README_ASSETS.md`

# Frontend do Portfólio – Lucas Biason

Aplicação React + Vite responsável pela camada visual do portfólio “Portfolio as API”. O frontend consome a API Node (Express) disponibilizada em `https://api.lucasbiason.com` e permite exibir projetos, jornada profissional e formulário de contato.

## Stack

- React 18 + Vite
- TypeScript
- Tailwind CSS
- Boxicons
- Axios nativo (fetch API)

## Requisitos

- Node.js 20+
- npm 10+
- API rodando em `http://localhost:3001`

## Instalação

```bash
npm install
```

## Scripts

| Comando              | Descrição                                      |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Inicia Vite em modo desenvolvimento (5173)     |
| `npm run build`      | Gera build otimizado em `dist/`                |
| `npm run preview`    | Sobe preview local do build                    |
| `npm run lint`       | Executa ESLint                                 |

## Variáveis de Ambiente

A aplicação detecta automaticamente o ambiente:

- `localhost` → usa `http://localhost:3001`
- Produção (`lucasbiason.com`) → usa `https://api.lucasbiason.com`

Opcionalmente, defina `VITE_API_URL` para forçar um endpoint.

## Estrutura de Pastas

```
frontend/
├─ public/             # assets estáticos
├─ src/
│  ├─ components/      # componentes reutilizáveis
│  ├─ hooks/           # hooks customizados (useProjects)
│  ├─ services/        # chamadas HTTP (api.ts)
│  ├─ styles (index.css) / assets
│  └─ App.tsx / main.tsx
├─ tsconfig.json       # configuração única de TypeScript
└─ vite.config.ts
```

## Padrões de Código

- Componentes em PascalCase (`Hero.tsx`)
- Hooks em camelCase iniciando por `use`
- Serviços em camelCase (`api.ts`)
- Estilos em Tailwind CSS (classes utilitárias)
- Tipos em `src/types.ts`

## Qualidade

- ESLint + TypeScript strict
- `tsconfig.json` único (inclui `vite.config.ts`)
- `node_modules` ignorado (`.gitignore` local e global)

## Fluxo de Desenvolvimento

1. `npm run dev`
2. Backend em `npm run dev` (pasta `backend`)
3. Acessar `http://localhost:5173`
4. Testar integração (`useProjects`) com a API

## Deploy

O Dockerfile gera build estático servido por Nginx. `docker-compose.prod.yml` monta um proxy Nginx apontando para backend e frontend.

## Referências

- Projeto base: `expenseiq-frontend`
- Documentação Vite: https://vite.dev
- Tailwind: https://tailwindcss.com

# Portfolio Suite API

Documentação breve dos principais endpoints expostos pelo backend. Todos os exemplos assumem `API_URL` apontando para `http://localhost:3001` em desenvolvimento.

## Autenticação

| Método | Rota              | Descrição                       |
|--------|-------------------|---------------------------------|
| POST   | `/api/auth/login` | Gera um JWT para acessar CRUDs |
| POST   | `/api/auth/register` | Cria um novo usuário (opcional) |

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "lucas.biason@foxcodesoftware.com",
  "password": "senha_portfolio"
}
```
Resposta:
```json
{ "token": "<jwt>" }
```
Use esse token no header `Authorization: Bearer <jwt>` ao chamar rotas protegidas (`/me`, `POST`, `PUT`, `DELETE`).

## Perfil público

| Método | Rota                   | Descrição |
|--------|------------------------|-----------|
| GET    | `/api/user`            | Dados completos do perfil padrão (usado pelo frontend)
| GET    | `/api/about`           | Conteúdo da seção "Quem sou eu"
| GET    | `/api/profile/public`  | Permite informar `?slug=` para acessar outro usuário
| GET    | `/api/profile/about`   | Versão pública do resumo
| PUT    | `/api/profile` *(JWT)* | Atualiza título, bio, highlights, textos de contato etc.

## Projetos

| Método | Rota                        | Descrição |
|--------|-----------------------------|-----------|
| GET    | `/api/projects`             | Lista pública (aceita `?featured=true`)
| GET    | `/api/projects/me` *(JWT)*  | Lista projetos do usuário autenticado
| POST   | `/api/projects` *(JWT)*     | Cria projeto
| PUT    | `/api/projects/:id` *(JWT)* | Atualiza projeto
| DELETE | `/api/projects/:id` *(JWT)* | Remove projeto

## Experiências

Mesma convenção de rotas (`/api/experience`, `/api/experience/me`, etc.).

## Serviços

Mesma convenção (`/api/services`).

## Contatos

| Método | Rota                         | Descrição |
|--------|------------------------------|-----------|
| GET    | `/api/contact/info`          | Dados públicos da seção "Contato" (título + cards)
| GET    | `/api/contact/info/me` *(JWT)* | Retorna os dados do usuário logado
| POST   | `/api/contact/info` *(JWT)*  | Cria cartão de contato
| PUT    | `/api/contact/info/:id` *(JWT)* | Atualiza cartão
| DELETE | `/api/contact/info/:id` *(JWT)* | Remove cartão
| POST   | `/api/contact`               | Envia mensagem do formulário (SMTP)

## Admin / Estatísticas

| Método | Rota              | Descrição |
|--------|-------------------|-----------|
| GET    | `/api/admin/stats` *(JWT)* | Retorna contagem de usuários, projetos etc.

## Saúde da API

`GET /health` → `{ "status": "ok", "timestamp": "..." }`

## Observações
- O frontend consome os endpoints públicos usando o usuário definido em `PORTFOLIO_DEFAULT_EMAIL`.
- Para mudar o perfil exibido no site sem recompilar o frontend, basta atualizar o banco via APIs protegidas ou scripts Prisma.
- Utilize o arquivo `docs/postman/PortfolioSuite.postman_collection.json` para importar toda a collection no Postman, incluindo exemplos de rotas autenticadas.

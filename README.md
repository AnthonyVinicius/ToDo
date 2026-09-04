# TO DO

Aplicação full stack de gerenciamento de tarefas desenvolvida para um desafio técnico. Permite cadastrar uma conta, fazer login e gerenciar tarefas com título, descrição, prazo e status. Cada usuário acessa somente os próprios dados.

## Funcionalidades

- Cadastro com nome, e-mail e senha, com prevenção de e-mail duplicado.
- Login com JWT e logout no frontend.
- Criação, listagem, edição e exclusão de tarefas com confirmação.
- Descrição completa exibida no card.
- Status pendente, em andamento e concluído.
- Filtros por status, contadores e mensagem para lista vazia.
- Validação de entradas no frontend e no backend.
- Layout responsivo com Angular Material.

## Tecnologias e decisões técnicas

| Parte | Tecnologias | Finalidade |
| --- | --- | --- |
| Backend | Java 17 e Spring Boot 4.1.1 | Construção da API REST |
| Persistência | Spring Data JPA e H2 | Acesso aos dados e execução local simples |
| Segurança | Spring Security, JWT e BCrypt | Autenticação e armazenamento seguro das senhas |
| Documentação | Swagger/OpenAPI | Consulta e teste dos endpoints |
| Frontend | Angular 21, TypeScript e Angular Material | Interface, formulários e navegação |
| Testes | JUnit, Mockito e Vitest | Validação dos comportamentos principais |

A aplicação foi organizada em controllers, services, repositories, DTOs e entidades no backend. No frontend, as páginas utilizam services para comunicação com a API, models para os dados, guard para navegação protegida e interceptor para envio do JWT.

O H2 foi escolhido para facilitar a execução do desafio sem exigir a instalação de um servidor de banco. Não há separação por roles: a autorização é baseada no usuário autenticado e na propriedade da tarefa.

## Pré-requisitos

- Git.
- JDK 17.
- Node.js 22.12 ou superior da linha 22, ou Node.js 24.
- npm 11 compatível com a versão instalada do Node.js.
- Acesso à internet para baixar as dependências na primeira execução.

Não é necessário instalar Maven ou Angular CLI globalmente.

## Executando localmente

### 1. Clonar o projeto

```bash
git clone https://github.com/AnthonyVinicius/ToDo.git
cd ToDo
```

### 2. Configurar o backend

```bash
cd BackEnd
```

Crie o arquivo local de configuração a partir do exemplo.

No Windows/PowerShell:

```powershell
Copy-Item .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e substitua o valor de `JWT_SECRET`. O valor do exemplo é apenas um marcador. Uma chave pode ser gerada com:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

| Variável | Uso |
| --- | --- |
| `JWT_SECRET` | Chave de assinatura do JWT, com pelo menos 32 caracteres |
| `JWT_EXPIRATION_MS` | Validade do token em milissegundos; padrão: `3600000` |

O arquivo `.env` é ignorado pelo Git. Somente o `.env.example` deve ser versionado.

### 3. Iniciar o backend

No Windows/PowerShell, dentro de `BackEnd`:

```powershell
.\mvnw.cmd spring-boot:run
```

No Linux/macOS:

```bash
sh mvnw spring-boot:run
```

O backend inicia na porta `8080`. O H2 e as tabelas são criados automaticamente. O banco está em memória, portanto usuários e tarefas são apagados quando o backend é reiniciado. Não há usuário de demonstração; crie uma conta pela aplicação.

### 4. Iniciar o frontend

Em outro terminal, partindo da raiz do projeto:

```bash
cd FrontEnd
npm ci
npm start
```

Acesse http://localhost:4200. O proxy de desenvolvimento encaminha as chamadas `/api` para o backend na porta `8080`.

## Endereços

| Recurso | Endereço |
| --- | --- |
| Aplicação | http://localhost:4200 |
| API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |
| H2 Console | http://localhost:8080/h2-console |

### Acesso ao H2

- **Driver Class:** `org.h2.Driver`
- **JDBC URL:** `jdbc:h2:mem:testdb`
- **User Name:** `sa`
- **Password:** deixe vazio.

Swagger e H2 estão liberados sem autenticação JWT para facilitar a avaliação local. Essa configuração é voltada somente à demonstração. O H2 permite consultar e alterar diretamente todo o banco e não deve ser exposto publicamente ou em produção.

Abrir o Swagger não exige login. Para executar rotas protegidas, faça cadastro e login, copie o token recebido e informe-o no botão **Authorize**.

## Principais endpoints

| Método | Rota | Ação |
| --- | --- | --- |
| POST | `/api/users` | Criar conta |
| POST | `/api/auth/login` | Fazer login e receber o token |
| GET | `/api/tasks` | Listar tarefas do usuário autenticado |
| GET | `/api/tasks/{uuid}` | Consultar uma tarefa própria |
| POST | `/api/tasks` | Criar uma tarefa |
| PUT | `/api/tasks/{uuid}` | Editar título, descrição e prazo |
| PATCH | `/api/tasks/{uuid}/status` | Alterar o status |
| DELETE | `/api/tasks/{uuid}` | Excluir uma tarefa própria |

As rotas de tarefas exigem `Authorization: Bearer <token>`. O backend utiliza o identificador presente no token para consultar e alterar somente as tarefas do usuário autenticado. As senhas são armazenadas com BCrypt e não são retornadas nas respostas.

## Prazo e validações

O campo `deadlineInDays` representa o prazo contado em dias a partir da criação da tarefa. Na edição, o prazo continua contando a partir da data original.

| Campo | Regra |
| --- | --- |
| Nome | Obrigatório, de 3 a 50 caracteres |
| E-mail | Obrigatório, formato válido e até 254 caracteres |
| Senha no cadastro | Obrigatória, de 8 a 72 caracteres |
| Senha no login | Obrigatória, até 72 caracteres |
| Título | Obrigatório, de 3 a 100 caracteres |
| Descrição | Obrigatória, de 3 a 1000 caracteres |
| Prazo | De 1 a 3650 dias; o formulário exige número inteiro |

As entradas são validadas no frontend e no backend. Nome, e-mail, título e descrição têm os espaços das extremidades removidos. A confirmação da senha ocorre no frontend e não é enviada à API.

## Testes

Configure o `.env` do backend antes de executar a suíte completa.

Backend no Windows/PowerShell:

```powershell
cd BackEnd
.\mvnw.cmd test
```

Backend no Linux/macOS:

```bash
cd BackEnd
sh mvnw test
```

Frontend:

```bash
cd FrontEnd
npm test -- --watch=false
```

O backend possui testes de validação, JWT, edição e propriedade de tarefas, acesso ao Swagger/H2 e inicialização da aplicação. O frontend possui testes de sessão, formulários, operações do dashboard e estados de erro. As chamadas HTTP dos testes do frontend são simuladas.

Não há uma suíte end-to-end com navegador e banco reais.

## Organização

- `BackEnd/src/main/java/com/anthony/todo`: código principal da API.
- `BackEnd/src/test`: testes do backend.
- `FrontEnd/src/app/pages`: login, cadastro e dashboard.
- `FrontEnd/src/app/services`: comunicação com a API e sessão.
- `FrontEnd/src/app/models`: interfaces dos dados.
- `FrontEnd/src/app/guards` e `interceptors`: proteção da navegação e envio do JWT.

## Dificuldades e aprendizados

- Integração entre o frontend e o backend.
- Implementação da autenticação com JWT.
- Validação dos dados nos dois lados da aplicação.

## Uso de inteligência artificial

A IA foi utilizada como ferramenta de apoio ao estudo durante o desenvolvimento: esclarecimento de dúvidas sobre Angular, Spring Security e Git, explicação de trechos de código e investigação de erros e alternativas de solução.

Também houve apoio na implementação e revisão de partes do código, na estilização e organização visual, na elaboração e execução dos testes e na organização desta documentação. Foram solicitadas explicações e simplificações para acompanhar o funcionamento da solução e manter uma estrutura adequada ao desafio.

## Próximos passos

- Persistir o banco em arquivo ou utilizar outro banco com migrações.
- Adicionar busca e paginação caso a quantidade de tarefas aumente.
- Permitir ordenar as tarefas por prazo, criação ou status.
- Destacar tarefas próximas do vencimento ou atrasadas.
- Publicar o backend e o frontend em um ambiente de demonstração.

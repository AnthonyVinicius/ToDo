# TO DO

  

Aplicação full stack de gerenciamento de tarefas, desenvolvida para um desafio técnico. Permite cadastrar uma conta, fazer login e gerenciar tarefas com título, descrição, prazo e status. Cada usuário acessa somente os próprios dados.

  

## Funcionalidades

  

- Cadastro com nome, e-mail e senha, com prevenção de e-mail duplicado.

- Login com JWT e logout no frontend.

- Criação, listagem, edição e exclusão de tarefas com confirmação.

- Descrição completa exibida no card.

- Status: pendente (`PENDING`), em andamento (`IN_PROGRESS`) e concluída (`COMPLETED`).

- Filtros por status, contadores e mensagem para lista vazia.

- Validação de entradas no frontend e no backend.

- Layout responsivo com Angular Material.

  

## Tecnologias e decisões técnicas

  

| Parte | Tecnologias | Finalidade |

| Backend | Java 17, Spring Boot 

| Persistência | Spring Data JPA e H2

| Documentação da API | Swagger UI

| Frontend | Angular 21, TypeScript 5.9 e Angular Material

  
## Pré-requisitos

  
- Git.

- JDK 17

- Node.js 22.12 ou superior da linha 22, ou Node.js 24.

- npm 11, compatível com a versão instalada do Node.js.

- Acesso à internet para baixar as dependências na primeira execução.


## Executando localmente

  

### 1. Clonar o projeto

  

```bash

git  clone  https://github.com/AnthonyVinicius/ToDo.git

cd  ToDo

```

  

### 2. Configurar o backend

  

Entre na pasta `BackEnd`:

  

```bash

cd  BackEnd

```

  

Crie o arquivo local de configuração a partir do exemplo.

  

No Windows/PowerShell:

  

```powershell

Copy-Item .env.example .env

```

  

No Linux/macOS:

  

```bash

cp  .env.example  .env

```

  

Abra `.env` e substitua o valor de `JWT_SECRET`. O texto de exemplo é apenas um marcador e não é uma chave válida para executar o projeto. Gere uma chave aleatória com o Node.js:

  

```bash

node  -e  "console.log(require('node:crypto').randomBytes(32).toString('hex'))"

```

  

Copie o resultado para `JWT_SECRET`, sem publicar esse valor. Mantenha `JWT_EXPIRATION_MS=3600000` para tokens com duração de uma hora.

  

| Variável | Uso |


| `JWT_SECRET` | Chave de assinatura do JWT; obrigatória, com pelo menos 32 caracteres |

| `JWT_EXPIRATION_MS` | Tempo de validade em milissegundos; padrão: `3600000` |

  

### 3. Iniciar o backend

  

No Windows/PowerShell, dentro de `BackEnd`:

  

```powershell

.\mvnw.cmd spring-boot:run

```

  

O backend utiliza a porta `8080`. O H2 é inicializado automaticamente e o Hibernate cria as tabelas. Não é necessário executar scripts SQL.

  

**O banco é em memória:** usuários e tarefas são apagados ao reiniciar o backend. Não há seed nem conta de demonstração; crie uma conta pela página de cadastro.

  

### 4. Iniciar o frontend

  

Abra outro terminal na raiz do repositório:

  

```bash

cd  FrontEnd

npm  ci

npm  start

```

  

Acesse http://localhost:4200. Cadastre uma conta; após o cadastro, a aplicação tenta fazer login automaticamente.

  

## Endereços

  

| Recurso | Endereço |

| Aplicação | http://localhost:4200 |

| API | http://localhost:8080/api |

| Swagger UI | http://localhost:8080/swagger-ui/index.html |


O Swagger e o console H2 estão liberados sem autenticação JWT para facilitar a avaliação local do projeto. Acesse o H2 em http://localhost:8080/h2-console e preencha:

- **Driver Class:** `org.h2.Driver`
- **JDBC URL:** `jdbc:h2:mem:testdb`
- **User Name:** `sa`
- **Password:** deixe vazio.

Essa liberação é destinada somente à demonstração local. O console H2 permite consultar e alterar diretamente todo o banco, sem o isolamento por usuário da API; não deve ser exposto publicamente ou em produção. Abrir a documentação do Swagger não exige login, mas executar as rotas protegidas de tarefas continua exigindo um token pelo botão **Authorize**.

  

## API e autenticação

  

| Método | Rota | Ação |

| --- | --- | --- |

| POST | `/api/users` | Criar conta, sem autenticação |

| POST | `/api/auth/login` | Fazer login e receber o token |

| GET | `/api/tasks` | Listar tarefas do usuário autenticado |

| GET | `/api/tasks/{uuid}` | Consultar uma tarefa própria |

| POST | `/api/tasks` | Criar uma tarefa |

| PUT | `/api/tasks/{uuid}` | Editar título, descrição e prazo |

| PATCH | `/api/tasks/{uuid}/status` | Alterar o status |

| DELETE | `/api/tasks/{uuid}` | Excluir uma tarefa própria |

  

As rotas de tarefas exigem o cabeçalho `Authorization: Bearer <token>`. No Swagger, faça cadastro/login e use o token retornado no botão **Authorize**. No frontend, o interceptor adiciona esse cabeçalho às chamadas da API.

  

O backend usa o identificador do usuário presente no token para consultar as tarefas. A verificação de propriedade ocorre no servidor, não apenas na interface. As senhas são armazenadas como hash BCrypt e não são retornadas nos DTOs de resposta.

  

### Prazo e validações

  

O campo `deadlineInDays` representa o prazo em dias a partir da criação. Por exemplo, uma tarefa criada em 2 de setembro com prazo de 3 dias vence em 5 de setembro, no mesmo horário. Na edição, o prazo continua contando da data original, sem reiniciar a contagem.

  

| Campo | Regra |

| --- | --- |

| Nome | Obrigatório, de 3 a 50 caracteres |

| E-mail | Obrigatório, formato válido e até 254 caracteres |

| Senha no cadastro | Obrigatória, de 8 a 72 caracteres |

| Senha no login | Obrigatória, até 72 caracteres |

| Título | Obrigatório, de 3 a 100 caracteres |

| Descrição | Obrigatória, de 3 a 1000 caracteres |

| Prazo | De 1 a 3650 dias; o formulário exige número inteiro |

  


## Testes

  

Configure o `.env` do backend antes de executar a suíte completa, pois o teste de inicialização carrega a aplicação.

  

No Windows/PowerShell, dentro de `BackEnd`:

  

```powershell

.\mvnw.cmd test

```

  

No Linux/macOS, dentro de `BackEnd`:

  

```bash

sh  mvnw  test

```

  

Dentro de `FrontEnd`:

  

```bash

npm  test  --  --watch=false

```

  

O backend possui testes de validação dos DTOs, geração/validação de JWT, edição de tarefas e verificação de propriedade, além do teste de inicialização. No frontend, há testes de sessão, formulários, operações do dashboard e estados de erro. As chamadas HTTP nos testes do frontend são simuladas; não é necessário iniciar a API para executá-los.

  


## Organização

  

-  `BackEnd/src/main/java/com/anthony/todo`: controllers, services, repositories, entidades, DTOs, mappers e segurança.

-  `BackEnd/src/test`: testes do backend.

-  `FrontEnd/src/app/pages`: login, cadastro e dashboard.

-  `FrontEnd/src/app/services`: comunicação com a API e sessão.

-  `FrontEnd/src/app/models`: interfaces de dados.

-  `FrontEnd/src/app/guards` e `interceptors`: navegação protegida e envio do JWT.

  

  

## Uso de inteligência artificial

  

A IA foi utilizada como ferramenta de apoio ao estudo durante o desenvolvimento: esclarecimento de dúvidas sobre Angular, Spring Security e Git, explicação de trechos de código e investigação de erros e alternativas de solução.

  

Também houve apoio na implementação e revisão de partes do código, na estilização e organização visual do site, na elaboração e execução dos testes e na organização desta documentação. Ao longo do processo, foram solicitadas explicações sobre os resultados dos testes e simplificações para acompanhar o funcionamento da solução e manter uma estrutura adequada ao escopo do desafio.

  

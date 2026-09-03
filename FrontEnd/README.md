# TO DO — Frontend

Frontend Angular com Angular Material para login, cadastro e gerenciamento de tarefas.

As instruções completas de instalação, configuração do backend, testes e decisões técnicas estão no [README principal](../README.md).

Dentro desta pasta:

```bash
npm ci
npm start
```

A aplicação abre em http://localhost:4200. O backend deve estar rodando em http://localhost:8080; o proxy local encaminha as chamadas `/api`.

Para testar e compilar:

```bash
npm test -- --watch=false
npm run build
```

Não há testes end-to-end configurados. Os testes de componentes e serviços usam Vitest, jsdom e requisições HTTP simuladas.

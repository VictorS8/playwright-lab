# Roteiro de Estudo: Playwright do Zero às Boas Práticas

## Resumo

Este roteiro tem **6 fases e 24 módulos** (do 0 ao 23). Cada módulo traz objetivo, conceitos em ordem atômica (do mais simples ao mais composto), um exemplo, 4 exercícios graduais e um desafio. Ao fim de cada fase há **questões estilo entrevista**. Não há gabarito: você manda as soluções no chat (ou pede ao agente revisor, apêndice C) e recebe correções e alternativas.

Os testes rodam no **container Docker do Playwright** que você já configurou no Omarchy, contra três sites feitos para treino:

| Site | Endereço | O que treina |
|------|----------|--------------|
| **TodoMVC** | `https://demo.playwright.dev/todomvc` | Fundamentos: locators, ações, assertions, listas |
| **Sauce Demo** | `https://www.saucedemo.com` | Fluxos reais: login, carrinho, checkout, Page Object, fixtures |
| **The Internet** | `https://the-internet.herokuapp.com` | Casos difíceis: esperas, diálogos, janelas, frames, arquivos, rede |

| Fase | Módulos | Foco |
|------|---------|------|
| 0. Ambiente | 0 | Organizar o projeto para os três sites |
| 1. Fundamentos (TodoMVC) | 1 a 6 | Anatomia do teste, locators, ações, assertions, listas, organização |
| 2. Fluxos reais (Sauce Demo) | 7 a 12 | Login, fluxo de compra, Page Object Model, fixtures, sessão salva, dados parametrizados |
| 3. Casos difíceis (The Internet) | 13 a 16 | Conteúdo dinâmico, diálogos e frames, formulários e arquivos, rede e API |
| 4. Qualidade profissional | 17 a 22 | Depuração, lint, configuração, testes visuais, CI e agentes |
| 5. Projeto final | 23 | Uma suíte completa, pronta para portfólio |

A ordem segue a lógica da própria documentação do Playwright: primeiro escrever e entender um teste, depois localizar e verificar com robustez, e só então organizar (Page Object, fixtures) e profissionalizar (CI, lint, relatórios).

---

## Como usar este roteiro

1. **Leia os "Conceitos" em ordem.** Cada item depende do anterior.
2. **Digite os exemplos** em vez de copiar e colar. Rode no UI Mode e observe cada passo na linha do tempo.
3. **Um arquivo por exercício**, por exemplo `tests/todomvc/m02-ex1.spec.ts`. Assim você tem o histórico do seu progresso.
4. **Antes de rodar, tente prever**: o teste vai passar? Se falhar, em qual linha?
5. **Quebre o teste de propósito** pelo menos uma vez por módulo. Ler a mensagem de erro é metade do aprendizado.
6. **Peça revisão**: mande o código no chat ou use o agente `revisor-playwright` (apêndice C).
7. **Responda as questões de entrevista** por escrito, como se explicasse para alguém.

> **Fundamento que vale para o roteiro inteiro:** um bom teste de ponta a ponta **se comporta como um usuário**. Ele encontra os elementos pelo que o usuário enxerga (o papel do elemento e o texto dele), faz ações que o usuário faria e verifica o que o usuário veria. A documentação de boas práticas do Playwright começa exatamente por aqui: testar o comportamento visível, e não detalhes de implementação como classes CSS ou nomes de funções.

> **Sobre os sites de treino:** eles são mantidos por terceiros e podem mudar. Se um locator deste roteiro deixar de funcionar, use o botão **Pick locator** do UI Mode para descobrir o novo. Isso não é um problema do roteiro: é exatamente a habilidade que você está treinando.

---

# FASE 0: AMBIENTE

## Módulo 0: Organizando o projeto para três sites

**Objetivo:** reaproveitar o projeto `~/aprendendo-playwright` e configurá-lo para testar os três sites, cada um como um "projeto" do Playwright.

**Conceitos:**
1. **`playwright.config.ts`**: o arquivo que centraliza as configurações: onde estão os testes, qual navegador usar, tempo limite, relatórios.
2. **`defineConfig`**: uma função que só "embrulha" o objeto de configuração para o TypeScript conseguir checar os campos e oferecer autocompletar.
3. **`use`**: opções que valem para todos os testes, como `baseURL` e `trace`.
4. **`baseURL`**: o endereço base. Com ele, `page.goto('/inventory.html')` vira `https://www.saucedemo.com/inventory.html`.
5. **Projeto (`projects`)**: um grupo de testes com configurações próprias. Normalmente se usa um projeto por navegador; aqui vamos usar **um projeto por site**, todos no Chromium.
6. **`testDir` por projeto**: diz em qual pasta ficam os testes daquele projeto.
7. **`devices['Desktop Chrome']`**: configurações prontas de tela e navegador de um Chrome de computador.
8. **`trace: 'on-first-retry'`**: grava o "trace" (a gravação completa do teste) quando um teste falha e é repetido. O módulo 17 aprofunda.

### Passo a passo

**1. Entre no container** (do Omarchy):

```bash
pw-docker
```

**2. Crie as pastas** (dentro do container):

```bash
mkdir -p tests/todomvc tests/saucedemo tests/the-internet pages fixtures
```

**3. Apague o teste de exemplo** (você já estudou ele):

```bash
rm tests/example.spec.ts
```

**4. Substitua o `playwright.config.ts`** (edite no VS Code do Omarchy) por este:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'todomvc',
      testDir: './tests/todomvc',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://demo.playwright.dev' },
    },
    {
      name: 'saucedemo',
      testDir: './tests/saucedemo',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
        testIdAttribute: 'data-test',
      },
    },
    {
      name: 'the-internet',
      testDir: './tests/the-internet',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://the-internet.herokuapp.com' },
    },
  ],
});
```

Leitura atômica das linhas que ainda não apareceram para você:
- `fullyParallel: true`: até os testes de um mesmo arquivo rodam em paralelo.
- `forbidOnly: !!process.env.CI`: no CI, proíbe o `test.only` (que roda só um teste) esquecido no código. O `!!` transforma qualquer valor em `true` ou `false`.
- `retries`: quantas vezes repetir um teste que falhou. Zero na sua máquina, dois no CI.
- `testIdAttribute: 'data-test'`: o Sauce Demo marca os elementos com `data-test`, e não com o `data-testid` padrão. O módulo 7 explica.

**5. Comandos do dia a dia** (dentro do container):

| Situação | Comando |
|----------|---------|
| Rodar tudo | `npx playwright test` |
| Rodar um site só | `npx playwright test --project=todomvc` |
| Rodar um arquivo | `npx playwright test tests/todomvc/m01-ex1.spec.ts` |
| UI Mode (abra `http://localhost:8080` no Omarchy) | `npx playwright test --ui-port=8080 --ui-host=0.0.0.0` |
| Ver o relatório | abra `~/aprendendo-playwright/playwright-report/index.html` no Omarchy |

O guia `playwright-docker-guia.md` tem a cola completa dos comandos do Docker.

**Exercício 0.1:** rode `npx playwright test --list`. O que aparece? (Ainda não há testes, então leia a mensagem.)

**Exercício 0.2:** crie `tests/todomvc/m00.spec.ts` com um teste que só abre `/todomvc` e verifica o título com `await expect(page).toHaveTitle(/TodoMVC/);`. Rode com `--project=todomvc` e depois abra no UI Mode.

**Leitura:** [Configuration](https://playwright.dev/docs/test-configuration), [Projects](https://playwright.dev/docs/test-projects), [Docker](https://playwright.dev/docs/docker)

---

# FASE 1: FUNDAMENTOS (TodoMVC)

> O TodoMVC é um gerenciador de tarefas: você digita no campo "What needs to be done?", aperta Enter, marca como concluída, filtra e apaga. É o mesmo domínio dos seus projetos de TypeScript e SQL, só que agora você só escreve os **testes**.
>
> Um detalhe importante: o TodoMVC guarda as tarefas no `localStorage` do navegador. Como cada teste do Playwright começa em um navegador **limpo**, toda tarefa que um teste cria some quando ele termina. Isso é o **isolamento**, que o módulo 6 explica.
>
> Consequência prática: todo teste começa com a lista **vazia**, e com a lista vazia o TodoMVC **esconde o rodapé inteiro** (contador, filtros All/Active/Completed e "Clear completed") e o checkbox "Mark all as complete". Para usar qualquer um deles, o teste precisa criar pelo menos uma tarefa antes.

## Módulo 1: Anatomia de um teste e navegação

**Objetivo:** escrever testes completos, entendendo cada pedaço da estrutura.

**Conceitos:**
1. **Teste de ponta a ponta (E2E)**: testa a aplicação como o usuário usa, por um navegador de verdade.
2. **`test(nome, função)`**: declara um teste. O nome aparece no relatório, então escreva como uma frase do comportamento: "adiciona uma tarefa", e não "teste1".
3. **`async` e `await`**: quase todo comando do Playwright é assíncrono e devolve uma Promise. O `await` espera ele terminar. Esquecer o `await` é o erro número um de iniciante.
4. **Fixture `page`**: uma aba nova e limpa, criada só para aquele teste.
5. **`page.goto(url)`**: navega e espera a página carregar.
6. **`expect(page).toHaveTitle()`** e **`expect(page).toHaveURL()`**: verificam o título da aba e o endereço.
7. **Strings e expressões regulares**: `'texto'` exige igualdade exata; `/texto/` aceita "contém".
8. **Três partes de todo teste (Arrange, Act, Assert)**: preparar (ir até a página), agir (clicar, digitar) e verificar.

**Exemplo** (`tests/todomvc/m01.spec.ts`):

```ts
import { test, expect } from '@playwright/test';

test('abre a página do TodoMVC', async ({ page }) => {
  // Arrange
  await page.goto('/todomvc');

  // Assert
  await expect(page).toHaveTitle(/TodoMVC/);
  await expect(page).toHaveURL(/\/todomvc/);
});

test('o filtro "Active" muda o endereço', async ({ page }) => {
  // Arrange: os filtros só aparecem quando existe pelo menos uma tarefa
  await page.goto('/todomvc');
  await page.getByPlaceholder('What needs to be done?').fill('Estudar Playwright');
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  // Act
  await page.getByRole('link', { name: 'Active' }).click();

  // Assert
  await expect(page).toHaveURL(/#\/active$/);
});
```

Repare no `/#\/active$/`: a barra precisa de `\` porque `/` delimita a expressão regular, e o `$` significa "termina aqui".

As duas linhas que criam a tarefa usam `getByPlaceholder`, `fill` e `press`, que os módulos 2 e 3 explicam. Por enquanto, leia como "digita no campo e aperta Enter". Sem elas, o link **Active** não existe na página e o `click()` espera até estourar o tempo limite.

**Exercícios:**
1. Escreva um teste que abre o TodoMVC e verifica que a URL termina com `#/`.
2. Escreva um teste que clica no filtro **Completed** e verifica a URL. Lembre de criar uma tarefa antes, como no exemplo.
3. Remova o `await` de um `goto` e rode. O que acontece? Coloque de volta.
4. Troque `/TodoMVC/` por `'TodoMVC'` (string). O teste passa? Explique em um comentário.

**Desafio:** escreva um teste que passa pelos três filtros (All, Active, Completed) em sequência, verificando a URL a cada clique, e depois volta com `page.goBack()` duas vezes, conferindo a URL de novo. Antes de rodar, preveja em qual URL você vai parar depois de cada `goBack()`.

**Leitura:** [Writing tests](https://playwright.dev/docs/writing-tests), [Navigations](https://playwright.dev/docs/navigations), [MDN: async/await](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/async_function)

---

## Módulo 2: Locators, encontrando elementos como o usuário

**Objetivo:** escolher o melhor locator para cada elemento e entender a ordem de preferência recomendada.

**Conceitos:**
1. **Locator**: uma "receita" para encontrar um elemento. Ele **não** procura na hora em que é criado; procura de novo **toda vez** que você faz uma ação. Por isso ele sobrevive a re-renderizações da página.
2. **Papel (role)**: todo elemento tem um papel de acessibilidade (`button`, `link`, `textbox`, `checkbox`, `heading`, `listitem`...). Botões e links têm papel **implícito**: não precisa estar escrito no HTML.
3. **Nome acessível**: o "nome" que um leitor de tela falaria. Normalmente o texto visível ou o rótulo.
4. **Ordem de preferência** (da documentação):
   1. `getByRole`: o mais próximo de como usuários e tecnologias assistivas enxergam a página.
   2. `getByLabel`: campos de formulário com rótulo.
   3. `getByPlaceholder`: campos sem rótulo, mas com texto de exemplo.
   4. `getByText`: elementos **não interativos** (`div`, `span`, `p`).
   5. `getByAltText` e `getByTitle`: imagens e elementos com `title`.
   6. `getByTestId`: um "contrato" explícito entre o código e o teste (`data-testid`).
   7. CSS e XPath (`page.locator(...)`): último recurso, porque quebram quando a estrutura muda.
5. **`exact: true`**: por padrão, `getByText` e o `name` aceitam "contém", sem diferenciar maiúsculas. Com `exact: true`, exige igualdade.
6. **Strictness (rigidez)**: se um locator encontrar **mais de um** elemento e você fizer uma ação, o Playwright dá erro em vez de "chutar" um. Isso é uma proteção, não um problema.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('encontra os elementos principais do TodoMVC', async ({ page }) => {
  await page.goto('/todomvc');

  // Pelo papel e nome acessível (o campo tem o placeholder como nome)
  const novaTarefa = page.getByRole('textbox', { name: 'What needs to be done?' });
  await expect(novaTarefa).toBeVisible();

  // Pelo placeholder (equivalente aqui)
  await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();

  // Os filtros só aparecem com pelo menos uma tarefa (fill e press: módulo 3)
  await novaTarefa.fill('Estudar locators');
  await novaTarefa.press('Enter');

  // Link pelo nome exato
  await expect(page.getByRole('link', { name: 'All', exact: true })).toBeVisible();

  // Título da página (heading)
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
});
```

**Exercícios:**
1. Abra o UI Mode, rode o teste do exemplo, clique em **Pick locator** e passe o mouse pelos elementos do TodoMVC. Anote o locator sugerido para: o campo de nova tarefa, o link "Completed" e o texto do rodapé "Double-click to edit a todo". (O Pick locator trabalha sobre a página registrada pelo teste; o link "Completed" só aparece nos passos depois que a tarefa foi criada.)
2. Escreva um teste que verifica que o texto "Double-click to edit a todo" está visível, usando `getByText`.
3. Rode `page.getByRole('link').click()` (sem nome). Leia a mensagem de erro de strictness: quantos elementos ele encontrou?
4. Escreva o mesmo locator do campo de tarefa de três jeitos (`getByRole`, `getByPlaceholder` e `page.locator('input.new-todo')`). Em um comentário, explique qual você usaria e por quê.

**Desafio:** a documentação diz que `getByText` deve ser usado para elementos não interativos. Escreva um comentário explicando o que poderia dar errado se você usasse `page.getByText('Active')` para clicar no filtro, em vez de `getByRole('link', { name: 'Active' })`. (Dica: pense em quantos lugares a palavra "Active" pode aparecer.)

**Leitura:** [Locators](https://playwright.dev/docs/locators), [Best Practices: use locators](https://playwright.dev/docs/best-practices#use-locators), [MDN: papéis ARIA](https://developer.mozilla.org/pt-BR/docs/Web/Accessibility/ARIA/Roles)

---

## Módulo 3: Ações

**Objetivo:** interagir com a página: digitar, apertar teclas, clicar, marcar, dar duplo clique.

**Conceitos:**
1. **Ação**: algo que o usuário faz: `click`, `fill`, `press`, `check`, `dblclick`, `hover`.
2. **Auto-waiting**: antes de cada ação, o Playwright espera o elemento estar **visível, estável, habilitado e recebendo eventos**. Você não precisa escrever esperas manuais.
3. **`fill(texto)`**: limpa o campo e preenche de uma vez. É o jeito normal de preencher formulários.
4. **`pressSequentially(texto)`**: digita tecla por tecla. Use só quando a página reage a cada tecla (busca com sugestões, por exemplo).
5. **`press('Enter')`**: aperta uma tecla. Aceita combinações como `'Control+A'`.
6. **`check()` e `uncheck()`**: marcam e desmarcam checkboxes. São melhores que `click()` porque **garantem o estado final**: se já estiver marcado, `check()` não desmarca.
7. **`dblclick()`** e **`hover()`**: duplo clique e passar o mouse por cima.
8. **Locator em variável**: guardar um locator em uma `const` evita repetição e deixa o teste legível.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('cria e conclui uma tarefa', async ({ page }) => {
  await page.goto('/todomvc');
  const novaTarefa = page.getByPlaceholder('What needs to be done?');

  await novaTarefa.fill('Estudar locators');
  await novaTarefa.press('Enter');

  const tarefa = page.getByTestId('todo-item').filter({ hasText: 'Estudar locators' });
  await tarefa.getByRole('checkbox', { name: 'Toggle Todo' }).check();

  await expect(tarefa.getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
});
```

O `filter({ hasText })` aparece aqui pela primeira vez; o módulo 5 aprofunda. Por enquanto, leia como "o item da lista que contém este texto".

**Exercícios:**
1. Adicione três tarefas e verifique que o contador mostra "3 items left" (dica: `getByTestId('todo-count')` e `toHaveText`).
2. Adicione uma tarefa, dê duplo clique no texto dela, apague o conteúdo do campo de edição (`getByRole('textbox', { name: 'Edit' })`), escreva outro texto e aperte Enter. Verifique o texto novo.
3. Use o checkbox **Mark all as complete** (`getByLabel('Mark all as complete')`) para concluir todas as tarefas.
4. Apague uma tarefa. O botão de apagar só aparece com o mouse por cima: use `hover()` e descubra o locator do botão com o Pick locator.

**Desafio:** escreva um teste que tente adicionar uma tarefa só com espaços (`'   '`). O que o TodoMVC faz? Escreva o teste verificando o comportamento real (dica: `toHaveCount(0)`).

**Leitura:** [Actions](https://playwright.dev/docs/input), [Auto-waiting](https://playwright.dev/docs/actionability)

---

## Módulo 4: Assertions web-first

**Objetivo:** verificar resultados do jeito que espera e tenta de novo, eliminando testes instáveis.

**Conceitos:**
1. **Assertion**: a verificação que decide se o teste passa ou falha.
2. **Web-first assertion**: `await expect(locator).toAlgo()`. Ela **tenta de novo** até a condição ser verdadeira ou o tempo acabar (5 segundos por padrão).
3. **Assertion manual (anti-padrão)**: `expect(await locator.isVisible()).toBe(true)`. O `await` está **dentro** do `expect`, então a verificação acontece uma única vez, no instante exato. Se o elemento demorar meio segundo, o teste falha à toa. A documentação mostra esse exemplo como o jeito errado.
4. **Matchers mais usados**: `toBeVisible`, `toBeHidden`, `toHaveText`, `toContainText`, `toHaveCount`, `toBeChecked`, `toHaveValue`, `toBeEnabled`, `toBeFocused`, `toHaveURL`, `toHaveTitle`.
5. **`toHaveText` vs `toContainText`**: o primeiro compara o texto inteiro (normalizando espaços); o segundo aceita um pedaço.
6. **`toHaveText` com lista**: em um locator que encontra vários elementos, `toHaveText(['a', 'b'])` verifica todos, na ordem.
7. **`.not`**: inverte. `await expect(x).not.toBeChecked()`.
8. **Teste instável (flaky)**: passa às vezes e falha às vezes, sem mudança no código. Quase sempre é causado por esperas erradas.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('lista mostra as tarefas na ordem em que foram criadas', async ({ page }) => {
  await page.goto('/todomvc');
  const novaTarefa = page.getByPlaceholder('What needs to be done?');

  for (const titulo of ['Ler a documentação', 'Fazer exercícios', 'Revisar']) {
    await novaTarefa.fill(titulo);
    await novaTarefa.press('Enter');
  }

  await expect(page.getByTestId('todo-title')).toHaveText([
    'Ler a documentação',
    'Fazer exercícios',
    'Revisar',
  ]);
  await expect(page.getByTestId('todo-item')).toHaveCount(3);
  await expect(novaTarefa).toHaveValue('');
  await expect(novaTarefa).toBeFocused();
});
```

**Exercícios:**
1. Verifique que, depois de concluir uma tarefa, o contador muda de "1 item left" para "0 items left".
2. Verifique que o botão **Clear completed** só aparece depois de concluir uma tarefa (use `toBeHidden` antes e `toBeVisible` depois).
3. Reescreva o exercício 1 do jeito **errado** (`expect(await ... .textContent()).toBe(...)`) e depois do jeito certo. Rode os dois várias vezes. Em um comentário, explique por que um pode ser instável e o outro não.
4. Use `toContainText` para verificar que o contador contém o número `2`, sem se importar com o resto do texto.

**Desafio:** crie 3 tarefas, conclua a do meio e verifique, no filtro **Active**, que a lista contém exatamente as outras duas, na ordem certa, com uma única assertion.

**Leitura:** [Assertions](https://playwright.dev/docs/test-assertions), [Best Practices: web first assertions](https://playwright.dev/docs/best-practices#use-web-first-assertions)

---

## Módulo 5: Filtrar e encadear, trabalhando com listas

**Objetivo:** encontrar um elemento específico dentro de uma lista sem depender da posição.

**Conceitos:**
1. **Encadear (chaining)**: chamar um locator a partir de outro restringe a busca: `item.getByRole('checkbox')` procura **dentro** do item.
2. **`filter({ hasText })`**: mantém só os elementos que contêm um texto (em qualquer descendente). Aceita string ou expressão regular.
3. **`filter({ hasNotText })`**: o contrário.
4. **`filter({ has: locator })`**: mantém os elementos que **contêm outro elemento**. O locator interno é relativo ao externo.
5. **`first()`, `last()`, `nth(i)`**: escolhem pela posição. A documentação **desaconselha**: se a página mudar a ordem, o teste age no elemento errado sem perceber. Use só quando a posição **é** o que você está testando.
6. **`toHaveCount`**: verifica quantos elementos o locator encontra, com espera.
7. **Iterar (raro)**: `for (const linha of await locator.all())` percorre os elementos. Prefira assertions sobre a lista inteira.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('conclui uma tarefa específica pelo texto', async ({ page }) => {
  await page.goto('/todomvc');
  const novaTarefa = page.getByPlaceholder('What needs to be done?');
  for (const titulo of ['Comprar pão', 'Pagar conta', 'Ligar para o banco']) {
    await novaTarefa.fill(titulo);
    await novaTarefa.press('Enter');
  }

  const tarefas = page.getByTestId('todo-item');
  const pagarConta = tarefas.filter({ hasText: 'Pagar conta' });

  await pagarConta.getByRole('checkbox', { name: 'Toggle Todo' }).check();

  // Só um item contém um checkbox marcado
  await expect(tarefas.filter({ has: page.getByRole('checkbox', { checked: true }) })).toHaveCount(1);
  await expect(tarefas.filter({ hasNotText: 'Pagar conta' })).toHaveCount(2);
});
```

**Exercícios:**
1. Crie 4 tarefas e apague a terceira **pelo texto**, sem usar `nth`.
2. Conclua duas tarefas e verifique, com `filter({ has })`, que existem exatamente 2 itens concluídos.
3. Escreva o exercício 1 usando `nth(2)` e depois crie as tarefas em outra ordem. O que acontece com cada versão?
4. Use `filter({ hasText: /^Ligar/ })` (expressão regular) para encontrar tarefas que **começam** com "Ligar".

**Desafio:** crie 10 tarefas chamadas "Tarefa 1" a "Tarefa 10" e conclua a "Tarefa 1" usando `filter({ hasText: 'Tarefa 1' })`. Rode e leia o erro: por que o locator encontrou dois itens? Corrija com uma expressão regular (`/^Tarefa 1$/`) e explique em um comentário o que o `^` e o `$` fazem.

**Leitura:** [Locators: filtering](https://playwright.dev/docs/locators#filtering-locators), [Locators: lists](https://playwright.dev/docs/locators#lists), [Locators: strictness](https://playwright.dev/docs/locators#strictness)

---

## Módulo 6: Organização e isolamento

**Objetivo:** agrupar testes, evitar repetição e garantir que um teste nunca dependa de outro.

**Conceitos:**
1. **Isolamento**: cada teste roda em um **contexto de navegador** novo, com cookies, `localStorage` e sessão próprios. É como abrir uma janela anônima nova para cada teste.
2. **Por que isso importa**: testes isolados podem rodar em qualquer ordem e em paralelo, e uma falha não derruba as outras em cascata.
3. **`test.describe(nome, função)`**: agrupa testes relacionados. O nome do grupo aparece no relatório.
4. **`test.beforeEach`**: roda antes de **cada** teste do arquivo ou do grupo. Ideal para "ir até a página".
5. **`test.afterEach`**, **`beforeAll`** e **`afterAll`**: existem, mas use com parcimônia. `beforeAll` roda uma vez só, e estado compartilhado entre testes quebra o isolamento.
6. **`test.step(nome, função)`**: divide um teste longo em etapas com nome, que aparecem no relatório e no UI Mode.
7. **Um pouco de repetição é aceitável**: a documentação diz que, quando os testes são simples, duplicar um pouco pode deixá-los mais claros.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test.describe('filtros do TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todomvc');
    const novaTarefa = page.getByPlaceholder('What needs to be done?');
    for (const titulo of ['A', 'B', 'C']) {
      await novaTarefa.fill(titulo);
      await novaTarefa.press('Enter');
    }
    await page
      .getByTestId('todo-item')
      .filter({ hasText: 'B' })
      .getByRole('checkbox', { name: 'Toggle Todo' })
      .check();
  });

  test('Active mostra só as pendentes', async ({ page }) => {
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText(['A', 'C']);
  });

  test('Completed mostra só as concluídas', async ({ page }) => {
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText(['B']);
  });
});

test('cada teste começa com a lista vazia', async ({ page }) => {
  await page.goto('/todomvc');
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});
```

**Exercícios:**
1. Reorganize os testes dos módulos 3 a 5 em blocos `describe` com `beforeEach`.
2. Use `test.step` para dividir o teste de editar uma tarefa em "criar", "editar" e "verificar". Veja os passos no UI Mode.
3. Rode o arquivo com `--repeat-each=5`. Algum teste falha às vezes? Se sim, você encontrou um teste instável.
4. Rode só um teste com `test.only` e depois remova. Por que o `forbidOnly` do módulo 0 existe?

**Desafio:** escreva dois testes em que o segundo **depende** do primeiro ter criado uma tarefa. Rode e explique por que o segundo falha. Depois, conserte de forma que cada um seja independente.

**Leitura:** [Isolation](https://playwright.dev/docs/browser-contexts), [Best Practices: isolation](https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible), [API: test.describe, beforeEach, step](https://playwright.dev/docs/api/class-test)

---

## Questões de entrevista da Fase 1

1. O que é um locator e por que ele é diferente de "procurar o elemento uma vez e guardar"?
2. Qual é a ordem de preferência de locators recomendada pelo Playwright? Por que CSS e XPath ficam por último?
3. Qual é a diferença entre `await expect(locator).toBeVisible()` e `expect(await locator.isVisible()).toBe(true)`?
4. O que é auto-waiting? Que verificações o Playwright faz antes de um clique?
5. O que é um teste instável (flaky) e quais as causas mais comuns?
6. Por que usar `nth()` é considerado arriscado? Quando seria aceitável?
7. O que significa isolamento de testes no Playwright e como ele é implementado?
8. Qual é a diferença entre `check()` e `click()` em um checkbox?

---

# FASE 2: FLUXOS REAIS (Sauce Demo)

> O Sauce Demo é uma loja de exemplo da Sauce Labs. A página de login mostra os usuários aceitos; os mais usados são `standard_user` (normal), `locked_out_user` (bloqueado) e `problem_user` (com bugs propositais). A senha de todos é `secret_sauce`. Essas credenciais são públicas e servem só para treino.

## Módulo 7: Login e test ids

**Objetivo:** testar um formulário de login, o caminho feliz e os de erro, e entender quando usar `getByTestId`.

**Conceitos:**
1. **Caminho feliz e caminhos de erro**: testar só o login que funciona não basta. Usuário bloqueado, senha errada e campos vazios também são comportamentos.
2. **Test id**: um atributo no HTML criado **só para testes**, como `data-testid="error"`. É um contrato explícito: o desenvolvedor promete não mudá-lo à toa.
3. **Quando usar**: quando o elemento não tem papel nem texto estável (um ícone sem texto, um contêiner), ou quando o time adota esse padrão. A documentação lembra que test ids **não** são o que o usuário vê, então prefira role e texto quando eles importam.
4. **`testIdAttribute`**: o Sauce Demo usa `data-test` em vez do padrão `data-testid`. Por isso configuramos `testIdAttribute: 'data-test'` no projeto `saucedemo` (módulo 0).
5. **`toHaveURL` depois de uma ação**: confirma a navegação, com espera.

**Exemplo** (`tests/saucedemo/login.spec.ts`):

```ts
import { test, expect } from '@playwright/test';

test.describe('login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('usuário padrão entra na loja', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('usuário bloqueado vê a mensagem de erro', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByTestId('error')).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory/);
  });
});
```

**Exercícios:**
1. Teste o login com senha errada e verifique a mensagem de erro.
2. Teste o clique em **Login** com os dois campos vazios. Qual mensagem aparece?
3. Depois de logar, faça **logout** pelo menu lateral (descubra os locators com o Pick locator) e verifique que voltou para a tela de login.
4. Abra o DevTools no UI Mode (pop out do DOM) e encontre três elementos com `data-test`. Escreva um teste que use os três com `getByTestId`.

**Desafio:** o ícone do carrinho não tem texto visível. Tente localizá-lo com `getByRole` e depois com `getByTestId`. Explique em um comentário por que, neste caso, o test id é a escolha certa.

**Leitura:** [Locators: test id](https://playwright.dev/docs/locators#locate-by-test-id), [Locators: label e placeholder](https://playwright.dev/docs/locators#locate-by-label)

---

## Módulo 8: Fluxo completo de compra e soft assertions

**Objetivo:** testar uma jornada inteira do usuário, do produto até a confirmação do pedido.

**Conceitos:**
1. **Jornada (user journey)**: uma sequência de passos que entrega valor ao usuário. É o tipo de teste E2E mais importante.
2. **Teste longo vs. muitos testes curtos**: jornadas precisam de vários passos; regras isoladas (o botão muda de "Add" para "Remove") cabem em testes curtos.
3. **`test.step` em jornadas**: deixa o relatório legível ("adicionar ao carrinho", "preencher entrega", "finalizar").
4. **Soft assertion (`expect.soft`)**: se falhar, **não para** o teste; ele continua e, no fim, mostra todas as falhas juntas. Útil para conferir vários detalhes de uma tela de uma vez.
5. **Quando não usar soft**: quando o próximo passo depende daquela verificação. Se o login falhou, não faz sentido continuar.
6. **`selectOption`**: escolhe uma opção em um `<select>`.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('compra uma mochila', async ({ page }) => {
  await test.step('login', async () => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
  });

  await test.step('adicionar ao carrinho', async () => {
    const mochila = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
    await mochila.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  });

  await test.step('checkout', async () => {
    await page.getByTestId('shopping-cart-link').click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByPlaceholder('First Name').fill('Ana');
    await page.getByPlaceholder('Last Name').fill('Souza');
    await page.getByPlaceholder('Zip/Postal Code').fill('60000-000');
    await page.getByRole('button', { name: 'Continue' }).click();
  });

  await test.step('conferir resumo e finalizar', async () => {
    await expect.soft(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect.soft(page.getByText('$29.99').first()).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  });
});
```

Repare no `.first()` do preço: o valor aparece duas vezes no resumo (item e subtotal). Aqui a posição não importa, só a presença; mesmo assim, o exercício 4 pede um jeito mais preciso.

**Exercícios:**
1. Adicione dois produtos, vá ao carrinho e verifique que os dois estão lá (`toHaveCount` e `toHaveText` com lista).
2. Adicione um produto e depois clique em **Remove** na página de produtos. Verifique que o badge do carrinho some.
3. Ordene os produtos por preço, do menor para o maior (`selectOption` no seletor de ordenação), e verifique o nome do primeiro e do último.
4. No resumo do checkout, encontre o subtotal pelo seu rótulo ("Item total"), em vez de `.first()`. Use o Pick locator.

**Desafio:** escreva o teste "não deve finalizar sem CEP": preencha nome e sobrenome, deixe o CEP vazio e verifique a mensagem de erro. Use soft assertions para conferir **três** coisas na tela de erro de uma vez.

**Leitura:** [Assertions: soft assertions](https://playwright.dev/docs/test-assertions#soft-assertions), [Actions: select options](https://playwright.dev/docs/input#select-options), [API: test.step](https://playwright.dev/docs/api/class-test#test-step)

---

## Módulo 9: Page Object Model

**Objetivo:** tirar os detalhes de "como encontrar os elementos" de dentro dos testes, para que os testes descrevam o **que** acontece.

**Conceitos:**
1. **O problema**: se o botão de login mudar, você precisa editar **todos** os testes que fazem login.
2. **Page Object**: uma classe que representa uma página (ou parte dela). Ela guarda os locators e oferece métodos de alto nível, como `login(usuario, senha)`.
3. **Classe** (do roteiro de TypeScript, módulo 11): um molde com propriedades e métodos. Aqui, as propriedades são locators.
4. **`readonly`**: a propriedade não pode ser reatribuída depois do construtor.
5. **Tipos `Page` e `Locator`**: vêm de `@playwright/test` e tipam o que a classe recebe e guarda.
6. **Assertions no Page Object?** Há duas escolas. Neste roteiro, os **métodos fazem ações** e os **testes fazem as verificações**. Assim o teste continua mostrando o que está sendo testado.
7. **Imports no Playwright**: o Playwright compila o TypeScript dos testes por conta própria, então os imports **sem** extensão (`'../../pages/login-page'`) funcionam. A regra do roteiro de TypeScript (sempre `.ts`) é do Node puro.

**Exemplo** (`pages/login-page.ts`):

```ts
import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usuario: Locator;
  readonly senha: Locator;
  readonly botaoEntrar: Locator;
  readonly erro: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usuario = page.getByPlaceholder('Username');
    this.senha = page.getByPlaceholder('Password');
    this.botaoEntrar = page.getByRole('button', { name: 'Login' });
    this.erro = page.getByTestId('error');
  }

  async abrir() {
    await this.page.goto('/');
  }

  async entrar(usuario: string, senha: string) {
    await this.usuario.fill(usuario);
    await this.senha.fill(senha);
    await this.botaoEntrar.click();
  }
}
```

E o teste fica assim (`tests/saucedemo/login-pom.spec.ts`):

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';

test('usuário bloqueado vê o erro', async ({ page }) => {
  const login = new LoginPage(page);
  await login.abrir();
  await login.entrar('locked_out_user', 'secret_sauce');

  await expect(login.erro).toContainText('locked out');
});
```

**Exercícios:**
1. Crie `pages/inventory-page.ts` com um método `adicionarAoCarrinho(nomeDoProduto: string)` e uma propriedade `badgeCarrinho`.
2. Crie `pages/cart-page.ts` e `pages/checkout-page.ts`, com um método `preencherEntrega(nome, sobrenome, cep)`.
3. Reescreva o teste de compra do módulo 8 usando os Page Objects. Compare o tamanho e a legibilidade.
4. Mude o locator do botão de login dentro do `LoginPage` para algo errado e rode todos os testes de login. Quantos arquivos você precisaria corrigir sem o Page Object?

**Desafio:** crie um componente `MenuLateral` (não é uma página inteira, é uma parte que aparece em várias) com os métodos `abrir()`, `sair()` e `resetarEstado()`. Use-o dentro do `InventoryPage` como uma propriedade.

**Leitura:** [Page object models](https://playwright.dev/docs/pom), roteiro de TypeScript (módulo 11, classes)

---

## Módulo 10: Fixtures customizadas

**Objetivo:** fazer o Playwright **entregar** os Page Objects prontos para o teste, do mesmo jeito que entrega o `page`.

**Conceitos:**
1. **Fixture**: algo que o teste recebe pronto nos parâmetros: `page`, `context`, `browser`, `request`. Você já usa desde o módulo 1.
2. **Fixture customizada**: uma que **você** cria com `test.extend`.
3. **Ciclo de vida**: o código antes do `await use(...)` é a **preparação**; o código depois é a **limpeza**. O Playwright chama a limpeza mesmo se o teste falhar.
4. **Sob demanda**: a fixture só é criada se o teste pedir por ela nos parâmetros.
5. **Fixtures dependem de fixtures**: a sua pode pedir `page` e usá-lo.
6. **Fixtures vs `beforeEach`**: fixtures são reaproveitáveis entre arquivos, tipadas e sob demanda. `beforeEach` vale só para um arquivo ou grupo.
7. **Generic `<Tipo>`** (roteiro de TypeScript, módulo 15): `test.extend<MinhasFixtures>` diz ao TypeScript quais fixtures existem.

**Exemplo** (`fixtures/saucedemo.ts`):

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

type Fixtures = {
  loginPage: LoginPage;
  usuarioLogado: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.abrir();
    await use(loginPage);
  },

  usuarioLogado: async ({ loginPage }, use) => {
    await loginPage.entrar('standard_user', 'secret_sauce');
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

E no teste, o `import` passa a vir da sua fixture:

```ts
import { test, expect } from '../../fixtures/saucedemo';

test('o erro aparece para usuário bloqueado', async ({ loginPage }) => {
  await loginPage.entrar('locked_out_user', 'secret_sauce');
  await expect(loginPage.erro).toBeVisible();
});

test('o usuário logado vê os produtos', async ({ usuarioLogado, page }) => {
  await expect(page).toHaveURL(/inventory/);
});
```

**Exercícios:**
1. Adicione as fixtures `inventoryPage` e `cartPage` ao arquivo de fixtures.
2. Reescreva o teste de compra para receber `usuarioLogado`, `inventoryPage` e `cartPage` pelos parâmetros.
3. Coloque um `console.log('preparando')` antes do `use` e `console.log('limpando')` depois. Rode um teste que pede a fixture e outro que não pede. Quando cada mensagem aparece?
4. Crie uma fixture `carrinhoComMochila` que depende de `usuarioLogado` e já deixa a mochila no carrinho.

**Desafio:** o teste `o usuário logado vê os produtos` pede `usuarioLogado` mas não usa a variável. O ESLint (módulo 18) pode reclamar disso. Pesquise na documentação de fixtures a opção `{ auto: true }` e explique em que situação ela resolveria isso, e por que nem sempre é uma boa ideia.

**Leitura:** [Fixtures](https://playwright.dev/docs/test-fixtures)

---

## Módulo 11: Autenticação reaproveitada (storageState)

**Objetivo:** fazer login **uma vez** e reaproveitar a sessão em todos os testes, sem repetir o formulário.

**Conceitos:**
1. **Sessão**: depois do login, o site guarda algo no navegador (normalmente um **cookie**) que diz "este usuário está logado".
2. **`storageState`**: um arquivo JSON com os cookies e o `localStorage` de um contexto. Dá para salvar e carregar.
3. **Projeto de setup**: um projeto que roda **antes** dos outros e faz o login, salvando o `storageState`.
4. **`dependencies`**: diz que um projeto só roda depois do outro.
5. **Ganho**: login pelo formulário em todo teste é lento e testa a mesma coisa várias vezes. O formulário de login continua coberto pelos testes do módulo 7.
6. **Desligar a sessão em testes de login**: `test.use({ storageState: { cookies: [], origins: [] } })` faz um arquivo começar deslogado.
7. **Segurança**: o arquivo de sessão contém dados de login. Coloque a pasta `playwright/.auth` no `.gitignore`.

**Exemplo:**

`tests/saucedemo/auth.setup.ts` (o nome não termina em `.spec.ts`, então ele não roda como teste comum):

```ts
import { test as setup, expect } from '@playwright/test';

const arquivoSessao = 'playwright/.auth/standard-user.json';

setup('autenticar standard_user', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);

  await page.context().storageState({ path: arquivoSessao });
});
```

No `playwright.config.ts`, troque o projeto `saucedemo` por estes dois:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'saucedemo-setup',
      testDir: './tests/saucedemo',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: 'https://www.saucedemo.com', testIdAttribute: 'data-test' },
    },
    {
      name: 'saucedemo',
      testDir: './tests/saucedemo',
      dependencies: ['saucedemo-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
        testIdAttribute: 'data-test',
        storageState: 'playwright/.auth/standard-user.json',
      },
    },
  ],
});
```

(O exemplo mostra só os dois projetos novos; mantenha os outros projetos e opções do seu arquivo.)

Agora um teste já começa logado:

```ts
import { test, expect } from '@playwright/test';

test('já começa logado', async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page.getByText('Products')).toBeVisible();
});
```

E no arquivo de testes de login, logo depois dos imports:

```ts
import { test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });
```

**Exercícios:**
1. Implemente o setup e rode `npx playwright test --project=saucedemo`. Repare na ordem em que os projetos rodam.
2. Abra o arquivo `playwright/.auth/standard-user.json` e identifique o cookie da sessão. Qual o nome dele?
3. Adicione `playwright/.auth` ao `.gitignore`.
4. Meça o tempo da suíte do Sauce Demo antes e depois do setup (o relatório mostra a duração).

**Desafio:** crie um segundo arquivo de sessão para o `problem_user` e um teste que use `test.use({ storageState: ... })` para rodar com esse usuário. Encontre algum comportamento quebrado de propósito nesse usuário e escreva um teste que **documente** o bug (dica: `test.fail()` marca um teste que deve falhar).

**Leitura:** [Authentication](https://playwright.dev/docs/auth), [Project dependencies](https://playwright.dev/docs/test-projects#dependencies), [Annotations: test.fail](https://playwright.dev/docs/test-annotations)

---

## Módulo 12: Testes parametrizados (data-driven)

**Objetivo:** rodar o mesmo teste com dados diferentes sem copiar e colar.

**Conceitos:**
1. **Parametrizar**: gerar vários testes a partir de uma lista de dados.
2. **Loop fora do `test`**: um `for` no nível do arquivo cria um teste por item. Cada teste continua isolado.
3. **Títulos únicos**: o Playwright exige que os nomes sejam diferentes. Coloque o dado no título.
4. **Tipos para os dados**: um `type` ou `interface` descreve cada caso (roteiro de TypeScript, módulo 7).
5. **Não confunda com loop dentro do teste**: um loop **dentro** de um teste para no primeiro erro e mostra um teste só no relatório.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

type CasoDeLogin = {
  usuario: string;
  senha: string;
  erroEsperado: RegExp;
};

const casos: CasoDeLogin[] = [
  { usuario: 'locked_out_user', senha: 'secret_sauce', erroEsperado: /locked out/ },
  { usuario: 'standard_user', senha: 'errada', erroEsperado: /do not match/ },
  { usuario: '', senha: 'secret_sauce', erroEsperado: /Username is required/ },
];

test.use({ storageState: { cookies: [], origins: [] } });

for (const caso of casos) {
  test(`login falha para "${caso.usuario || '(vazio)'}"`, async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(caso.usuario);
    await page.getByPlaceholder('Password').fill(caso.senha);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByTestId('error')).toContainText(caso.erroEsperado);
  });
}
```

**Exercícios:**
1. Adicione o caso "senha vazia".
2. Parametrize um teste que adiciona cada um de 3 produtos ao carrinho e verifica o badge.
3. Parametrize a ordenação: para cada opção do seletor (`az`, `za`, `lohi`, `hilo`), verifique o primeiro produto.
4. Coloque dois casos com o mesmo título e rode. Leia o erro.

**Desafio:** transforme a lista de casos em um arquivo `dados/logins.json` e importe no teste. Pesquise como o TypeScript tipa um JSON importado e qual opção do `tsconfig` controla isso.

**Leitura:** [Parameterize tests](https://playwright.dev/docs/test-parameterize)

---

## Questões de entrevista da Fase 2

1. O que é o Page Object Model? Que problema ele resolve e qual é o custo?
2. Assertions devem ficar no Page Object ou no teste? Defenda uma posição.
3. O que é uma fixture no Playwright? Qual é a diferença para um `beforeEach`?
4. Como você evitaria fazer login pelo formulário em todos os testes? E como garantiria que o formulário de login continua testado?
5. Quando usar `getByTestId` em vez de `getByRole`?
6. O que são soft assertions e quando elas são uma má ideia?
7. Como você parametrizaria um teste para 20 combinações de dados? O que muda no relatório em relação a um loop dentro do teste?

---

# FASE 3: CASOS DIFÍCEIS (The Internet)

> O The Internet tem dezenas de páginas, cada uma com um problema clássico de automação. A página inicial lista todas. As credenciais do formulário de login (`tomsmith` / `SuperSecretPassword!`) aparecem na própria página.

## Módulo 13: Conteúdo dinâmico e tempos limite

**Objetivo:** lidar com elementos que aparecem, somem ou mudam depois de um tempo, **sem** esperas fixas.

**Conceitos:**
1. **Espera fixa (anti-padrão)**: `page.waitForTimeout(5000)`. Ou espera demais (teste lento) ou de menos (teste instável). Só serve para depurar.
2. **Espera pela condição**: uma assertion web-first já espera. `await expect(x).toBeVisible()` é a "espera" correta.
3. **Timeout de assertion**: o padrão é 5 segundos. Se a página demora mais, aumente **naquela assertion**: `toBeVisible({ timeout: 10_000 })`.
4. **Timeout global**: `expect: { timeout }` no config muda o padrão de todas as assertions; `timeout` muda o tempo máximo de cada teste (30 segundos por padrão).
5. **`10_000`**: o `_` é só um separador visual de milhar no JavaScript.
6. **`toBeHidden`**: espera algo **sumir** (um "Loading...", por exemplo).
7. **Elemento escondido vs. inexistente**: um elemento pode existir no HTML e estar invisível. Para o usuário, os dois casos são "não está lá", e `toBeHidden` aceita ambos.

**Exemplo** (`tests/the-internet/dinamico.spec.ts`):

```ts
import { test, expect } from '@playwright/test';

test('o texto aparece depois do carregamento', async ({ page }) => {
  await page.goto('/dynamic_loading/1');
  await page.getByRole('button', { name: 'Start' }).click();

  // O carregamento leva cerca de 5 s, o mesmo que o timeout padrão.
  await expect(page.getByRole('heading', { name: 'Hello World!' })).toBeVisible({ timeout: 10_000 });
});

test('remover e adicionar o checkbox', async ({ page }) => {
  await page.goto('/dynamic_controls');
  await page.getByRole('button', { name: 'Remove' }).click();

  await expect(page.getByText("It's gone!")).toBeVisible();
  await expect(page.getByRole('checkbox')).toBeHidden();
});
```

**Exercícios:**
1. Faça o mesmo teste para `/dynamic_loading/2` (o elemento é **criado** depois, não estava escondido). O teste precisa mudar?
2. Em `/dynamic_controls`, clique em **Enable** e verifique que o campo de texto ficou habilitado (`toBeEnabled`) e aceita texto.
3. Escreva o teste do exemplo 1 com `waitForTimeout(6000)` no lugar da assertion com timeout. Compare a duração no relatório. Depois apague.
4. Em `/add_remove_elements/`, adicione 5 elementos, remova 2 e verifique a contagem.

**Desafio:** na página `/disappearing_elements`, um item do menu aparece só às vezes. Escreva um teste que verifica os itens que **sempre** aparecem e documente, em um comentário, por que testar o item aleatório deixaria a suíte instável. O que você faria se esse comportamento fosse da sua aplicação?

**Leitura:** [Timeouts](https://playwright.dev/docs/test-timeouts), [Auto-waiting](https://playwright.dev/docs/actionability), [Assertions](https://playwright.dev/docs/test-assertions)

---

## Módulo 14: Diálogos, novas janelas e frames

**Objetivo:** lidar com o que **não** é um elemento comum da página: alertas do navegador, abas novas e páginas dentro de páginas.

**Conceitos:**
1. **Diálogo nativo**: `alert`, `confirm` e `prompt` do JavaScript. Não fazem parte do HTML, então não têm locator.
2. **Padrão do Playwright**: por padrão, diálogos são **dispensados** automaticamente. Para controlar, registre um ouvinte **antes** da ação: `page.once('dialog', ...)`.
3. **`dialog.accept()`**, **`dialog.dismiss()`** e **`dialog.message()`**: aceitar, cancelar e ler o texto. No `prompt`, `accept('texto')` responde.
4. **Evento**: algo que acontece e pode ser "escutado" (um diálogo abriu, uma aba nova abriu, um download começou).
5. **Esperar um evento**: crie a promessa **antes** da ação e dê `await` **depois**: `const p = page.waitForEvent('popup'); await clique; const nova = await p;`. Se esperar só depois do clique, o evento pode já ter passado.
6. **Frame (iframe)**: uma página dentro de outra. Os locators da página de fora não enxergam dentro dele.
7. **`frameLocator`**: entra no frame. Pode ser encadeado para frames dentro de frames.
8. **CSS aceitável**: frames não têm papel nem texto; selecionar pelo atributo `name` do frame é o caminho natural.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('aceita o confirm', async ({ page }) => {
  await page.goto('/javascript_alerts');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('I am a JS Confirm');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Click for JS Confirm' }).click();

  await expect(page.getByText('You clicked: Ok')).toBeVisible();
});

test('abre uma nova janela', async ({ page }) => {
  await page.goto('/windows');

  const novaJanelaPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Click Here' }).click();
  const novaJanela = await novaJanelaPromise;

  await expect(novaJanela.getByRole('heading', { name: 'New Window' })).toBeVisible();
});

test('lê o texto de frames aninhados', async ({ page }) => {
  await page.goto('/nested_frames');

  const meio = page.frameLocator('frame[name="frame-top"]').frameLocator('frame[name="frame-middle"]');
  await expect(meio.locator('body')).toHaveText('MIDDLE');
});
```

Repare que, no primeiro teste, o `expect` dentro do ouvinte **não** é web-first: `dialog.message()` já é um texto pronto, não um locator. Aqui o `expect` comum é o correto.

**Exercícios:**
1. Teste o botão **Click for JS Alert** e verifique a mensagem de resultado.
2. Teste o **Confirm** clicando em cancelar (`dismiss`).
3. Teste o **Prompt** respondendo `Playwright` e verificando o resultado.
4. Em `/nested_frames`, verifique o texto dos frames LEFT, RIGHT e BOTTOM.

**Desafio:** remova o `page.once` do teste do Confirm e rode. O que o Playwright fez com o diálogo? Qual resultado apareceu na página? Explique em um comentário por que esse comportamento padrão existe.

**Leitura:** [Dialogs](https://playwright.dev/docs/dialogs), [Pages (novas abas e popups)](https://playwright.dev/docs/pages), [Frames](https://playwright.dev/docs/frames), [Events](https://playwright.dev/docs/events)

---

## Módulo 15: Formulários especiais e arquivos

**Objetivo:** dominar os controles que vão além do campo de texto: checkbox sem rótulo, select, upload, download, teclado e hover.

**Conceitos:**
1. **`selectOption`**: escolhe em um `<select>` pelo valor ou pelo rótulo (`{ label: 'Option 2' }`). Um `<select>` tem o papel `combobox`.
2. **Checkbox sem rótulo**: quando a página não dá nome ao controle, não há locator "bonito". Aqui o `nth` é aceitável, porque a posição é a única informação disponível. Se a aplicação fosse sua, o certo seria **corrigir a acessibilidade** adicionando um rótulo.
3. **Upload**: `setInputFiles` preenche um `<input type="file">`. Aceita um caminho ou um arquivo criado na memória (`{ name, mimeType, buffer }`), sem precisar criar arquivo no disco.
4. **`Buffer`**: um bloco de bytes do Node. `Buffer.from('texto')` transforma texto em bytes.
5. **Download**: espere o evento `'download'` (mesmo padrão do módulo 14) e use `download.suggestedFilename()`.
6. **Teclado**: `press('Tab')`, `press('Shift+Tab')`, `press('ArrowDown')`.
7. **Hover**: conteúdo que só aparece com o mouse por cima.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('escolhe uma opção no dropdown', async ({ page }) => {
  await page.goto('/dropdown');
  const select = page.getByRole('combobox');

  await select.selectOption({ label: 'Option 2' });
  await expect(select).toHaveValue('2');
});

test('envia um arquivo criado na memória', async ({ page }) => {
  await page.goto('/upload');

  await page.locator('#file-upload').setInputFiles({
    name: 'anotacoes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Estudando Playwright'),
  });
  await page.getByRole('button', { name: 'Upload' }).click();

  await expect(page.getByRole('heading', { name: 'File Uploaded!' })).toBeVisible();
  await expect(page.getByText('anotacoes.txt')).toBeVisible();
});
```

O `#file-upload` é CSS. Inputs de arquivo costumam ser escondidos ou sem rótulo; o exercício 4 pede para você procurar uma alternativa.

**Exercícios:**
1. Em `/checkboxes`, marque o primeiro, desmarque o segundo e verifique os dois estados.
2. Em `/download`, baixe o primeiro arquivo da lista e verifique que `suggestedFilename()` não está vazio.
3. Em `/hovers`, passe o mouse sobre a primeira figura e verifique que o texto `name: user1` aparece.
4. No upload, tente encontrar o input de arquivo com `getByLabel` ou `getByRole`. Funciona? Explique o resultado.

**Desafio:** em `/key_presses`, aperte as teclas `Tab`, `Escape` e `A` em sequência, verificando a mensagem de resultado depois de cada uma. Use um loop com uma lista de pares `[tecla, textoEsperado]`.

**Leitura:** [Actions: select, upload, keys, hover](https://playwright.dev/docs/input), [Downloads](https://playwright.dev/docs/downloads), [Node.js: Buffer](https://nodejs.org/api/buffer.html)

---

## Módulo 16: Rede e testes de API

**Objetivo:** observar e controlar o que a página pede pela rede, e testar APIs sem abrir navegador.

**Conceitos:**
1. **Requisição e resposta**: toda página pede arquivos (HTML, imagens, scripts) e dados (APIs) por **HTTP**. Cada resposta tem um **status**: 200 (ok), 201 (criado), 404 (não encontrado), 500 (erro do servidor).
2. **`page.route(padrão, função)`**: intercepta requisições. Você pode **bloquear** (`route.abort()`), **responder no lugar do servidor** (`route.fulfill(...)`) ou **deixar passar** (`route.continue()`).
3. **Mock**: uma resposta falsa e controlada. A documentação recomenda usar isso para **não depender de serviços de terceiros**, que você não controla.
4. **`page.waitForResponse`**: espera uma resposta específica (mesmo padrão "promessa antes da ação").
5. **Fixture `request`**: faz requisições HTTP direto do Node, **sem navegador**. Serve para testar APIs, preparar dados antes de um teste de interface e conferir o servidor depois.
6. **JSON**: o formato de dados das APIs. `await resposta.json()` transforma em objeto.
7. **`toBeOK()`**: verifica que o status está entre 200 e 299.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('a página de status devolve 404', async ({ request }) => {
  const resposta = await request.get('/status_codes/404');
  expect(resposta.status()).toBe(404);
});

test('bloqueia imagens e a página continua funcionando', async ({ page }) => {
  await page.route('**/*.{png,jpg,jpeg}', (route) => route.abort());
  await page.goto('/hovers');
  await expect(page.getByRole('heading', { name: 'Hovers' })).toBeVisible();
});

test('API pública: cria um post', async ({ request }) => {
  const resposta = await request.post('https://jsonplaceholder.typicode.com/posts', {
    data: { title: 'Estudando', body: 'Playwright', userId: 1 },
  });

  await expect(resposta).toBeOK();
  expect(resposta.status()).toBe(201);
  expect(await resposta.json()).toMatchObject({ title: 'Estudando', userId: 1 });
});
```

Repare que, no primeiro e no último teste, o `expect` sobre `resposta.status()` não leva `await`: o status já chegou, é um número. Já o `toBeOK()` recebe a resposta inteira e é assíncrono. O JSONPlaceholder é a mesma API pública do módulo 20 do roteiro de TypeScript.

**Exercícios:**
1. Teste os status 200, 301 e 500 da página `/status_codes` com a fixture `request`. O 301 vai surpreender: a fixture segue redirecionamentos sozinha. Descubra na documentação da API como desligar isso (dica: `maxRedirects`).
2. Com `request`, busque `https://jsonplaceholder.typicode.com/posts/1` e verifique os campos `id` e `userId`.
3. Em `/broken_images`, use `page.on('response', ...)` para contar quantas imagens respondem com 404.
4. Use `page.route` com `route.fulfill` para trocar a resposta de alguma requisição de uma página por um conteúdo seu (dica: experimente na página `/` do The Internet, interceptando o próprio HTML).

**Desafio:** escreva um teste que usa `request` para buscar os posts do usuário 1 no JSONPlaceholder e verifica, com um tipo TypeScript para o post, que **todos** têm `userId` igual a 1. (Dica: `toHaveLength` e um `every`.)

**Leitura:** [Network](https://playwright.dev/docs/network), [Mock APIs](https://playwright.dev/docs/mock), [API testing](https://playwright.dev/docs/api-testing), [MDN: códigos de status HTTP](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status)

---

## Questões de entrevista da Fase 3

1. Por que `waitForTimeout` é considerado má prática? O que usar no lugar?
2. Qual é a diferença entre o timeout de uma assertion e o timeout de um teste?
3. Como o Playwright trata diálogos `alert` e `confirm` por padrão? Como você mudaria isso?
4. Por que a promessa de `waitForEvent` deve ser criada **antes** da ação que dispara o evento?
5. Como você testaria uma página dentro de um iframe?
6. Quando faz sentido usar `page.route` para simular uma API? Quais os riscos de abusar de mocks?
7. Qual é a diferença entre um teste de API com a fixture `request` e um teste de interface? Como os dois podem trabalhar juntos?

---

# FASE 4: QUALIDADE PROFISSIONAL

## Módulo 17: Depuração

**Objetivo:** descobrir **por que** um teste falhou, rápido e com evidências.

**Conceitos:**
1. **Mensagem de erro**: o Playwright mostra o locator, o que ele esperava, o que recebeu e um log das tentativas. Leia inteira antes de qualquer coisa.
2. **Trace**: uma gravação completa: cada ação, foto do DOM antes e depois, rede, console e o código. É o que o UI Mode mostra, salvo em um arquivo `.zip`.
3. **`--trace on`**: grava trace de todos os testes nesta execução. Pesado; use para investigar.
4. **`trace: 'on-first-retry'`** (já está no seu config): grava só quando um teste falha e é repetido. É o padrão recomendado para CI.
5. **Relatório HTML**: cada teste falho tem o erro, os passos, anexos e o link para o trace.
6. **Screenshot e vídeo**: `screenshot: 'only-on-failure'` e `video: 'retain-on-failure'` no `use`. A documentação recomenda o trace em vez deles no CI, porque mostra muito mais.
7. **Limitação do seu ambiente**: `--debug`, `--headed` e o `codegen` precisam de janela, que o container não tem. O UI Mode e o trace cobrem quase tudo; no Zorin (ou outro sistema suportado) os três funcionam direto.

**Exemplo** (dentro do container):

```bash
# Grava trace de todos os testes do TodoMVC
npx playwright test --project=todomvc --trace on

# Abre o relatório (no Omarchy, abra o arquivo index.html no navegador)
ls playwright-report/
```

**Exercícios:**
1. Quebre um teste trocando o texto esperado. Rode com `--trace on`, abra o relatório e encontre, no trace, a foto do DOM no momento da falha.
2. No trace, abra a aba **Network** e encontre uma requisição da página. Qual o status dela?
3. Ative `screenshot: 'only-on-failure'` no config, quebre um teste e encontre o screenshot no relatório.
4. Use `console.log` dentro de um teste e encontre a mensagem na aba **Console** do UI Mode.

**Desafio:** escreva um teste que falhe por **strictness** (um locator que encontra dois elementos). Usando só a mensagem de erro e o trace, descubra quais são os dois elementos e corrija o locator sem usar `nth`.

**Leitura:** [Debugging tests](https://playwright.dev/docs/debug), [Trace viewer](https://playwright.dev/docs/trace-viewer), [Best Practices: debugging](https://playwright.dev/docs/best-practices#configure-debugging)

---

## Módulo 18: Lint e checagem de tipos

**Objetivo:** pegar erros **antes** de rodar os testes, de forma automática.

**Conceitos:**
1. **Lint**: uma ferramenta que lê o código e aponta erros e más práticas sem executar. O mais usado em JavaScript e TypeScript é o **ESLint**.
2. **Regra**: cada verificação do lint. Pode ser erro ou aviso.
3. **`@typescript-eslint/no-floating-promises`**: aponta Promises sem `await`. A documentação do Playwright recomenda essa regra justamente para pegar o `await` esquecido.
4. **`eslint-plugin-playwright`**: um plugin da comunidade com regras específicas: `missing-playwright-await`, `no-wait-for-timeout`, `prefer-web-first-assertions`, `no-force-option`, `no-page-pause`, `no-focused-test`, entre outras.
5. **`tsc --noEmit`**: roda o verificador de tipos do TypeScript sem gerar arquivos. Pega chamadas com parâmetros errados.
6. **Scripts no `package.json`**: atalhos como `npm run lint`.

**Passo a passo** (dentro do container):

```bash
npm install -D eslint typescript-eslint eslint-plugin-playwright typescript
```

Crie `eslint.config.mjs` na raiz do projeto:

```js
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    files: ['tests/**/*.ts', 'pages/**/*.ts', 'fixtures/**/*.ts'],
    extends: [tseslint.configs.base],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
  },
);
```

Leitura atômica: o primeiro bloco liga o leitor de TypeScript em todas as pastas de código e ativa a regra das Promises (o `projectService` deixa o ESLint usar as informações de tipo, que essa regra precisa). O segundo bloco ativa as regras recomendadas do Playwright só nos testes.

O ESLint precisa de um `tsconfig.json`. Se o seu projeto ainda não tem, crie este na raiz:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["tests", "pages", "fixtures", "playwright.config.ts"]
}
```

E no `package.json`, dentro de `"scripts"`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "check": "tsc",
    "test": "playwright test"
  }
}
```

(Se `"scripts"` já existir, só acrescente as três linhas.) O `types: ["node"]` precisa do pacote `@types/node`, que o `npm init playwright` já instala.

**Exercícios:**
1. Rode `npm run lint` e `npm run check`. Corrija o que aparecer.
2. Remova um `await` de propósito e rode o lint. Qual regra pegou?
3. Escreva um teste com `page.waitForTimeout(1000)` e outro com `expect(await x.isVisible()).toBe(true)`. Quais regras reclamam?
4. Leia a lista de regras do `eslint-plugin-playwright` e escolha duas que **não** estão no `recommended` para ativar. Justifique a escolha em um comentário no config.

**Desafio:** a regra `no-raw-locators` proíbe `page.locator(...)`. Ative-a e veja onde ela reclama nos seus testes. Para cada ocorrência, decida: dá para trocar por um locator de usuário, ou é um caso legítimo (como o frame do módulo 14)? Use `// eslint-disable-next-line` com um comentário explicando o motivo nos casos legítimos.

**Leitura:** [Best Practices: lint your tests](https://playwright.dev/docs/best-practices#lint-your-tests), [eslint-plugin-playwright](https://github.com/mskelton/eslint-plugin-playwright), [typescript-eslint: no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/), [TypeScript | Playwright](https://playwright.dev/docs/test-typescript)

---

## Módulo 19: Configuração avançada, tags e relatórios

**Objetivo:** controlar **como** a suíte roda: em paralelo ou não, com quantas repetições, quais testes e com quais relatórios.

**Conceitos:**
1. **Worker**: um processo que roda testes. Vários workers rodam em paralelo.
2. **`workers`**: quantos ao mesmo tempo. A documentação recomenda **1 no CI** para priorizar estabilidade, a não ser que a máquina seja forte.
3. **`retries`**: repetir testes que falharam. Um teste que passa só na repetição é marcado como **flaky** no relatório. Repetição esconde instabilidade; use para **detectar**, não para ignorar.
4. **Tags**: etiquetas em testes, como `@smoke` (testes rápidos e essenciais) ou `@lento`. Sintaxe: `test('nome', { tag: '@smoke' }, async ...)`.
5. **`--grep`** e **`--grep-invert`**: rodam (ou excluem) testes cujo nome ou tag combine com um padrão.
6. **Reporters**: `list` (terminal), `html`, `junit` (XML para ferramentas de CI), `json`. Pode usar vários ao mesmo tempo.
7. **Anotações**: `test.skip()` (pular), `test.fixme()` (sabidamente quebrado), `test.slow()` (triplica o timeout), `test.fail()` (deve falhar).

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

test('a página inicial abre', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to the-internet' })).toBeVisible();
});

test('carregamento dinâmico', { tag: ['@lento', '@regressao'] }, async ({ page }) => {
  test.slow();
  await page.goto('/dynamic_loading/1');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByRole('heading', { name: 'Hello World!' })).toBeVisible({ timeout: 10_000 });
});
```

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @lento
npx playwright test --reporter=list
```

**Exercícios:**
1. Marque um teste de cada site como `@smoke` e rode só eles.
2. Configure dois reporters ao mesmo tempo no config: `[['list'], ['html', { open: 'never' }]]`.
3. Rode a suíte com `--workers=1` e depois com o padrão. Compare a duração.
4. Ative `retries: 1` localmente, crie um teste que falha só às vezes (dica: `Math.random()`) e veja como ele aparece no relatório. Depois apague esse teste.

**Desafio:** organize uma estratégia de tags para a sua suíte: quais testes rodariam a cada commit (`@smoke`), quais rodariam uma vez por dia (`@regressao`) e por quê. Escreva em um comentário no topo do `playwright.config.ts`.

**Leitura:** [Configuration](https://playwright.dev/docs/test-configuration), [Annotations e tags](https://playwright.dev/docs/test-annotations), [Reporters](https://playwright.dev/docs/test-reporters), [Retries](https://playwright.dev/docs/test-retries), [Parallelism](https://playwright.dev/docs/test-parallel)

---

## Módulo 20: Testes visuais

**Objetivo:** detectar mudanças **visuais** que nenhuma assertion de texto pegaria (um botão que mudou de cor, um layout quebrado).

**Conceitos:**
1. **Teste de regressão visual**: compara um screenshot atual com um screenshot de referência (o **baseline**).
2. **`toHaveScreenshot()`**: na primeira execução, **cria** o baseline e falha (de propósito); nas próximas, compara.
3. **`--update-snapshots`**: atualiza os baselines quando a mudança visual é intencional.
4. **Diferença de pixels**: o Playwright tolera pequenas diferenças com `maxDiffPixels` ou `maxDiffPixelRatio`.
5. **`mask`**: cobre partes que mudam sempre (datas, anúncios) com uma caixa colorida antes de comparar.
6. **O grande problema**: fontes e renderização mudam entre sistemas operacionais e versões de navegador. Por isso o nome do arquivo de baseline inclui o navegador e o sistema.
7. **A vantagem do seu setup**: como seus testes rodam **sempre** no mesmo container, o baseline é estável. Essa é uma das razões citadas pela documentação de CI para rodar testes dentro de containers.

**Exemplo:**

```ts
import { test, expect } from '@playwright/test';

// A sessão salva do módulo 11 não deve interferir na tela de login
test.use({ storageState: { cookies: [], origins: [] } });

test('a tela de login do Sauce Demo não mudou', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('login.png');
});

test('o formulário de login, sem o logo', async ({ page }) => {
  await page.goto('/');
  const formulario = page.locator('form');
  await expect(formulario).toHaveScreenshot('formulario-login.png', { maxDiffPixels: 50 });
});
```

**Exercícios:**
1. Rode o primeiro teste duas vezes. O que acontece na primeira? E na segunda? Encontre a pasta onde o baseline foi salvo.
2. Faça um screenshot só do cabeçalho da página de produtos (logado).
3. Use `mask` para esconder o badge do carrinho em um screenshot da página de produtos.
4. Use `page.route` (módulo 16) para bloquear as imagens dos produtos e compare: o screenshot muda? Isso é bom ou ruim para um teste visual?

**Desafio:** o `problem_user` mostra imagens erradas nos produtos. Crie um teste visual que passa com o `standard_user` e falha com o `problem_user`. Abra o relatório e encontre a visualização de diferença (diff) entre as imagens.

**Leitura:** [Visual comparisons](https://playwright.dev/docs/test-snapshots), [Screenshots](https://playwright.dev/docs/screenshots), [CI: via containers](https://playwright.dev/docs/ci#via-containers)

---

## Módulo 21: Integração contínua com GitHub Actions

**Objetivo:** rodar a suíte automaticamente a cada `push`, no mesmo container que você usa no Omarchy.

**Conceitos:**
1. **CI (Continuous Integration)**: um servidor que roda os testes a cada mudança no repositório.
2. **Workflow**: um arquivo YAML em `.github/workflows/` que descreve quando e como rodar.
3. **`on`**: os gatilhos (`push`, `pull_request`).
4. **`jobs` e `steps`**: um job roda em uma máquina; os steps são os comandos, em ordem.
5. **`container`**: roda o job dentro de uma imagem Docker. É o equivalente ao seu `docker run`.
6. **`npm ci`**: instala exatamente as versões do `package-lock.json`. É o `npm install` para CI.
7. **Artefato (artifact)**: um arquivo que o CI guarda para você baixar depois, como o relatório HTML.
8. **`if: ${{ !cancelled() }}`**: roda o passo mesmo se os testes falharem, para o relatório ser salvo quando você mais precisa dele.
9. **`process.env.CI`**: o GitHub Actions define essa variável, e é por isso que o seu config muda `retries` e `forbidOnly` no CI.

**Exemplo** (`.github/workflows/playwright.yml`):

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.63.0-noble
      options: --user 1001
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
      - name: Instalar dependências
        run: npm ci
      - name: Lint e tipos
        run: npm run lint && npm run check
      - name: Testes
        run: npx playwright test
      - uses: actions/upload-artifact@v5
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

Compare com o seu `docker run`: a imagem é a mesma, o `checkout` faz o papel do `-v`, e o `--user 1001` evita o problema de arquivos criados como root.

**Exercícios:**
1. Crie um repositório no GitHub para o projeto, adicione o workflow e faça um push. Acompanhe a execução na aba **Actions**.
2. Quebre um teste, faça push e baixe o relatório pelo artefato. Abra o trace.
3. Mude o workflow para rodar só os testes `@smoke` em pull requests e a suíte completa em pushes na `main`.
4. Adicione um gatilho `schedule` (cron) para rodar a suíte completa todo dia às 6h.

**Desafio:** pesquise **sharding** na documentação e divida a suíte em 2 partes rodando em paralelo no GitHub Actions. Explique em um comentário no workflow quando isso vale a pena e quando é exagero.

**Leitura:** [Continuous Integration](https://playwright.dev/docs/ci), [Setting up CI](https://playwright.dev/docs/ci-intro), [Sharding](https://playwright.dev/docs/test-sharding), [GitHub Docs: jobs em container](https://docs.github.com/en/actions/using-jobs/running-jobs-in-a-container)

---

## Módulo 22: Agentes de IA para testes

**Objetivo:** usar agentes de IA para **revisar** e **gerar** testes, sem perder o entendimento do que está sendo feito.

**Conceitos:**
1. **Agente**: um assistente de IA com instruções fixas e ferramentas (ler arquivos, buscar na web, rodar comandos) para uma tarefa específica.
2. **Agente revisor** (`revisor-playwright`, criado junto com este roteiro): lê seus testes e aponta melhorias com base nas boas práticas da documentação, explicando o fundamento de cada sugestão. Ele **não edita** seus arquivos. O apêndice C explica como instalar e usar.
3. **Playwright Test Agents**: o próprio Playwright traz três agentes:
   - **planner**: explora a aplicação e escreve um plano de testes em Markdown.
   - **generator**: transforma o plano em arquivos de teste, verificando os locators ao vivo.
   - **healer**: roda os testes que falham e tenta consertá-los.
4. **`npx playwright init-agents --loop=...`**: gera as definições desses agentes para a sua ferramenta (VS Code, Claude Code, Codex ou OpenCode). A documentação pede para gerar de novo sempre que atualizar o Playwright.
5. **Seed test**: um teste "semente" que prepara o ambiente e serve de exemplo de estilo para os testes gerados.
6. **Cuidado pedagógico**: um agente que escreve o teste por você é ótimo para produtividade, mas atrapalha o aprendizado se usado cedo demais. Neste roteiro, use o **revisor** desde o início e os agentes que **geram** só depois de terminar a Fase 3.
7. **Limitação do seu ambiente**: os agentes do Playwright precisam controlar um navegador. No container, isso pede a configuração do apêndice "noVNC" da documentação ou um sistema suportado (como o Zorin).

**Exercícios:**
1. Instale o agente revisor (apêndice C) e peça uma revisão da pasta `tests/todomvc`. Aplique as sugestões que fizerem sentido e anote as que você discordar, com o motivo.
2. Peça ao revisor para revisar um teste em que você colocou três erros de propósito (um `await` faltando, um `waitForTimeout` e um locator CSS). Ele encontrou os três?
3. Leia a página de Test Agents e responda em um comentário: qual a diferença entre o que o **healer** faz e o que um humano faria ao consertar um teste?
4. (Opcional, se tiver ambiente com janela) Rode `npx playwright init-agents` para a ferramenta que você usa e peça ao planner um plano para o fluxo de checkout do Sauce Demo. Compare com os testes que você escreveu na Fase 2.

**Desafio:** escreva, com suas palavras, uma política de uso de IA para a sua suíte: o que pode ser gerado automaticamente, o que precisa de revisão humana e como você garante que um teste gerado está testando a coisa certa (e não só passando).

**Leitura:** [Playwright Test Agents](https://playwright.dev/docs/test-agents), [Claude Code: subagents](https://code.claude.com/docs/en/sub-agents)

---

## Questões de entrevista da Fase 4

1. Um teste falhou só no CI. Quais são seus primeiros passos para investigar?
2. Por que a documentação recomenda trace em vez de vídeo e screenshot no CI?
3. Retries resolvem testes instáveis? Explique.
4. Que regras de lint você considera essenciais para uma suíte Playwright? Por quê?
5. Quais os desafios de testes visuais e como o Docker ajuda?
6. Como você organizaria uma suíte com 500 testes para dar retorno rápido em pull requests?
7. Como você usaria IA para acelerar a escrita de testes sem perder a qualidade?

---

# FASE 5: PROJETO FINAL

## Módulo 23: Uma suíte completa para o portfólio

**Objetivo:** construir uma suíte de testes profissional para o **Sauce Demo**, juntando tudo o que você estudou, pronta para mostrar em entrevistas.

**Requisitos:**

1. **Repositório próprio no GitHub**, com um `README.md` explicando: o que é testado, como rodar (com Docker), a estrutura de pastas e as decisões que você tomou.
2. **Estrutura:**

```
suite-saucedemo/
  playwright.config.ts
  eslint.config.mjs
  tsconfig.json
  pages/            Page Objects (login, produtos, carrinho, checkout, menu)
  fixtures/         fixtures customizadas
  dados/            casos de teste parametrizados (JSON)
  tests/
    auth.setup.ts
    login.spec.ts
    produtos.spec.ts
    carrinho.spec.ts
    checkout.spec.ts
    visual.spec.ts
  .github/workflows/playwright.yml
```

3. **Cobertura mínima:**
   - Login: sucesso, usuário bloqueado, senha errada, campos vazios (parametrizado).
   - Produtos: as 4 ordenações (parametrizado), adicionar e remover itens, badge do carrinho.
   - Carrinho: itens corretos, remover item, continuar comprando.
   - Checkout: jornada completa, validação dos três campos obrigatórios, conferência do total (item total + taxa = total).
   - Menu: logout e "Reset App State".
   - Visual: pelo menos 2 telas.
   - Um teste que **documenta** um bug do `problem_user` com `test.fail()`.
4. **Boas práticas obrigatórias:**
   - Nenhum `waitForTimeout`, nenhum `force: true`, nenhum XPath.
   - Locators de usuário sempre que possível; test ids só onde justificado.
   - Login reaproveitado com `storageState`.
   - Page Objects entregues por fixtures.
   - Testes independentes (passam com `--repeat-each=3` e em qualquer ordem).
   - `npm run lint` e `npm run check` sem erros.
5. **CI**: workflow no container oficial, com relatório como artefato e tags `@smoke` rodando em pull requests.
6. **Revisão**: rode o agente revisor na suíte inteira e registre no README as sugestões que você aplicou.

**Conceitos aplicados por módulo:**

| Parte do projeto | Módulos |
|------------------|---------|
| Locators e assertions | 2, 4, 5 |
| Jornada e steps | 6, 8 |
| Login e test ids | 7 |
| Page Objects e fixtures | 9, 10 |
| Sessão salva | 11 |
| Dados parametrizados | 12 |
| Lint, tipos e config | 18, 19 |
| Visual | 20 |
| CI | 21 |
| Revisão com agente | 22 |

**Extras opcionais:** rodar a suíte também no Firefox e no WebKit (a imagem Docker já tem os três); um teste de acessibilidade com a biblioteca `@axe-core/playwright` (veja a página Accessibility testing); uma segunda suíte menor para o The Internet usando a mesma estrutura.

---

# APÊNDICES

## A. Erros comuns e o que significam

| Mensagem (resumida) | Causa mais comum |
|---------------------|------------------|
| `strict mode violation: ... resolved to 2 elements` | O locator encontrou mais de um elemento. Torne-o mais específico (nome, `exact`, `filter`, encadeamento) |
| `Timeout 5000ms exceeded` em um `expect` | O elemento não chegou ao estado esperado: locator errado, texto diferente ou a página é mais lenta (módulo 13) |
| `Test timeout of 30000ms exceeded` | O teste inteiro passou de 30 s, geralmente por uma ação esperando um elemento que nunca aparece |
| `element is not visible` / `not enabled` / `intercepts pointer events` | Auto-waiting esperou e o elemento continuou escondido, desabilitado ou coberto por outro (um modal, um banner) |
| `Target page, context or browser has been closed` | Faltou um `await` e o teste terminou antes da ação |
| `Duplicate test title` | Dois testes com o mesmo nome no mesmo arquivo (comum em loops, módulo 12) |
| `A snapshot doesn't exist ... writing actual` | Primeira execução de um teste visual: o baseline foi criado (módulo 20) |
| `Executable doesn't exist` | A versão do `@playwright/test` não bate com a da imagem Docker |

## B. Cola rápida

**Locators, em ordem de preferência:**

```ts
page.getByRole('button', { name: 'Salvar' });
page.getByLabel('E-mail');
page.getByPlaceholder('Digite seu nome');
page.getByText('Bem-vindo');
page.getByAltText('logo');
page.getByTitle('Fechar');
page.getByTestId('carrinho');
page.locator('#id-ou-css');          // último recurso
```

**Assertions mais usadas:**

```ts
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toHaveText('exato');
await expect(locator).toContainText('parte');
await expect(locator).toHaveCount(3);
await expect(locator).toHaveValue('valor');
await expect(locator).toBeChecked();
await expect(locator).toBeEnabled();
await expect(page).toHaveURL(/caminho/);
await expect(page).toHaveTitle(/Título/);
```

**Comandos:**

```bash
npx playwright test --project=saucedemo        # um site
npx playwright test -g "login"                 # pelo nome
npx playwright test --grep @smoke              # pela tag
npx playwright test --repeat-each=5            # caçar flaky
npx playwright test --trace on                 # gravar trace
npx playwright test --update-snapshots         # atualizar baselines
npx playwright test --ui-port=8080 --ui-host=0.0.0.0
```

## C. O agente revisor (`revisor-playwright`)

O arquivo `revisor-playwright.md` entregue com este roteiro é um **subagente do Claude Code**: um arquivo Markdown com um cabeçalho (nome, descrição, ferramentas) e as instruções de revisão.

**Instalação (Claude Code):**

```bash
mkdir -p ~/aprendendo-playwright/.claude/agents
cp revisor-playwright.md ~/aprendendo-playwright/.claude/agents/
```

Na pasta `.claude/agents/` do projeto, ele vale só para esse projeto. Em `~/.claude/agents/`, vale para todos os seus projetos.

**Uso** (abra o Claude Code na pasta do projeto, no Omarchy):

```
Use o subagente revisor-playwright para revisar tests/todomvc
```

Ou digite `@` e escolha o agente na lista. O revisor:
- lê os testes (e os Page Objects e fixtures que eles usam);
- classifica cada achado como 🔴 crítico, 🟡 importante ou 🟢 sugestão;
- mostra o trecho atual e a versão melhorada, com o **fundamento** e o link da documentação;
- elogia o que está bom, para você saber o que manter;
- **não altera** seus arquivos: quem aplica a mudança é você.

**Sem Claude Code:** cole seu teste aqui no chat e peça uma revisão. O corpo do arquivo (tudo depois do segundo `---`) também funciona como instruções em outras ferramentas que aceitam agentes personalizados em Markdown.

## D. Checklist de progresso

- [x] Módulo 0: Ambiente
- [x] Módulo 1: Anatomia e navegação
- [x] Módulo 2: Locators
- [ ] Módulo 3: Ações
- [ ] Módulo 4: Assertions web-first
- [ ] Módulo 5: Filtrar e encadear
- [ ] Módulo 6: Organização e isolamento
- [ ] Questões da Fase 1
- [ ] Módulo 7: Login e test ids
- [ ] Módulo 8: Fluxo de compra e soft assertions
- [ ] Módulo 9: Page Object Model
- [ ] Módulo 10: Fixtures
- [ ] Módulo 11: storageState
- [ ] Módulo 12: Testes parametrizados
- [ ] Questões da Fase 2
- [ ] Módulo 13: Conteúdo dinâmico e timeouts
- [ ] Módulo 14: Diálogos, janelas e frames
- [ ] Módulo 15: Formulários especiais e arquivos
- [ ] Módulo 16: Rede e API
- [ ] Questões da Fase 3
- [ ] Módulo 17: Depuração
- [ ] Módulo 18: Lint e tipos
- [ ] Módulo 19: Configuração, tags e relatórios
- [ ] Módulo 20: Testes visuais
- [ ] Módulo 21: CI com GitHub Actions
- [ ] Módulo 22: Agentes de IA
- [ ] Questões da Fase 4
- [ ] Módulo 23: Projeto final

---

## Fontes

- [Documentação oficial do Playwright](https://playwright.dev/docs/intro): base de todos os conceitos. A ordem das fases segue o caminho Getting Started (escrever, rodar, depurar) e depois os guias.
- [Best Practices | Playwright](https://playwright.dev/docs/best-practices): filosofia de testes, ordem de preferência dos locators, web-first assertions, lint, depuração e CI. É também a base das regras do agente revisor.
- [Locators | Playwright](https://playwright.dev/docs/locators): módulos 2 e 5, `testIdAttribute` e strictness.
- [Agents | Playwright](https://playwright.dev/docs/test-agents): módulo 22 (planner, generator, healer e `init-agents`). O exemplo da documentação usa o próprio TodoMVC, de onde vêm os locators `Toggle Todo` e `What needs to be done?`.
- [Continuous Integration | Playwright](https://playwright.dev/docs/ci) e [Docker | Playwright](https://playwright.dev/docs/docker): módulo 21 e ambiente.
- [eslint-plugin-playwright](https://github.com/mskelton/eslint-plugin-playwright): módulo 18 e regras usadas pelo revisor.
- [Claude Code: subagents](https://code.claude.com/docs/en/sub-agents): formato do agente revisor (apêndice C).
- [TodoMVC demo](https://demo.playwright.dev/todomvc), [Sauce Demo](https://www.saucedemo.com) e [The Internet](https://the-internet.herokuapp.com): sites de treino. A lista de páginas e as credenciais do The Internet foram conferidas na própria página inicial.
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/): API pública do módulo 16 (a mesma do roteiro de TypeScript).

> **Como os exemplos foram verificados:** todo o código TypeScript deste roteiro passou pelo verificador de tipos (`tsc`) e pelo ESLint com as regras do módulo 18, usando o Playwright 1.63.0. A configuração do módulo 0 foi carregada com `npx playwright test --list`, e a configuração do ESLint foi testada contra um arquivo com erros de propósito (`await` faltando, `waitForTimeout`, assertion manual e `force: true`): ela apontou os quatro. Os testes **não** puderam ser executados contra os três sites no ambiente em que o roteiro foi escrito (o acesso a eles estava bloqueado). Por isso, os textos e locators específicos de cada site vêm da documentação e do conhecimento desses sites; se algum não bater, o Pick locator do UI Mode resolve, e esse ajuste faz parte do treino.

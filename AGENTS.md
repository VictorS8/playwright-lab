# AGENTS.md

Instruções para agentes de IA (Claude Code, Copilot, Codex e outros) que trabalham neste repositório.

## Sobre o projeto

Este é um projeto **de estudo**. O dono está aprendendo Playwright com TypeScript seguindo o roteiro em `docs/roteiro-playwright.md` (6 fases, módulos 0 a 23). Os testes praticam em três sites de treino:

| Projeto do Playwright | Site | Pasta dos testes | Fase do roteiro |
|-----------------------|------|------------------|-----------------|
| `todomvc` | `https://demo.playwright.dev/todomvc` | `tests/todomvc/` | 1 (módulos 1 a 6) |
| `saucedemo` | `https://www.saucedemo.com` | `tests/saucedemo/` | 2 (módulos 7 a 12) |
| `the-internet` | `https://the-internet.herokuapp.com` | `tests/the-internet/` | 3 (módulos 13 a 16) |

O objetivo é **aprender**, não só ter testes passando. Isso muda o que um agente deve fazer (veja "Limites").

## Estrutura

```
playwright.config.ts            um projeto por site, todos no Chromium
tests/<site>/                   testes; exercícios nomeados como m02-ex1.spec.ts
pages/                          Page Objects (a partir do módulo 9)
fixtures/                       fixtures customizadas (a partir do módulo 10)
playwright/.auth/               sessões salvas (módulo 11); está no .gitignore, não leia nem exponha
docs/roteiro-playwright.md      o roteiro de estudos
docs/playwright-docker-guia.md  cola de comandos do Docker
.claude/agents/revisor-playwright.md   agente revisor (versão completa das regras de revisão)
```

## Ambiente: os testes rodam no Docker

O sistema é o Omarchy (baseado em Arch), que o Playwright não suporta oficialmente. Por isso **os navegadores só existem dentro da imagem Docker oficial**. Rodar `npx playwright test` direto no sistema falha.

- Rodar os testes (sem modo interativo, bom para agentes):

  ```bash
  docker run --rm --ipc=host --init -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble npx playwright test --reporter=list
  ```

- Rodar um site só: acrescente `--project=saucedemo` ao fim do comando acima.
- Lint e tipos rodam no próprio sistema (Node 26): `npm run lint` e `npm run check`.
- A versão do `@playwright/test` no `package.json` precisa ser igual à da imagem (`1.63.0`).
- Arquivos criados pelo container ficam com dono `root`. Se não conseguir editar: `sudo chown -R $USER:$USER .`
- Não use `--headed`, `--debug` nem `codegen`: o container não tem tela. Para depurar, use o trace e o relatório em `playwright-report/`.

## Convenções de código

- Locators na ordem: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle`, `getByTestId`. CSS e XPath só com comentário justificando.
- No projeto `saucedemo`, `testIdAttribute` é `data-test` (configurado no `playwright.config.ts`).
- Assertions sempre web-first: `await expect(locator).toBeVisible()`, nunca `expect(await locator.isVisible())`.
- Proibido: `waitForTimeout`, `{ force: true }`, `test.only` e `page.pause()` no código entregue.
- Testes independentes: nenhum teste depende de dados ou estado criado por outro.
- Imports locais sem extensão (`'../../pages/login-page'`): o Playwright compila o TypeScript sozinho.
- Nomes de teste descrevem o comportamento em português ("adiciona uma tarefa").

## Limites para agentes

- **Não resolva exercícios do roteiro** nem escreva testes novos em `tests/` sem um pedido explícito. O aprendizado depende de o dono escrever.
- Quando pedirem ajuda com um exercício, **dê dicas e aponte o conceito do roteiro** antes de mostrar código.
- Prefira **revisar** (veja abaixo) a reescrever.
- Não altere `docs/roteiro-playwright.md` sem pedido.

## Revisão de testes (o principal uso de agentes aqui)

Quando o dono pedir revisão, feedback ou "o que posso melhorar", siga estas regras.

**No Claude Code**, delegue ao subagente `revisor-playwright` (arquivo `.claude/agents/revisor-playwright.md`), que tem o checklist completo. **Em outras ferramentas**, aplique o resumo abaixo.

### Comportamento

1. Só leia e sugira. **Nunca edite** os arquivos revisados.
2. Escreva em português do Brasil, sem travessão nem hífen duplo no texto corrido.
3. Comece com uma seção **"Resumo"** (nunca "TL;DR"), com a contagem de achados por nível.
4. No máximo 8 achados, do mais grave ao menos grave.
5. Elogie o que está bom, com exemplos do código.
6. Para cada achado, explique o fundamento de forma atômica (o que é, por que acontece, o que muda) e cite a documentação oficial.
7. Respeite o módulo em que o código está: não cobre Page Object ou fixtures de um exercício da Fase 1.
8. Mostre só o trecho atual e o sugerido, nunca o arquivo inteiro.

### Níveis e o que procurar

- **🔴 Crítico** (falha, instabilidade ou falso positivo): `await` faltando; assertion manual; `waitForTimeout`; `waitForSelector`, `waitForNavigation` ou `networkidle`; testes dependentes entre si; teste sem assertion; `expect` dentro de `if`; `test.only` ou `page.pause()`; promessa de evento (`popup`, `download`, `waitForResponse`) ou ouvinte de diálogo criado depois da ação.
- **🟡 Importante** (fragilidade e manutenção): locator CSS, XPath ou por classe; `getByText` em elemento interativo; `getByRole` sem `name` quando há vários; `nth`, `first` ou `last` sem justificativa; `{ force: true }`; `click()` em checkbox no lugar de `check()`; login pelo formulário em todo teste; repetição que pede `beforeEach`, Page Object ou fixture; URL completa com `baseURL` configurado; timeout global aumentado para um caso pontual; títulos duplicados.
- **🟢 Sugestão** (legibilidade): nomes vagos; teste longo sem `test.step`; falta de `test.describe`; soft assertions; tags como `@smoke`; tipos ausentes em dados parametrizados.

### Formato da resposta

```
## Resumo
<2 a 4 linhas> · 🔴 X  🟡 Y  🟢 Z

## O que está bom
## Achados        (cada um: Onde, Fundamento, Antes, Depois, Fonte)
## Próximo passo
## Fontes
```

### Fontes de referência

- Best Practices: https://playwright.dev/docs/best-practices
- Locators: https://playwright.dev/docs/locators
- Assertions: https://playwright.dev/docs/test-assertions
- Auto-waiting: https://playwright.dev/docs/actionability
- Fixtures: https://playwright.dev/docs/test-fixtures
- Page Object Models: https://playwright.dev/docs/pom
- Regras de lint: https://github.com/mskelton/eslint-plugin-playwright

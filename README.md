# Playwright Lab

Projeto de estudo de testes end-to-end com Playwright e TypeScript.

## Motivação

Aprender Playwright na prática, seguindo um roteiro próprio de 6 fases ([docs/roteiro-playwright.md](docs/roteiro-playwright.md)). Os testes exercitam três sites feitos para treino de automação:

| Projeto | Site | Pasta dos testes |
|---------|------|------------------|
| `todomvc` | https://demo.playwright.dev/todomvc | `tests/todomvc/` |
| `saucedemo` | https://www.saucedemo.com | `tests/saucedemo/` |
| `the-internet` | https://the-internet.herokuapp.com | `tests/the-internet/` |

O foco é entender os conceitos aplicados a Web (locators, assertions, Page Objects, fixtures), não só ter testes passando.

## Tecnologias

- **[Playwright](https://playwright.dev) 1.63.0** com TypeScript: framework de testes end-to-end. Todos os projetos rodam no Chromium.
- **[Docker](https://www.docker.com)** (só no Linux): os testes rodam dentro da [imagem oficial do Playwright](https://playwright.dev/docs/docker), que já traz os navegadores. O Arch Linux não é suportado oficialmente pelo Playwright, então os navegadores existem só dentro do container. No Windows e no macOS, os testes rodam direto no sistema ([veja abaixo](#comandos-no-windows-e-macos)).

> A versão do `@playwright/test` no `package.json` precisa ser igual à da imagem Docker (`1.63.0`).

## Comandos no Linux (Arch)

### Primeira vez

```bash
# 1. Instalar e ligar o Docker (já sobe sozinho nos próximos boots)
sudo pacman -S docker
sudo systemctl enable --now docker.service

# 2. Usar o Docker sem sudo (depois, saia da sessão e entre de novo)
sudo usermod -aG docker $USER
groups                       # deve listar "docker"

# 3. Baixar a imagem do Playwright
docker pull mcr.microsoft.com/playwright:v1.63.0-noble

# 4. Instalar as dependências do projeto
npm install
```

> **Atenção ao passo 2.** Estar no grupo `docker` equivale a ter acesso de root: quem roda `docker run` consegue montar o sistema inteiro dentro de um container, sem pedir senha. Por isso, rode só imagens confiáveis, como a oficial do Playwright ([fonte](https://docs.docker.com/engine/security/#docker-daemon-attack-surface)).

### Rotina: rodar os testes

Na raiz do projeto, entre no container:

```bash
docker run -it --rm --ipc=host --init -p 127.0.0.1:8080:8080 -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble /bin/bash
```

O `-p 127.0.0.1:8080:8080` liga a porta 8080 do container à porta 8080 do Arch. Ele só é necessário para o UI Mode (abaixo).

> **Não tire o `127.0.0.1`.** Com ele, a porta só abre para a própria máquina. Sem ele (`-p 8080:8080`), o UI Mode fica acessível para qualquer um na mesma rede, e o Docker passa por cima do firewall do sistema ([fonte](https://docs.docker.com/engine/network/packet-filtering-firewalls/)).

Dentro do container:

```bash
npx playwright test                          # todos os projetos
npx playwright test --project=todomvc        # só um projeto
npx playwright test tests/todomvc/m01.spec.ts   # só um arquivo
npx playwright test --ui-port=8080 --ui-host=0.0.0.0   # UI Mode
```

O container não tem tela, então o UI Mode não abre uma janela. Em vez disso, ele sobe um servidor web:

- `--ui-port=8080` escolhe a porta do servidor.
- `--ui-host=0.0.0.0` faz o servidor aceitar conexões de fora do container. Sem ele, o servidor só responde dentro do próprio container e o Arch não consegue acessar.

Com o servidor de pé, abra **http://localhost:8080** no navegador do Arch. Para parar, use Ctrl+C no terminal do container. Também dá para combinar com `--project=<nome>`.

O relatório fica em `playwright-report/index.html`. Abra esse arquivo no navegador do sistema.

Para rodar sem entrar no container (ele abre, roda e fecha sozinho):

```bash
docker run --rm --ipc=host --init -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble npx playwright test --reporter=list
```

Para um projeto só, acrescente `--project=<nome>` ao fim.

### Fechar o container

```bash
exit          # ou Ctrl+D (Ctrl+C antes, se algo estiver rodando)
```

Conferir que fechou mesmo:

```bash
docker ps     # não deve listar nenhum container do Playwright
docker ps -a  # também vazio: o --rm apaga o container ao sair
```

Se algum container tiver ficado aberto, pegue o `CONTAINER ID` na saída do `docker ps` e encerre:

```bash
docker stop <CONTAINER ID>
```

### Problemas comuns

```bash
newgrp docker                  # "permission denied" no docker.sock
sudo chown -R $USER:$USER .    # arquivos criados pelo container ficam com dono root
```

## Comandos no Windows e macOS

O Playwright suporta esses sistemas oficialmente, então não há Docker: o navegador fica instalado na própria máquina. Por isso, nada de entrar ou fechar container, nem de `sudo chown`.

### Primeira vez

Instale o [Node.js LTS](https://nodejs.org) e, na raiz do projeto:

```bash
npm ci                            # instala as versões exatas do package-lock.json
npx playwright install chromium   # baixa o navegador (os três projetos usam só o Chromium)
```

> **Windows:** se o `npm` der "a execução de scripts foi desabilitada", rode uma vez no PowerShell `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` ([fonte](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies)).

### Rotina: rodar os testes

Os mesmos comandos de dentro do container, agora direto no terminal:

```bash
npx playwright test                             # todos os projetos
npx playwright test --project=todomvc           # só um projeto
npx playwright test tests/todomvc/m01.spec.ts   # só um arquivo
npx playwright test --ui                        # UI Mode numa janela, sem --ui-port nem --ui-host
```

### Comandos que o Docker não permite

O container não tem tela, então estes só funcionam aqui:

```bash
npx playwright test --headed                             # mostra o navegador durante o teste
npx playwright test --debug                              # Inspector: executa passo a passo
npx playwright test tests/todomvc/m01.spec.ts:10 --debug # depura só o teste da linha 10
npx playwright codegen demo.playwright.dev/todomvc       # grava suas ações e gera o código
npx playwright show-report                               # abre o relatório HTML
npx playwright show-trace caminho/do/trace.zip           # abre um trace no Trace Viewer
```

Também dá para rodar e depurar pela barra lateral do VS Code com a extensão [Playwright Test for VS Code](https://playwright.dev/docs/getting-started-vscode).

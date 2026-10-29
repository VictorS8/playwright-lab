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
- **[Docker](https://www.docker.com)**: os testes rodam dentro da [imagem oficial do Playwright](https://playwright.dev/docs/docker), que já traz os navegadores. O sistema de desenvolvimento (Arch Linux) não é suportado oficialmente pelo Playwright, então os navegadores existem só dentro do container.

> A versão do `@playwright/test` no `package.json` precisa ser igual à da imagem Docker (`1.63.0`).

## Comandos

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

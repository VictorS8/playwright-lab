# Playwright + Docker: comandos

## Setup do Docker (uma vez)

```bash
sudo pacman -S docker                      # instalar
sudo systemctl enable --now docker.service # ligar serviço
sudo usermod -aG docker $USER              # usar sem sudo (relogar depois)
groups                                     # conferir grupo docker
docker run hello-world                     # testar
```

## Imagem (uma vez por versão)

```bash
docker pull mcr.microsoft.com/playwright:v1.63.0-noble  # baixar
docker images                                           # listar baixadas
```

## Criar projeto (uma vez)

```bash
mkdir -p ~/aprendendo-playwright && cd ~/aprendendo-playwright
# entrar no container (ver abaixo), depois:
npm init playwright@latest                 # navegadores: NÃO / deps sistema: NÃO
npm install -D @playwright/test@1.63.0     # mesma versão da imagem
```

## Entrar no container

```bash
pw-docker
```

Ou o comando completo:

```bash
cd ~/aprendendo-playwright
docker run -it --rm --ipc=host --init -p 127.0.0.1:8080:8080 -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble /bin/bash
```

## Dentro do container

```bash
npx playwright test                                    # rodar todos
npx playwright test tests/arquivo.spec.ts              # rodar um arquivo
npx playwright test --project=chromium                 # só Chromium
npx playwright test --ui-port=8080 --ui-host=0.0.0.0   # UI Mode
```

UI Mode no navegador: `http://localhost:8080`
Relatório: `~/aprendendo-playwright/playwright-report/index.html`

## Sair

```bash
Ctrl+C   # parar o que está rodando
exit     # sair do container (ou Ctrl+D)
docker ps  # conferir que nada ficou rodando
```

## Alias (no ~/.bashrc)

```bash
alias pw-docker='builtin cd ~/aprendendo-playwright && docker run -it --rm --ipc=host --init -p 127.0.0.1:8080:8080 -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble /bin/bash'
```

```bash
source ~/.bashrc   # recarregar
```

## Problemas comuns

```bash
newgrp docker                                         # erro docker.sock
sudo chown -R $USER:$USER ~/aprendendo-playwright     # VS Code não salva
ls -d ~/aprendendo-playwright                         # erro zoxide / pasta
```

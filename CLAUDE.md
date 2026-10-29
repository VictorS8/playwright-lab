@AGENTS.md

## Claude Code

- Para revisar testes, use o subagente `revisor-playwright` (em `.claude/agents/`). Exemplo de pedido: "Use o subagente revisor-playwright para revisar tests/saucedemo".
- Use o subagente só ao concluir uma fase ou ao revisar uma pasta inteira, porque ele relê tudo do zero e gasta mais tokens. Para um ou dois arquivos, revise direto na conversa, aplicando as regras de revisão do `AGENTS.md`.
- O `revisor-playwright.md` está em `docs/`. O Claude Code só carrega subagentes de `.claude/agents/`, então, antes da primeira revisão de fase, crie lá um link simbólico: `mkdir -p .claude/agents && ln -s ../../docs/revisor-playwright.md .claude/agents/revisor-playwright.md`.
- Rode os testes pelo comando Docker da seção "Ambiente" do `AGENTS.md`, nunca com `npx playwright test` direto no sistema.
- Ao explicar algo, siga o padrão do dono: resumo no início, fundamento em passos atômicos e fontes com links.

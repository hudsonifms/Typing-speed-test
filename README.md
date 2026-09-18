# ⌨️ Typing Speed Test

Teste de digitação em **HTML, CSS e JavaScript puros** — sem framework, sem build, sem dependências. Solução para o desafio [Typing Speed Test](https://www.frontendmentor.io/challenges/typing-speed-test) do Frontend Mentor, com o motor de digitação, cálculo de métricas, persistência de recorde e responsividade totalmente implementados do zero.

![Preview do projeto](./preview.jpg)

## Índice

- [Visão geral](#visão-geral)
- [Demo](#demo)
- [Funcionalidades](#funcionalidades)
- [Como executar](#como-executar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como funciona](#como-funciona)
  - [Fórmulas de WPM e acurácia](#fórmulas-de-wpm-e-acurácia)
  - [Captura de digitação](#captura-de-digitação)
  - [Persistência do recorde](#persistência-do-recorde)
- [Acessibilidade](#acessibilidade)
- [Tecnologias](#tecnologias)
- [Decisões de design](#decisões-de-design)
- [Limitações conhecidas](#limitações-conhecidas)
- [Roadmap](#roadmap)
- [Autor](#autor)

## Visão geral

O app apresenta uma passagem de texto e mede a velocidade e a precisão do usuário enquanto ele digita. É possível escolher a **dificuldade** do texto (fácil / médio / difícil) e o **modo** de teste (cronômetro de 60s ou passagem completa), acompanhar WPM, acurácia e tempo em tempo real, e comparar o resultado com o próprio recorde pessoal, salvo localmente.

O repositório partiu apenas do starter code do Frontend Mentor (marcação sem estilo, sem lógica). Todo o HTML semântico, o CSS (incluindo os estados de hover/focus e o layout responsivo) e o JavaScript (motor de digitação, cronômetro, cálculo de métricas e persistência) foram escritos para este projeto — os detalhes de cada decisão estão em [IMPLEMENTACAO.md](./IMPLEMENTACAO.md).

## Demo

Como a aplicação carrega os textos via `fetch()`, ela precisa ser servida por HTTP (abrir o `index.html` direto com duplo clique não funciona — veja [Como executar](#como-executar)).

- Repositório: [github.com/hudsonifms/Typing-speed-test](https://github.com/hudsonifms/Typing-speed-test)
- Desafio original: [Frontend Mentor — Typing Speed Test](https://www.frontendmentor.io/challenges/typing-speed-test)

## Funcionalidades

- **Dois modos de teste** — cronômetro de 60 segundos ou passagem completa (o texto some do cronômetro e a contagem de tempo passa a ser crescente).
- **Três dificuldades** — fácil, médio e difícil, cada uma sorteando uma passagem diferente de `data.json` sem repetir a última sorteada.
- **Início flexível** — pelo botão "Start Typing Test" ou simplesmente clicando no texto e começando a digitar.
- **Feedback caractere a caractere** — cada letra digitada é marcada como correta (verde), incorreta (vermelho, com sublinhado) ou como posição atual do cursor, em tempo real.
- **Métricas ao vivo** — WPM, acurácia (%) e tempo restante/decorrido, recalculados a cada tecla.
- **Erros não se apagam com backspace** — corrigir um erro atualiza o feedback visual, mas o erro original continua contando contra a acurácia final (conforme o enunciado do desafio).
- **Tela de resultados com três variações** — *Baseline Established!* (primeiro teste), *High Score Smashed!* (novo recorde, com confete) e *Test Complete!* (execução normal).
- **Recorde pessoal persistente** — salvo em `localStorage`, sobrevive a recarregamentos da página.
- **Totalmente responsivo** — de 375px (mobile) a desktop; os controles de dificuldade/modo viram um dropdown compacto em telas pequenas e uma fileira de pílulas em telas largas, a partir da mesma marcação HTML.
- **Acessível por teclado e leitor de tela** — ver seção [Acessibilidade](#acessibilidade).

## Como executar

O `data.json` (banco de passagens) é carregado com `fetch()`, e navegadores bloqueiam `fetch()` em páginas abertas via `file://`. É necessário servir a pasta por um servidor HTTP local:

```bash
# Node
npx serve .

# Python
python -m http.server 4173
```

Ou abra a pasta no VS Code e use a extensão **Live Server**.

Depois acesse `http://localhost:4173` (ou a porta indicada pelo servidor escolhido).

> Se o arquivo for aberto diretamente pelo navegador (`file://`), a aplicação detecta a falha ao carregar os textos e exibe uma mensagem explicativa em vez de uma tela em branco.

## Estrutura do projeto

```
.
├── assets/
│   ├── fonts/            # Sora (Regular, SemiBold, Bold) em woff2
│   └── images/           # Ícones, logos e padrões SVG
├── design/               # Referências visuais do desafio (desktop/mobile, hover, focus)
├── data.json             # Banco de passagens (10 fáceis, 10 médias, 10 difíceis)
├── index.html            # Marcação semântica da aplicação
├── styles.css            # Design tokens, layout responsivo, estados e animações
├── script.js             # Motor de digitação, cronômetro, métricas e persistência
├── style-guide.md         # Guia de estilo original do desafio (cores, tipografia, breakpoints)
├── IMPLEMENTACAO.md       # Relatório detalhado de tudo que foi implementado e por quê
└── ANALISE-FRONTEND-MENTOR.md  # Auditoria dos critérios de avaliação do Frontend Mentor
```

## Como funciona

### Fórmulas de WPM e acurácia

```
WPM (líquido)  = (caracteres corretos / 5) / minutos decorridos
Acurácia       = (teclas totais − teclas erradas) / teclas totais × 100
```

- "Palavra" é definido como 5 caracteres — o padrão adotado por ferramentas como MonkeyType e 10FastFingers.
- Os contadores de teclas digitadas e de erros são **cumulativos** e nunca decrementam: apagar um erro com backspace corrige o feedback visual, mas não devolve a acurácia perdida.
- No modo Timed, o cronômetro é exibido como `0:SS` (contagem regressiva de 60 a 0); no modo Passage, como `M:SS` crescente, já que a digitação pode passar de um minuto.

### Captura de digitação

A captura das teclas é feita por um `<textarea>` invisível, ouvindo o evento `input` (em vez de `keydown`). Isso é necessário porque teclados virtuais em iOS/Android não emitem eventos `keydown` de forma confiável — ler o valor do campo e comparar (diff) com o texto esperado funciona tanto em desktop quanto em mobile.

### Persistência do recorde

O melhor WPM alcançado é salvo em `localStorage` sob a chave `typing-speed-test:personal-best`. A leitura e a escrita são protegidas por `try/catch`, já que navegação anônima ou armazenamento bloqueado pelo navegador pode lançar exceção — nesses casos a aplicação continua funcionando normalmente, apenas sem guardar o recorde entre sessões.

## Acessibilidade

- Grupos de opções (dificuldade e modo) marcados com `role="radiogroup"` / `role="radio"` e `aria-checked`, navegáveis pelas setas do teclado.
- Dropdown mobile com `aria-expanded` no botão que o controla.
- Tela de resultados com `role="status"` para ser anunciada por leitores de tela.
- Skip link para pular direto para o teste.
- `:focus-visible` visível em todos os elementos interativos.
- Sem armadilha de foco: o campo de digitação não força o foco de volta ao perder o foco; qualquer tecla imprimível redireciona o foco automaticamente, sem quebrar a navegação por `Tab`.
- `Espaço` com foco em um botão ativa o botão em vez de iniciar o teste sem querer.
- `@media (prefers-reduced-motion: reduce)` desativa animações (confete, pulso do cursor, estrelas decorativas).

## Tecnologias

- **HTML5** semântico
- **CSS3** — variáveis customizadas, Flexbox, Grid, mobile-first
- **JavaScript** (Vanilla, sem frameworks) — manipulação de DOM, eventos, estado da aplicação
- **LocalStorage** — persistência do recorde pessoal
- Fonte [Sora](https://fonts.google.com/specimen/Sora) (pesos 400, 600, 700)

## Decisões de design

Pontos ambíguos entre o enunciado e as referências visuais do desafio, e a decisão adotada em cada um — detalhamento completo em [IMPLEMENTACAO.md](./IMPLEMENTACAO.md):

| Ponto ambíguo | Decisão adotada |
| --- | --- |
| Rótulo do botão ao bater o recorde (desktop e mobile divergem) | "Beat This Score" nos dois tamanhos |
| Recorde pessoal antes do primeiro teste | Bloco fica oculto, em vez de mostrar "0 WPM" |
| Dificuldade padrão ao carregar a página | Medium |
| Cor da acurácia | Branca sem digitação, verde em 100%, vermelha abaixo disso |
| Teste encerrado sem digitar nada | Mostra "Test Complete!" e não grava recorde de 0 WPM |

## Limitações conhecidas

- Espaçamentos e tamanhos foram estimados a partir dos JPGs de referência (o arquivo Figma é exclusivo para assinantes Pro do Frontend Mentor), podendo haver diferenças de poucos pixels.
- Não há um layout intermediário dedicado para tablet — o breakpoint de desktop (`48rem`) já se adapta bem a essa faixa.

## Roadmap

- [ ] Ranking de pontuações por nível de dificuldade
- [ ] Histórico das últimas execuções
- [ ] Modo de treino com texto personalizado
- [ ] Atalhos de teclado adicionais
- [ ] Sincronização de recordes em nuvem

## Autor

**Hudson Batista**
- GitHub: [@hudsonifms](https://github.com/hudsonifms)

---

Challenge by [Frontend Mentor](https://www.frontendmentor.io?ref=challenge).

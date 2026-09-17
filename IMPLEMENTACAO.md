# Typing Speed Test — Relatório de Implementação

Documento que descreve o estado inicial do projeto, tudo que estava faltando, o que foi
implementado, e a justificativa de cada decisão técnica.

- **Desafio:** Frontend Mentor — *Typing Speed Test*
- **Stack:** HTML + CSS + JavaScript puros (sem framework, sem build, sem dependências)
- **Data:** 16/09/2026

---

## 1. Ponto de partida

O repositório continha **apenas o starter code** do Frontend Mentor. Nada da aplicação
existia ainda:

| Arquivo | Estado inicial |
| --- | --- |
| `index.html` | Rascunho de 57 linhas — só texto solto e comentários `<!-- WPM -->`, sem tags semânticas, sem CSS, sem JS |
| `styles.css` | **Não existia** |
| `script.js` | **Não existia** |
| `data.json` | Fornecido pelo desafio (30 textos: 10 easy, 10 medium, 10 hard) — usado, não alterado |
| `assets/` | Fontes Sora + ícones SVG fornecidos — usados, não alterados |
| `design/` | 13 JPGs de referência (desktop, mobile, hover, focus) — usados como especificação |

Ou seja: **100% da aplicação (marcação, estilo e lógica) precisou ser escrita.**

---

## 2. Arquivos alterados / criados

| Arquivo | Ação | Descrição |
| --- | --- | --- |
| `index.html` | **Reescrito** | Estrutura semântica completa: header, barra de estatísticas, controles, área do texto, tela de resultados, rodapé |
| `styles.css` | **Criado** | ~900 linhas — design tokens, layout mobile-first, breakpoint desktop, estados hover/focus, animações |
| `script.js` | **Criado** | ~480 linhas — motor de digitação, cronômetro, cálculo de métricas, persistência, dropdowns acessíveis |
| `IMPLEMENTACAO.md` | **Criado** | Este documento |
| `data.json`, `assets/`, `design/` | Intactos | Material original do desafio |

Nenhuma dependência externa foi adicionada. O projeto continua sendo três arquivos estáticos,
conforme solicitado (apenas HTML, CSS e JS).

---

## 3. Funcionalidades que faltavam e foram implementadas

Cada item abaixo estava listado no `README.md` do desafio e **não tinha nenhuma implementação**.

### 3.1 Controles do teste

| Requisito | Implementação | Por quê |
| --- | --- | --- |
| Iniciar pelo botão | `#start-btn` → `startTest()` | Caminho explícito exigido pelo design |
| Iniciar clicando no texto e digitando | `mousedown` no `.passage-viewport` + handler global de `keydown` | O design traz literalmente "Or click the text and start typing". O overlay recebeu `pointer-events: none` para que o clique atravesse até o texto, e só o botão volta a ser clicável |
| Dificuldade (Easy / Medium / Hard) | Radiogroup em `.control[data-control="difficulty"]` | Troca de dificuldade sorteia um texto novo daquele nível e zera o teste |
| Modo (Timed 60s / Passage) | Radiogroup em `.control[data-control="mode"]` | Troca de modo **mantém o mesmo texto** e apenas reinicia a contagem — só a regra de tempo mudou, não faz sentido trocar o parágrafo |
| Reiniciar a qualquer momento | `#restart-btn` → `resetTest({ newPassage: true })` | Sorteia um texto novo da dificuldade atual, como pede o enunciado |

**Detalhe de sorteio:** `pickPassage()` evita repetir o mesmo texto duas vezes seguidas —
sortear e cair no mesmo parágrafo passa a impressão de que o botão não funcionou.

### 3.2 Experiência de digitação

| Requisito | Implementação | Por quê |
| --- | --- | --- |
| Captura das teclas | `<textarea>` invisível (`.typing-input`) + evento `input` | Ouvir só `keydown` quebra em teclado virtual de celular (Android/iOS não emitem `keydown` confiável). Ler o `value` do campo e fazer *diff* funciona em desktop **e** mobile |
| Feedback visual por caractere | Cada caractere vira um `<span class="char">`; classes `--correct` (verde), `--incorrect` (vermelho + sublinhado), `--current` (cursor) | Espelha exatamente o design `desktop-started.jpg` |
| Cursor | `.char--current` com fundo translúcido e animação `cursor-pulse` | O design mostra um bloco cinza sobre o caractere atual |
| Backspace corrige, mas o erro continua contando | Contadores `keystrokes` e `errors` são **cumulativos e nunca decrementam**; só caracteres *novos* (índice ≥ `typed.length`) são contabilizados | Requisito explícito: "original errors still count against accuracy" |
| WPM / Acurácia / Tempo em tempo real | `renderStats()` chamado a cada tecla e a cada 100 ms | — |
| Quebra de linha correta | `spans` inline + `white-space: pre-wrap` no container | Elementos *inline* não criam ponto de quebra, então o navegador continua quebrando só nos espaços. Se eu usasse `inline-block` por palavra, as palavras quebrariam no meio |
| Espaço digitado errado | `.char--incorrect.char--space` ganha fundo vermelho | Um espaço errado é invisível só com `color`; sem fundo o usuário não entende por que errou |
| Texto rola conforme digita | `keepCursorVisible()` ajusta `scrollTop` do viewport | No mobile só cabem ~9 linhas; sem isso o cursor sumiria da tela |

### 3.3 Resultados e progresso

As três variações de tela final foram implementadas em `RESULT_COPY` e aplicadas por
`renderResults()`:

| Situação | Título | Ícone | Botão | Extra |
| --- | --- | --- | --- | --- |
| Primeiro teste concluído | *Baseline Established!* | `icon-completed.svg` | Beat This Score | estrelas decorativas |
| Superou o recorde | *High Score Smashed!* | `icon-new-pb.svg` | Beat This Score | **confete** animado |
| Conclusão normal | *Test Complete!* | `icon-completed.svg` | Go Again | estrelas decorativas |

- **Recorde pessoal persistente:** `localStorage`, chave `typing-speed-test:personal-best`.
  Leitura e escrita envolvidas em `try/catch` porque navegação anônima / storage bloqueado
  lança exceção — a aplicação continua funcionando, só não guarda o recorde.
- **Cards de resultado:** WPM, Acurácia e `acertos/erros` (verde `/` vermelho), como no design.

### 3.4 Interface e responsividade

| Requisito | Implementação |
| --- | --- |
| Layout mobile (375px) e desktop (1440px) | Mobile-first; breakpoint em `48rem` |
| Controles viram dropdown no mobile | **Uma única marcação** para os dois layouts: no desktop `.control__options` é `position: static` e vira uma fileira de pílulas; no mobile o `.control__trigger` aparece e a lista vira popup absoluto com indicador de rádio (`::before`) |
| Logo adaptativo | `logo-large.svg` (desktop) / `logo-small.svg` (mobile) |
| "Personal best:" → "Best:" no mobile | Dois `<span>` alternados por media query |
| Estados de hover | Pílulas e botões conforme `hover-states.jpg` |
| Estados de foco | `:focus-visible` com contorno branco, conforme `focus-states.jpg` |

**Por que marcação única para os controles:** duplicar o HTML (uma versão desktop + uma
mobile) exigiria sincronizar dois grupos de botões e duplicaria os listeners. Com CSS
trocando apenas o *modo de exibição* do mesmo elemento, existe uma única fonte de verdade.

---

## 4. Fórmulas adotadas

O design mostra números de exemplo que **não fecham entre si** (WPM 85 com 120 caracteres
corretos em 60s daria 24 WPM), então são valores ilustrativos. Foram adotadas as definições
padrão do mercado:

```
WPM (líquido)  = (caracteres corretos / 5) / minutos decorridos
Acurácia       = (teclas totais − teclas erradas) / teclas totais × 100
Caracteres     = corretos (posição bate com o texto) / erros acumulados
```

- "Palavra" = 5 caracteres é o padrão da indústria (MonkeyType, 10FastFingers).
- A acurácia usa contadores **acumulados**, e por isso apagar com backspace não recupera a
  acurácia perdida — exatamente o que o enunciado pede.
- O número verde de "Characters" usa a posição final correta; o vermelho usa o total
  acumulado de erros.

### Formato do cronômetro

O design mostra `0:60` para um minuto cheio (e não `1:00`). Para reproduzir isso:

- **Modo Timed:** sempre `0:SS`, com `SS` de 60 a 00 — fiel ao design.
- **Modo Passage:** `M:SS` normal, porque a contagem é crescente e pode passar de um minuto.

---

## 5. Decisões e ambiguidades resolvidas

| Ponto ambíguo | Decisão | Justificativa |
| --- | --- | --- |
| Rótulo do botão no recorde: desktop diz "Beat This Score", mobile diz "Go Again" | Usado **"Beat This Score"** nos dois | Os JPGs se contradizem; o desktop é o mais detalhado e o texto é mais coerente com a celebração |
| Recorde pessoal antes do 1º teste | Bloco fica **oculto** | Não existe design para "Personal best: — WPM"; mostrar zero seria inventar estado |
| Dificuldade padrão | **Medium** | O design mostra Hard selecionado, mas é só o estado do mockup; Medium é o ponto de partida neutro |
| Cor da acurácia | Branca enquanto ninguém digitou, verde em 100%, vermelha abaixo disso | Cobre os quatro estados observados nos JPGs sem inventar limiares |
| Cor do tempo | Amarela só enquanto o teste roda | `desktop-started.jpg` mostra amarelo em andamento e branco parado |
| Teste encerrado sem digitar nada (timeout com 0 WPM) | Mostra "Test Complete!", **não** grava recorde | Gravar um recorde de 0 WPM bloquearia a mensagem "Baseline Established!" para sempre |

---

## 6. Acessibilidade

- `role="radiogroup"` / `role="radio"` + `aria-checked` nos controles, com navegação por setas.
- `aria-expanded` no gatilho do dropdown mobile.
- `role="status"` na tela de resultados, para que leitores de tela anunciem o resultado.
- Skip link para pular direto ao teste.
- `:focus-visible` visível em todos os elementos interativos.
- **Sem armadilha de foco:** o campo de captura não se re-foca à força no `blur`. Em vez
  disso, digitar qualquer tecla imprimível redireciona o foco de volta — assim `Tab`
  continua funcionando para quem navega por teclado.
- `Espaço` com foco em um botão ativa o botão em vez de iniciar o teste.
- `@media (prefers-reduced-motion: reduce)` desliga animações (confete, cursor, estrelas).

---

## 7. Como executar

O `data.json` é lido com `fetch()`, e navegadores bloqueiam `fetch()` em URLs `file://`.
Por isso é preciso servir a pasta por HTTP:

```bash
# qualquer uma das opções
npx serve .
python -m http.server 4173
# ou a extensão "Live Server" do VS Code
```

Depois abra `http://localhost:4173`.

> Se o projeto for aberto com duplo clique no `index.html`, a aplicação detecta a falha e
> exibe uma mensagem explicando o motivo, em vez de mostrar uma tela em branco.

---

## 8. Checklist do desafio

- [x] Iniciar pelo botão
- [x] Iniciar clicando no texto e digitando
- [x] Selecionar dificuldade (Easy / Medium / Hard)
- [x] Alternar entre Timed (60s) e Passage
- [x] Reiniciar com texto novo a qualquer momento
- [x] WPM, acurácia e tempo em tempo real
- [x] Verde para acertos, vermelho sublinhado para erros, cursor visível
- [x] Backspace corrige mas o erro permanece na acurácia
- [x] Tela de resultado com WPM, acurácia e acertos/erros
- [x] "Baseline Established!" no primeiro teste
- [x] "High Score Smashed!" com confete ao bater o recorde
- [x] Recorde pessoal persistido em `localStorage`
- [x] Layout responsivo (375px → desktop)
- [x] Estados de hover e foco em todos os elementos interativos

---

## 9. Limitações conhecidas

- **Não foi testado em navegador real nesta máquina** (não havia ferramenta de automação
  disponível no ambiente). Validado por revisão de código, checagem de sintaxe, conferência
  de todos os `id` entre HTML e JS, e verificação de que todos os arquivos são servidos
  com status 200. Recomendo abrir e testar manualmente antes de entregar.
- Espaçamentos e tamanhos de fonte foram estimados a partir dos JPGs (o Figma é exclusivo
  para assinantes Pro), então podem haver diferenças de alguns pixels.
- Não há layout intermediário dedicado para tablet — o breakpoint de `48rem` já entrega o
  layout desktop, que se adapta bem nessa faixa.

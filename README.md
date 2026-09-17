Teste de digitação
🎯 Visão Geral
Este projeto é uma aplicação web moderna de teste de digitação desenvolvida com HTML5, CSS3 e JavaScript puro (Vanilla). A interface foi cuidadosamente projetada para simular uma ferramenta profissional de avaliação de velocidade e precisão, oferecendo múltiplos modos de teste, seleção de dificuldade, feedback visual em tempo real e persistência de recordes.

O principal objetivo foi transformar um desafio de design em uma experiência altamente funcional, responsiva e fluida, aprimorando conceitos avançados de UI, UX e lógica de programação frontend.

🔗 Links e Recursos
Desafio original: Frontend Mentor

Repositório do código: GitHub

Demo local: Execute o projeto em um servidor local para testar todas as funcionalidades.

⚡ Funcionalidades Principais
Modos de Teste Variados:

Modo cronometrado de 60 segundos.

Modo de passagem com contador crescente.

Níveis de Dificuldade: Seleção dinâmica entre os níveis fácil, média e difícil.

Métricas em Tempo Real: Cálculo instantâneo de WPM (Palavras por Minuto), precisão (%) e tempo decorrido.

Feedback Visual Avançado: Indicação por caractere dividida em correto, incorreto e posição atual do cursor.

Tela de Resultados: Exibição detalhada de desempenho com alertas de Personal Best (recorde batido).

Persistência de Dados: Salvamento automático da melhor pontuação utilizando o localStorage.

Design Responsivo: Layout totalmente adaptado para proporcionar uma excelente experiência tanto em desktops quanto em dispositivos móveis.

🛠️ Tecnologias Utilizadas
O projeto foi construído utilizando tecnologias web fundamentais, sem dependência de frameworks externos:

HTML5: Estruturação semântica da aplicação.

CSS3: Estilização customizada, variáveis e layout responsivo.

JavaScript (Vanilla): Lógica de manipulação de eventos, cálculo de métricas e controle de estado.

LocalStorage: Armazenamento local do melhor desempenho do usuário.

🚀 Como Executar o Projeto
Como a aplicação realiza requisições assíncronas para carregar os textos dinamicamente via fetch(), é necessário executá-la através de um servidor local para evitar erros de CORS.

Opção 1: Python
No terminal, dentro da pasta do projeto, execute:

Bash
python -m http.server 8000
Acesse no navegador: http://localhost:8000

Opção 2: VS Code Live Server
Abra a pasta do projeto no Visual Studio Code e clique na opção Live Server na barra inferior para iniciar a aplicação instantaneamente.

📂 Estrutura do Projeto
Plaintext
.
├── assets/
│   ├── fonts/
│   └── images/
├── design/
├── data.json
├── index.html
├── script.js
├── styles.css
├── README.md
├── README-template.md
├── style-guide.md
├── preview.jpg
├── IMPLEMENTACAO.md
└── ANALISE-FRONTEND-MENTOR.md
💡 O que Aprendi
O desenvolvimento deste projeto proporcionou um sólido aprendizado prático em diversos pilares do desenvolvimento web moderno:

Manipulação avançada do DOM com JavaScript puro.

Gestão eficiente de estado da aplicação e eventos de interface.

Implementação de lógica de timer e atualização sincronizada em tempo real.

Algoritmos para cálculo preciso de WPM e acurácia.

Persistência e recuperação segura de dados utilizando localStorage.

Técnicas de refinamento visual e adaptação para responsividade mobile.

🧗‍♂️ Desafios Superados
Sincronização: Alinhar com precisão o timer, os cálculos de desempenho e a digitação contínua do usuário.

Cálculo de Acurácia: Garantir que o sistema contabilizasse corretamente erros, acertos e correções em tempo real.

Renderização Visual: Manter o texto perfeitamente alinhado com o cursor e o feedback visual caractere por caractere.

Experiência Multi-dispositivo: Assegurar consistência e usabilidade tanto em teclados físicos de desktop quanto em telas touch/mobile.

🔮 Desenvolvimento Contínuo (Próximos Passos)
[ ] Implementar um sistema de ranking por nível de dificuldade.

[ ] Criar um histórico detalhado das últimas pontuações.

[ ] Adicionar um modo de treino com inserção de textos personalizados.

[ ] Expandir recursos de acessibilidade (a11y) e atalhos de teclado.

[ ] Integrar com um backend para salvamento de recordes em nuvem.

Implementação, Lógica e Refinamento: Hudson Batista

📌 Status do Projeto
✅ Concluído: Aplicação totalmente funcional rodando no navegador, com design responsivo, motor de cálculo de desempenho otimizado e persistência de recordes ativa.
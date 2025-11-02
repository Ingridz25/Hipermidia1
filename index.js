// 1. IMPORTAR O READLINE
const readline = require('readline');

// 2. IMPORTAR AS PARTES DO MVC
const Model = require('./model.js'); // A instância Singleton
const View = require('./view.js');   // A instância da View
const Controller = require('./controller.js'); // A Classe do Controller

// 3. CONFIGURAR O READLINE
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 4. "LIGAR TUDO" (INJEÇÃO DE DEPENDÊNCIA)
// Criamos o cérebro (Controller) e damos a ele acesso
// aos dados (Model) e à impressora (View).
const controller = new Controller(Model, View);

// 5. INICIAR O JOGO
// O Controller manda a View mostrar a primeira sala
controller.iniciarJogo();

// 6. DEFINIR O GAME LOOP
function gameLoop() {
  
  // Verifica se a condição de vitória foi atingida (pergunta ao Model)
  if (Model.verificarVitoria()) {
    rl.close(); // Encerra o jogo
    return;
  }
  
  // Pergunta por input
  rl.question('> ', (input) => {
    
    // Passa o input para o Controller processar
    // O Controller vai decidir o que fazer
    controller.processarComando(input);
    
    // Chama o loop novamente para a próxima rodada
    gameLoop();
  });
}

// 7. CHAMAR O LOOP PELA PRIMEIRA VEZ
gameLoop();
const readline = require('readline');
const mapa = require('./mapa.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// --- VARIÁVEIS DE ESTADO DO JOGADOR ---
let salaAtual = mapa.main;
let inventario = {}; // O inventário começa vazio.
const maxItens = mapa.max_itens;

function gameLoop() {
  console.log(`\n[${salaAtual}]`);
  const dadosDaSala = mapa[salaAtual];
  console.log(dadosDaSala.description);

  // --- MOSTRA OS ITENS NA SALA ---
  if (dadosDaSala.itens && Object.keys(dadosDaSala.itens).length > 0) {
    for (const nomeItem in dadosDaSala.itens) {
      const descItem = dadosDaSala.itens[nomeItem];
      console.log(`Aqui pode ser visto: ${descItem}.`);
    }
  }

  // --- MOSTRA AS SAÍDAS (DIREÇÕES) ---
  const saidasDisponiveis = Object.keys(dadosDaSala).filter(key => key !== 'description' && key !== 'itens');
  if (saidasDisponiveis.length > 0) {
    const textoSaidas = saidasDisponiveis.map(direcao => `${direcao}, para ${dadosDaSala[direcao]}`).join('. ');
    console.log(`*** Você pode ir para ${textoSaidas}.`);
  }

  // --- PERGUNTA AO JOGADOR E PROCESSA O COMANDO ---
  rl.question('> ', (input) => {
    const partes = input.trim().toLowerCase().split(' ');
    const acao = partes[0];   // A primeira palavra é a ação (ex: "pegue", "north")
    const alvo = partes[1];    // A segunda palavra é o alvo (ex: "faca")

    // LÓGICA PARA MOVIMENTO
    if (saidasDisponiveis.includes(acao)) {
      salaAtual = dadosDaSala[acao];
    }
    // LÓGICA PARA O COMANDO "LISTA"
    else if (acao === 'lista') {
      if (Object.keys(inventario).length === 0) {
        console.log("Seu inventário está vazio.");
      } else {
        console.log("No seu inventário você tem:");
        for (const nomeItem in inventario) {
          console.log(`- ${nomeItem}: ${inventario[nomeItem]}`);
        }
      }
    }
    // LÓGICA PARA O COMANDO "PEGUE"
    else if (acao === 'pegue') {
      if (!alvo) {
        console.log("Pegar o quê?");
      } else if (Object.keys(inventario).length >= maxItens) {
        console.log("Seu inventário está cheio! Você não pode pegar mais nada.");
      } else if (dadosDaSala.itens && dadosDaSala.itens[alvo]) {
        inventario[alvo] = dadosDaSala.itens[alvo];
        delete dadosDaSala.itens[alvo];
        console.log(`Você pegou: ${alvo}.`);
      } else {
        console.log(`Não há nenhum(a) "${alvo}" nesta sala.`);
      }
    }
    // LÓGICA PARA O COMANDO "DEIXE"
    else if (acao === 'deixe') {
      if (!alvo) {
        console.log("Deixar o quê?");
      } else if (inventario[alvo]) {
        if (!dadosDaSala.itens) {
          dadosDaSala.itens = {};
        }
        dadosDaSala.itens[alvo] = inventario[alvo];
        delete inventario[alvo];
        console.log(`Você deixou: ${alvo}.`);
      } else {
        console.log(`Você não tem um(a) "${alvo}" no seu inventário.`);
      }
    }
    // MENSAGEM PARA COMANDOS INVÁLIDOS
    else {
      console.log('Comando desconhecido. Tente "north", "pegue <item>", "deixe <item>" ou "lista".');
    }

    // Começa a próxima rodada
    gameLoop();
  });
}

console.log('--- Bem-vindo ao Jogo de Aventura ---');
gameLoop();
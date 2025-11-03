// 1. IMPORTAR OS DADOS
// [MUDANÇA 1] Renomeado para 'mapaOriginal' para guardarmos o "molde"
const mapaOriginal = require('./mapa.json');

// 2. CLASSE PARA GUARDAR O ESTADO QUE MUDA
class GameState {
  constructor() {
    this.salaAtual = mapaOriginal.main; // Usa o mapaOriginal
    this.inventario = {};
    this.maxItens = mapaOriginal.max_itens; // Usa o mapaOriginal
  }
}

// 3. CLASSE PRINCIPAL DO MODELO (SINGLETON)
class Model {
  constructor() {
    // Lógica do Singleton: se já existe uma instância, retorne ela
    if (Model.instance) {
      return Model.instance;
    }
    
    // [MUDANÇA 2] Criamos uma CÓPIA do mapa para ser modificada.
    // Se usássemos o 'mapaOriginal' direto, os itens pegos e monstros
    // mortos NUNCA seriam resetados.
    this.mapa = JSON.parse(JSON.stringify(mapaOriginal)); 
    
    this.gameState = new GameState();
    Model.instance = this;
  }

  // --- Funções para LER o estado (Usadas pelo Controller) ---

  getSalaAtualData() {
    return this.mapa.rooms[this.gameState.salaAtual];
  }

  getSalaAtualNome() {
    return this.gameState.salaAtual;
  }

  getInventario() {
    return this.gameState.inventario;
  }

  // --- Funções para MODIFICAR o estado (Lógica do Jogo) ---

  mover(direcao) {
    const salaData = this.getSalaAtualData();
    if (salaData[direcao]) {
      this.gameState.salaAtual = salaData[direcao];
      return true; 
    }
    return false;
  }

  pegarItem(item) {
    const salaData = this.getSalaAtualData();
    if (!salaData.itens || !salaData.itens[item]) {
      return "nao_existe";
    }
    if (Object.keys(this.gameState.inventario).length >= this.gameState.maxItens) {
      return "cheio";
    }

    this.gameState.inventario[item] = salaData.itens[item];
    delete salaData.itens[item];
    return "sucesso";
  }

  deixarItem(item) {
    if (!this.gameState.inventario[item]) {
      return "nao_tem";
    }

    const salaData = this.getSalaAtualData();
    if (!salaData.itens) {
      salaData.itens = {}; 
    }

    salaData.itens[item] = this.gameState.inventario[item];
    delete this.gameState.inventario[item];
    return "sucesso";
  }

  processarAcao(acaoString, itemUsado) {
    const dadosDaSala = this.getSalaAtualData();
    const partes = acaoString.split(' ');
    const comandoAcao = partes[0];
    let mensagemAcao = "";
    
    switch (comandoAcao) {
      case 'add_dir':
        const direcao = partes[1];
        const salaDestino = partes[2];
        dadosDaSala[direcao] = salaDestino; 
        mensagemAcao = `(Uma nova passagem para ${direcao} foi aberta!)`;
        break;
      
      case 'consume_item':
        delete this.gameState.inventario[itemUsado]; 
        mensagemAcao = `(O ${itemUsado} foi quebrado ou consumido.)`;
        break;

      default:
        mensagemAcao = `(Ação desconhecida: ${acaoString})`;
    }
    return mensagemAcao; 
  }

  usarItem(item) {
    const salaData = this.getSalaAtualData();
    const inventario = this.getInventario();
    let mensagens = [];
    let itemFoiUsado = false;

    if (!inventario[item]) {
      mensagens.push(`Você não tem "${item}" no seu inventário.`);
      return { mensagens };
    }

    if (salaData.monster && item === salaData.monster.defeat_item) {
      mensagens.push(salaData.monster.defeat_message);
      salaData.monster = null; 
      itemFoiUsado = true;
    }
    
    if (salaData.use && !itemFoiUsado) {
      const interacao = salaData.use.find(u => u.item === item);
      if (interacao) {
        mensagens.push(interacao.description);
        const msgAcao = this.processarAcao(interacao.action, item);
        mensagens.push(msgAcao);
        itemFoiUsado = true;
      }
    }

    if (!itemFoiUsado) {
      mensagens.push(`Não há como usar "${item}" aqui.`);
    }
    
    return { mensagens };
  }

  verificarVitoria() {
    return this.gameState.salaAtual === mapaOriginal.exit; // Usa o mapaOriginal
  }

  /**
   * [MUDANÇA 3 - A FUNÇÃO QUE FALTAVA]
   * Reseta o jogo ao estado inicial.
   */
  resetarJogo() {
    // Restaura o mapa para o estado original (com todos os itens e monstros)
    this.mapa = JSON.parse(JSON.stringify(mapaOriginal));
    // Reseta o estado do jogador (posição e inventário)
    this.gameState = new GameState();
  }

} // Fim da classe Model

// 4. EXPORTAR A INSTÂNCIA ÚNICA (SINGLETON)
const modelInstance = new Model();
module.exports = modelInstance;
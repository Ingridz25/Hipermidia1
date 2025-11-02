// 1. IMPORTAR OS DADOS
const mapa = require('./mapa.json');

// 2. CLASSE PARA GUARDAR O ESTADO QUE MUDA
class GameState {
  constructor() {
    this.salaAtual = mapa.main;
    this.inventario = {};
    this.maxItens = mapa.max_itens;
  }
}

// 3. CLASSE PRINCIPAL DO MODELO (SINGLETON)
class Model {
  constructor() {
    // Lógica do Singleton: se já existe uma instância, retorne ela
    if (Model.instance) {
      return Model.instance;
    }
    // Se não, crie a instância
    this.mapa = mapa;
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

  /**
   * Tenta mover o jogador para uma nova direção.
   * @param {string} direcao - A direção (ex: "north")
   */
  mover(direcao) {
    const salaData = this.getSalaAtualData();
    if (salaData[direcao]) {
      this.gameState.salaAtual = salaData[direcao];
      return true; // Movido com sucesso
    }
    return false; // Não foi possível mover
  }

  /**
   * Tenta pegar um item da sala.
   * Retorna um código de status.
   * @param {string} item - O nome do item
   */
  pegarItem(item) {
    const salaData = this.getSalaAtualData();
    if (!salaData.itens || !salaData.itens[item]) {
      return "nao_existe";
    }
    if (Object.keys(this.gameState.inventario).length >= this.gameState.maxItens) {
      return "cheio";
    }

    // Sucesso
    this.gameState.inventario[item] = salaData.itens[item];
    delete salaData.itens[item];
    return "sucesso";
  }

  /**
   * Tenta deixar um item na sala.
   * Retorna um código de status.
   * @param {string} item - O nome do item
   */
  deixarItem(item) {
    if (!this.gameState.inventario[item]) {
      return "nao_tem";
    }

    const salaData = this.getSalaAtualData();
    if (!salaData.itens) {
      salaData.itens = {}; // Cria o "container" de itens se não existir
    }

    // Sucesso
    salaData.itens[item] = this.gameState.inventario[item];
    delete this.gameState.inventario[item];
    return "sucesso";
  }

  /**
   * Processa uma ação de "use" (função movida do seu jogo.js)
   * @param {string} acaoString - Ex: "add_dir west cozinha_velha"
   * @param {string} itemUsado - Ex: "elmo"
   * @returns {string} - A mensagem de resultado da ação
   */
  processarAcao(acaoString, itemUsado) {
    const dadosDaSala = this.getSalaAtualData();
    const partes = acaoString.split(' ');
    const comandoAcao = partes[0];
    let mensagemAcao = "";

    // ATENÇÃO: Seu código original tinha "add_dir" e "consume_item".
    // Seu JSON tem "abrir nova direção" e "sumir com item".
    // Para seu código funcionar, você deve ATUALIZAR O JSON
    // para que as ações sejam:
    // "action": "add_dir west cozinha_velha" (na sala_de_jantar)
    // "action": "add_dir down jardim_secreto" (na escadaria_secreta)
    // "action": "consume_item" (para o elmo)
    
    // Esta lógica é a MESMA que você já tinha:
    switch (comandoAcao) {
      case 'add_dir':
        const direcao = partes[1];
        const salaDestino = partes[2];
        dadosDaSala[direcao] = salaDestino; // Modifica o estado do mapa
        mensagemAcao = `(Uma nova passagem para ${direcao} foi aberta!)`;
        break;
      
      case 'consume_item':
        delete this.gameState.inventario[itemUsado]; // Modifica o inventário
        mensagemAcao = `(O ${itemUsado} foi quebrado ou consumido.)`;
        break;

      default:
        mensagemAcao = `(Ação desconhecida: ${acaoString})`;
    }
    return mensagemAcao; // Retorna a mensagem para o Controller/View
  }

  /**
   * Tenta usar um item.
   * @param {string} item - O nome do item
   * @returns {object} - Um objeto com as mensagens a serem exibidas
   */
  usarItem(item) {
    const salaData = this.getSalaAtualData();
    const inventario = this.getInventario();
    let mensagens = [];
    let itemFoiUsado = false;

    // 1. Validar se tem o item (lógica movida do seu "else if (acao === 'use')")
    if (!inventario[item]) {
      mensagens.push(`Você não tem "${item}" no seu inventário.`);
      return { mensagens };
    }

    // 2. Verificação de COMBATE
    if (salaData.monster && item === salaData.monster.defeat_item) {
      mensagens.push(salaData.monster.defeat_message);
      salaData.monster = null; // MODIFICA O MODELO
      itemFoiUsado = true;
    }
    
    // 3. Verificação de INTERAÇÃO
    if (salaData.use && !itemFoiUsado) {
      const interacao = salaData.use.find(u => u.item === item);
      if (interacao) {
        mensagens.push(interacao.description);
        // Processa a ação (que muda o Model)
        const msgAcao = this.processarAcao(interacao.action, item);
        mensagens.push(msgAcao);
        itemFoiUsado = true;
      }
    }

    // 4. Se não fez nada
    if (!itemFoiUsado) {
      mensagens.push(`Não há como usar "${item}" aqui.`);
    }
    
    return { mensagens };
  }

  /**
   * Verifica se o jogador venceu.
   * @returns {boolean}
   */
  verificarVitoria() {
    return this.gameState.salaAtual === this.mapa.exit;
  }

} // Fim da classe Model

// 4. EXPORTAR A INSTÂNCIA ÚNICA (SINGLETON)
const modelInstance = new Model();
module.exports = modelInstance;
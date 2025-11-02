class Controller {
  // O Controller "recebe" o model e a view para poder usá-los
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  /**
   * Função chamada pelo index.js para começar o jogo.
   */
  iniciarJogo() {
    this.view.mostrarBoasVindas();
    this.mostrarLocalizacaoAtual();
  }

  /**
   * Pede ao Model os dados da sala e manda a View desenhar.
   */
  mostrarLocalizacaoAtual() {
    const salaData = this.model.getSalaAtualData();
    const salaNome = this.model.getSalaAtualNome();
    this.view.mostrarSala(salaData, salaNome);
  }
  
  /**
   * Função principal que recebe o input do usuário.
   * (Substitui todo o bloco "rl.question")
   * @param {string} input - O texto cru do usuário
   */
  processarComando(input) {
    const partes = input.trim().toLowerCase().split(' ');
    const acao = partes[0];
    const alvo = partes[1];
    
    // Se o jogo já acabou, não faça nada
    if (this.model.verificarVitoria()) {
      return; 
    }

    // Pega as saídas ANTES de tentar mover
    const salaData = this.model.getSalaAtualData();
    const saidasDisponiveis = Object.keys(salaData).filter(key =>
      key !== 'description' &&
      key !== 'itens' &&
      key !== 'monster' &&
      key !== 'use'
    );

    // --- LÓGICA DE DECISÃO (O if/else if refatorado) ---

    // --- Movimento ---
    if (saidasDisponiveis.includes(acao)) {
      this.mover(acao);
    }
    // --- "lista" ---
    else if (acao === 'lista') {
      this.listarInventario();
    }
    // --- "pegue" ---
    else if (acao === 'pegue') {
      this.pegar(alvo);
    }
    // --- "deixe" ---
    else if (acao === 'deixe') {
      this.deixar(alvo);
    }
    // --- "use" ---
    else if (acao === 'use') {
      this.usar(alvo);
    }
    // --- Inválido ---
    else {
      this.view.mostrarMensagem('Comando desconhecido. Tente "north", "use <item>", "pegue <item>", etc.');
    }
    
    // --- APÓS O COMANDO ---
    // Verifica se o comando resultou em vitória
    if (this.model.verificarVitoria()) {
        const salaData = this.model.getSalaAtualData();
        const salaNome = this.model.getSalaAtualNome();
        this.view.mostrarVitoria(salaData, salaNome);
    } else {
        // Se não venceu, apenas mostre a sala (que pode ter mudado)
        // (Não mostre se o comando foi 'lista', para não poluir)
        if (acao !== 'lista' && acao !== 'use' && !saidasDisponiveis.includes(acao)) {
             this.mostrarLocalizacaoAtual(); // Mostra o estado atual
        } else if (saidasDisponiveis.includes(acao) || acao === 'use') {
             this.mostrarLocalizacaoAtual(); // Mostra a nova sala após mover ou usar
        }
    }
  }

  // --- Funções de Ação (chamadas por processarComando) ---

  mover(direcao) {
    const salaData = this.model.getSalaAtualData();
    
    // Lógica de bloqueio por monstro (do seu 'else if' de movimento)
    if (salaData.monster) {
      this.view.mostrarMensagem(`Você não pode sair! O ${salaData.monster.name} bloqueia seu caminho!`);
    } else {
      this.model.mover(direcao); // O Model atualiza a salaAtual
    }
  }

  listarInventario() {
    const inventario = this.model.getInventario();
    this.view.mostrarInventario(inventario); // Manda a View imprimir
  }

  pegar(item) {
    if (!item) {
      this.view.mostrarMensagem("Pegar o quê?");
      return;
    }
    
    // Pede ao Model para tentar pegar
    const resultado = this.model.pegarItem(item);
    
    // Manda a View mostrar a resposta correta
    switch (resultado) {
      case "sucesso":
        this.view.mostrarMensagem(`Você pegou: ${item}.`);
        break;
      case "cheio":
        this.view.mostrarMensagem("Seu inventário está cheio! Você não pode pegar mais nada.");
        break;
      case "nao_existe":
        this.view.mostrarMensagem(`Não há nenhum(a) "${item}" nesta sala.`);
        break;
    }
  }

  deixar(item) {
    if (!item) {
      this.view.mostrarMensagem("Deixar o quê?");
      return;
    }
    
    const resultado = this.model.deixarItem(item);
    
    switch (resultado) {
      case "sucesso":
        this.view.mostrarMensagem(`Você deixou: ${item}.`);
        break;
      case "nao_tem":
        this.view.mostrarMensagem(`Você não tem um(a) "${item}" no seu inventário.`);
        break;
    }
  }

  usar(item) {
    if (!item) {
      this.view.mostrarMensagem("Usar o quê?");
      return;
    }
    
    // Pede ao Model para processar o "use"
    const resultado = this.model.usarItem(item);
    
    // O Model retorna uma lista de mensagens, manda a View imprimir todas
    resultado.mensagens.forEach(msg => {
      this.view.mostrarMensagem(msg);
    });
  }

} // Fim da classe Controller

// Exporta a CLASSE (não uma instância)
module.exports = Controller;
class View {
  
  /**
   * Exibe uma mensagem genérica
   * @param {string} msg 
   */
  mostrarMensagem(msg) {
    console.log(msg);
  }

  /**
   * Exibe a descrição da sala, itens, monstros e saídas.
   * (Substitui todos os console.log do início do seu gameLoop)
   * @param {object} salaData - Os dados da sala (do Model)
   * @param {string} salaNome - O nome da sala (do Model)
   */
  mostrarSala(salaData, salaNome) {
    console.log(`\n[${salaNome}]`);
    console.log(salaData.description);

    // Mostra itens na sala
    if (salaData.itens && Object.keys(salaData.itens).length > 0) {
      for (const nomeItem in salaData.itens) {
        const descItem = salaData.itens[nomeItem];
        console.log(`Aqui pode ser visto: ${descItem}.`);
      }
    }

    // Mostra monstros na sala
    if (salaData.monster) {
      console.log(`--- PERIGO! ---`);
      console.log(salaData.monster.description);
    }

    // Filtra e mostra as saídas
    const saidasDisponiveis = Object.keys(salaData).filter(key =>
      key !== 'description' &&
      key !== 'itens' &&
      key !== 'monster' &&
      key !== 'use'
    );
    
    if (saidasDisponiveis.length > 0) {
      const textoSaidas = saidasDisponiveis.map(direcao => `${direcao}, para ${salaData[direcao]}`).join('. ');
      console.log(`*** Você pode ir para ${textoSaidas}.`);
    }
  }

  /**
   * Exibe o inventário do jogador.
   * (Substitui a lógica do "else if (acao === 'lista')")
   * @param {object} inventario - O inventário (do Model)
   */
  mostrarInventario(inventario) {
    if (Object.keys(inventario).length === 0) {
      console.log("Seu inventário está vazio.");
    } else {
      console.log("No seu inventário você tem:");
      for (const nomeItem in inventario) {
        console.log(`- ${nomeItem}: ${inventario[nomeItem]}`);
      }
    }
  }
  
  /**
   * Exibe a tela de vitória.
   * @param {object} salaData - Dados da sala final
   * @param {string} salaNome - Nome da sala final
   */
  mostrarVitoria(salaData, salaNome) {
    console.log(`\n[${salaNome}]`);
    console.log(salaData.description);
    console.log("*** PARABÉNS, VOCÊ VENCEU! ***");
  }
  
  /**
   * Exibe a mensagem inicial
   */
  mostrarBoasVindas() {
    console.log('--- Bem-vindo ao Jogo de Aventura ---');
  }
}

// Exporta uma INSTÂNCIA da View
module.exports = new View();
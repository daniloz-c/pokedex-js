// Estado da aplicação - objeto state
const state = {
    pokemons: [],
    geracaoAtual: 1,
    carregando: false,
    filtro: ''
};

// Configurações das gerações - objeto geracoes
const geracoes = {
    1: { inicio: 1, fim: 151 },
    2: { inicio: 152, fim: 251 },
    3: { inicio: 252, fim: 386 }
};

// Elementos do DOM
const carregamentoDiv = document.getElementById('carregamento');
const conteudoMain = document.getElementById('conteudo');
const filtroInput = document.getElementById('filtro');
const pokemonContainer = document.getElementById('pokemon-container');
const mensagemFiltro = document.getElementById('mensagem-filtro');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners de navegação
    document.querySelectorAll('[data-geracao]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const geracao = link.dataset.geracao;
            state.filtro = '';
            filtroInput.value = '';
            carregarGeracao(geracao);
        });
    });

    // Event listener do filtro - dispara quando user digita algo
    filtroInput.addEventListener('input', () => {
        state.filtro = filtroInput.value;
        renderizarPokemons();
    });

    // Carregar primeira geração por padrão
    carregarGeracao(1);
});

/**
 * Carrega pokémons de uma geração específica
 */
async function carregarGeracao(numeroDaGeracao) {
    state.geracaoAtual = numeroDaGeracao;
    state.pokemons = [];
    state.carregando = true;
    
    mostrarCarregamento();
    
    try {
        const { inicio, fim } = geracoes[numeroDaGeracao];
        
        for (let indice = inicio; indice <= fim; indice++) {
            try {
                const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${indice}`);
                const pokemon = await resposta.json(); // converte resposta em JSON
                state.pokemons.push(pokemon); // add na array
            } catch (erro) {
                console.error(`Erro ao carregar pokémon ${indice}:`, erro);
            }
        }
        
        state.carregando = false;
        esconderCarregamento();
        renderizarPokemons();
    } catch (erro) {
        console.error('Erro ao carregar geração:', erro);
        state.carregando = false;
        esconderCarregamento();
    }
}

/**
 * Filtra pokémons com base no termo de busca
 */
function obterPokemonsFiltrados() {
    if (!state.filtro.trim()) {
        return state.pokemons;
    }
    
    const termo = state.filtro.toLowerCase();
    return state.pokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(termo)
    );
}

/**
 * Renderiza os pokémons na tela
 */
function renderizarPokemons() {
    const pokemonsFiltrados = obterPokemonsFiltrados();
    
    // Atualizar mensagem de filtro
    if (pokemonsFiltrados.length === 0) {
        mensagemFiltro.textContent = 'Não foi encontrado nenhum Pokémon.';
    } else if (pokemonsFiltrados.length === 1) {
        mensagemFiltro.textContent = 'Foi encontrado apenas um Pokémon.';
    } else {
        mensagemFiltro.textContent = `Foram encontrados ${pokemonsFiltrados.length} Pokémons.`;
    }
    
    // Limpar container
    pokemonContainer.innerHTML = '';
    
    // Renderizar cards dos pokémons
    pokemonsFiltrados.forEach(pokemon => {
        const card = criarCardPokemon(pokemon);
        pokemonContainer.appendChild(card);
    });
}

/**
 * Cria um card HTML para um pokémon
 */
function criarCardPokemon(pokemon) {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    
    const tipo = pokemon.types[0]?.type?.name || 'normal'; // pega o tipo do pokémon ou 'normal' se não tiver
    
    const card = document.createElement('div'); // cria o card
    card.className = `card ${tipo}`;
    
    const img = document.createElement('img');
    img.src = pokemon.sprites.front_default || '';
    img.alt = pokemon.name;
    
    const p = document.createElement('p');
    p.textContent = pokemon.name;
    
    card.appendChild(img);
    card.appendChild(p);
    col.appendChild(card);
    
    return col;
}

/**
 * Mostra o elemento de carregamento
 */
function mostrarCarregamento() {
    carregamentoDiv.style.display = 'flex';
    conteudoMain.style.display = 'none';
}

/**
 * Esconde o elemento de carregamento
 */
function esconderCarregamento() {
    carregamentoDiv.style.display = 'none';
    conteudoMain.style.display = 'block';
}

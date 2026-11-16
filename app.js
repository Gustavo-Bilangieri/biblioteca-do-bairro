// ============================================================================
// JavaScript do Zero — Exercícios 06 a 09
// Biblioteca do Bairro · catálogo em objetos, DOM, eventos e armazenamento
// ============================================================================

// O catálogo começa vazio: os dados vêm do livros.json (exercício 09).
// Usa-se let porque o array é substituído quando o ficheiro é carregado.
let catalogo = [];

// ----------------------------------------------------------------------------
// EXERCÍCIO 06 — O catálogo em objetos
// ----------------------------------------------------------------------------

// 02 — mostrar «Título — Autor (ano)» para cada livro (na consola)
function mostrarCatalogo(lista = catalogo) {
    console.log("\n--- Catálogo (consola) ---");
    for (const { titulo, autor, ano } of lista) {
        console.log(`«${titulo} — ${autor} (${ano})»`);
    }
}

// 03 — quantos livros estão disponíveis
// Contado sempre a partir do array: se um disponivel mudar, a contagem muda.
function contarDisponiveis(lista = catalogo) {
    return lista.filter((livro) => livro.disponivel).length;
}

// 04 — o livro mais antigo (menor ano)
function livroMaisAntigo(lista = catalogo) {
    return lista.reduce((maisAntigo, livro) =>
        livro.ano < maisAntigo.ano ? livro : maisAntigo
    );
}

// 05 — emprestar(titulo): marca como emprestado, ou avisa se não puder
function emprestar(titulo) {
    const livro = catalogo.find(
        (l) => normalizar(l.titulo) === normalizar(titulo)
    );

    // Livro que não existe: avisa e devolve false, sem lançar erro
    if (!livro) {
        console.warn(`⚠ Aviso: «${titulo}» não existe no catálogo.`);
        return false;
    }

    // Já emprestado: avisa
    if (!livro.disponivel) {
        console.warn(`⚠ Aviso: «${livro.titulo}» já está emprestado.`);
        return false;
    }

    livro.disponivel = false;
    console.log(`✓ «${livro.titulo}» emprestado.`);
    return true;
}

// ----------------------------------------------------------------------------
// Elementos da página (exercício 07)
// ----------------------------------------------------------------------------

const lista = document.querySelector("#lista-livros");
const resumo = document.querySelector("#resumo");
const pesquisa = document.querySelector("#pesquisa");
const botaoDisponiveis = document.querySelector("#so-disponiveis");
const botaoTema = document.querySelector("#tema");
const form = document.querySelector("#inscricao");
const mensagem = document.querySelector("#mensagem");

let soDisponiveis = false;

// ----------------------------------------------------------------------------
// TEXTOS: tirar acentos e maiúsculas, para a pesquisa ser tolerante
// ----------------------------------------------------------------------------
function normalizar(texto) {
    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// ----------------------------------------------------------------------------
// EXERCÍCIO 07 — O catálogo na página
// ----------------------------------------------------------------------------

function livrosFiltrados() {
    const termo = normalizar(pesquisa ? pesquisa.value : "");

    return catalogo.filter((livro) => {
        const corresponde = normalizar(`${livro.titulo} ${livro.autor}`).includes(termo);
        const passaFiltro = !soDisponiveis || livro.disponivel;
        return corresponde && passaFiltro;
    });
}

// 02/03/04 — um <li> por livro, com a classe e a palavra «emprestado»
function mostrarLivros(livros = livrosFiltrados()) {
    if (!lista) return;

    lista.replaceChildren(); // limpa a lista sem innerHTML

    if (livros.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "vazio";
        vazio.textContent = "Nenhum livro encontrado";
        lista.append(vazio);
    }

    for (const livro of livros) {
        lista.append(criarItem(livro));
    }

    // 05 — o resumo do <h2> é calculado, nunca escrito à mão
    if (resumo) {
        const total = catalogo.length;
        const disponiveis = contarDisponiveis();
        resumo.textContent = `${total} livros, ${disponiveis} disponíveis`;
    }
}

function criarItem(livro) {
    const item = document.createElement("li");

    const titulo = document.createElement("span");
    titulo.className = "titulo";
    titulo.textContent = `«${livro.titulo} — ${livro.autor} (${livro.ano})»`;

    if (!livro.disponivel) {
        item.classList.add("indisponivel");
        const etiqueta = document.createElement("em");
        etiqueta.textContent = " — emprestado";
        titulo.append(etiqueta);
    }

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    // Botão que usa a função emprestar() do exercício 06
    const emprestarBotao = document.createElement("button");
    emprestarBotao.type = "button";
    emprestarBotao.textContent = "Emprestar";
    emprestarBotao.disabled = !livro.disponivel;
    emprestarBotao.addEventListener("click", () => {
        emprestar(livro.titulo);
        mostrarLivros();
    });

    // Botão «Guardar» dos favoritos (exercício 09)
    const guardar = document.createElement("button");
    guardar.type = "button";
    guardar.className = "favorito";
    const guardado = favoritos.includes(livro.titulo);
    guardar.textContent = guardado ? "★ Guardado" : "☆ Guardar";
    guardar.setAttribute("aria-pressed", String(guardado));
    if (guardado) guardar.classList.add("ativo");
    guardar.addEventListener("click", () => alternarFavorito(livro.titulo));

    acoes.append(emprestarBotao, guardar);
    item.append(titulo, acoes);
    return item;
}

// ----------------------------------------------------------------------------
// EXERCÍCIO 08 — Pesquisar e inscrever
// ----------------------------------------------------------------------------

// 01/02 — a lista filtra a cada tecla, ignorando maiúsculas (e acentos)
pesquisa?.addEventListener("input", () => mostrarLivros());

// 03 — ligar/desligar o filtro «só disponíveis»
botaoDisponiveis?.addEventListener("click", () => {
    soDisponiveis = !soDisponiveis;
    botaoDisponiveis.classList.toggle("ativo", soDisponiveis);
    botaoDisponiveis.setAttribute("aria-pressed", String(soDisponiveis));
    mostrarLivros();
});

// 04/05 — formulário validado sem recarregar a página
form?.addEventListener("submit", (evento) => {
    evento.preventDefault(); // não recarregar a página

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (nome === "" || !emailValido) {
        mostrarMensagem("Preencha o nome e um e-mail válido.", "erro");
        return;
    }

    mostrarMensagem(`Obrigado, ${nome}! Inscrição feita com o e-mail ${email}.`, "sucesso");
    form.reset();
});

function mostrarMensagem(texto, tipo) {
    if (!mensagem) return;
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

// ----------------------------------------------------------------------------
// EXERCÍCIO 09 — Lembrar e carregar
// ----------------------------------------------------------------------------

const CHAVE_TEMA = "biblioteca-tema";
const CHAVE_FAVORITOS = "biblioteca-favoritos";

// localStorage só guarda texto: JSON converte listas e objetos
function lerGuardado(chave, porOmissao) {
    try {
        const texto = localStorage.getItem(chave);
        return texto === null ? porOmissao : JSON.parse(texto);
    } catch {
        return porOmissao;
    }
}

function guardar(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
        console.warn("Não foi possível guardar no localStorage.");
    }
}

let favoritos = lerGuardado(CHAVE_FAVORITOS, []);

function alternarFavorito(titulo) {
    if (favoritos.includes(titulo)) {
        favoritos = favoritos.filter((t) => t !== titulo);
    } else {
        favoritos = [...favoritos, titulo];
    }
    guardar(CHAVE_FAVORITOS, favoritos);
    mostrarLivros();
}

// 04 — modo escuro lembrado entre visitas
function aplicarTema(tema) {
    const escuro = tema === "escuro";
    document.body.classList.toggle("escuro", escuro);
    if (botaoTema) {
        botaoTema.textContent = escuro ? "☀ Modo claro" : "🌙 Modo escuro";
        botaoTema.setAttribute("aria-pressed", String(escuro));
    }
}

botaoTema?.addEventListener("click", () => {
    const novo = document.body.classList.contains("escuro") ? "claro" : "escuro";
    guardar(CHAVE_TEMA, novo);
    aplicarTema(novo);
});

aplicarTema(lerGuardado(CHAVE_TEMA, "claro"));

// 01/02/03 — carregar o catálogo do livros.json
async function carregarLivros() {
    try {
        const resposta = await fetch("livros.json");
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        catalogo = await resposta.json();

        // Exercício 06 na consola: lista, contagem e mais antigo
        mostrarCatalogo();
        console.log(`\nLivros disponíveis: ${contarDisponiveis()}`);
        const antigo = livroMaisAntigo();
        if (antigo) console.log(`Livro mais antigo: «${antigo.titulo}» (${antigo.ano})`);

        mostrarLivros();
    } catch (erro) {
        // 03 — aviso na página quando o ficheiro não carrega
        console.error("Não foi possível carregar livros.json:", erro);
        if (resumo) resumo.textContent = "Catálogo indisponível";
        if (lista) {
            lista.replaceChildren();
            const aviso = document.createElement("li");
            aviso.className = "erro";
            aviso.textContent = "Não foi possível carregar o catálogo (livros.json).";
            lista.append(aviso);
        }
    }
}

carregarLivros();

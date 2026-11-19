/* =========================================================================
   Biblioteca do Bairro — comportamento da página
   localStorage do Zero (exercícios 03, 05, 07, 08, 09, 10, 11) + catálogo
   ========================================================================= */

// ---------------------------------------------------------------- 0. chaves
const CHAVES = {
    tema: "biblioteca:tema",
    favoritos: "biblioteca:favoritos",
    leitor: "biblioteca:leitor",
    leitura: "biblioteca:leitura",
    pesquisas: "biblioteca:pesquisas",
    visitas: "biblioteca:visitas",
    aviso: "biblioteca:aviso-fechado",
};

const PREFIXO = "biblioteca:";
const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

const $ = (seletor) => document.querySelector(seletor);
const $$ = (seletor) => [...document.querySelectorAll(seletor)];

// --------------------------------------------------- 1. ler / guardar (JSON)
function ler(chave, porOmissao) {
    try {
        const texto = localStorage.getItem(chave);
        return texto === null ? porOmissao : JSON.parse(texto);
    } catch {
        return porOmissao;          // JSON estragado não rebenta a página
    }
}

function guardar(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch (erro) {
        toast(`Não foi possível guardar (${erro.name}).`, "!");
        return false;
    }
}

// ------------------------------------------------------------- 2. toasts
function toast(texto, icone = "✓") {
    const caixa = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast";

    const marca = document.createElement("span");
    marca.className = "icone";
    marca.textContent = icone;

    const corpo = document.createElement("span");
    corpo.textContent = texto;

    el.append(marca, corpo);
    caixa.append(el);

    setTimeout(() => {
        el.classList.add("sai");
        el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3200);
}

// ------------------------------------------- 3. tema (claro / escuro / sistema)
const botoesTema = $$(".tema button");
const sistemaEscuro = matchMedia("(prefers-color-scheme: dark)");

function modoGuardado() {
    const guardado = ler(CHAVES.tema, "sistema");
    return guardado === "claro" || guardado === "escuro" ? guardado : "sistema";
}

function aplicarTema() {
    const modo = modoGuardado();
    const efetivo = modo === "sistema" ? (sistemaEscuro.matches ? "escuro" : "claro") : modo;

    document.documentElement.dataset.tema = efetivo;
    for (const botao of botoesTema) {
        botao.setAttribute("aria-pressed", String(botao.dataset.modo === modo));
    }

    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = efetivo === "escuro" ? "#0d1116" : "#fbf7ef";
}

for (const botao of botoesTema) {
    botao.addEventListener("click", () => {
        const modo = botao.dataset.modo;
        if (modo === "sistema") {
            localStorage.removeItem(CHAVES.tema);
            toast("A seguir o tema do sistema.", "🖥");
        } else {
            guardar(CHAVES.tema, modo);
            toast(modo === "escuro" ? "Modo escuro ligado." : "Modo claro ligado.",
                  modo === "escuro" ? "🌙" : "☀");
        }
        aplicarTema();
    });
}

sistemaEscuro.addEventListener("change", () => {
    if (modoGuardado() === "sistema") aplicarTema();
});

// ------------------------------------------------ 4. contador de visitas (03)
function contarVisita() {
    const visitas = Number(localStorage.getItem(CHAVES.visitas)) + 1;
    localStorage.setItem(CHAVES.visitas, visitas);

    $("#stat-visitas").textContent = visitas;
    $("#texto-visitas").textContent = visitas === 1 ? "primeira visita" : "visitas tuas";
    return visitas;
}

$("#recomecar").addEventListener("click", () => {
    localStorage.removeItem(CHAVES.visitas);
    contarVisita();
    toast("Contador de visitas reposto.", "↺");
});

// ------------------------------------------------- 5. ficha do leitor (05)
const formLeitor = $("#form-leitor");

function desenharLeitor() {
    const leitor = ler(CHAVES.leitor, null);
    const topo = $("#leitor-topo");
    const generos = $("#leitor-generos");

    generos.replaceChildren();

    if (!leitor) {
        topo.hidden = true;
        generos.hidden = true;
        return;
    }

    topo.hidden = false;
    generos.hidden = false;
    $("#leitor-inicial").textContent = leitor.nome.trim().charAt(0).toUpperCase() || "?";
    $("#leitor-nome").textContent = `Olá, ${leitor.nome}`;
    $("#leitor-cartao").textContent = leitor.cartao ? `Cartão ${leitor.cartao}` : "Sem cartão registado";

    for (const genero of leitor.generos) {
        const etiqueta = document.createElement("span");
        etiqueta.textContent = genero;
        generos.append(etiqueta);
    }
}

formLeitor.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = formLeitor.nome.value.trim();

    if (nome === "") {
        toast("O nome não pode ficar vazio.", "!");
        formLeitor.nome.focus();
        return;
    }

    guardar(CHAVES.leitor, {
        nome,
        cartao: formLeitor.cartao.value.trim(),
        generos: formLeitor.generos.value.split(",").map((g) => g.trim()).filter(Boolean),
    });

    formLeitor.reset();
    desenharLeitor();
    toast(`Ficha de ${nome} guardada.`, "👤");
});

$("#esquecer-leitor").addEventListener("click", () => {
    localStorage.removeItem(CHAVES.leitor);
    desenharLeitor();
    toast("Ficha apagada.", "🗑");
});

// --------------------------------------------- 6. lista de leitura (08 + 10)
let leitura = ler(CHAVES.leitura, []);
let filtroLista = "todos";

function desenharLeitura() {
    const lista = $("#lista-leitura");
    lista.replaceChildren();

    const lidos = leitura.filter((l) => l.lido).length;
    const total = leitura.length;
    const percentagem = total === 0 ? 0 : Math.round((lidos / total) * 100);

    $("#anel").style.setProperty("--p", percentagem);
    $("#anel-texto").textContent = `${lidos}/${total}`;
    $("#resumo-leitura").textContent = total === 0
        ? "Ainda não tens livros na lista."
        : `${lidos} de ${total} lidos (${percentagem}%)`;

    const visiveis = leitura.filter((item) => {
        if (filtroLista === "lidos") return item.lido;
        if (filtroLista === "porLer") return !item.lido;
        return true;
    });

    if (visiveis.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "vazio-grande";
        vazio.textContent = total === 0
            ? "Junta o primeiro livro para começares a lista."
            : "Nada neste filtro.";
        lista.append(vazio);
        return;
    }

    for (const item of visiveis) {
        const indice = leitura.indexOf(item);
        const li = document.createElement("li");
        if (item.lido) li.classList.add("lido");

        const marcar = document.createElement("button");
        marcar.type = "button";
        marcar.className = "marcador";
        marcar.textContent = "✓";
        marcar.setAttribute("aria-label", item.lido ? "Marcar como por ler" : "Marcar como lido");
        marcar.addEventListener("click", () => {
            leitura[indice].lido = !leitura[indice].lido;
            atualizarLeitura();
        });

        const titulo = document.createElement("span");
        titulo.className = "titulo-item";
        titulo.textContent = item.titulo;

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "remover";
        remover.textContent = "✕";
        remover.setAttribute("aria-label", `Remover ${item.titulo}`);
        remover.addEventListener("click", () => {
            leitura.splice(indice, 1);
            atualizarLeitura();
        });

        li.append(marcar, titulo, remover);
        lista.append(li);
    }
}

function atualizarLeitura() {
    guardar(CHAVES.leitura, leitura);
    desenharLeitura();
    atualizarEstatisticas();
}

$("#form-leitura").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campo = evento.target.querySelector("[name='titulo']");
    const titulo = campo.value.trim();
    if (titulo === "") return;

    leitura.push({ titulo, lido: false });
    evento.target.reset();
    atualizarLeitura();
    toast(`«${titulo}» juntado à lista.`, "📖");
});

for (const botao of $$("[data-filtro]")) {
    botao.addEventListener("click", () => {
        filtroLista = botao.dataset.filtro;
        $$("[data-filtro]").forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
        desenharLeitura();
    });
}

// ------------------------------------------ 7. últimas pesquisas (11)
let temporizador;

function lerPesquisas() {
    const caixa = ler(CHAVES.pesquisas, null);
    if (!caixa || caixa.versao !== 1) return [];
    if (Date.now() - caixa.guardadoEm > SETE_DIAS) return [];   // velhas: ignorar
    return caixa.dados;
}

function registarPesquisa(termo) {
    const limpo = termo.trim();
    if (limpo.length < 2) return;

    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
        const antigas = lerPesquisas().filter((t) => t !== limpo);
        const dados = [limpo, ...antigas].slice(0, 5);
        guardar(CHAVES.pesquisas, { versao: 1, guardadoEm: Date.now(), dados });
        desenharPesquisas();
    }, 600);
}

function desenharPesquisas() {
    const caixa = $("#ultimas-pesquisas");
    caixa.replaceChildren();
    const pesquisas = lerPesquisas();

    if (pesquisas.length === 0) {
        const vazio = document.createElement("span");
        vazio.className = "vazio";
        vazio.textContent = "As tuas últimas pesquisas aparecem aqui.";
        caixa.append(vazio);
        return;
    }

    for (const termo of pesquisas) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = termo;
        botao.addEventListener("click", () => {
            $("#pesquisa").value = termo;
            filtrarCatalogo();
        });
        caixa.append(botao);
    }
}

$("#limpar-pesquisas").addEventListener("click", () => {
    localStorage.removeItem(CHAVES.pesquisas);
    desenharPesquisas();
    toast("Pesquisas apagadas.", "🗑");
});

// -------------------------------------------------- 8. catálogo (livros.json)
let catalogo = [];
let favoritos = ler(CHAVES.favoritos, []);
let soDisponiveis = false;

function normalizar(texto) {
    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function matiz(titulo) {
    let soma = 0;
    for (const letra of titulo) soma = (soma * 31 + letra.charCodeAt(0)) % 360;
    return soma;
}

const PALAVRAS_VAZIAS = new Set(["o", "a", "os", "as", "de", "do", "da", "dos", "das", "e", "em", "no", "na", "um", "uma"]);

function iniciais(titulo) {
    const palavras = titulo
        .split(/\s+/)
        .filter((p) => p.length > 1 && !PALAVRAS_VAZIAS.has(p.toLowerCase()));

    return palavras.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("")
        || titulo.charAt(0).toUpperCase();
}

function cartaoLivro(livro) {
    const artigo = document.createElement("article");
    artigo.className = "livro" + (livro.disponivel ? "" : " indisponivel");

    const cor = matiz(livro.titulo);
    const lombada = document.createElement("div");
    lombada.className = "lombada";
    lombada.textContent = iniciais(livro.titulo);
    lombada.style.background =
        `linear-gradient(155deg, hsl(${cor} 42% 38%), hsl(${(cor + 24) % 360} 46% 22%))`;

    const corpo = document.createElement("div");
    corpo.className = "livro-corpo";

    const titulo = document.createElement("h3");
    titulo.className = "livro-titulo";
    titulo.textContent = livro.titulo;

    const meta = document.createElement("p");
    meta.className = "livro-meta";
    meta.textContent = `${livro.autor} · ${livro.ano}`;

    const estado = document.createElement("span");
    estado.className = "livro-estado";
    estado.textContent = livro.disponivel ? "disponível" : "emprestado";

    const acoes = document.createElement("div");
    acoes.className = "livro-acoes";

    const emprestar = document.createElement("button");
    emprestar.type = "button";
    emprestar.textContent = "Emprestar";
    emprestar.disabled = !livro.disponivel;
    emprestar.addEventListener("click", () => {
        livro.disponivel = false;
        desenharCatalogo();
        atualizarEstatisticas();
        toast(`«${livro.titulo}» emprestado.`, "📚");
    });

    const ehFavorito = favoritos.includes(livro.titulo);
    const favorito = document.createElement("button");
    favorito.type = "button";
    favorito.textContent = ehFavorito ? "★ guardado" : "☆ guardar";
    if (ehFavorito) favorito.classList.add("guardado");
    favorito.addEventListener("click", () => {
        favoritos = ehFavorito
            ? favoritos.filter((t) => t !== livro.titulo)
            : [...favoritos, livro.titulo];
        guardar(CHAVES.favoritos, favoritos);
        desenharCatalogo();
        toast(ehFavorito ? "Removido dos favoritos." : "Guardado nos favoritos.", "★");
    });

    acoes.append(emprestar, favorito);
    corpo.append(titulo, meta, estado, acoes);
    artigo.append(lombada, corpo);
    return artigo;
}

function livrosVisiveis() {
    const termo = normalizar($("#pesquisa").value);
    return catalogo.filter((livro) => {
        const corresponde = normalizar(`${livro.titulo} ${livro.autor}`).includes(termo);
        const passaFiltro = !soDisponiveis || livro.disponivel;
        return corresponde && passaFiltro;
    });
}

function desenharCatalogo() {
    const grelha = $("#lista-livros");
    grelha.replaceChildren();
    const visiveis = livrosVisiveis();

    if (visiveis.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "vazio-grande";
        vazio.textContent = catalogo.length === 0
            ? "Não foi possível carregar o catálogo."
            : "Nenhum livro encontrado para esta pesquisa.";
        grelha.append(vazio);
        return;
    }

    for (const livro of visiveis) grelha.append(cartaoLivro(livro));
}

function filtrarCatalogo() {
    desenharCatalogo();
    registarPesquisa($("#pesquisa").value);
}

$("#pesquisa").addEventListener("input", filtrarCatalogo);

$("#so-disponiveis").addEventListener("click", () => {
    soDisponiveis = !soDisponiveis;
    $("#so-disponiveis").setAttribute("aria-pressed", String(soDisponiveis));
    desenharCatalogo();
});

async function carregarCatalogo() {
    const grelha = $("#lista-livros");
    for (let i = 0; i < 6; i++) {
        const esqueleto = document.createElement("div");
        esqueleto.className = "esqueleto";
        grelha.append(esqueleto);
    }

    try {
        const resposta = await fetch("livros.json");
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        catalogo = await resposta.json();
        desenharCatalogo();
        atualizarEstatisticas();
    } catch (erro) {
        console.warn("Catálogo indisponível:", erro);
        grelha.replaceChildren();
        const vazio = document.createElement("p");
        vazio.className = "vazio-grande";
        vazio.textContent = "Não foi possível carregar o catálogo (livros.json).";
        grelha.append(vazio);
    }
}

// --------------------------------------------------- 9. estatísticas do hero
function atualizarEstatisticas() {
    $("#stat-livros").textContent = catalogo.length || "—";
    $("#stat-disponiveis").textContent = catalogo.filter((l) => l.disponivel).length || "—";
    $("#stat-lista").textContent = leitura.length;
}

// ------------------------------------------------ 10. aviso por visita (09)
const faixa = $("#faixa-aviso");
if (sessionStorage.getItem(CHAVES.aviso) !== "sim") faixa.hidden = false;

$("#fechar-aviso").addEventListener("click", () => {
    faixa.hidden = true;
    sessionStorage.setItem(CHAVES.aviso, "sim");
    toast("Aviso fechado só nesta visita.", "👋");
});

// ------------------------------------------- 11. os meus dados (modal + JSON)
function chavesGuardadas() {
    return Object.keys(localStorage).filter((c) => c.startsWith(PREFIXO)).sort();
}

function abrirDados() {
    const corpo = $("#corpo-dados");
    corpo.replaceChildren();
    const chaves = chavesGuardadas();

    if (chaves.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "sem-dados";
        vazio.textContent = "Ainda não há nada guardado neste browser.";
        corpo.append(vazio);
    } else {
        const tabela = document.createElement("table");

        const cabecalho = document.createElement("thead");
        for (const titulo of ["Chave", "Valor", "Bytes", ""]) {
            const th = document.createElement("th");
            th.textContent = titulo;
            cabecalho.append(th);
        }

        const corpoTabela = document.createElement("tbody");
        for (const chave of chaves) {
            const valor = localStorage.getItem(chave) ?? "";
            const linha = document.createElement("tr");

            const c1 = document.createElement("td");
            c1.textContent = chave;

            const c2 = document.createElement("td");
            const codigo = document.createElement("code");
            codigo.textContent = valor;
            c2.append(codigo);

            const c3 = document.createElement("td");
            c3.textContent = valor.length;

            const c4 = document.createElement("td");
            const apagar = document.createElement("button");
            apagar.type = "button";
            apagar.className = "botao botao--mini botao--perigo";
            apagar.textContent = "apagar";
            apagar.addEventListener("click", () => {
                localStorage.removeItem(chave);
                abrirDados();
                desenharTudo();
                toast("Chave apagada.", "🗑");
            });
            c4.append(apagar);

            linha.append(c1, c2, c3, c4);
            corpoTabela.append(linha);
        }

        tabela.append(cabecalho, corpoTabela);
        corpo.append(tabela);
    }

    const bytes = chaves.reduce((soma, c) => soma + (localStorage.getItem(c) || "").length, 0);
    $("#total-dados").textContent = `${chaves.length} chaves · ${bytes} bytes`;
    $("#modal-dados").showModal();
}

$("#abrir-dados").addEventListener("click", abrirDados);
$("#fechar-modal").addEventListener("click", () => $("#modal-dados").close());
$("#fechar-modal-2").addEventListener("click", () => $("#modal-dados").close());

$("#apagar-tudo").addEventListener("click", () => {
    for (const chave of chavesGuardadas()) localStorage.removeItem(chave);
    sessionStorage.removeItem(CHAVES.aviso);
    $("#modal-dados").close();
    desenharTudo();
    contarVisita();
    toast("Todos os dados deste site foram apagados.", "🧹");
});

$("#exportar").addEventListener("click", () => {
    const dados = {};
    for (const chave of chavesGuardadas()) dados[chave] = localStorage.getItem(chave);

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const ligacao = document.createElement("a");
    ligacao.href = url;
    ligacao.download = "biblioteca-dados.json";
    ligacao.click();
    URL.revokeObjectURL(url);
    toast("Dados exportados para JSON.", "⬇");
});

// ------------------------------------- 12. sincronização entre separadores (10)
window.addEventListener("storage", (evento) => {
    if (evento.key === CHAVES.leitura || evento.key === null) {
        leitura = ler(CHAVES.leitura, []);
        desenharLeitura();
    }
    if (evento.key === CHAVES.tema || evento.key === null) aplicarTema();
    if (evento.key === CHAVES.pesquisas) desenharPesquisas();
    if (evento.key === CHAVES.favoritos) {
        favoritos = ler(CHAVES.favoritos, []);
        desenharCatalogo();
    }
});

// --------------------------------------------- 13. animações e progresso
const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target);
        }
    }
}, { threshold: 0.12 });

for (const elemento of $$(".revelar")) observador.observe(elemento);

addEventListener("scroll", () => {
    const altura = document.documentElement.scrollHeight - innerHeight;
    const progresso = altura > 0 ? (scrollY / altura) * 100 : 0;
    $(".progresso-leitura").style.width = `${progresso}%`;
}, { passive: true });

// ------------------------------------------------------------- 14. arranque
function desenharTudo() {
    desenharLeitor();
    leitura = ler(CHAVES.leitura, []);
    desenharLeitura();
    desenharPesquisas();
    desenharCatalogo();
    atualizarEstatisticas();
}

aplicarTema();
contarVisita();
desenharTudo();
carregarCatalogo();

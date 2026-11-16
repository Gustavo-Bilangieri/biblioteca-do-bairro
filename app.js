const livro = {
titulo: "Os Maias",
autor: "Eça de Queirós",
ano: 1888,
disponivel: true,
};

console.log(livro.titulo);
livro.disponivel = false; 
livro.estante = "B3"; 
console.log(livro);


//exercicio 6
for (const l of catalogo) {
console.log(`${l.titulo} — ${l.autor} (${l.ano})`);
}
console.log(catalogo.filter(l => l.disponivel).length);
let antigo = catalogo[0];
for (const l of catalogo) {
if (l.ano < antigo.ano) antigo = l;
}
function emprestar(titulo) {
const livro = catalogo.find(l => l.titulo === titulo);
if (!livro) return "Livro não encontrado.";
if (!livro.disponivel) return "Já está emprestado.";
livro.disponivel = false; return "Emprestado!";
}

//exercicio 7
function mostrarLivros(livros) {
lista.replaceChildren();
for (const l of livros) {
const item = document.createElement("li");
item.textContent = `${l.titulo} — ${l.autor} (${l.ano})`;
if (!l.disponivel) {
item.classList.add("indisponivel");
item.append(" · emprestado");
}
lista.append(item);
}
const n = livros.filter(l => l.disponivel).length;
resumo.textContent = `${livros.length} livros, ${n} disponíveis`;
}

//exercicio 8
let soDisponiveis = false;
function atualizar() {
const texto = pesquisa.value.trim().toLowerCase();
let res = catalogo.filter(l =>
l.titulo.toLowerCase().includes(texto));
if (soDisponiveis) res = res.filter(l => l.disponivel);
mostrarLivros(res);
if (!res.length) lista.textContent = "Nenhum livro encontrado.";
}
pesquisa.addEventListener("input", atualizar);
botao.addEventListener("click", () => {
soDisponiveis = !soDisponiveis;
atualizar();
});

//exercicio 9
async function carregarLivros() {
try {
const resposta = await fetch("livros.json");
catalogo = await resposta.json();
atualizar();
} catch {
lista.textContent = "Erro ao carregar o catálogo.";
}
}
carregarLivros();
const tema = localStorage.getItem("tema");
document.body.classList.toggle("escuro", tema === "escuro");
botaoTema.addEventListener("click", () => {
const escuro = document.body.classList.toggle("escuro");
localStorage.setItem("tema", escuro ? "escuro" : "claro");
});

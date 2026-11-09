//1
const livros = [
    "Tropa de Elite",
    "O Senhor dos Anéis",
    "Bolsonaro Capitão",
    "O Pequeno Príncipe",
    "A Revolução dos Bichos",
];

//2
livros.push ("Jumanji", "Harry Potter");
console.log(`Total de livros: ${livros.length}`)

//3
const listaNumerada = livros.map((titulo, indice) => `${indice + 1}. ${titulo}`);
console.log("\nLista numerada:");
listaNumerada.forEach((linha) => console.log(linha));

//4
const titulosLongos = livros.filter((titulo) => titulo.length > 10);
console.log("\nTítulos com mais de 10 letras:", titulosLongos);

//5
const titulosMaiusculos = livros.map((titulo) => titulo.toUpperCase());
console.log("\nTítulos em maiúsculas:", titulosMaiusculos);

//6
console.log("\nArray original:", livros);

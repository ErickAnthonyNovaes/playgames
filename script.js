// script.js

// Função para carregar todos os arquivos Python do repositório do GitHub
async function loadPythonGame() {
    // Carrega o Pyodide
    let pyodide = await loadPyodide();
    
    // Função para obter a lista de arquivos do GitHub
    async function fetchRepoContents(repoUrl) {
        const response = await fetch(repoUrl);
        if (!response.ok) {
            throw new Error(`Erro ao listar arquivos do repositório: ${response.statusText}`);
        }
        return await response.json();
    }

    // Função para buscar o conteúdo de um arquivo Python do GitHub
    async function fetchPythonFile(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo Python: ${response.statusText}`);
        }
        return await response.text();
    }

    // URL da API do GitHub para o repositório (formato JSON)
    const repoApiUrl = 'https://api.github.com/repos/StanislavPetrovV/Minecraft/contents/';

    // Obter lista de arquivos do repositório (inclusive de pastas)
    const repoContents = await fetchRepoContents(repoApiUrl);

    // Iterar sobre todos os arquivos e carregar apenas arquivos .py
    for (const file of repoContents) {
        if (file.type === 'file' && file.name.endsWith('.py')) {
            const fileUrl = file.download_url;
            const pythonCode = await fetchPythonFile(fileUrl);
            pyodide.runPython(pythonCode); // Executa o código Python no Pyodide
        }
        // Se for uma pasta, você pode fazer uma chamada recursiva para buscar arquivos dentro dela
        else if (file.type === 'dir') {
            const folderContents = await fetchRepoContents(file.url);
            for (const subFile of folderContents) {
                if (subFile.type === 'file' && subFile.name.endsWith('.py')) {
                    const subFileUrl = subFile.download_url;
                    const subPythonCode = await fetchPythonFile(subFileUrl);
                    pyodide.runPython(subPythonCode);
                }
            }
        }
    }
}

// Quando o botão for clicado, carregar o jogo
document.getElementById("startBtn").addEventListener("click", function() {
    loadPythonGame();
});

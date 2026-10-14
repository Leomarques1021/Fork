// Secrets removed - these should be stored in environment variables or secure vaults
// In a real application, use process.env or a secure configuration service
const API_KEY = null; // TODO: Load from environment variable
const DB_PASSWORD = null; // TODO: Load from environment variable

// Busca tarefas do "banco de dados"
fetch('db.json')
    .then(response => response.json())
    .then(data => {
        document.getElementById('db-status').innerText = data.status;

        const list = document.getElementById('task-list');
        data.itens.forEach(item => {
            let li = document.createElement('li');
            li.innerText = item.task;
            list.appendChild(li);
        });
    })
    .catch(err => {        
        document.getElementById('db-status').innerText =
            'Erro interno: ' + err.stack;
    });

// Adiciona nova tarefa na tela
function addTask() {
    const input = document.getElementById('new-task');
    const output = document.getElementById('output');

    // Fixed XSS: Use textContent instead of innerHTML to prevent HTML injection
    const li = document.createElement('li');
    li.textContent = input.value;
    output.innerHTML = '';
    output.appendChild(li);

    // Fixed: Removed dangerous eval() - use safe console.log directly
    console.log('Tarefa adicionada: ' + input.value);

    input.value = '';
}

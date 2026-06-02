const API_URL = 'http://localhost:3000/api';

let TOKEN = localStorage.getItem('token') || "";

/* LOGIN AUTOMÁTICO */

if(TOKEN){
    carregarInterfaceLogada();
}

/* LOGIN */

async function realizarLogin(){

    const username =
        document.getElementById('user').value;

    const password =
        document.getElementById('pass').value;

    const res = await fetch(`${API_URL}/login`,{

        method:'POST',

        headers:{
            'Content-Type':'application/json'
        },

        body:JSON.stringify({
            username,
            password
        })

    });

    const data = await res.json();

    if(data.token){

        TOKEN = data.token;

        localStorage.setItem('token',TOKEN);

        carregarInterfaceLogada();

    }else{

        alert("Falha no login!");

    }

}

/* MOSTRAR DASHBOARD */

function carregarInterfaceLogada(){

    document
        .getElementById('login-section')
        .classList.add('hidden');

    document
        .getElementById('dashboard-section')
        .classList.remove('hidden');

}

/* LOGOUT */

function logout(){

    localStorage.removeItem('token');

    location.reload();

}

/* LISTAR PACIENTES */

async function listarPacientesParaGestao(){

    const res = await fetch(`${API_URL}/etapa5`,{

        headers:{
            'Authorization':`Bearer ${TOKEN}`
        }

    });

    const data = await res.json();

    const listDiv =
        document.getElementById('lista-gestao');

    listDiv.innerHTML = "";

    data.pacientes.forEach(p => {

        listDiv.innerHTML += `

            <div class="paciente-card">

                <input
                    type="text"
                    id="input-edit-${p.id}"
                    value="${p.nome}"
                >

                <div class="actions">

                    <button
                        class="btn-success"
                        onclick="atualizarNome(${p.id})"
                    >
                        Salvar
                    </button>

                    <button
                        class="btn-danger"
                        onclick="deletarPaciente(${p.id})"
                    >
                        Excluir
                    </button>

                </div>

            </div>

        `;

    });

}

/* CONSULTAS */

async function fetchData(endpoint){

    const box =
        document.getElementById('resultado');

    box.innerHTML = "Carregando...";

    try{

        const response = await fetch(
            `${API_URL}/${endpoint}`,
            {
                headers:{
                    'Authorization':`Bearer ${TOKEN}`
                }
            }
        );

        const data = await response.json();

        if(endpoint === 'etapa10'){

            box.innerHTML =

`🏆 Sintoma mais frequente: ${data.descricao}
📊 Frequência: ${data.frequencia}`;

        }else{

            box.innerHTML =
                JSON.stringify(data,null,2);

        }

    }catch(error){

        box.innerHTML =
            "Erro ao conectar com API.";

    }

}

/* REGISTRAR */
async function registrarAtendimento(){
    const nome = document.getElementById('nome').value;
    const sintoma = document.getElementById('sintoma').value;
    const box = document.getElementById('resultado');

    if(!nome || !sintoma){
        box.innerHTML = "Preencha todos os campos!";
        return;
    }

    box.innerHTML = "🧠 IA analisando sintoma para pré-triagem...";

    try {
        const response = await fetch(`${API_URL}/pre-triagem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({ sintoma })
        });

        const data = await response.json();

        box.innerHTML = `
            <div style="background: #eef2f7; padding: 15px; border-radius: 8px; margin-bottom: 15px; color: #333;">
                <strong>🤖 Pré-Triagem da IA:</strong>
                <p>${data.analise}</p>
            </div>
            <p>Deseja confirmar o atendimento para o paciente <strong>${nome}</strong>?</p>
            <button class="btn-success" onclick="confirmarSalvarAtendimento('${nome}', '${sintoma}')">
                Sim, Confirmar e Salvar
            </button>
        `;

    } catch(error) {
        box.innerHTML = "Erro ao realizar pré-triagem com IA. Tentando salvar direto...";
        confirmarSalvarAtendimento(nome, sintoma);
    }
}

async function confirmarSalvarAtendimento(nome, sintoma) {
    const box = document.getElementById('resultado');
    box.innerHTML = "Salvando no sistema...";

    try {
        const response = await fetch(`${API_URL}/atendimento`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({ nome, sintoma })
        });

        const data = await response.json();

        box.innerHTML = `
            ✅ ${data.message}
            <br>Paciente: ${data.paciente}
            <br>Sintoma: ${data.sintoma}
        `;

    } catch(error) {
        box.innerHTML = "Erro ao salvar atendimento.";
    }
}

/* PUT */

async function atualizarNome(id){

    const novoNome =
        document.getElementById(
            `input-edit-${id}`
        ).value;

    const res = await fetch(
        `${API_URL}/atendimento/${id}`,
        {

            method:'PUT',

            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${TOKEN}`
            },

            body:JSON.stringify({
                nome:novoNome
            })

        }
    );

    if(res.ok){

        alert("Nome atualizado!");

    }

}

/* DELETE */

async function deletarPaciente(id){

    if(
        !confirm(
            "Deseja excluir este paciente?"
        )
    ) return;

    const res = await fetch(
        `${API_URL}/atendimento/${id}`,
        {

            method:'DELETE',

            headers:{
                'Authorization':`Bearer ${TOKEN}`
            }

        }
    );

    if(res.ok){

        listarPacientesParaGestao();

    }

}
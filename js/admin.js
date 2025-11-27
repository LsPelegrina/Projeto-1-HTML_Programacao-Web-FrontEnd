const form = document.getElementById('form-cadastro');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const tabelaUsuarios = document.querySelector('#lista-usuarios tbody');
const inputPesquisa = document.getElementById('pesquisa');
const btnLimpar = document.getElementById('btn-limpar');
const btnExcluirTodos = document.getElementById('btn-excluir-todos');

const STORAGE_KEY = 'usuariosCadastro';

const obterUsuarios = () => {
  const dados = localStorage.getItem(STORAGE_KEY);
  return dados ? JSON.parse(dados) : [];
};

const salvarUsuarios = usuarios => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
};

const mostrarErro = (input, mensagem) => {
  const small = input.nextElementSibling;
  if (small && small.classList.contains('error-msg')) {
    small.textContent = mensagem;
  }
};

const limparErros = () => {
  const erros = form.querySelectorAll('.error-msg');
  erros.forEach(erro => erro.textContent = '');
};

const validarEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const validarFormulario = () => {
  limparErros();
  let valido = true;

  if (!inputNome.value.trim() || inputNome.value.trim().length < 3) {
    mostrarErro(inputNome, 'Nome deve ter ao menos 3 caracteres.');
    valido = false;
  }

  if (!validarEmail(inputEmail.value)) {
    mostrarErro(inputEmail, 'Por favor, insira um e-mail válido.');
    valido = false;
  }

  return valido;
};

const adicionarUsuario = (nome, email) => {
  const usuarios = obterUsuarios();
  const dataEnvio = new Date().toLocaleString();
  usuarios.push({ id: Date.now(), nome: nome.trim(), email: email.trim(), dataEnvio });
  salvarUsuarios(usuarios);
  renderizarLista(usuarios);
};

const criarLinhaUsuario = ({ id, nome, email, dataEnvio }) => {
  const tr = document.createElement('tr');
  tr.dataset.id = id;

  tr.innerHTML = `
    <td>${dataEnvio}</td>
    <td>${nome}</td>
    <td>${email}</td>
    <td>
      <button class="btn-excluir" aria-label="Excluir usuário ${nome}" title="Excluir usuário">
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
  `;

  return tr;
};

const renderizarLista = usuarios => {
  tabelaUsuarios.innerHTML = '';
  
  if (usuarios.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="4" style="text-align:center; color: var(--cor-texto-claro); padding: 15px;">Nenhum usuário encontrado.</td>`;
    tabelaUsuarios.appendChild(tr);
    return;
  }

  usuarios.forEach(usuario => {
    tabelaUsuarios.appendChild(criarLinhaUsuario(usuario));
  });
};

const excluirUsuario = id => {
  const usuarios = obterUsuarios().filter(u => u.id !== Number(id));
  salvarUsuarios(usuarios);
  renderizarLista(usuarios);
};

const excluirTodos = () => {
  if (confirm('Deseja realmente excluir todos os usuários?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderizarLista([]);
  }
};

const limparCampos = () => {
  form.reset();
  limparErros();
};

const pesquisarUsuarios = termo => {
  termo = termo.toLowerCase();
  const usuarios = obterUsuarios();
  const filtrados = usuarios.filter(({ nome, email }) =>
    nome.toLowerCase().includes(termo) || email.toLowerCase().includes(termo)
  );
  renderizarLista(filtrados);
};

// Eventos

form.addEventListener('submit', e => {
  e.preventDefault();
  if (validarFormulario()) {
    adicionarUsuario(inputNome.value, inputEmail.value);
    limparCampos();
  }
});

tabelaUsuarios.addEventListener('click', e => {
  if (e.target.closest('.btn-excluir')) {
    const tr = e.target.closest('tr');
    excluirUsuario(tr.dataset.id);
  }
});

btnLimpar.addEventListener('click', limparCampos, renderizarLista([]));
btnExcluirTodos.addEventListener('click', excluirTodos);
inputPesquisa.addEventListener('input', e => pesquisarUsuarios(e.target.value));

document.addEventListener('DOMContentLoaded', () => {
  renderizarLista(obterUsuarios());
});

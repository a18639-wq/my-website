// ==================== VARIÁVEIS GLOBAIS ====================
let encomenda = [];
let passoAtual = 1;
let numeroEncomendaAtual = 1;
let dadosCliente = {};
let dadosPagamento = {};
let contadorAtivado = false;

// ==================== NAVEGAÇÃO ====================

function mostrarPagina(paginaId) {
    console.log('Navegando para:', paginaId); // Debug
    
    // Esconder todas as páginas
    document.querySelectorAll('.pagina').forEach(p => {
        p.classList.remove('ativa');
    });
    
    // Mostrar página selecionada
    const pagina = document.getElementById(paginaId);
    if (pagina) {
        pagina.classList.add('ativa');
        window.scrollTo(0, 0);
    } else {
        console.error('Página não encontrada:', paginaId);
    }
    
    // Atualizar menu ativo
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const linkAtivo = document.getElementById('link-' + paginaId);
    if (linkAtivo) {
        linkAtivo.classList.add('active');
    }
    
    // Fechar menu mobile se aberto
    document.getElementById('mainNav').classList.remove('ativo');
    document.getElementById('menuToggle').classList.remove('ativo');
    
    // Ações específicas por página
    if (paginaId === 'home' && !contadorAtivado) {
        setTimeout(animarContador, 500);
    }
    
    if (paginaId === 'encomenda') {
        resetarPassos();
        atualizarEncomenda();
    }
}

function toggleMenuMobile() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('menuToggle');
    nav.classList.toggle('ativo');
    toggle.classList.toggle('ativo');
}

// ==================== MENU ====================

function filtrarMenu(filtro) {
    // Atualizar botões ativos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filtrar produtos
    document.querySelectorAll('.produto').forEach(produto => {
        const categoria = produto.getAttribute('data-categoria');
        if (filtro === 'todos' || categoria === filtro) {
            produto.classList.remove('escondido');
        } else {
            produto.classList.add('escondido');
        }
    });
}

// ==================== SISTEMA DE ENCOMENDAS ====================

function adicionarEncomenda(nome, preco) {
    const existente = encomenda.find(item => item.nome === nome);
    
    if (existente) {
        existente.qtd++;
    } else {
        encomenda.push({ nome, preco, qtd: 1 });
    }
    
    atualizarContador();
    mostrarNotificacao(`${nome} adicionado!`);
    
    // Efeito visual no botão
    const btn = event.target.closest('.btn-add');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.background = '#27ae60';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-plus"></i>';
            btn.style.background = '';
        }, 1000);
    }
}

function atualizarContador() {
    const total = encomenda.reduce((sum, item) => sum + item.qtd, 0);
    const contador = document.getElementById('menuContador');
    if (contador) contador.textContent = total;
}

function atualizarEncomenda() {
    const vazio = document.getElementById('encomendaVazio');
    const itens = document.getElementById('encomendaItens');
    const subtotal = document.getElementById('encomendaSubtotal');
    const botoes = document.getElementById('encomendaBotoes');
    
    if (encomenda.length === 0) {
        if (vazio) vazio.style.display = 'block';
        if (itens) itens.style.display = 'none';
        if (subtotal) subtotal.style.display = 'none';
        if (botoes) botoes.style.display = 'none';
        document.getElementById('passo2').style.display = 'none';
        document.getElementById('passo3').style.display = 'none';
        return;
    }
    
    if (vazio) vazio.style.display = 'none';
    if (itens) {
        itens.style.display = 'block';
        itens.innerHTML = '';
        
        let total = 0;
        encomenda.forEach((item, index) => {
            const itemTotal = item.preco * item.qtd;
            total += itemTotal;
            
            const div = document.createElement('div');
            div.className = 'encomenda-item';
            div.innerHTML = `
                <div class="encomenda-item-info">
                    <h4>${item.nome}</h4>
                    <span class="encomenda-item-preco">${item.preco.toFixed(2)}€ cada</span>
                </div>
                <div class="encomenda-item-controles">
                    <button class="btn-qtd" onclick="alterarQtd(${index}, -1)">-</button>
                    <span>${item.qtd}</span>
                    <button class="btn-qtd" onclick="alterarQtd(${index}, 1)">+</button>
                    <span class="item-subtotal">${itemTotal.toFixed(2)}€</span>
                    <button class="btn-remover" onclick="removerItem(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            itens.appendChild(div);
        });
        
        document.getElementById('valorSubtotal').textContent = `${total.toFixed(2)}€`;
        document.getElementById('valorTotalFinal').textContent = `${total.toFixed(2)}€`;
    }
    
    if (subtotal) subtotal.style.display = 'flex';
    if (botoes) botoes.style.display = 'flex';
    
    // Controlar passos
    const passo2 = document.getElementById('passo2');
    const passo3 = document.getElementById('passo3');
    if (passo2) passo2.style.display = passoAtual >= 2 ? 'block' : 'none';
    if (passo3) passo3.style.display = passoAtual >= 3 ? 'block' : 'none';
    
    // Atualizar botões
    const btnVoltar = document.getElementById('btnVoltar');
    const btnAvancar = document.getElementById('btnAvancar');
    
    if (btnVoltar) btnVoltar.style.display = passoAtual > 1 ? 'flex' : 'none';
    
    if (btnAvancar) {
        if (passoAtual === 3) {
            btnAvancar.innerHTML = 'Finalizar Encomenda <i class="fas fa-check"></i>';
            btnAvancar.onclick = finalizarEncomenda;
        } else {
            btnAvancar.innerHTML = 'Avançar <i class="fas fa-arrow-right"></i>';
            btnAvancar.onclick = proximoPasso;
        }
    }
}

function alterarQtd(index, delta) {
    encomenda[index].qtd += delta;
    if (encomenda[index].qtd <= 0) {
        encomenda.splice(index, 1);
    }
    atualizarContador();
    atualizarEncomenda();
}

function removerItem(index) {
    encomenda.splice(index, 1);
    atualizarContador();
    atualizarEncomenda();
}

function proximoPasso() {
    if (passoAtual === 1) {
        if (encomenda.length === 0) {
            alert('Adicione itens à encomenda primeiro!');
            return;
        }
        passoAtual = 2;
    } else if (passoAtual === 2) {
        // Validar dados
        const nome = document.getElementById('encomendaNome')?.value.trim();
        const email = document.getElementById('encomendaEmail')?.value.trim();
        const telefone = document.getElementById('encomendaTelefone')?.value.trim();
        
        if (!nome || !email || !telefone) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Email inválido!');
            return;
        }
        
        dadosCliente = { nome, email, telefone };
        passoAtual = 3;
    }
    
    atualizarEncomenda();
    window.scrollTo(0, 0);
}

function passoAnterior() {
    if (passoAtual > 1) {
        passoAtual--;
        atualizarEncomenda();
        window.scrollTo(0, 0);
    }
}

function resetarPassos() {
    passoAtual = 1;
    document.getElementById('formDados')?.reset();
    document.getElementById('formPagamento')?.reset();
    atualizarPreviewCartao();
}

// Preview do cartão
function atualizarPreviewCartao() {
    const numero = document.getElementById('cartaoNumero')?.value || '';
    const titular = document.getElementById('cartaoTitular')?.value || '';
    const validade = document.getElementById('cartaoValidade')?.value || '';
    
    const previewNumero = document.getElementById('cartaoNumeroPreview');
    const previewTitular = document.getElementById('cartaoTitularPreview');
    const previewValidade = document.getElementById('cartaoValidadePreview');
    
    if (previewNumero) {
        previewNumero.textContent = numero ? numero.replace(/\d(?=\d{4})/g, '*') : '**** **** **** ****';
    }
    if (previewTitular) {
        previewTitular.textContent = titular.toUpperCase() || 'NOME DO TITULAR';
    }
    if (previewValidade) {
        previewValidade.textContent = validade || 'MM/AA';
    }
}

// Máscaras do cartão
function aplicarMascaras() {
    const numeroInput = document.getElementById('cartaoNumero');
    const validadeInput = document.getElementById('cartaoValidade');
    const cvvInput = document.getElementById('cartaoCVV');
    const titularInput = document.getElementById('cartaoTitular');
    
    if (numeroInput) {
        numeroInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = valor.substring(0, 19);
            atualizarPreviewCartao();
        });
    }
    
    if (validadeInput) {
        validadeInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length >= 2) {
                valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
            }
            e.target.value = valor.substring(0, 5);
            atualizarPreviewCartao();
        });
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }
    
    if (titularInput) {
        titularInput.addEventListener('input', atualizarPreviewCartao);
    }
}

function finalizarEncomenda() {
    const numero = document.getElementById('cartaoNumero')?.value.trim();
    const validade = document.getElementById('cartaoValidade')?.value.trim();
    const cvv = document.getElementById('cartaoCVV')?.value.trim();
    const titular = document.getElementById('cartaoTitular')?.value.trim();
    
    if (!numero || !validade || !cvv || !titular) {
        alert('Preencha todos os dados do cartão!');
        return;
    }
    
    const btn = document.getElementById('btnAvancar');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        const numEncomenda = String(numeroEncomendaAtual).padStart(3, '0');
        numeroEncomendaAtual++;
        
        document.getElementById('numeroEncomenda').textContent = numEncomenda;
        
        const detalhes = document.getElementById('confirmacaoDetalhes');
        if (detalhes) {
            detalhes.innerHTML = `
                <p style="margin-bottom: 1rem; color: #666;"><strong>Cliente:</strong> ${dadosCliente.nome}</p>
                <p style="margin-bottom: 1rem; color: #666;"><strong>Email:</strong> ${dadosCliente.email}</p>
            `;
            
            let total = 0;
            encomenda.forEach(item => {
                const itemTotal = item.preco * item.qtd;
                total += itemTotal;
                const div = document.createElement('div');
                div.className = 'confirmacao-item';
                div.innerHTML = `
                    <span>${item.nome} x${item.qtd}</span>
                    <span>${itemTotal.toFixed(2)}€</span>
                `;
                detalhes.appendChild(div);
            });
            
            const totalDiv = document.createElement('div');
            totalDiv.className = 'confirmacao-total';
            totalDiv.innerHTML = `<span>Total Pago</span><span>${total.toFixed(2)}€</span>`;
            detalhes.appendChild(totalDiv);
        }
        
        encomenda = [];
        atualizarContador();
        mostrarPagina('confirmacao');
        
        if (btn) {
            btn.innerHTML = 'Avançar <i class="fas fa-arrow-right"></i>';
            btn.disabled = false;
        }
    }, 2000);
}

function novaEncomenda() {
    resetarPassos();
    mostrarPagina('menu');
}

// ==================== UTILITÁRIOS ====================

function mostrarNotificacao(texto) {
    const notif = document.getElementById('notificacao');
    const textoEl = document.getElementById('notificacaoTexto');
    if (notif && textoEl) {
        textoEl.textContent = texto;
        notif.classList.add('mostrar');
        setTimeout(() => notif.classList.remove('mostrar'), 3000);
    }
}

function animarContador() {
    document.querySelectorAll('.numero').forEach(numero => {
        const alvo = parseInt(numero.getAttribute('data-target'));
        const duracao = 2000;
        const incremento = alvo / (duracao / 16);
        let atual = 0;
        
        const timer = setInterval(() => {
            atual += incremento;
            if (atual >= alvo) {
                numero.textContent = alvo.toLocaleString('pt-PT');
                clearInterval(timer);
            } else {
                numero.textContent = Math.floor(atual).toLocaleString('pt-PT');
            }
        }, 16);
    });
    contadorAtivado = true;
}

function enviarContacto(event) {
    event.preventDefault();
    alert('Mensagem enviada com sucesso!');
    event.target.reset();
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('☕ Café Aroma - Site carregado!');
    
    // Aplicar máscaras
    aplicarMascaras();
    
    // Scroll no header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            header.style.boxShadow = window.pageYOffset > 50 
                ? '0 2px 10px rgba(0,0,0,0.2)' 
                : '0 2px 5px rgba(0,0,0,0.1)';
        }
    });
    
    // Iniciar na home
    mostrarPagina('home');
});
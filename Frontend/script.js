document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const recoverForm = document.getElementById('recover-form');
    const paymentForm = document.getElementById('payment-form');
    const chargeForm = document.getElementById('charge-form');
    const movementForm = document.getElementById('movement-form');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const recoverSection = document.getElementById('recover-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userNameSpan = document.getElementById('user-name');
    const accountBalance = document.getElementById('account-balance');

    const residentsList = document.getElementById('residents-list');
    const paymentsList = document.getElementById('payments-list');
    const chargesList = document.getElementById('charges-list');
    const movementsList = document.getElementById('movements-list');
    const reportsList = document.getElementById('reports-list');

    const API_URL = 'http://localhost:3000';
    let currentUser = null;

    // Manter o estado do usuário após o login
    function saveCurrentUser(user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    function loadCurrentUser() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            userNameSpan.textContent = currentUser.email;
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadDashboardData();
        }
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                saveCurrentUser(data.user);
                userNameSpan.textContent = username;
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                loadDashboardData();
            } else {
                alert('Usuário ou senha inválidos');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = event.target.name.value;
        const email = event.target.email.value;
        const confirmEmail = event.target['confirm-email'].value;
        const phone = event.target.phone.value;
        const mobile = event.target.mobile.value;
        const cpf = event.target.cpf.value;
        const password = event.target.password.value;
        const confirmPassword = event.target['confirm-password'].value;
        const state = event.target.state.value;
        const city = event.target.city.value;
        const condo = event.target.condo.value;
        const unit = event.target.unit.value;
        const condoType = event.target['condo-type'].value;

        if (email === confirmEmail && password === confirmPassword) {
            fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, mobile, cpf, password, state, city, condo, unit, condoType })
            })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    alert('Usuário cadastrado com sucesso!');
                    registerSection.style.display = 'none';
                    loginSection.style.display = 'block';
                } else {
                    alert('Erro ao cadastrar usuário');
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('Os emails ou senhas não coincidem!');
        }
    });

    recoverForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = event.target.email.value;

        fetch(`${API_URL}/recoverPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Email de recuperação enviado!');
                recoverSection.style.display = 'none';
                loginSection.style.display = 'block';
            } else {
                alert('Erro ao enviar email de recuperação');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    paymentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = event.target.amount.value;
        const date = event.target.date.value;
        const description = event.target.description.value;

        if (currentUser) {
            fetch(`${API_URL}/addPayment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, amount, date, description })
            })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    alert('Pagamento registrado com sucesso!');
                    loadPayments();
                    updateAccountBalanceDisplay();
                } else {
                    alert('Erro ao registrar pagamento');
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('Usuário não autenticado!');
        }
    });

    chargeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const issueDate = event.target.issueDate.value;
        const number = event.target.number.value;
        const reason = event.target.reason.value;
        const dueDate = event.target.dueDate.value;
        const property = event.target.property.value;
        const description = event.target.description.value;
        const amount = event.target.amount.value;
        const discount = event.target.discount.value;
        const deductions = event.target.deductions.value;
        const interest = event.target.interest.value;
        const penalty = event.target.penalty.value;
        const otherAdditions = event.target.otherAdditions.value;
        const status = event.target.status.value;
        const receivedDate = event.target.receivedDate.value;
        const reasonForCancellation = event.target.reasonForCancellation.value;

        fetch(`${API_URL}/addCharge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                issueDate, number, reason, dueDate, property, description, amount, discount,
                deductions, interest, penalty, otherAdditions, status, receivedDate, reasonForCancellation
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                alert('Cobrança registrada com sucesso!');
                loadCharges();
            } else {
                alert('Erro ao registrar cobrança');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    movementForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const date = event.target.date.value;
        const document = event.target.document.value;
        const value = event.target.value.value;
        const account = event.target.account.value;
        const detail = event.target.detail.value;

        fetch(`${API_URL}/addMovement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, document, value, account, detail })
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                alert('Movimento registrado com sucesso!');
                loadMovements();
            } else {
                alert('Erro ao registrar movimento');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    function loadDashboardData() {
        loadPayments();
        loadResidents();
        loadCharges();
        loadMovements();
        loadReports();
        updateAccountBalanceDisplay();
    }

    function loadPayments() {
        fetch(`${API_URL}/getPayments`)
        .then(response => response.json())
        .then(data => {
            paymentsList.innerHTML = '';
            data.payments.forEach(payment => {
                const li = document.createElement('li');
                li.classList.add('payment-item'); // Adiciona a classe payment-item
                li.innerHTML = `
                    <div><strong>Valor:</strong> R$${payment.amount}</div>
                    <div><strong>Data:</strong> ${payment.date}</div>
                    <div><strong>Descrição:</strong> ${payment.description}</div>
                `;
                paymentsList.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    function loadResidents() {
        const residents = ['Morador 1', 'Morador 2', 'Morador 3'];
        residentsList.innerHTML = '';
        residents.forEach(resident => {
            const li = document.createElement('li');
            li.textContent = resident;
            residentsList.appendChild(li);
        });
    }

    function loadCharges() {
        fetch(`${API_URL}/getCharges`)
        .then(response => response.json())
        .then(data => {
            chargesList.innerHTML = '';
            data.charges.forEach(charge => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div><strong>Número:</strong> ${charge.number}</div>
                    <div><strong>Valor:</strong> R$${charge.amount}</div>
                    <div><strong>Data de Vencimento:</strong> ${charge.dueDate}</div>
                `;
                chargesList.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    function loadMovements() {
        fetch(`${API_URL}/getMovements`)
        .then(response => response.json())
        .then(data => {
            movementsList.innerHTML = '';
            data.movements.forEach(movement => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div><strong>Valor:</strong> R$${movement.value}</div>
                    <div><strong>Data:</strong> ${movement.date}</div>
                    <div><strong>Detalhe:</strong> ${movement.detail}</div>
                `;
                movementsList.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    function loadReports() {
        const reports = ['Relatório 1', 'Relatório 2', 'Relatório 3'];
        reportsList.innerHTML = '';
        reports.forEach(report => {
            const li = document.createElement('li');
            li.textContent = report;
            reportsList.appendChild(li);
        });
    }

    function updateAccountBalance(amount) {
        const currentBalance = parseFloat(accountBalance.textContent.replace('R$ ', '').replace(',', '.'));
        const newBalance = currentBalance + parseFloat(amount);
        accountBalance.textContent = `R$ ${newBalance.toFixed(2).replace('.', ',')}`;
    }

    function updateAccountBalanceDisplay() {
        fetch(`${API_URL}/getAccountBalance`)
        .then(response => response.json())
        .then(data => {
            accountBalance.textContent = `R$ ${data.balance.toFixed(2).replace('.', ',')}`;
        })
        .catch(error => console.error('Error:', error));
    }

    window.showSection = function(section) {
        document.getElementById('residents-section').style.display = 'none';
        document.getElementById('payments-section').style.display = 'none';
        document.getElementById('charges-section').style.display = 'none';
        document.getElementById('movements-section').style.display = 'none';
        document.getElementById('reports-section').style.display = 'none';
        document.getElementById(section + '-section').style.display = 'block';
    }

    window.showRegister = function() {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    }

    window.showRecover = function() {
        loginSection.style.display = 'none';
        recoverSection.style.display = 'block';
    }

    window.showLogin = function() {
        registerSection.style.display = 'none';
        recoverSection.style.display = 'none';
        loginSection.style.display = 'block';
    }

    window.goBack = function() {
        if (registerSection.style.display === 'block') {
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
        } else if (recoverSection.style.display === 'block') {
            recoverSection.style.display = 'none';
            loginSection.style.display = 'block';
        }
    }

    window.logout = function() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        dashboardSection.style.display = 'none';
        loginSection.style.display = 'block';
    }

    window.togglePayments = function() {
        const paymentsList = document.getElementById('payments-list');
        const toggleButton = document.querySelector('.toggle-button');
        if (paymentsList.classList.contains('hidden')) {
            paymentsList.classList.remove('hidden');
            toggleButton.textContent = 'Ocultar Pagamentos';
        } else {
            paymentsList.classList.add('hidden');
            toggleButton.textContent = 'Mostrar Pagamentos';
        }
    }

    // Carregar usuário atual ao carregar a página
    loadCurrentUser();
});

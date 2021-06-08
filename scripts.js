const Modal = {
  open() {
    // Abrir Modal
    // Adicionar a class active ao modal
    // alert('Abri o modal')
    // ao invés dessa função, poderia utilizar toogle**
    document
      .querySelector(".modal-overlay") //pesquisa no documento
      .classList // abre a lista de classe deste documento//
      .add("active"); //adiciona "active" na classe do documento
    // irá adicionar a classe active ao modal-overlay
  },
  close() {
    // Fechar o Modal
    // remover a class active do modal
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    // retorna transformando a string em array
  },
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
    // transforma o array em string
  },
};

// Eu preciso somar as entradas,
// depois eu preciso somar as saídas e
// remover das entradas o valor das saídas
// assim, eu terei o total

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    // push coloca algo dentro do array
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    // Soma das entradas
    // pegar todas as transações
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    // verificar se cada transação é maior que zero
    // se for, somar a uma variável e retornar a variável
    return income;
  },
  expenses() {
    let expenses = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expenses += transaction.amount;
      }
      // Soma das saídas
      // verificar se cada transação é menor que zero
      // se for, somar a uma variável e retornar a variável
    });

    return expenses;
  },
  total() {
    // entradas - saídas
    return Transaction.incomes() + Transaction.expenses();
  },
};

// Agora preciso substituir os dados do HTML com os dados
// do JS

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
        <img onclick="Transaction.remove(${index})" src="./assets/assets/minus.svg" alt="Remover transação" />
        </td>
        `;
    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    return Math.round(value);
  },

  formatDate(date) {
    // formatação da data
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
  // Formatação dos valores
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    // se for menor que 0, então (?) o sinal será negativo.

    value = String(value).replace(/\D/g, "");
    // /\D/g - usado para achar somente números

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    // validar os campos
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();
    // verificar se todas as informações foram preenchidas

    try {
      Form.validateFields();
      // formatar os dados para salvar
      const transaction = Form.formatValues();
      // salvar
      Transaction.add(transaction);
      // apagar os dados do formulário
      Form.clearFields();
      // modal feche
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();

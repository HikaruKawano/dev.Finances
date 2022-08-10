const Modal = {
    open() {
        //abrir modal
        //adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        //fechar o modal
        //renomear a class do modal
        document.querySelector('.modal-overlay').classList.remove('active');
    }
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finamces:transactions")) || []
    },
    set(transaction) {
        localStorage.setItem("dev.finamces:transactions", JSON.stringify(transaction))
        
    }
}


const Transaction = {
    all:Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ) {
                income += transaction.amount;
            }

        })

        return income;
    },
    expense() {
        let expense  = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
            return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expense()
    }

}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },


    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        
        const amount = Utils.fomatCurrency(transaction.amount)

        const html = `
            <td class="production">${transaction.production}</td>
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./img/minus.svg" alt="Remover transação"></td>
            </tr>
        `
        return html
    },


    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.fomatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.fomatCurrency(Transaction.expense())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.fomatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
     formatAmount(value) {
        value = Number(value) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },


    fomatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
           currency: "BRL"
        })


        return signal + value
    }
}

const Form = {
    production: document.querySelector('input#production'),
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValue() {
        return{
            production: Form.production.value,
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields() {
        const { production, description, amount,  date } = Form.getValue()
        
        if(production.trim() === "" || 
        description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === "") {
                throw new Error("Por favor, complete todos os campos")
            }

        },



    formateValues() {
        let { production, description, amount, date } = Form.getValue()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            production,
            description,
            amount,
            date
        }

    },  


    clearFields() {
        Form.production.value = ""
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },


    submit(event) {
        event.preventDefault()

       try {
           Form.validateFields()
           const transaction = Form.formateValues()
           Transaction.add(transaction)
           Form.clearFields()
           Modal.close()
       }catch (error) {
        Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Cool'
          })
           
       }
    }
}


const App = {
    init() {

        Transaction.all.forEach(function(transaction, index) {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
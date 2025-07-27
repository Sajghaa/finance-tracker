
// 💡 Elements
const form = document.getElementById('transaction-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const transactionsList = document.getElementById('transactions');
const incomeDisplay = document.getElementById('income');
const expenseDisplay = document.getElementById('expense');
const balanceDisplay = document.getElementById('balance');

let transactions = JSON.parse(localStorage.getItem('lavish_transactions')) || [];

// ✨ Glowing cursor
document.addEventListener("mousemove", (e) => {
  document.body.style.setProperty('--x', `${e.clientX}px`);
  document.body.style.setProperty('--y', `${e.clientY}px`);
});

// ⏳ Loading fade
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 1000);
});

//  Add Transaction
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const type = typeSelect.value;

  if (!desc || isNaN(amount)) return;

  const newTransaction = {
    id: Date.now(),
    desc,
    amount,
    type
  };

  transactions.push(newTransaction);
  localStorage.setItem('lavish_transactions', JSON.stringify(transactions));

  descInput.value = '';
  amountInput.value = '';

  renderTransactions();
  updateSummary();
  updateChart();
});

// 🗑Remove Transaction
function removeTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  localStorage.setItem('lavish_transactions', JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
  updateChart();
}

// render Transactions
function renderTransactions() {
  transactionsList.innerHTML = '';

  const selectedMonth = monthFilter.value;

  const filtered = selectedMonth === 'all'
    ? transactions
    : transactions.filter(tx => {
        const date = new Date(tx.id);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        return month === selectedMonth;
      });

  filtered.forEach(tx => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${tx.desc} — $${tx.amount.toFixed(2)} 
      <button onclick="removeTransaction(${tx.id})">❌</button>
    `;
    li.style.borderLeftColor = tx.type === 'income' ? '#7FFF00' : '#FF6F61';
    transactionsList.prepend(li);
  });
}

//  Update Summary
function updateSummary() {
  const income = transactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balance = income - expense;

  incomeDisplay.textContent = `$${income.toFixed(2)}`;
  expenseDisplay.textContent = `$${expense.toFixed(2)}`;
  balanceDisplay.textContent = `$${balance.toFixed(2)}`;
}

//  Chart.js
let chart;
function updateChart() {
  const income = transactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const ctx = document.getElementById('chart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#7FFF00', '#FF6F61'],
        borderColor: ['#333', '#333'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        }
      }
    }
  });
}

function populateMonthFilter() {
  const months = new Set(transactions.map(tx => {
    const date = new Date(tx.id);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }));

  monthFilter.innerHTML = `<option value="all">All</option>`;
  [...months].sort().forEach(month => {
    monthFilter.innerHTML += `<option value="${month}">${month}</option>`;
  });
}
populateMonthFilter();

document.getElementById('export-csv').addEventListener('click', () => {
  if (transactions.length === 0) return;

  let csv = 'Date,Description,Amount,Type\n';

  transactions.forEach(tx => {
    const date = new Date(tx.id).toLocaleDateString();
    csv += `${date},"${tx.desc}",${tx.amount},${tx.type}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'finance_tracker.csv';
  link.click();
});
const voiceBtn = document.getElementById('voice-btn');

if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';

  voiceBtn.addEventListener('click', () => {
    recognition.start();
    voiceBtn.textContent = '🎤...';
  });

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    descInput.value = transcript;
    voiceBtn.textContent = '🎙️';
  };

  recognition.onerror = () => {
    voiceBtn.textContent = '🎙️';
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = "Voice input not supported";
}
monthFilter.addEventListener('change', () => {
    renderTransactions();
    updateSummary();
    updateChart();
    populateMonthFilter(); 
});

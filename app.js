// Minimal personal finance tracker with localStorage persistence
(function(){
  const form = document.getElementById('transaction-form');
  const descInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const typeInput = document.getElementById('type');
  const transactionsEl = document.getElementById('transactions');
  const totalIncomeEl = document.getElementById('total-income');
  const totalExpensesEl = document.getElementById('total-expenses');
  const balanceEl = document.getElementById('balance');
  const clearBtn = document.getElementById('clear-all');

  const STORAGE_KEY = 'pf_tracker_transactions_v1';

  let transactions = loadTransactions();

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }

  function loadTransactions(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('Failed to parse stored transactions', e);
      return [];
    }
  }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  function addTransaction(desc, amount, type){
    const t = { id: uid(), description: desc, amount: Number(amount), type, created: new Date().toISOString() };
    transactions.unshift(t);
    save();
    render();
  }

  function removeTransaction(id){
    transactions = transactions.filter(t => t.id !== id);
    save();
    render();
  }

  function formatMoney(n){
    return n.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
  }

  function updateSummary(){
    const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s + Math.abs(t.amount),0);
    const expenses = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s + Math.abs(t.amount),0);
    totalIncomeEl.textContent = formatMoney(income);
    totalExpensesEl.textContent = formatMoney(expenses);
    balanceEl.textContent = formatMoney(income - expenses);
  }

  function render(){
    transactionsEl.innerHTML = '';
    if(transactions.length === 0){
      const li = document.createElement('li');
      li.className = 'muted';
      li.textContent = 'No transactions yet.';
      transactionsEl.appendChild(li);
    } else {
      transactions.forEach(t => {
        const li = document.createElement('li');
        const meta = document.createElement('div'); meta.className = 'meta';
        const desc = document.createElement('span'); desc.textContent = t.description || '(no description)';
        const date = document.createElement('small'); date.className = 'muted'; date.textContent = new Date(t.created).toLocaleString();
        meta.appendChild(desc); meta.appendChild(date);

        const right = document.createElement('div');
        const amt = document.createElement('span');
        amt.className = 'amount ' + (t.type==='income' ? 'income' : 'expense');
        const sign = t.type==='income' ? '+' : '-';
        amt.textContent = sign + formatMoney(Math.abs(t.amount));

        const del = document.createElement('button');
        del.textContent = 'Delete';
        del.className = 'danger';
        del.style.marginLeft = '8px';
        del.addEventListener('click', ()=> removeTransaction(t.id));

        right.appendChild(amt); right.appendChild(del);

        li.appendChild(meta);
        li.appendChild(right);
        transactionsEl.appendChild(li);
      });
    }
    updateSummary();
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const desc = descInput.value.trim();
    const amt = Number(amountInput.value);
    const type = typeInput.value;
    if(!desc){ alert('Please add a description'); return; }
    if(Number.isNaN(amt) || amt === 0){ alert('Please enter a non-zero amount'); return; }
    addTransaction(desc, Math.abs(amt), type);
    form.reset();
    descInput.focus();
  });

  clearBtn.addEventListener('click', function(){
    if(!confirm('Clear all transactions? This cannot be undone.')) return;
    transactions = [];
    save();
    render();
  });

  // initial render
  render();
})();

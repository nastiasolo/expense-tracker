const STORAGE_KEY = "expense-tracker-data";

// export function saveToStorage() {
//   const data = {
//     income: monthlyIncome,
//     expenses: allExpenses,
//   };
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
// }

// export function loadFromStorage() {
//   const saved = localStorage.getItem(STORAGE_KEY);
//   if (!saved) return false;

//   const data = JSON.parse(saved);
//   monthlyIncome = data.income || 0;
//   allExpenses.push(...(data.expenses || []));

//   return true;
// }

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { income: 0, expenses: [] };
  }
  return JSON.parse(raw);
}

export function saveData(income, expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, expenses }));
}

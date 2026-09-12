import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { ArrowUpRight, ArrowDownLeft, Trees } from 'lucide-react';

const ACCOUNT_ID = '11111111-1111-1111-1111-111111111111';

export default function App() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: acc } = await supabase.from('accounts').select('*').eq('id', ACCOUNT_ID).single();
    if (acc) setBalance(parseFloat(acc.balance));

    const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (txs) setTransactions(txs);
    setLoading(false);
  }

  async function handleTransaction(title, category, amount, icon) {
    const newBalance = balance + amount;
    setBalance(newBalance);

    await supabase.from('accounts').update({ balance: newBalance }).eq('id', ACCOUNT_ID);

    const { data } = await supabase.from('transactions').insert([
      { account_id: ACCOUNT_ID, title, category, amount, icon }
    ]).select();

    if (data) {
      setTransactions(prev => [data[0], ...prev]);
    }
  }

  const getBeaverMood = () => {
    if (balance > 2000) return { emoji: '🦫👑', text: 'Бабёр у роскошы! Плотина з мароненага дуба.' };
    if (balance > 500) return { emoji: '🦫🪵', text: 'Бабёр задаволены. Бярвёны ўкладзены роўна.' };
    return { emoji: '🦫🏚️', text: 'Бабёр сумуе. Час папоўніць плоціну!' };
  };

  const mood = getBeaverMood();

  if (loading) return <div className="min-h-screen bg-stone-100 flex items-center justify-center font-sans">Загрузка плоціны... 🦫</div>;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-4 max-w-md mx-auto font-sans">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-emerald-900">Бабруйскі Банк</h1>
          <p className="text-xs text-stone-500">Надзейна як дубовы гай</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-800 text-amber-100 flex items-center justify-center font-bold">
          МК
        </div>
      </header>

      {/* Маскот */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 mb-6 text-center">
        <div className="text-6xl mb-2 animate-bounce">{mood.emoji}</div>
        <p className="text-sm font-medium text-emerald-800">{mood.text}</p>
      </div>

      {/* Баланс */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Trees size={160} />
        </div>
        <span className="text-xs text-emerald-200 uppercase tracking-wider">Асноўная плоціна</span>
        <div className="text-3xl font-extrabold mt-1 mb-6">
          {balance.toFixed(2)} <span className="text-lg font-normal text-amber-300">BYN</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleTransaction('Загатоўка бярвёнаў', 'Папаўненне', 100.00, '🪵')}
            className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition cursor-pointer"
          >
            <ArrowDownLeft size={18} />
            Загатаваць
          </button>
          <button 
            onClick={() => handleTransaction('Перакус у лесе', 'Ежа', -15.50, '🪓')}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <ArrowUpRight size={18} />
            Перакінуць
          </button>
        </div>
      </div>

      {/* История */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 mb-3 uppercase tracking-wider">Свежая шчэпа (Гісторыя)</h2>
        <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
          {transactions.map(tx => (
            <div key={tx.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-lg">{tx.icon}</div>
                <div>
                  <p className="text-sm font-semibold">{tx.title}</p>
                  <p className="text-xs text-stone-400">{tx.category}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${parseFloat(tx.amount) > 0 ? 'text-emerald-600' : 'text-stone-800'}`}>
                {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toFixed(2)}` : parseFloat(tx.amount).toFixed(2)} BYN
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
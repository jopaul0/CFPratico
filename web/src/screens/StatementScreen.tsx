import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus } from 'lucide-react'
import { BaseCard } from '../components/BaseCard'
import { SimpleButton } from '../components/SimpleButton'
import { getTransactions, deleteTransactions } from '../services/database'
import type { Transaction } from '../services/database/types'

export function StatementScreen(){
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())

  async function load(){
    setLoading(true)
    const list = await getTransactions()
    setTransactions(list)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.type === 'revenue' ? t.value : -t.value), 0)
  }, [transactions])

  async function handleDelete(){
    if (selected.size === 0) return
    if (!confirm(`Excluir ${selected.size} ${selected.size>1? 'transações':'transação'}?`)) return
    await deleteTransactions(Array.from(selected))
    setSelected(new Set())
    await load()
  }

  return (
    <div className="space-y-4">
      <BaseCard title="Saldo atual">
        <div className="text-2xl font-bold text-gray-900">
          {balance.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
        </div>
      </BaseCard>

      <BaseCard title="Extrato" right={
        <div className="flex items-center gap-2">
          <Link to="/add" className="btn btn-primary"><Plus size={18}/> Adicionar</Link>
          <SimpleButton onClick={handleDelete} variant="danger"><Trash2 size={18}/> Excluir</SimpleButton>
        </div>
      }>
        {loading ? <p className="text-gray-600">Carregando…</p> : (
          <div className="space-y-2">
            {transactions.length === 0 && <p className="text-gray-500">Nenhuma transação ainda.</p>}
            {transactions.map(tx => {
              const isSel = selected.has(tx.id)
              return (
                <label key={tx.id} className={`list-item border ${isSel ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={isSel}
                    onChange={e => {
                      const next = new Set(selected)
                      e.target.checked ? next.add(tx.id) : next.delete(tx.id)
                      setSelected(next)
                    }}
                  />
                  <div className="flex-1">
                    <Link to={`/transaction/${tx.id}`} className="font-medium text-gray-800">{tx.description ?? '(Sem descrição)'}</Link>
                    <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleString('pt-BR')}</div>
                  </div>
                  <div className={`font-semibold ${tx.type==='revenue' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(tx.type==='revenue'? tx.value : -tx.value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </BaseCard>
    </div>
  )
}
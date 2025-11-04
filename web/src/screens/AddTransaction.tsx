import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BaseCard } from '../components/BaseCard'
import { InputGroup } from '../components/InputGroup'
import { SimpleButton } from '../components/SimpleButton'
import { addTransaction, getCategories, getPaymentMethods } from '../services/database'
import type { NewTransactionData, Category, PaymentMethod, TransactionType, TransactionCondition } from '../services/database/types'

export function AddTransaction(){
  const nav = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [methods, setMethods] = useState<PaymentMethod[]>([])

  const [form, setForm] = useState<NewTransactionData>({
    date: new Date().toISOString(),
    description: '',
    value: 0,
    type: 'expense',
    condition: 'paid',
    installments: 1,
    payment_method_id: 1,
    category_id: 1,
  })

  useEffect(() => {
    getCategories().then(setCategories)
    getPaymentMethods().then(setMethods)
  }, [])

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    await addTransaction(form)
    nav('/')
  }

  return (
    <BaseCard title="Adicionar Transação">
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <InputGroup label="Descrição">
          <input className="input" value={form.description ?? ''} onChange={e => setForm({...form, description: e.target.value})}/>
        </InputGroup>

        <InputGroup label="Data">
          <input type="datetime-local" className="input"
            value={new Date(form.date).toISOString().slice(0,16)}
            onChange={e => setForm({...form, date: new Date(e.target.value).toISOString()})}
          />
        </InputGroup>

        <InputGroup label="Valor (R$)">
          <input type="number" step="0.01" className="input"
            value={form.value}
            onChange={e => setForm({...form, value: parseFloat(e.target.value) })}
          />
        </InputGroup>

        <InputGroup label="Tipo">
          <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value as TransactionType})}>
            <option value="expense">Despesa</option>
            <option value="revenue">Receita</option>
          </select>
        </InputGroup>

        <InputGroup label="Condição">
          <select className="input" value={form.condition} onChange={e => setForm({...form, condition: e.target.value as TransactionCondition})}>
            <option value="paid">Paga</option>
            <option value="pending">Pendente</option>
          </select>
        </InputGroup>

        <InputGroup label="Parcelas">
          <input type="number" min={1} className="input"
            value={form.installments}
            onChange={e => setForm({...form, installments: parseInt(e.target.value || '1') })}
          />
        </InputGroup>

        <InputGroup label="Categoria">
          <select className="input" value={form.category_id} onChange={e => setForm({...form, category_id: parseInt(e.target.value)})}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </InputGroup>

        <InputGroup label="Forma de pagamento">
          <select className="input" value={form.payment_method_id} onChange={e => setForm({...form, payment_method_id: parseInt(e.target.value)})}>
            {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </InputGroup>

        <div className="md:col-span-2 flex items-center gap-2">
          <SimpleButton type="submit" variant="primary">Salvar</SimpleButton>
          <SimpleButton type="button" onClick={() => nav('/')}>Cancelar</SimpleButton>
        </div>
      </form>
    </BaseCard>
  )
}
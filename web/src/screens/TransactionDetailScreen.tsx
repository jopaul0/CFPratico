import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BaseCard } from '../components/BaseCard'
import { getTransaction } from '../services/database'
import type { Transaction } from '../services/database/types'

export function TransactionDetailScreen(){
  const { id } = useParams()
  const [tx, setTx] = useState<Transaction | null>(null)

  useEffect(() => {
    if (!id) return
    getTransaction(Number(id)).then(setTx)
  }, [id])

  if (!id) return <p>ID inválido</p>
  if (!tx) return <p>Carregando…</p>

  return (
    <BaseCard title="Detalhe da Transação" right={<Link to="/" className="btn">Voltar</Link>}>
      <div className="grid md:grid-cols-2 gap-4">
        <div><span className="label">Descrição</span><div>{tx.description ?? '-'}</div></div>
        <div><span className="label">Data</span><div>{new Date(tx.date).toLocaleString('pt-BR')}</div></div>
        <div><span className="label">Valor</span><div>{tx.value.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</div></div>
        <div><span className="label">Tipo</span><div>{tx.type}</div></div>
        <div><span className="label">Condição</span><div>{tx.condition}</div></div>
        <div><span className="label">Parcelas</span><div>{tx.installments}</div></div>
        <div><span className="label">Categoria ID</span><div>{tx.category_id}</div></div>
        <div><span className="label">Forma de pagamento ID</span><div>{tx.payment_method_id}</div></div>
      </div>
    </BaseCard>
  )
}
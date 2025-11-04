import type { Category, PaymentMethod, Transaction, NewTransactionData, UserConfig } from './types'

const LS_KEY = 'cfp_db_v1'

type DBShape = {
  transactions: Transaction[]
  categories: Category[]
  paymentMethods: PaymentMethod[]
  userConfig: UserConfig
  seeded?: boolean
}

function load(): DBShape {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) return JSON.parse(raw) as DBShape
  const initial: DBShape = {
    transactions: [],
    categories: [
      { id:1, name:'Salário' },
      { id:2, name:'Alimentação' },
      { id:3, name:'Transporte' },
      { id:4, name:'Moradia' },
      { id:5, name:'Lazer' },
    ],
    paymentMethods: [
      { id:1, name:'Dinheiro' },
      { id:2, name:'Cartão Crédito' },
      { id:3, name:'Cartão Débito' },
      { id:4, name:'Pix' },
    ],
    userConfig: { id:1, company_name:null, initial_balance: 0 },
    seeded: true
  }
  localStorage.setItem(LS_KEY, JSON.stringify(initial))
  return initial
}

function save(db: DBShape){
  localStorage.setItem(LS_KEY, JSON.stringify(db))
}

// Public API (similar to your mobile service)
export async function initDatabase(){
  load(); // ensure exists
}

export async function getCategories(){ return load().categories }
export async function getPaymentMethods(){ return load().paymentMethods }
export async function getUserConfig(){ return load().userConfig }

export async function setUserConfig(config: Partial<UserConfig>){
  const db = load()
  db.userConfig = { ...db.userConfig, ...config }
  save(db)
  return db.userConfig
}

export async function addTransaction(data: NewTransactionData){
  const db = load()
  const nextId = (db.transactions.at(-1)?.id ?? 0) + 1
  const tx: Transaction = { id: nextId, ...data }
  db.transactions.push(tx)
  save(db)
  return tx
}

export async function getTransactions(){
  const db = load()
  // order by date desc, then id desc
  return [...db.transactions].sort((a,b) => (b.date.localeCompare(a.date) || b.id - a.id))
}

export async function getTransaction(id: number){
  const db = load()
  return db.transactions.find(t => t.id === id) ?? null
}

export async function deleteTransactions(ids: number[]){
  const db = load()
  const set = new Set(ids)
  db.transactions = db.transactions.filter(t => !set.has(t.id))
  save(db)
}
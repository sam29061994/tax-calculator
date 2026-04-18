import { TaxForm } from './components/TaxForm'

function App() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="text-2xl font-semibold text-slate-900">Tax calculator</h1>
        <p className="mt-2 text-sm text-slate-600">Enter a salary and pick a year.</p>
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <TaxForm onSubmit={(salary, year) => console.log({ salary, year })} />
        </div>
      </div>
    </main>
  )
}

export default App

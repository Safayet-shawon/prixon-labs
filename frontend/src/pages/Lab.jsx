import { useEffect, useMemo, useState } from 'react'
import { computeScenario } from '../api'
import { useDebouncedValue } from '../hooks/useDebounce'
import { PageIntro, Callout } from '../components/Primitives'
import { PIPELINE_STAGES, SCENARIOS, defaultInventory, defaultPipeline } from '../lib/scenarios'
import './lab.css'

// Instant local result for responsiveness, plus a debounced call to the API.
// If the server agrees we show "verified"; if it is unreachable we say so.
function useScenario(kind, input) {
  const local = useMemo(() => {
    try {
      return { data: SCENARIOS[kind](input), error: '' }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }, [kind, input])
  const debounced = useDebouncedValue(input, 350)
  const [server, setServer] = useState('pending')
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    computeScenario(kind, debounced, controller.signal)
      .then((data) =>
        setServer(
          JSON.stringify(data) === JSON.stringify(SCENARIOS[kind](debounced))
            ? 'verified'
            : 'differs',
        ),
      )
      .catch((error) => setServer(error.status === 400 ? 'rejected' : 'offline'))
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [kind, debounced])
  return { ...local, server: input === debounced ? server : 'pending' }
}

function ServerBadge({ state }) {
  const text = {
    verified: 'Verified by the Praxivon API',
    pending: 'Checking with the API…',
    offline: 'Computed in your browser (API offline)',
    differs: 'API result differs — please report this',
    rejected: 'Input needs attention',
  }[state]
  return <span className={`lab-badge lab-badge-${state}`}>{text}</span>
}

const num = (value) => (value === '' || Number.isNaN(Number(value)) ? 0 : Number(value))
const money = (n) => `$${n.toLocaleString('en-US')}`
const pct = (n) => `${Math.round(n * 1000) / 10}%`

function Tile({ label, value, note }) {
  return (
    <div className="lab-tile">
      <small>{label}</small>
      <strong>{value}</strong>
      {note && <span>{note}</span>}
    </div>
  )
}

function Heat({ matrix, rows, cols }) {
  return (
    <div className="lab-heat" role="table" aria-label="Matrix">
      <div className="lab-heat-row lab-heat-head" role="row">
        <span />
        {cols.map((c) => (
          <span key={c} role="columnheader">
            {c}
          </span>
        ))}
      </div>
      {matrix.map((row, i) => (
        <div className="lab-heat-row" role="row" key={rows[i]}>
          <span role="rowheader">{rows[i]}</span>
          {row.map((v, j) => (
            <span
              key={j}
              role="cell"
              className="lab-heat-cell"
              style={{ '--v': Math.min(1, Math.abs(v)) }}
            >
              {Math.round(v * 100) / 100}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function PipelineTool() {
  const [state, setState] = useState(defaultPipeline)
  const { data, error, server } = useScenario('pipeline', state)
  const set = (key, index, value) =>
    setState((s) => ({ ...s, [key]: s[key].map((v, i) => (i === index ? value : v)) }))
  const faster = () =>
    setState((s) => ({ ...s, lost: s.lost.map((v) => Math.round(v * 60) / 100) }))
  const cols = [...PIPELINE_STAGES, 'Won', 'Lost']
  return (
    <div className="lab-panel">
      <p className="lab-lead">
        <b>Problem:</b> leads slip away between stages, so nobody knows how many will really close.
        We model the pipeline as an <em>absorbing Markov chain</em> and solve (I − Q)⁻¹ to get the
        honest win rate, time to close and the revenue your pipeline can support.
      </p>
      <div className="lab-grid">
        <div className="lab-inputs">
          {PIPELINE_STAGES.map((stage, i) => (
            <fieldset key={stage}>
              <legend>{stage}</legend>
              <label>
                Moves forward each week <output>{Math.round(state.advance[i] * 100)}%</output>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(state.advance[i] * 100)}
                  onChange={(e) => set('advance', i, num(e.target.value) / 100)}
                />
              </label>
              <label>
                Lost each week <output>{Math.round(state.lost[i] * 100)}%</output>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(state.lost[i] * 100)}
                  onChange={(e) => set('lost', i, num(e.target.value) / 100)}
                />
              </label>
            </fieldset>
          ))}
          <div className="lab-row">
            <label>
              New leads / month
              <input
                type="number"
                min="0"
                value={state.leadsPerMonth}
                onChange={(e) => setState((s) => ({ ...s, leadsPerMonth: num(e.target.value) }))}
              />
            </label>
            <label>
              Average deal value ($)
              <input
                type="number"
                min="0"
                value={state.averageValue}
                onChange={(e) => setState((s) => ({ ...s, averageValue: num(e.target.value) }))}
              />
            </label>
          </div>
          <div className="lab-actions">
            <button type="button" className="btn" onClick={faster}>
              What if we follow up faster? (−40% lost)
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setState(defaultPipeline)}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="lab-results" aria-live="polite">
          {error && (
            <p className="lab-error" role="alert">
              {error}
            </p>
          )}
          {data && (
            <>
              <div className="lab-tiles">
                <Tile
                  label="Leads that close"
                  value={pct(data.winRate)}
                  note={`${data.monthlyWins} deals / month`}
                />
                <Tile
                  label="Time to close"
                  value={`${data.expectedWeeksToClose} wks`}
                  note="from first contact"
                />
                <Tile label="Monthly revenue" value={money(data.monthlyRevenue)} note="expected" />
              </div>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Win chance from here</th>
                    <th>Weeks left</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stages.map((s, i) => (
                    <tr key={s}>
                      <td>{s}</td>
                      <td>{pct(data.winRateByStage[i])}</td>
                      <td>{data.expectedWeeksByStage[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h4>Weekly transition matrix P</h4>
              <Heat matrix={data.transition} rows={cols} cols={cols} />
            </>
          )}
          <ServerBadge state={server} />
        </div>
      </div>
    </div>
  )
}

function InventoryTool() {
  const [state, setState] = useState(defaultInventory)
  const { data, error, server } = useScenario('inventory', state)
  const names = state.items
  const setCell = (i, j, value) =>
    setState((s) => ({
      ...s,
      requirements: s.requirements.map((row, r) =>
        row.map((v, c) => (r === i && c === j ? value : v)),
      ),
    }))
  const setVec = (key, i, value) =>
    setState((s) => ({ ...s, [key]: s[key].map((v, k) => (k === i ? value : v)) }))
  return (
    <div className="lab-panel">
      <p className="lab-lead">
        <b>Problem:</b> to ship 500 shirts, how much fabric and thread must you actually buy once
        sleeves, stock on the shelf and multi-level assemblies are counted? We solve the bill of
        materials as a Leontief system, gross = (I − A)⁻¹ · demand, then net your stock level by
        level so stocked sleeve kits also save fabric.
      </p>
      <div className="lab-grid">
        <div className="lab-inputs">
          <h4>
            Requirement matrix A <small>(column item needs row item)</small>
          </h4>
          <div className="lab-matrix" style={{ '--n': names.length }}>
            <span />
            {names.map((n) => (
              <b key={n}>{n}</b>
            ))}
            {state.requirements.map((row, i) => (
              <div className="lab-matrix-row" key={names[i]}>
                <b>{names[i]}</b>
                {row.map((v, j) => (
                  <input
                    key={j}
                    type="number"
                    min="0"
                    step="0.05"
                    aria-label={`${names[j]} needs ${names[i]}`}
                    value={v}
                    onChange={(e) => setCell(i, j, num(e.target.value))}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="lab-row lab-row-4">
            {names.map((n, i) => (
              <label key={n}>
                {n}
                <small>Customer demand</small>
                <input
                  type="number"
                  min="0"
                  value={state.demand[i]}
                  onChange={(e) => setVec('demand', i, num(e.target.value))}
                />
                <small>In stock</small>
                <input
                  type="number"
                  min="0"
                  value={state.stock[i]}
                  onChange={(e) => setVec('stock', i, num(e.target.value))}
                />
              </label>
            ))}
          </div>
          <div className="lab-actions">
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setState(defaultInventory)}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="lab-results" aria-live="polite">
          {error && (
            <p className="lab-error" role="alert">
              {error}
            </p>
          )}
          {data && (
            <>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Total needed</th>
                    <th>In stock</th>
                    <th>Buy / make</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>{data.gross[i]}</td>
                      <td>
                        {state.stock[i]}
                        <span className="lab-bar">
                          <i style={{ width: `${data.coverage[i] * 100}%` }} />
                        </span>
                      </td>
                      <td className={data.net[i] ? 'lab-need' : 'lab-ok'}>
                        {data.net[i] || '✓ covered'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h4>Leontief inverse (I − A)⁻¹</h4>
              <Heat matrix={data.leontiefInverse} rows={names} cols={names} />
            </>
          )}
          <ServerBadge state={server} />
        </div>
      </div>
    </div>
  )
}

const decisionDefault = {
  options: ['Spreadsheets + chat', 'Off-the-shelf SaaS', 'Custom software'],
  criteria: ['Cost', 'Speed to start', 'Fit to workflow', 'Scales with growth'],
  scores: [
    [9, 8, 3, 2],
    [6, 7, 5, 6],
    [4, 4, 9, 9],
  ],
  weights: [2, 1, 3, 3],
}

function DecisionTool() {
  const [state, setState] = useState(decisionDefault)
  const { data, error, server } = useScenario('decision', state)
  const setScore = (i, j, value) =>
    setState((s) => ({
      ...s,
      scores: s.scores.map((row, r) =>
        row.map((v, c) => (r === i && c === j ? Math.min(10, Math.max(0, value)) : v)),
      ),
    }))
  const setWeight = (j, value) =>
    setState((s) => ({
      ...s,
      weights: s.weights.map((v, c) => (c === j ? Math.max(0, value) : v)),
    }))
  return (
    <div className="lab-panel">
      <p className="lab-lead">
        <b>Problem:</b> choosing between tools becomes an argument of opinions. Score each option
        0–10 on what matters, weight the criteria, and let the weighted-sum matrix product S · w
        make the trade-off visible.
      </p>
      <div className="lab-grid">
        <div className="lab-inputs">
          <div className="lab-decision" style={{ '--n': state.criteria.length }}>
            <span />
            {state.criteria.map((c) => (
              <b key={c}>{c}</b>
            ))}
            <span className="lab-w-label">Weight</span>
            {state.weights.map((w, j) => (
              <input
                key={j}
                type="number"
                min="0"
                step="1"
                aria-label={`Weight for ${state.criteria[j]}`}
                value={w}
                onChange={(e) => setWeight(j, num(e.target.value))}
              />
            ))}
            {state.options.map((o, i) => (
              <div className="lab-matrix-row" key={o}>
                <b>{o}</b>
                {state.scores[i].map((v, j) => (
                  <input
                    key={j}
                    type="number"
                    min="0"
                    max="10"
                    aria-label={`${o}: ${state.criteria[j]}`}
                    value={v}
                    onChange={(e) => setScore(i, j, num(e.target.value))}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="lab-actions">
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setState(decisionDefault)}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="lab-results" aria-live="polite">
          {error && (
            <p className="lab-error" role="alert">
              {error}
            </p>
          )}
          {data && (
            <>
              <div className="lab-tiles">
                <Tile label="Best fit for your priorities" value={data.winner} />
              </div>
              <ol className="lab-rank">
                {data.ranking.map((r) => (
                  <li key={r.name}>
                    <span>{r.name}</span>
                    <span className="lab-bar">
                      <i style={{ width: `${r.score * 10}%` }} />
                    </span>
                    <b>{r.score}</b>
                  </li>
                ))}
              </ol>
            </>
          )}
          <ServerBadge state={server} />
        </div>
      </div>
    </div>
  )
}

const TOOLS = [
  ['pipeline', 'Sales pipeline forecast', PipelineTool],
  ['inventory', 'Stock & materials planner', InventoryTool],
  ['decision', 'Decision matrix', DecisionTool],
]

export function Lab() {
  const [tool, setTool] = useState('pipeline')
  const Active = TOOLS.find(([id]) => id === tool)[2]
  return (
    <>
      <PageIntro
        number="05 / SOLUTION LAB"
        title={
          <>
            MATH THAT SOLVES
            <br />
            <em>REAL PROBLEMS.</em>
          </>
        }
        description="Three working tools built on matrix mathematics: forecast your sales pipeline, plan materials and stock, and compare options fairly. Change any number and watch the answer update."
      />
      <section className="section container lab">
        <div className="lab-tabs" role="tablist" aria-label="Lab tools">
          {TOOLS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tool === id}
              className={`btn ${tool === id ? 'is-active' : ''}`}
              onClick={() => setTool(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <Active />
        <p className="work-disclaimer">
          These tools use the numbers you enter. Results are estimates for planning, not guarantees.
        </p>
      </section>
      <Callout />
    </>
  )
}

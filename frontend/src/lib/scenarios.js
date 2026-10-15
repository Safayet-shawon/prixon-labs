// Business scenarios built on the matrix toolkit. Pure functions: the same
// code runs in the browser and in the /api/matrix serverless endpoint.
import {
  MatrixError,
  absorbingChain,
  leontief,
  multiplyVector,
  round,
  roundMatrix,
  weightedScores,
} from './matrix.js'

export const PIPELINE_STAGES = ['New lead', 'Qualified', 'Proposal', 'Negotiation']

export const defaultPipeline = {
  // Per weekly step: chance to advance / chance to be lost (remainder: stay).
  advance: [0.3, 0.35, 0.4, 0.5],
  lost: [0.15, 0.1, 0.1, 0.1],
  leadsPerMonth: 120,
  averageValue: 1800,
}

function num(value, label, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    throw new MatrixError(`${label} must be a number between ${min} and ${max}.`)
  return value
}

/**
 * CRM pipeline forecast as an absorbing Markov chain.
 * Answers: what share of leads will really close, how long does it take, and
 * what is the monthly revenue the pipeline can honestly support?
 */
export function pipelineForecast(input = {}) {
  const advance = input.advance ?? defaultPipeline.advance
  const lost = input.lost ?? defaultPipeline.lost
  const n = PIPELINE_STAGES.length
  if (!Array.isArray(advance) || !Array.isArray(lost) || advance.length !== n || lost.length !== n)
    throw new MatrixError(`Provide ${n} advance and ${n} lost rates.`)
  const leads = num(input.leadsPerMonth ?? defaultPipeline.leadsPerMonth, 'Leads per month', 0, 1e6)
  const value = num(
    input.averageValue ?? defaultPipeline.averageValue,
    'Average deal value',
    0,
    1e9,
  )

  // States: 0..n-1 transient stages, n = Won, n+1 = Lost.
  const p = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0))
  for (let i = 0; i < n; i++) {
    const a = num(advance[i], `Advance rate ${i + 1}`, 0, 1)
    const l = num(lost[i], `Loss rate ${i + 1}`, 0, 1)
    if (a + l > 1)
      throw new MatrixError(`Stage "${PIPELINE_STAGES[i]}": advance + loss cannot exceed 100%.`)
    if (a + l === 0)
      throw new MatrixError(`Stage "${PIPELINE_STAGES[i]}": leads would never leave this stage.`)
    p[i][i] = 1 - a - l
    p[i][i + 1 < n ? i + 1 : n] = a
    p[i][n + 1] += l
  }
  p[n][n] = 1
  p[n + 1][n + 1] = 1

  const { absorption, expectedSteps, fundamental } = absorbingChain(p, n)
  const winRate = absorption[0][0]
  return {
    stages: PIPELINE_STAGES,
    transition: roundMatrix(p, 4),
    winRateByStage: absorption.map((row) => round(row[0], 4)),
    expectedWeeksByStage: expectedSteps.map((v) => round(v, 2)),
    fundamental: roundMatrix(fundamental, 3),
    winRate: round(winRate, 4),
    expectedWeeksToClose: round(expectedSteps[0], 2),
    monthlyWins: round(leads * winRate, 1),
    monthlyRevenue: Math.round(leads * winRate * value),
  }
}

export const defaultInventory = {
  items: ['Shirt', 'Sleeve kit', 'Cotton fabric (m)', 'Thread (spool)'],
  // requirements[i][j] = units of item i needed for one unit of item j
  requirements: [
    [0, 0, 0, 0],
    [2, 0, 0, 0],
    [1.6, 0.35, 0, 0],
    [0.2, 0.05, 0, 0],
  ],
  demand: [500, 0, 0, 0],
  stock: [40, 200, 600, 90],
}

/**
 * Multi-level bill-of-materials explosion with level-by-level stock netting.
 *   gross = (I - A)^-1 d          everything needed if you started with no stock
 *   x     = max(0, A x + d - s)   what you actually buy or make, solved by iterating
 *                                 the matrix-vector product until it settles
 * Stock of a sub-assembly (e.g. sleeve kits) reduces the raw material needed
 * to build it, which a single end-of-line subtraction would miss.
 */
export function inventoryPlan(input = {}) {
  const items = input.items ?? defaultInventory.items
  const requirements = input.requirements ?? defaultInventory.requirements
  const demand = input.demand ?? defaultInventory.demand
  const stock = input.stock ?? defaultInventory.stock
  const n = items.length
  if (n < 2 || n > 12) throw new MatrixError('Use between 2 and 12 items.')
  if (
    !Array.isArray(stock) ||
    stock.length !== n ||
    stock.some((v) => !Number.isFinite(v) || v < 0)
  )
    throw new MatrixError('Stock must be a non-negative number for every item.')
  const { gross, leontiefInverse } = leontief(requirements, demand)
  let net = new Array(n).fill(0)
  for (let pass = 0; pass < 500; pass++) {
    const need = multiplyVector(requirements, net)
    const next = need.map((v, i) => Math.ceil(Math.max(0, v + demand[i] - stock[i]) - 1e-9))
    if (next.every((v, i) => v === net[i])) break
    net = next
  }
  return {
    items,
    gross: gross.map((v) => round(v, 2)),
    net,
    coverage: gross.map((g, i) => (g <= 1e-9 ? 1 : round(Math.min(1, stock[i] / g), 3))),
    leontiefInverse: roundMatrix(leontiefInverse, 3),
  }
}

/** Weighted decision matrix for comparing options on shared criteria. */
export function decisionMatrix({ options, criteria, scores, weights }) {
  if (
    !Array.isArray(options) ||
    options.length < 1 ||
    options.length > 20 ||
    options.length !== scores?.length
  )
    throw new MatrixError('Provide one score row per option.')
  if (!Array.isArray(criteria) || criteria.length > 20 || criteria.length !== scores[0]?.length)
    throw new MatrixError('Provide one score column per criterion.')
  const totals = weightedScores(scores, weights)
  const ranking = options
    .map((name, i) => ({ name, score: round(totals[i], 3) }))
    .sort((a, b) => b.score - a.score)
  return { ranking, winner: ranking[0].name }
}

export const SCENARIOS = {
  pipeline: pipelineForecast,
  inventory: inventoryPlan,
  decision: decisionMatrix,
}

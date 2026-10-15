// Small dependency-free linear algebra toolkit.
// Shared by the browser (Solution Lab) and the serverless API so both sides
// always produce identical numbers.

const EPS = 1e-12

export class MatrixError extends Error {}

function assertMatrix(m, name = 'matrix') {
  if (!Array.isArray(m) || m.length === 0 || !Array.isArray(m[0]) || m[0].length === 0)
    throw new MatrixError(`${name} must be a non-empty 2D array.`)
  const cols = m[0].length
  for (const row of m) {
    if (!Array.isArray(row) || row.length !== cols)
      throw new MatrixError(`${name} rows must all have the same length.`)
    for (const v of row)
      if (typeof v !== 'number' || !Number.isFinite(v))
        throw new MatrixError(`${name} must contain only finite numbers.`)
  }
}

const clone = (m) => m.map((row) => row.slice())

export const zeros = (r, c = r) => Array.from({ length: r }, () => new Array(c).fill(0))
export const identity = (n) => zeros(n).map((row, i) => ((row[i] = 1), row))
export const transpose = (m) => m[0].map((_, j) => m.map((row) => row[j]))
export const scale = (m, k) => m.map((row) => row.map((v) => v * k))

export function add(a, b) {
  assertMatrix(a, 'A')
  assertMatrix(b, 'B')
  if (a.length !== b.length || a[0].length !== b[0].length)
    throw new MatrixError('Matrices must have the same dimensions.')
  return a.map((row, i) => row.map((v, j) => v + b[i][j]))
}

export function subtract(a, b) {
  return add(a, scale(b, -1))
}

export function multiply(a, b) {
  assertMatrix(a, 'A')
  assertMatrix(b, 'B')
  if (a[0].length !== b.length) throw new MatrixError('Columns of A must equal rows of B.')
  const out = zeros(a.length, b[0].length)
  for (let i = 0; i < a.length; i++)
    for (let k = 0; k < b.length; k++) {
      const aik = a[i][k]
      if (aik === 0) continue
      for (let j = 0; j < b[0].length; j++) out[i][j] += aik * b[k][j]
    }
  return out
}

export const multiplyVector = (a, v) =>
  multiply(
    a,
    v.map((x) => [x]),
  ).map((row) => row[0])

// Gauss-Jordan elimination with partial pivoting. Returns { inverse, determinant }.
function gaussJordan(m) {
  assertMatrix(m)
  const n = m.length
  if (m[0].length !== n) throw new MatrixError('Matrix must be square.')
  const a = clone(m)
  const inv = identity(n)
  let det = 1
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r
    if (Math.abs(a[pivot][col]) < EPS) return { inverse: null, determinant: 0 }
    if (pivot !== col) {
      ;[a[pivot], a[col]] = [a[col], a[pivot]]
      ;[inv[pivot], inv[col]] = [inv[col], inv[pivot]]
      det = -det
    }
    const p = a[col][col]
    det *= p
    for (let j = 0; j < n; j++) {
      a[col][j] /= p
      inv[col][j] /= p
    }
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = a[r][col]
      if (f === 0) continue
      for (let j = 0; j < n; j++) {
        a[r][j] -= f * a[col][j]
        inv[r][j] -= f * inv[col][j]
      }
    }
  }
  return { inverse: inv, determinant: det }
}

export const determinant = (m) => gaussJordan(m).determinant

export function inverse(m) {
  const { inverse: inv } = gaussJordan(m)
  if (!inv) throw new MatrixError('Matrix is singular and cannot be inverted.')
  return inv
}

// Solve A x = b for x.
export function solve(a, b) {
  const x = multiply(
    inverse(a),
    b.map((v) => [v]),
  )
  return x.map((row) => row[0])
}

export const round = (value, digits = 4) => {
  const f = 10 ** digits
  return Math.round(value * f) / f
}
export const roundMatrix = (m, digits = 4) => m.map((row) => row.map((v) => round(v, digits)))

/**
 * Absorbing Markov chain.
 * `p` is a full row-stochastic transition matrix whose first `transient`
 * states are transient and the rest are absorbing.
 * Returns the fundamental matrix N = (I - Q)^-1, absorption probabilities
 * B = N R and expected steps until absorption t = N 1.
 */
export function absorbingChain(p, transient) {
  assertMatrix(p, 'P')
  const n = p.length
  if (p[0].length !== n) throw new MatrixError('Transition matrix must be square.')
  if (!Number.isInteger(transient) || transient < 1 || transient >= n)
    throw new MatrixError('Invalid number of transient states.')
  for (let i = 0; i < n; i++) {
    const sum = p[i].reduce((s, v) => s + v, 0)
    if (p[i].some((v) => v < 0 || v > 1) || Math.abs(sum - 1) > 1e-6)
      throw new MatrixError(`Row ${i + 1} must contain probabilities that sum to 1.`)
  }
  const q = p.slice(0, transient).map((row) => row.slice(0, transient))
  const r = p.slice(0, transient).map((row) => row.slice(transient))
  const fundamental = inverse(subtract(identity(transient), q))
  return {
    fundamental,
    absorption: multiply(fundamental, r),
    expectedSteps: multiplyVector(fundamental, new Array(transient).fill(1)),
  }
}

/**
 * Multi-level bill of materials / input-output (Leontief) model.
 * a[i][j] = units of item i consumed to make one unit of item j.
 * demand is external demand per item. gross = (I - A)^-1 d.
 */
export function leontief(a, demand) {
  assertMatrix(a, 'A')
  const n = a.length
  if (a[0].length !== n) throw new MatrixError('Requirement matrix must be square.')
  if (
    !Array.isArray(demand) ||
    demand.length !== n ||
    demand.some((v) => !Number.isFinite(v) || v < 0)
  )
    throw new MatrixError('Demand must be a non-negative number for every item.')
  if (a.some((row) => row.some((v) => v < 0)))
    throw new MatrixError('Requirements cannot be negative.')
  const l = inverse(subtract(identity(n), a))
  const gross = multiplyVector(l, demand)
  // A productive economy has a non-negative Leontief inverse; a circular
  // requirement loop (item needs itself) produces negative or huge values.
  if (gross.some((v) => v < -1e-9 || !Number.isFinite(v)))
    throw new MatrixError('Requirements form an impossible loop (an item ends up needing itself).')
  return { leontiefInverse: l, gross }
}

// Weighted decision matrix: rows are options, columns are criteria.
export function weightedScores(scores, weights) {
  assertMatrix(scores, 'scores')
  if (!Array.isArray(weights) || weights.length !== scores[0].length)
    throw new MatrixError('Provide one weight per criterion.')
  const total = weights.reduce((s, w) => s + w, 0)
  if (!(total > 0) || weights.some((w) => w < 0)) throw new MatrixError('Weights must be positive.')
  const normalized = weights.map((w) => w / total)
  return multiplyVector(scores, normalized)
}

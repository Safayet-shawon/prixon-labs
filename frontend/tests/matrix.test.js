import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MatrixError,
  determinant,
  identity,
  inverse,
  multiply,
  solve,
  absorbingChain,
  leontief,
} from '../src/lib/matrix.js'
import { decisionMatrix, inventoryPlan, pipelineForecast } from '../src/lib/scenarios.js'

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`)

test('multiply and determinant', () => {
  assert.deepEqual(
    multiply(
      [
        [1, 2],
        [3, 4],
      ],
      [
        [5, 6],
        [7, 8],
      ],
    ),
    [
      [19, 22],
      [43, 50],
    ],
  )
  close(
    determinant([
      [4, 3],
      [6, 3],
    ]),
    -6,
  )
  assert.throws(() => multiply([[1, 2]], [[1, 2]]), MatrixError)
})

test('inverse and linear solve', () => {
  const a = [
    [2, 1],
    [1, 3],
  ]
  const product = multiply(a, inverse(a))
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) close(product[i][j], identity(2)[i][j])
  const x = solve(a, [3, 5])
  close(x[0], 0.8)
  close(x[1], 1.4)
  assert.throws(
    () =>
      inverse([
        [1, 2],
        [2, 4],
      ]),
    /singular/,
  )
})

test('absorbing chain matches the closed-form single-stage answer', () => {
  const { absorption, expectedSteps } = absorbingChain(
    [
      [0.5, 0.3, 0.2],
      [0, 1, 0],
      [0, 0, 1],
    ],
    1,
  )
  close(absorption[0][0], 0.6)
  close(absorption[0][1], 0.4)
  close(expectedSteps[0], 2)
})

test('pipeline forecast agrees with hand-computed recursion', () => {
  const result = pipelineForecast()
  close(result.winRate, 0.3457, 1e-4)
  close(result.expectedWeeksToClose, 5.43, 1e-2)
  close(result.monthlyRevenue, 120 * 0.345679 * 1800, 5)
  assert.throws(
    () => pipelineForecast({ advance: [0.9, 0.3, 0.3, 0.3], lost: [0.3, 0.1, 0.1, 0.1] }),
    MatrixError,
  )
})

test('inventory plan explodes a multi-level bill of materials', () => {
  const plan = inventoryPlan()
  assert.deepEqual(plan.gross, [500, 1000, 1150, 150])
  assert.deepEqual(plan.net, [460, 720, 388, 38])
})

test('leontief rejects circular requirements', () => {
  assert.throws(() => leontief([[1.5]], [10]), MatrixError)
})

test('decision matrix ranks by weighted score', () => {
  const { winner, ranking } = decisionMatrix({
    options: ['A', 'B'],
    criteria: ['Cost', 'Speed'],
    scores: [
      [9, 3],
      [5, 8],
    ],
    weights: [1, 3],
  })
  assert.equal(winner, 'B')
  assert.equal(ranking[0].score, 7.25)
})

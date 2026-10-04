import assert from 'node:assert/strict'
import test from 'node:test'
import { projects, services } from '../src/data.js'

test('the service catalog has unique numbers and complete display content', () => {
  assert.equal(services.length, 10)
  assert.equal(new Set(services.map((service) => service.number)).size, services.length)

  for (const service of services) {
    assert.ok(service.title)
    assert.ok(service.short)
    assert.ok(service.category)
  }
})

test('every project route has complete case-study content and is labeled as a concept', () => {
  assert.equal(projects.length, 5)
  assert.equal(new Set(projects.map((project) => project.slug)).size, projects.length)

  for (const project of projects) {
    assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(project.name)
    assert.ok(project.summary)
    assert.ok(project.intro)
    assert.ok(project.challenge)
    assert.ok(project.approach)
    assert.ok(project.outcome)
    assert.ok(project.scope.length > 0)
    assert.match(project.note, /concept/i)
  }
})

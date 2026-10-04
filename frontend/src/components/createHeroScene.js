import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const systems = [
  {
    label: 'ERP',
    detail: 'Operations in sync',
    start: [-3.3, 1.15, 0.15],
    end: [-2.15, 0.48, 0.2],
  },
  { label: 'CRM', detail: 'Every relationship', start: [3.25, 1.2, -0.1], end: [0, 0.48, 0.2] },
  {
    label: 'Inventory',
    detail: 'Stock with clarity',
    start: [-3.2, -1.05, 0.45],
    end: [2.15, 0.48, 0.2],
  },
  {
    label: 'Finance',
    detail: 'The full picture',
    start: [3.25, -1.05, 0.2],
    end: [-2.15, -0.88, 0.2],
  },
  { label: 'HR', detail: 'People, connected', start: [-0.6, 1.95, -0.4], end: [0, -0.88, 0.2] },
  {
    label: 'Web',
    detail: 'Your digital front door',
    start: [0.6, -1.95, 0.1],
    end: [2.15, -0.88, 0.2],
  },
]

function texture(width, height, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  return map
}

function rounded(context, x, y, width, height, radius, color) {
  context.fillStyle = color
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

function moduleTexture(system, index) {
  return texture(512, 288, (context) => {
    rounded(context, 0, 0, 512, 288, 22, '#f2f0e9')
    context.fillStyle = '#171915'
    context.font = '800 44px Manrope, sans-serif'
    context.fillText(system.label, 34, 68)
    context.fillStyle = '#727a65'
    context.font = '500 21px "DM Sans", sans-serif'
    context.fillText(system.detail, 34, 103)
    rounded(context, 416, 30, 60, 36, 18, '#d4f456')
    context.fillStyle = '#657523'
    context.font = '700 19px "DM Sans", sans-serif'
    context.fillText('↗', 437, 55)
    context.strokeStyle = '#d8dbcf'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(34, 137)
    context.lineTo(478, 137)
    context.stroke()
    const heights = [38, 52, 43, 72, 58, 90, 78, 109]
    for (let bar = 0; bar < heights.length; bar += 1) {
      const adjusted = heights[(bar + index) % heights.length]
      rounded(
        context,
        34 + bar * 55,
        248 - adjusted,
        33,
        adjusted,
        5,
        bar > 5 ? '#a8be45' : '#d6dfb2',
      )
    }
  })
}

function dashboardTexture() {
  return texture(1360, 820, (context) => {
    rounded(context, 0, 0, 1360, 820, 28, '#e7e9df')
    rounded(context, 0, 0, 1360, 155, 28, '#f2f0e9')
    context.fillStyle = '#171915'
    context.font = '800 33px Manrope, sans-serif'
    context.fillText('✳ praxivon.', 44, 65)
    context.font = '600 25px "DM Sans", sans-serif'
    context.fillText('Business overview', 44, 113)
    rounded(context, 1095, 41, 218, 46, 23, '#d4f456')
    context.fillStyle = '#171915'
    context.font = '700 17px "DM Sans", sans-serif'
    context.fillText('●  SYSTEMS CONNECTED', 1113, 70)
    context.fillStyle = '#8c947d'
    context.font = '500 17px "DM Sans", sans-serif'
    context.fillText('A connected workspace. A clearer picture.', 44, 784)
    context.textAlign = 'right'
    context.fillText('Illustrative interface', 1316, 784)
  })
}

function glowTexture() {
  return texture(128, 128, (context) => {
    const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(212, 244, 86, 0.65)')
    gradient.addColorStop(0.35, 'rgba(182, 218, 67, 0.28)')
    gradient.addColorStop(1, 'rgba(182, 218, 67, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
  })
}

export function createHeroScene({ host, getProgress, getPointer, onReady, onFailure }) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x171915, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-5.5, 5.5, 3, -3, 0.1, 40)
  camera.position.z = 10
  const root = new THREE.Group()
  scene.add(root)
  scene.add(new THREE.HemisphereLight(0xf2f0e9, 0x435024, 2.5))
  const light = new THREE.DirectionalLight(0xe8ffc0, 3)
  light.position.set(3, 4, 6)
  scene.add(light)

  const resources = new Set()
  const retain = (resource) => {
    resources.add(resource)
    return resource
  }
  const halo = retain(glowTexture())
  const frameGeometry = retain(new RoundedBoxGeometry(1.91, 1.1, 0.17, 2, 0.09))
  const faceGeometry = retain(new THREE.PlaneGeometry(1.83, 1.03))

  const nodes = systems.map((system, index) => {
    const group = new THREE.Group()
    group.position.fromArray(system.start)
    const frameMaterial = retain(
      new THREE.MeshStandardMaterial({
        color: 0x7e9941,
        emissive: 0x839d36,
        emissiveIntensity: 0.45,
        metalness: 0.28,
        roughness: 0.5,
      }),
    )
    group.add(new THREE.Mesh(frameGeometry, frameMaterial))
    const map = retain(moduleTexture(system, index))
    const faceMaterial = retain(new THREE.MeshBasicMaterial({ map, transparent: true }))
    const face = new THREE.Mesh(faceGeometry, faceMaterial)
    face.position.z = 0.091
    group.add(face)
    const glowMaterial = retain(
      new THREE.SpriteMaterial({
        map: halo,
        color: 0xd4f456,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    const glow = new THREE.Sprite(glowMaterial)
    glow.scale.set(3.7, 2.6, 1)
    glow.position.z = -0.1
    group.add(glow)
    root.add(group)
    return { group, frameMaterial, glowMaterial, start: system.start, end: system.end }
  })

  const board = new THREE.Group()
  const boardFrameMaterial = retain(
    new THREE.MeshStandardMaterial({
      color: 0xabb693,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      roughness: 0.7,
    }),
  )
  const boardGeometry = retain(new RoundedBoxGeometry(6.85, 4.14, 0.14, 2, 0.09))
  board.add(new THREE.Mesh(boardGeometry, boardFrameMaterial))
  const boardFaceMaterial = retain(
    new THREE.MeshBasicMaterial({
      map: retain(dashboardTexture()),
      transparent: true,
      depthWrite: false,
      opacity: 0,
    }),
  )
  const boardFace = new THREE.Mesh(retain(new THREE.PlaneGeometry(6.8, 4.1)), boardFaceMaterial)
  boardFace.position.z = 0.075
  board.add(boardFace)
  board.position.z = -0.13
  root.add(board)

  const coreMaterial = retain(
    new THREE.MeshStandardMaterial({
      color: 0xd4f456,
      emissive: 0x99b83d,
      emissiveIntensity: 1,
      transparent: true,
      depthWrite: false,
    }),
  )
  const core = new THREE.Mesh(retain(new THREE.IcosahedronGeometry(0.28, 1)), coreMaterial)
  root.add(core)
  const ringMaterial = retain(
    new THREE.MeshBasicMaterial({
      color: 0xd4f456,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    }),
  )
  const ring = new THREE.Mesh(retain(new THREE.TorusGeometry(0.56, 0.008, 6, 80)), ringMaterial)
  root.add(ring)

  const connections = systems.map((_, index) => [-1, index])
  connections.push([0, 4], [4, 1], [1, 3], [3, 5], [5, 2], [2, 0])
  const lineVertices = new Float32Array(connections.length * 6)
  const lineGeometry = retain(new THREE.BufferGeometry())
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3))
  const lineMaterial = retain(
    new THREE.LineBasicMaterial({
      color: 0xd4f456,
      transparent: true,
      depthWrite: false,
      opacity: 0.4,
    }),
  )
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
  lines.frustumCulled = false
  root.add(lines)

  const points = new Float32Array(90)
  for (let index = 0; index < 30; index += 1) {
    points[index * 3] = Math.sin(index * 12.3) * 4.9
    points[index * 3 + 1] = Math.cos(index * 8.7) * 2.5
    points[index * 3 + 2] = -2 - (index % 4) * 0.2
  }
  const pointsGeometry = retain(new THREE.BufferGeometry())
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3))
  const pointsMaterial = retain(
    new THREE.PointsMaterial({
      color: 0xbcd063,
      size: 0.025,
      transparent: true,
      depthWrite: false,
      opacity: 0.35,
    }),
  )
  root.add(new THREE.Points(pointsGeometry, pointsMaterial))

  function resize() {
    const width = host.clientWidth
    const height = host.clientHeight
    if (!width || !height) return
    const aspect = width / height
    const halfWidth = Math.max(4.65, aspect * 2.75)
    camera.left = -halfWidth
    camera.right = halfWidth
    camera.top = halfWidth / aspect
    camera.bottom = -halfWidth / aspect
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  resize()

  let active = false
  let destroyed = false
  let ready = false
  let lastFrame = -Infinity
  let assembly = 0
  const finalColor = new THREE.Color(0xc4cab8)
  const floatingColor = new THREE.Color(0x7e9941)

  function render(timestamp) {
    if (destroyed || timestamp - lastFrame < 1000 / 30) return
    lastFrame = timestamp
    const seconds = timestamp / 1000
    const raw = THREE.MathUtils.clamp((getProgress() - 0.12) / 0.73, 0, 1)
    const target = raw * raw * (3 - 2 * raw)
    assembly = THREE.MathUtils.lerp(assembly, target, 0.16)
    const free = 1 - assembly
    const pointer = getPointer()
    root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, (pointer.y * 0.07 - 0.06) * free, 0.07)
    root.rotation.y = THREE.MathUtils.lerp(
      root.rotation.y,
      (Math.sin(seconds * 0.19) * 0.12 + pointer.x * 0.12) * free,
      0.07,
    )
    root.rotation.z = Math.sin(seconds * 0.14) * 0.024 * free
    camera.zoom = 1 + assembly * 0.1
    camera.updateProjectionMatrix()

    nodes.forEach((node, index) => {
      const bob = Math.sin(seconds * 0.7 + index * 1.2) * 0.08 * free
      node.group.position.set(
        THREE.MathUtils.lerp(node.start[0], node.end[0], assembly),
        THREE.MathUtils.lerp(node.start[1], node.end[1], assembly) + bob,
        THREE.MathUtils.lerp(node.start[2], node.end[2], assembly),
      )
      node.group.rotation.y = Math.sin(seconds * 0.3 + index) * 0.09 * free
      node.group.rotation.z = Math.sin(seconds * 0.25 + index) * 0.025 * free
      node.frameMaterial.color.copy(floatingColor).lerp(finalColor, assembly)
      node.frameMaterial.emissiveIntensity = 0.45 * free
      node.glowMaterial.opacity = 0.32 * free
    })

    connections.forEach(([from, to], index) => {
      const start = from < 0 ? core.position : nodes[from].group.position
      const end = nodes[to].group.position
      start.toArray(lineVertices, index * 6)
      end.toArray(lineVertices, index * 6 + 3)
    })
    lineGeometry.attributes.position.needsUpdate = true
    lineMaterial.opacity = 0.4 * free * free
    lines.visible = free > 0.015
    const boardOpacity = THREE.MathUtils.smoothstep(assembly, 0.2, 0.8)
    boardFrameMaterial.opacity = boardOpacity
    boardFaceMaterial.opacity = boardOpacity
    board.scale.setScalar(0.94 + assembly * 0.06)
    coreMaterial.opacity = free * free
    core.visible = free > 0.015
    core.rotation.y = seconds * 0.25
    ringMaterial.opacity = 0.6 * free * free
    ring.visible = free > 0.015
    ring.rotation.x = seconds * 0.16
    ring.rotation.y = seconds * 0.13
    pointsMaterial.opacity = 0.35 * free + 0.1
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      onReady()
    }
  }

  function setActive(value) {
    if (destroyed || active === value) return
    active = value
    lastFrame = -Infinity
    renderer.setAnimationLoop(active ? render : null)
  }

  function contextLost(event) {
    event.preventDefault()
    setActive(false)
    onFailure()
  }
  renderer.domElement.addEventListener('webglcontextlost', contextLost)

  return {
    setActive,
    destroy() {
      destroyed = true
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      resources.forEach((resource) => resource.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

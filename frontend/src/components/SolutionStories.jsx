import { usePrefersReducedMotion } from '../hooks/useMotionPreferences'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useInView, useMotionValue, useScroll, useTransform } from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  CheckCheck,
  Clock3,
  Eye,
  Globe2,
  Layers3,
  Users,
} from 'lucide-react'
import { solutions } from '../solutions'
import { Reveal, SectionHead } from './Primitives'
import './solution-stories.css'

const icons = {
  users: Users,
  clock: Clock3,
  eye: Eye,
  chart: ChartNoAxesCombined,
  layers: Layers3,
  check: CheckCheck,
  boxes: Boxes,
  bell: Bell,
  globe: Globe2,
}

export function ProblemPicker() {
  return (
    <div className="problem-picker">
      <span className="eyebrow">WHERE IS WORK GETTING STUCK?</span>
      <div className="problem-picker-grid">
        {solutions.map((solution, index) => (
          <Reveal key={solution.id} delay={index * 0.06}>
            <a href={`#${solution.id}`}>
              <span>{solution.name}</span>
              <strong>{solution.picker}</strong>
              <ArrowDown size={17} aria-hidden="true" />
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

function ChaosCard({ label, index, progress, reduced }) {
  const x = useTransform(progress, [0, 0.65], [[-22, 30, 25, -25][index], 0])
  const y = useTransform(progress, [0, 0.65], [[-22, 18, 24, -10][index], 0])
  const rotate = useTransform(progress, [0, 0.65], [[-9, 8, 7, -6][index], 0])
  return (
    <motion.div
      className={`chaos-note chaos-note-${index}`}
      style={reduced ? undefined : { x, y, rotate }}
    >
      <span>! / NEEDS ATTENTION</span>
      <strong>{label}</strong>
      <i />
    </motion.div>
  )
}

function WorkflowVisual({ solution }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.5'] })
  const chaosOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0])
  const screenOpacity = useTransform(scrollYProgress, [0.5, 0.72], [0, 1])
  const scale = useTransform(scrollYProgress, [0.5, 0.72], [0.94, 1])
  return (
    <div className="workflow-visual" ref={ref}>
      <div className="workflow-visual-label">
        <span>SCATTERED WORK</span>
        <span>ONE CLEAR WORKSPACE ↗</span>
      </div>
      {!reduced && (
        <motion.div className="chaos-layer" style={{ opacity: chaosOpacity }} aria-hidden="true">
          <svg viewBox="0 0 500 350">
            <path d="M30 90L440 260 130 290 370 60 80 220 460 160" />
          </svg>
          {solution.chaos.map((label, index) => (
            <ChaosCard
              key={label}
              label={label}
              index={index}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </motion.div>
      )}
      <motion.div
        className="workflow-screen"
        style={reduced ? { opacity: 1, scale: 1 } : { opacity: screenOpacity, scale }}
      >
        <div className="workflow-toolbar">
          <b>✳ praxivon.</b>
          <span>
            <i /> CONNECTED
          </span>
        </div>
        <div className="workflow-screen-title">
          <small>{solution.name.toUpperCase()}</small>
          <h4>{solution.dashboard}</h4>
        </div>
        <div className="workflow-tiles">
          {solution.tiles.map(([label, status], index) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{status}</strong>
              <div className="workflow-bars">
                {[35, 56, 42, 75, 65, 90].map((height, i) => (
                  <i key={i} style={{ height: `${height - index * 3}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="workflow-screen-foot">
          <span>Shared records. Clear next actions.</span>
          <CheckCheck size={16} aria-hidden="true" />
        </div>
      </motion.div>
      <span className="workflow-note">Illustrative interface · scroll to bring it together</span>
    </div>
  )
}

function CountUp({ value, unit, active }) {
  const ref = useRef(null)
  const current = useMotionValue(0)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) {
      ref.current.textContent = String(value)
      return
    }
    const unsubscribe = current.on('change', (next) => {
      if (ref.current) ref.current.textContent = String(Math.round(next * 10) / 10)
    })
    const animation = active ? animate(current, value, { duration: 1.25, ease: 'easeOut' }) : null
    return () => {
      animation?.stop()
      unsubscribe()
    }
  }, [active, current, reduced, value])
  return (
    <span aria-label={`${value} ${unit}`}>
      <span ref={ref} aria-hidden="true">
        {reduced ? value : 0}
      </span>
      <small aria-hidden="true">{unit === '%' ? '%' : ` ${unit}`}</small>
    </span>
  )
}

function ImpactChart({ solution }) {
  const ref = useRef(null)
  const active = useInView(ref, { amount: 0.2 })
  const reduced = usePrefersReducedMotion()
  const chart = solution.chart
  const path = (values) =>
    values
      .map(
        (value, index) =>
          `${index ? 'L' : 'M'}${58 + index * 76} ${222 - (value / chart.max) * 176}`,
      )
      .join(' ')
  return (
    <div className="impact-panel" ref={ref} data-chart-active={active ? 'true' : 'false'}>
      <div className="impact-heading">
        <span className="eyebrow">04 / BEFORE VS AFTER</span>
        <span>Six-week example</span>
      </div>
      <h4>{chart.label}</h4>
      <svg
        className="impact-chart"
        viewBox="0 0 480 268"
        role="img"
        aria-label={`Illustrative ${chart.label}: without a connected system ${chart.before} ${chart.unit}, with a connected system ${chart.after} ${chart.unit}.`}
      >
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line x1="58" y1={222 - fraction * 176} x2="438" y2={222 - fraction * 176} />
            <text x="44" y={226 - fraction * 176} textAnchor="end">
              {Math.round(chart.max * fraction * 10) / 10}
            </text>
          </g>
        ))}
        <text x="58" y="22">
          {chart.unit}
        </text>
        {chart.with.map((_, i) => (
          <text key={i} x={58 + i * 76} y="250" textAnchor="middle">
            W{i + 1}
          </text>
        ))}
        <motion.path
          className="chart-without"
          d={path(chart.without)}
          initial={false}
          animate={{ pathLength: reduced || active ? 1 : 0 }}
          transition={{ duration: reduced || !active ? 0 : 1.4 }}
        />
        <motion.path
          className="chart-with"
          d={path(chart.with)}
          initial={false}
          animate={{ pathLength: reduced || active ? 1 : 0 }}
          transition={{ duration: reduced || !active ? 0 : 1.65 }}
        />
      </svg>
      <div className="impact-legend">
        <span>
          <i className="legend-red" /> Without a connected system
        </span>
        <span>
          <i className="legend-green" /> With a connected system
        </span>
      </div>
      <div className="impact-metrics">
        {[
          { label: chart.label, unit: chart.unit, before: chart.before, after: chart.after },
          solution.secondMetric,
        ].map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <div>
              <span className="metric-before">
                <CountUp value={metric.before} unit={metric.unit} active={active} />
              </span>
              <span className="metric-arrow" aria-hidden="true">
                →
              </span>
              <strong>
                <CountUp value={metric.after} unit={metric.unit} active={active} />
              </strong>
            </div>
          </div>
        ))}
      </div>
      <p className="estimate-note">
        <b>Illustrative estimates.</b> Example scenarios, not measured client results or promised
        outcomes. Actual improvement depends on your starting point, scope and adoption.
      </p>
    </div>
  )
}

function SolutionStory({ solution }) {
  return (
    <section
      className="solution-story container"
      id={solution.id}
      aria-labelledby={`${solution.id}-title`}
    >
      <Reveal className="solution-story-head">
        <span className="eyebrow">
          {solution.number} / {solution.name.toUpperCase()}
        </span>
        <h2 id={`${solution.id}-title`}>{solution.title}</h2>
        <a
          href={`#${solution.id}`}
          className="solution-permalink"
          aria-label={`Link to ${solution.name} section`}
        >
          #{solution.id} ↗
        </a>
      </Reveal>
      <div className="problem-solution-grid">
        <Reveal className="problem-copy">
          <span className="eyebrow">01 / THE PROBLEM</span>
          <h3>Sound familiar?</h3>
          <p>{solution.problem}</p>
          <ul>
            {solution.pains.map((pain, index) => (
              <Reveal as="li" key={pain} delay={index * 0.04}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {pain}
              </Reveal>
            ))}
          </ul>
        </Reveal>
        <WorkflowVisual solution={solution} />
      </div>
      <Reveal className="solution-answer">
        <span className="eyebrow">02 / THE SOLUTION</span>
        <h3>{solution.solution}</h3>
        <Link className="text-link" to="/contact#demo">
          Discuss your workflow <ArrowUpRight size={18} />
        </Link>
      </Reveal>
      <div className="solution-workflow">
        <Reveal>
          <span className="eyebrow">03 / HOW IT WORKS</span>
        </Reveal>
        <ol>
          {solution.steps.map(([title, description], index) => (
            <Reveal as="li" key={title} delay={index * 0.09} className="solution-step">
              <span>
                {String(index + 1).padStart(2, '0')}
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
              <h4>{title}</h4>
              <p>{description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
      <div className="impact-benefits-grid">
        <ImpactChart solution={solution} />
        <div className="solution-benefits">
          <Reveal>
            <span className="eyebrow">05 / WHAT GETS BETTER</span>
            <h3>
              Less friction.
              <br />
              <em>More room to grow.</em>
            </h3>
          </Reveal>
          <div>
            {solution.benefits.map(([icon, title, description], index) => {
              const Icon = icons[icon]
              return (
                <Reveal key={title} delay={index * 0.06} className="benefit-card">
                  <Icon size={22} aria-hidden="true" />
                  <h4>{title}</h4>
                  <p>{description}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export function SolutionStories() {
  return (
    <div className="solution-stories">
      <div className="container solution-stories-intro">
        <Reveal>
          <SectionHead
            kicker="START WITH THE PROBLEM / FIND YOUR SOLUTION"
            title={
              <>
                Your daily friction.
                <br />
                <em>A clearer way forward.</em>
              </>
            }
          />
        </Reveal>
        <nav className="solution-jump-links" aria-label="Business solutions">
          {solutions.map((solution) => (
            <a key={solution.id} href={`#${solution.id}`}>
              {solution.name}
              <ArrowDown size={14} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      {solutions.map((solution) => (
        <SolutionStory key={solution.id} solution={solution} />
      ))}
    </div>
  )
}

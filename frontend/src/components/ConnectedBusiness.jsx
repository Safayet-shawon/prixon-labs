import { usePrefersReducedMotion } from '../hooks/useMotionPreferences'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Boxes, Globe2, Landmark, Network, Users, UserRound } from 'lucide-react'
import { Reveal, SectionHead } from './Primitives'
import './connected-business.css'

const nodes = [
  {
    id: 'erp',
    name: 'ERP / SAP',
    icon: Network,
    x: 50,
    y: 45,
    title: 'The shared operational backbone.',
    description:
      'Bring approved orders, stock movements, financial records and people workflows into a consistent operating picture.',
    flow: ['Shared records', 'Connected workflows', 'Clear decisions'],
  },
  {
    id: 'crm',
    name: 'CRM',
    icon: Users,
    x: 18,
    y: 18,
    title: 'From a conversation to a fulfilled order.',
    description:
      'Customer context and approved sales orders move into operations. Delivery and billing status return to the customer team.',
    flow: ['Customer enquiry', 'Sales order', 'ERP fulfilment'],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: Boxes,
    x: 82,
    y: 18,
    title: 'Stock and orders tell the same story.',
    description:
      'Purchases, goods received and dispatches update availability. Sales and operations can see what can actually be promised.',
    flow: ['Stock movement', 'Available quantity', 'ERP planning'],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: Landmark,
    x: 18,
    y: 70,
    title: 'The numbers follow the work.',
    description:
      'Approved transactions become billing and finance records. Payment and reconciliation status support the next operational decision.',
    flow: ['Approved transaction', 'Invoice / payment', 'ERP visibility'],
  },
  {
    id: 'hr',
    name: 'HR',
    icon: UserRound,
    x: 82,
    y: 70,
    title: 'People planning meets daily operations.',
    description:
      'Employee records, availability and approved people workflows help teams plan responsibilities and capacity.',
    flow: ['People records', 'Approved workflow', 'ERP capacity'],
  },
  {
    id: 'web',
    name: 'Website',
    icon: Globe2,
    x: 50,
    y: 89,
    title: 'Your digital front door opens into the business.',
    description:
      'Enquiries and orders enter the right workflow. Customers receive a clearer journey while your team avoids copying requests between tools.',
    flow: ['Website enquiry', 'CRM / order capture', 'ERP workflow'],
  },
]

export function ConnectedBusiness() {
  const [selected, setSelected] = useState('erp')
  const reduced = usePrefersReducedMotion()
  const active = nodes.find((node) => node.id === selected)
  return (
    <section className="connected-business" id="connections" aria-labelledby="connections-title">
      <div className="container">
        <Reveal>
          <SectionHead
            kicker="HOW EVERYTHING CONNECTS / ONE SHARED PICTURE"
            title={
              <span id="connections-title">
                Good systems work better
                <br />
                <em>together.</em>
              </span>
            }
          />
        </Reveal>
        <div className="connected-business-layout">
          <div
            className="connection-map"
            aria-label="ERP at the centre of five connected business systems"
          >
            <svg
              className="connection-lines"
              viewBox="0 0 800 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {nodes.slice(1).map((node) => (
                <motion.path
                  key={node.id}
                  className={
                    selected === node.id || selected === 'erp' ? 'connection-line-active' : ''
                  }
                  d={`M400 234 Q${node.x * 8} 234 ${node.x * 8} ${node.y * 5.2}`}
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={reduced ? { pathLength: 1 } : undefined}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: reduced ? 0 : 1.1 }}
                />
              ))}
            </svg>
            <div className="connection-core-ring" aria-hidden="true" />
            {nodes.map((node) => {
              const Icon = node.icon
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`connection-node connection-node-${node.id} ${selected === node.id ? 'is-selected' : ''}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  aria-pressed={selected === node.id}
                  aria-describedby="connection-detail"
                  onMouseEnter={() => setSelected(node.id)}
                  onFocus={() => setSelected(node.id)}
                  onClick={() => setSelected(node.id)}
                >
                  <Icon size={node.id === 'erp' ? 26 : 20} aria-hidden="true" />
                  <span>{node.name}</span>
                  <small>{node.id === 'erp' ? 'THE CENTRE' : 'CONNECTED'}</small>
                </button>
              )
            })}
            <p className="connection-hint">Hover, focus or tap a system to explore.</p>
          </div>
          <div
            className="connection-detail"
            id="connection-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="eyebrow">{active.name.toUpperCase()} / IN THE FLOW</span>
            <h3>{active.title}</h3>
            <p>{active.description}</p>
            <ol>
              {active.flow.map((step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  {step}
                  {index < 2 && <ArrowUpRight size={16} aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <p className="connection-scope">
              We plan the connections around your existing tools, processes and priorities.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

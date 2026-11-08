import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import GeneratorApp from './GeneratorApp.jsx'
import { linksExcept } from './generatorLinks.js'
import './index.css'

const config = {
  endpoint: '/api/resign',
  eyebrow: 'FOR WHEN IT IS TIME TO GO',
  h1: 'Resignation Letter Generator',
  subtitle: ['Get a resignation letter, Slack message or talking points in seconds.', 'Professional or absurd. Your call.'],
  groups: [
    {
      key: 'who', label: 'Who are you telling?', style: 'tiles', default: 'manager',
      options: [
        { id: 'boss', emoji: '💼', label: 'Boss' },
        { id: 'manager', emoji: '🧑‍💼', label: 'Manager' },
        { id: 'hr', emoji: '📋', label: 'HR' },
        { id: 'team', emoji: '👥', label: 'Team' },
        { id: 'client', emoji: '🤝', label: 'Client' },
      ],
    },
    {
      key: 'reason', label: 'Why are you leaving?', style: 'chips', default: 'newjob',
      options: [
        { id: 'newjob', label: 'New job' },
        { id: 'school', label: 'Back to school' },
        { id: 'moving', label: 'Moving' },
        { id: 'break', label: 'Taking a break' },
        { id: 'ownthing', label: 'Starting my own thing' },
        { id: 'none', label: 'Rather not say' },
      ],
    },
    {
      key: 'notice', label: 'Notice', style: 'chips', default: 'two',
      options: [
        { id: 'two', label: 'Two weeks' },
        { id: 'month', label: 'One month' },
        { id: 'today', label: 'Effective today' },
      ],
    },
    {
      key: 'tone', label: 'Tone', style: 'chips', default: 'professional',
      options: [
        { id: 'professional', emoji: '📄', label: 'Professional' },
        { id: 'grateful', emoji: '🙏', label: 'Grateful' },
        { id: 'brief', emoji: '✂️', label: 'Brief' },
        { id: 'dramatic', emoji: '🎭', label: 'Dramatic' },
        { id: 'absurd', emoji: '🤪', label: 'Absurd' },
      ],
    },
    {
      key: 'channel', label: 'Send it as', style: 'channel', default: 'letter',
      options: [
        { id: 'letter', label: '✉ Letter' },
        { id: 'slack', label: '# Slack' },
        { id: 'script', label: '🗣 Say it' },
      ],
    },
  ],
  hint: { label: 'Details to include', placeholder: 'e.g. 3 years on the design team, want to thank Priya' },
  button: 'Write My Resignation →',
  loading: ['Writing your resignation…', 'Keeping the bridge standing.'],
  scoreName: 'bridges intact',
  backupTag: 'IF THEY ASK WHY',
  copyLabel: 'letter',
  shareFilename: 'zodumb-resignation.png',
  shareText: 'My resignation, written by Zodumb 👋',
  links: linksExcept('/resign'),
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GeneratorApp config={config} />
    <Analytics />
  </React.StrictMode>,
)

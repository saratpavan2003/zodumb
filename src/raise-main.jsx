import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import GeneratorApp from './GeneratorApp.jsx'
import { linksExcept } from './generatorLinks.js'
import './index.css'

const config = {
  endpoint: '/api/raise',
  eyebrow: 'FOR WHEN YOU KNOW YOUR WORTH',
  h1: 'Ask for a Raise Generator',
  subtitle: ['Get the email, Slack message or talking points to ask for a raise.', 'Serious drafts or silly ones. Your call.'],
  groups: [
    {
      key: 'who', label: 'Who are you asking?', style: 'tiles', default: 'manager',
      options: [
        { id: 'boss', emoji: '💼', label: 'Boss' },
        { id: 'manager', emoji: '🧑‍💼', label: 'Manager' },
        { id: 'hr', emoji: '📋', label: 'HR' },
        { id: 'founder', emoji: '🚀', label: 'Founder / CEO' },
        { id: 'client', emoji: '🤝', label: 'Client (rate)' },
      ],
    },
    {
      key: 'reason', label: 'Main reason', style: 'chips', default: 'more',
      options: [
        { id: 'more', label: 'More responsibility' },
        { id: 'results', label: 'Strong results' },
        { id: 'market', label: 'Below market rate' },
        { id: 'tenure', label: 'No raise in a while' },
        { id: 'offer', label: 'Got another offer' },
        { id: 'cost', label: 'Cost of living' },
      ],
    },
    {
      key: 'tone', label: 'Tone', style: 'chips', default: 'confident',
      options: [
        { id: 'confident', emoji: '💪', label: 'Confident' },
        { id: 'polite', emoji: '🙂', label: 'Polite' },
        { id: 'data', emoji: '📊', label: 'Data-driven' },
        { id: 'dramatic', emoji: '🎭', label: 'Dramatic' },
        { id: 'absurd', emoji: '🤪', label: 'Absurd' },
      ],
    },
    {
      key: 'channel', label: 'Send it as', style: 'channel', default: 'email',
      options: [
        { id: 'email', label: '✉ Email' },
        { id: 'slack', label: '# Slack' },
        { id: 'script', label: '🗣 Say it' },
      ],
    },
  ],
  hint: { label: 'Details to include', placeholder: 'e.g. 2 years in role, led the website relaunch, asking for 10%' },
  button: 'Write My Raise Request →',
  loading: ['Writing your request…', 'Making the case for you.'],
  scoreName: 'odds of a yes',
  backupTag: "IF THEY SAY 'NOT NOW'",
  copyLabel: 'request',
  shareFilename: 'zodumb-raise-request.png',
  shareText: 'My raise request 📈',
  links: linksExcept('/raise'),
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GeneratorApp config={config} />
    <Analytics />
  </React.StrictMode>,
)

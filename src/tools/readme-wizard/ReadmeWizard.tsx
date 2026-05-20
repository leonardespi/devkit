import { useState, useMemo, useCallback } from 'react'
import { CircleUserRound, FolderGit2 } from 'lucide-react'
import { Button } from '../../components/Shared/Button'
import { SOCIALS, EMPTY_SOCIALS } from './socials'
import { generateUserReadme, generateProjectReadme } from './generators'
import type { WizardMode, UserState, ProjectState, TechItem, BadgeConfig } from './types'
import TECH_RAW from './techstack.json'
import styles from './ReadmeWizard.module.css'

// ---------- data ----------

const TECH_CATALOG: TechItem[] = Object.entries(TECH_RAW as Record<string, string>).map(([name, url]) => ({
  name,
  url,
}))

// ---------- initial state ----------

const initUser = (): UserState => ({
  bioText: '',
  jobTitle: '',
  workplace: '',
  currentlyLearning: '',
  socials: { ...EMPTY_SOCIALS },
  techStack: [],
})

const initProject = (): ProjectState => ({
  name: '',
  description: '',
  repoUrl: '',
  owner: '',
  repo: '',
  badges: {
    stars: true, forks: true, issues: true, prs: true,
    license: true, lastCommit: true, contributors: true,
    custom: [],
  },
  sections: { features: '', install: '', usage: '' },
  techStack: [],
  licenseText: 'MIT',
})

// ---------- small shared UI ----------

function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div className={styles.stepHeader}>
      <span className={styles.stepPill}>{step}/{total}</span>
      <span className={styles.stepTitle}>{title}</span>
    </div>
  )
}

function NavRow({
  onBack, onNext, nextLabel = 'Next →', backDisabled = false, nextDisabled = false,
}: {
  onBack?: () => void; onNext: () => void
  nextLabel?: string; backDisabled?: boolean; nextDisabled?: boolean
}) {
  return (
    <div className={styles.navRow}>
      {onBack
        ? <Button size="sm" variant="ghost" onClick={onBack} disabled={backDisabled}>← Back</Button>
        : <span />
      }
      <Button size="sm" variant="primary" onClick={onNext} disabled={nextDisabled}>{nextLabel}</Button>
    </div>
  )
}

// ---------- tech stack picker ----------

function TechPicker({ selected, onChange }: { selected: TechItem[]; onChange: (t: TechItem[]) => void }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return TECH_CATALOG.slice(0, 120)
    const q = search.toLowerCase()
    return TECH_CATALOG.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 120)
  }, [search])

  const isSelected = (name: string) => selected.some((t) => t.name === name)

  const toggle = useCallback((item: TechItem) => {
    if (isSelected(item.name)) {
      onChange(selected.filter((t) => t.name !== item.name))
    } else {
      onChange([...selected, item])
    }
  }, [selected, onChange])

  return (
    <div className={styles.techPicker}>
      <input
        className={styles.searchInput}
        placeholder="Search technologies…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {selected.length > 0 && (
        <div className={styles.selectedChips}>
          {selected.map((t) => (
            <span key={t.name} className={styles.chip} onClick={() => toggle(t)}>
              {t.name} ✕
            </span>
          ))}
        </div>
      )}
      <div className={styles.techGrid}>
        {filtered.map((t) => (
          <label key={t.name} className={`${styles.techItem} ${isSelected(t.name) ? styles.techSelected : ''}`}>
            <input
              type="checkbox"
              checked={isSelected(t.name)}
              onChange={() => toggle(t)}
              className={styles.techCheckbox}
            />
            <img src={t.url} alt={t.name} className={styles.techBadge} loading="lazy" />
          </label>
        ))}
      </div>
      {!search && <p className={styles.hint}>Showing first 120 entries — search to filter all {TECH_CATALOG.length}.</p>}
    </div>
  )
}

// ---------- preview / output ----------

function OutputPanel({ markdown, filename }: { markdown: string; filename: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className={styles.outputPanel}>
      <div className={styles.outputActions}>
        <Button size="sm" onClick={copy}>{copied ? '✓ Copied!' : 'Copy'}</Button>
        <Button size="sm" variant="primary" onClick={download}>↓ Download {filename}</Button>
      </div>
      <pre className={styles.outputPre}>{markdown}</pre>
    </div>
  )
}

// ---------- USER WIZARD ----------

type UserStep = 'bio' | 'socials' | 'tech' | 'preview'
const USER_STEPS: UserStep[] = ['bio', 'socials', 'tech', 'preview']

function UserWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<UserStep>('bio')
  const [state, setState] = useState<UserState>(initUser)

  const idx = USER_STEPS.indexOf(step)
  const go = (s: UserStep) => setStep(s)
  const next = () => go(USER_STEPS[idx + 1])
  const prev = () => (idx === 0 ? onBack() : go(USER_STEPS[idx - 1]))

  const upd = (key: keyof UserState, value: unknown) => setState((s) => ({ ...s, [key]: value }))

  const markdown = useMemo(() => generateUserReadme(state), [state])

  if (step === 'bio') return (
    <div className={styles.wizardPane}>
      <StepHeader step={1} total={4} title="User Bio" />
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Bio <span className={styles.req}>*</span></label>
          <textarea
            className={styles.fieldInput}
            rows={5}
            value={state.bioText}
            onChange={(e) => upd('bioText', e.target.value)}
            placeholder="I'm …, a … with focus on …"
          />
          {state.bioText.trim().length > 0 && state.bioText.trim().length < 10 && (
            <span className={styles.fieldError}>Min. 10 characters</span>
          )}
        </div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Job Title (optional)</label>
            <input className={styles.fieldInput} value={state.jobTitle} onChange={(e) => upd('jobTitle', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Workplace (optional)</label>
            <input className={styles.fieldInput} value={state.workplace} onChange={(e) => upd('workplace', e.target.value)} />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Currently Learning (optional)</label>
          <input className={styles.fieldInput} value={state.currentlyLearning} onChange={(e) => upd('currentlyLearning', e.target.value)} />
        </div>
      </div>
      <NavRow onBack={prev} onNext={next} nextDisabled={state.bioText.trim().length < 10} />
    </div>
  )

  if (step === 'socials') return (
    <div className={styles.wizardPane}>
      <StepHeader step={2} total={4} title="Socials" />
      <div className={styles.socialsGrid}>
        {SOCIALS.map((meta) => {
          const val = state.socials[meta.key] ?? ''
          return (
            <div key={meta.key} className={styles.socialRow}>
              <img src={meta.badge} alt={meta.label} className={styles.socialBadge} loading="lazy" />
              <input
                className={styles.fieldInput}
                placeholder={`${meta.label} handle`}
                value={val}
                onChange={(e) => upd('socials', { ...state.socials, [meta.key]: e.target.value })}
              />
            </div>
          )
        })}
      </div>
      <NavRow onBack={prev} onNext={next} />
    </div>
  )

  if (step === 'tech') return (
    <div className={styles.wizardPane}>
      <StepHeader step={3} total={4} title="Tech Stack" />
      <TechPicker selected={state.techStack} onChange={(t) => upd('techStack', t)} />
      <NavRow onBack={prev} onNext={next} nextLabel="Generate →" />
    </div>
  )

  return (
    <div className={styles.wizardPane}>
      <StepHeader step={4} total={4} title="Generated README" />
      <OutputPanel markdown={markdown} filename="README.md" />
      <NavRow onBack={prev} onNext={() => {}} nextLabel="Done" nextDisabled />
    </div>
  )
}

// ---------- PROJECT WIZARD ----------

type ProjectStep = 'basics' | 'badges' | 'tech' | 'sections' | 'preview'
const PROJECT_STEPS: ProjectStep[] = ['basics', 'badges', 'tech', 'sections', 'preview']

const GITHUB_RE = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/

function ProjectWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ProjectStep>('basics')
  const [state, setState] = useState<ProjectState>(initProject)
  const [repoErr, setRepoErr] = useState('')

  const idx = PROJECT_STEPS.indexOf(step)
  const go = (s: ProjectStep) => setStep(s)
  const prev = () => (idx === 0 ? onBack() : go(PROJECT_STEPS[idx - 1]))

  const upd = (key: keyof ProjectState, value: unknown) =>
    setState((s) => ({ ...s, [key]: value }))

  const markdown = useMemo(() => generateProjectReadme(state), [state])

  if (step === 'basics') {
    const nextBasics = () => {
      const m = state.repoUrl.match(GITHUB_RE)
      if (!m) { setRepoErr('Use https://github.com/owner/repo format'); return }
      setRepoErr('')
      setState((s) => ({ ...s, owner: m[1], repo: m[2] }))
      go('badges')
    }

    return (
      <div className={styles.wizardPane}>
        <StepHeader step={1} total={5} title="Project Basics" />
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Project Name</label>
            <input className={styles.fieldInput} value={state.name} onChange={(e) => upd('name', e.target.value)} placeholder="MyProject" />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Short Description</label>
            <textarea className={styles.fieldInput} rows={3} value={state.description} onChange={(e) => upd('description', e.target.value)} placeholder="One or two lines…" />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>GitHub Repo URL <span className={styles.req}>*</span></label>
            <input
              className={`${styles.fieldInput} ${repoErr ? styles.fieldInputError : ''}`}
              value={state.repoUrl}
              onChange={(e) => { upd('repoUrl', e.target.value); setRepoErr('') }}
              placeholder="https://github.com/owner/repo"
            />
            {repoErr && <span className={styles.fieldError}>{repoErr}</span>}
          </div>
        </div>
        <NavRow onBack={prev} onNext={nextBasics} nextDisabled={!state.repoUrl.trim()} />
      </div>
    )
  }

  if (step === 'badges') {
    const BADGE_KEYS: (keyof Omit<BadgeConfig, 'custom'>)[] = [
      'stars', 'forks', 'issues', 'prs', 'license', 'lastCommit', 'contributors',
    ]
    const BADGE_LABELS: Record<string, string> = {
      stars: 'Stars', forks: 'Forks', issues: 'Issues', prs: 'Pull Requests',
      license: 'License', lastCommit: 'Last Commit', contributors: 'Contributors',
    }
    return (
      <div className={styles.wizardPane}>
        <StepHeader step={2} total={5} title="Badges" />
        <div className={styles.badgeGrid}>
          {BADGE_KEYS.map((k) => (
            <label key={k} className={styles.badgeChip}>
              <input
                type="checkbox"
                checked={state.badges[k] as boolean}
                onChange={(e) => upd('badges', { ...state.badges, [k]: e.target.checked })}
              />
              {BADGE_LABELS[k]}
            </label>
          ))}
        </div>
        <NavRow onBack={prev} onNext={() => go('tech')} />
      </div>
    )
  }

  if (step === 'tech') return (
    <div className={styles.wizardPane}>
      <StepHeader step={3} total={5} title="Tech Stack (optional)" />
      <TechPicker selected={state.techStack} onChange={(t) => upd('techStack', t)} />
      <NavRow onBack={prev} onNext={() => go('sections')} />
    </div>
  )

  if (step === 'sections') return (
    <div className={styles.wizardPane}>
      <StepHeader step={4} total={5} title="Sections" />
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Features</label>
          <textarea className={styles.fieldInput} rows={4} value={state.sections.features} onChange={(e) => upd('sections', { ...state.sections, features: e.target.value })} placeholder="- Feature 1&#10;- Feature 2" />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Installation</label>
          <textarea className={styles.fieldInput} rows={3} value={state.sections.install} onChange={(e) => upd('sections', { ...state.sections, install: e.target.value })} placeholder="npm install" />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Usage</label>
          <textarea className={styles.fieldInput} rows={3} value={state.sections.usage} onChange={(e) => upd('sections', { ...state.sections, usage: e.target.value })} placeholder="npm run dev" />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>License</label>
          <input className={styles.fieldInput} value={state.licenseText} onChange={(e) => upd('licenseText', e.target.value)} placeholder="MIT — see LICENSE file" />
        </div>
      </div>
      <NavRow onBack={prev} onNext={() => go('preview')} nextLabel="Generate →" />
    </div>
  )

  return (
    <div className={styles.wizardPane}>
      <StepHeader step={5} total={5} title="Generated README" />
      <OutputPanel markdown={markdown} filename="README.md" />
      <NavRow onBack={prev} onNext={() => {}} nextLabel="Done" nextDisabled />
    </div>
  )
}

// ---------- Root ----------

export default function ReadmeWizard() {
  const [mode, setMode] = useState<WizardMode | null>(null)

  return (
    <div className="tool-root">
      <div className="tool-header">
        <span className="tool-title">README Wizard</span>
        <span className="tool-desc">Generate GitHub-ready READMEs step by step</span>
        {mode && (
          <Button size="sm" variant="ghost" onClick={() => setMode(null)} style={{ marginLeft: 'auto' }}>
            ↩ Change mode
          </Button>
        )}
      </div>

      {!mode && (
        <div className={styles.modePicker}>
          <p className={styles.modePrompt}>What kind of README?</p>
          <div className={styles.modeCards}>
            <button className={styles.modeCard} onClick={() => setMode('user')}>
              <span className={styles.modeIcon}><CircleUserRound size={32} strokeWidth={1.4} /></span>
              <span className={styles.modeLabel}>User / Profile</span>
              <span className={styles.modeDesc}>GitHub profile README with bio, socials & tech stack</span>
            </button>
            <button className={styles.modeCard} onClick={() => setMode('project')}>
              <span className={styles.modeIcon}><FolderGit2 size={32} strokeWidth={1.4} /></span>
              <span className={styles.modeLabel}>Project / Repo</span>
              <span className={styles.modeDesc}>Project README with badges, sections & tech stack</span>
            </button>
          </div>
        </div>
      )}

      {mode === 'user'    && <UserWizard    onBack={() => setMode(null)} />}
      {mode === 'project' && <ProjectWizard onBack={() => setMode(null)} />}
    </div>
  )
}

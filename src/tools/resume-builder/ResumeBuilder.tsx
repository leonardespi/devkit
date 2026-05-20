import { useState } from 'react'
import { useResumeBuilder } from './useResumeBuilder'
import { exportPdf } from './pdf'
import { Button } from '../../components/Shared/Button'
import type { ResumeData, PdfConfig, EducationItem, ExperienceItem, ProjectItem } from './types'
import styles from './ResumeBuilder.module.css'

// ---------- helpers ----------

type Section = 'education' | 'experience' | 'projects'

function deepSet(obj: ResumeData, path: string, value: unknown): ResumeData {
  const next: Record<string, unknown> = { ...obj }
  const parts = path.split('.')
  let cur: Record<string, unknown> = next
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    cur[k] = Array.isArray(cur[k]) ? [...(cur[k] as unknown[])] : { ...(cur[k] as object) }
    cur = cur[k] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
  return next as unknown as ResumeData
}

// ---------- sub-components ----------

function Field({
  label, value, onChange, multiline = false, placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; placeholder?: string
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {multiline
        ? <textarea
            className={styles.fieldInput}
            value={value}
            rows={4}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        : <input
            className={styles.fieldInput}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
      }
    </div>
  )
}

function SectionBlock({ title, onAdd, children }: {
  title: string; onAdd: () => void; children: React.ReactNode
}) {
  return (
    <div className={styles.block}>
      <div className={styles.blockHeader}>
        <span className={styles.blockTitle}>{title}</span>
        <Button size="sm" onClick={onAdd}>+ Add</Button>
      </div>
      {children}
    </div>
  )
}

function ItemCard({ label, onRemove, children }: {
  label: string; onRemove: () => void; children: React.ReactNode
}) {
  return (
    <div className={styles.itemCard}>
      <div className={styles.itemCardHeader}>
        <span className={styles.itemLabel}>{label}</span>
        <Button size="sm" variant="danger" onClick={onRemove}>✕</Button>
      </div>
      {children}
    </div>
  )
}

// ---------- FormPanel ----------

function FormPanel({ form, onChange }: { form: ResumeData; onChange: (d: ResumeData) => void }) {
  const upd = (path: string, value: string) => onChange(deepSet(form, path, value))

  const addItem = (key: Section) => {
    const blank =
      key === 'education' ? { school: '', degree: '', startDate: '', endDate: '', notes: '', location: '' } as EducationItem
      : key === 'experience' ? { company: '', title: '', startDate: '', endDate: '', location: '', bullets: '' } as ExperienceItem
      : { name: '', url: '', description: '' } as ProjectItem
    onChange({ ...form, [key]: [...form[key], blank] })
  }

  const removeItem = (key: Section, idx: number) => {
    const arr = [...form[key]]
    arr.splice(idx, 1)
    onChange({ ...form, [key]: arr })
  }

  return (
    <div className={styles.formScroll}>
      {/* Contact */}
      <div className={styles.block}>
        <span className={styles.blockTitle}>Contact</span>
        <div className={styles.grid2}>
          <Field label="Full Name" value={form.contact.fullName} onChange={(v) => upd('contact.fullName', v)} />
          <Field label="Headline" value={form.contact.headline ?? ''} onChange={(v) => upd('contact.headline', v)} />
          <Field label="Phone" value={form.contact.phone ?? ''} onChange={(v) => upd('contact.phone', v)} />
          <Field label="Email" value={form.contact.email ?? ''} onChange={(v) => upd('contact.email', v)} />
          <Field label="Location" value={form.contact.location ?? ''} onChange={(v) => upd('contact.location', v)} />
          <Field label="Website" value={form.contact.website ?? ''} onChange={(v) => upd('contact.website', v)} />
        </div>
        <Field label="LinkedIn" value={form.contact.linkedin ?? ''} onChange={(v) => upd('contact.linkedin', v)} />
      </div>

      {/* Education */}
      <SectionBlock title="Education" onAdd={() => addItem('education')}>
        {form.education.map((ed, i) => (
          <ItemCard key={i} label={ed.school || 'School'} onRemove={() => removeItem('education', i)}>
            <div className={styles.grid2}>
              <Field label="School" value={ed.school} onChange={(v) => upd(`education.${i}.school`, v)} />
              <Field label="Degree" value={ed.degree ?? ''} onChange={(v) => upd(`education.${i}.degree`, v)} />
              <Field label="Start" value={ed.startDate ?? ''} onChange={(v) => upd(`education.${i}.startDate`, v)} />
              <Field label="End" value={ed.endDate ?? ''} onChange={(v) => upd(`education.${i}.endDate`, v)} />
              <Field label="Location" value={ed.location ?? ''} onChange={(v) => upd(`education.${i}.location`, v)} />
              <Field label="Notes" value={ed.notes ?? ''} onChange={(v) => upd(`education.${i}.notes`, v)} />
            </div>
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Experience */}
      <SectionBlock title="Experience" onAdd={() => addItem('experience')}>
        {form.experience.map((ex, i) => (
          <ItemCard key={i} label={ex.company || 'Company'} onRemove={() => removeItem('experience', i)}>
            <div className={styles.grid2}>
              <Field label="Company" value={ex.company} onChange={(v) => upd(`experience.${i}.company`, v)} />
              <Field label="Title" value={ex.title ?? ''} onChange={(v) => upd(`experience.${i}.title`, v)} />
              <Field label="Start" value={ex.startDate ?? ''} onChange={(v) => upd(`experience.${i}.startDate`, v)} />
              <Field label="End" value={ex.endDate ?? ''} onChange={(v) => upd(`experience.${i}.endDate`, v)} />
              <Field label="Location" value={ex.location ?? ''} onChange={(v) => upd(`experience.${i}.location`, v)} />
            </div>
            <Field label="Bullets (one per line)" value={ex.bullets ?? ''} onChange={(v) => upd(`experience.${i}.bullets`, v)} multiline placeholder="Led team of 5 engineers…" />
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Projects */}
      <SectionBlock title="Projects" onAdd={() => addItem('projects')}>
        {form.projects.map((p, i) => (
          <ItemCard key={i} label={p.name || 'Project'} onRemove={() => removeItem('projects', i)}>
            <div className={styles.grid2}>
              <Field label="Name" value={p.name} onChange={(v) => upd(`projects.${i}.name`, v)} />
              <Field label="URL" value={p.url ?? ''} onChange={(v) => upd(`projects.${i}.url`, v)} />
            </div>
            <Field label="Description (one per line)" value={p.description ?? ''} onChange={(v) => upd(`projects.${i}.description`, v)} multiline />
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Skills */}
      <div className={styles.block}>
        <span className={styles.blockTitle}>Skills</span>
        <Field label="Skills (comma or newline separated)" value={form.skills} onChange={(v) => deepSet(form, 'skills', v) && onChange({ ...form, skills: v })} multiline placeholder="Python, TypeScript, Docker…" />
      </div>
    </div>
  )
}

// ---------- PreviewPanel ----------

function Sep({ items }: { items: (string | undefined)[] }) {
  return <>{items.filter(Boolean).join('  •  ')}</>
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className={styles.previewSection}>
      <span className={styles.previewSectionTitle}>{title.toUpperCase()}</span>
      <hr className={styles.previewHr} />
    </div>
  )
}

function PreviewPanel({ data }: { data: ResumeData | null }) {
  if (!data) return (
    <div className={styles.previewEmpty}>
      Fill in the form and click <strong>Compile Preview</strong> to see the document here.
    </div>
  )

  return (
    <div className={styles.previewDoc} id="resume-preview">
      <div className={styles.previewName}>{data.contact.fullName || '—'}</div>
      {data.contact.headline && <div className={styles.previewHeadline}>{data.contact.headline}</div>}
      <div className={styles.previewContact}>
        <Sep items={[data.contact.phone, data.contact.email, data.contact.website, data.contact.linkedin, data.contact.location]} />
      </div>

      {data.education?.length > 0 && (
        <>
          <SectionHead title="Education" />
          {data.education.filter(e => e.school).map((ed, i) => (
            <div key={i} className={styles.previewEntry}>
              <div className={styles.previewEntryRow}>
                <span className={styles.previewEntryLeft}>{[ed.school, ed.location].filter(Boolean).join(' — ')}</span>
                <span className={styles.previewEntryRight}>{[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}</span>
              </div>
              {ed.degree && <div>{ed.degree}{ed.notes ? ` — ${ed.notes}` : ''}</div>}
            </div>
          ))}
        </>
      )}

      {data.experience?.length > 0 && (
        <>
          <SectionHead title="Experience" />
          {data.experience.filter(e => e.company).map((ex, i) => (
            <div key={i} className={styles.previewEntry}>
              <div className={styles.previewEntryRow}>
                <span className={styles.previewEntryLeft}>{[ex.title, ex.company, ex.location].filter(Boolean).join(' — ')}</span>
                <span className={styles.previewEntryRight}>{[ex.startDate, ex.endDate].filter(Boolean).join(' – ')}</span>
              </div>
              {ex.bullets && (
                <ul className={styles.previewBullets}>
                  {ex.bullets.split(/\r?\n/).filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {data.projects?.length > 0 && (
        <>
          <SectionHead title="Projects" />
          {data.projects.filter(p => p.name).map((p, i) => (
            <div key={i} className={styles.previewEntry}>
              <div>
                <strong>{p.name}</strong>
                {p.url && <> — <a href={p.url}>{p.url}</a></>}
              </div>
              {p.description && (
                <ul className={styles.previewBullets}>
                  {p.description.split(/\r?\n/).filter(Boolean).map((d, j) => <li key={j}>{d}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {data.skills && (
        <>
          <SectionHead title="Skills" />
          <div className={styles.previewEntry}>
            <ul className={styles.previewBullets}>
              {data.skills.split(/\r?\n/).filter(Boolean).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

// ---------- Config panel ----------

function ConfigPanel({ config, onChange }: { config: PdfConfig; onChange: (c: PdfConfig) => void }) {
  return (
    <div className={styles.configPanel}>
      <div className={styles.configRow}>
        <label className={styles.fieldLabel}>Font size: {config.fontSize.toFixed(1)}pt</label>
        <input
          type="range" min={9} max={12} step={0.1}
          value={config.fontSize}
          onChange={(e) => onChange({ ...config, fontSize: parseFloat(e.target.value) })}
          className={styles.slider}
        />
      </div>
      <div className={styles.configRow}>
        <span className={styles.fieldLabel}>Hyperlinks:</span>
        {(['email', 'linkedin', 'website'] as const).map((k) => (
          <label key={k} className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={config.asLinks[k]}
              onChange={(e) => onChange({ ...config, asLinks: { ...config.asLinks, [k]: e.target.checked } })}
            />
            {k}
          </label>
        ))}
      </div>
    </div>
  )
}

// ---------- Root ----------

export default function ResumeBuilder() {
  const { form, setForm, compiled, compile, config, setConfig } = useResumeBuilder()
  const [exporting, setExporting] = useState(false)

  const download = async () => {
    setExporting(true)
    try {
      await exportPdf(compiled, config)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="tool-root">
      <div className={`tool-header ${styles.header}`}>
        <span className="tool-title">Resume Builder</span>
        <span className="tool-desc">ATS-friendly CV · PDF export via pdfmake</span>
        <div className={styles.headerActions}>
          <Button size="sm" variant="secondary" onClick={compile}>Compile Preview</Button>
          <Button size="sm" variant="primary" onClick={download} disabled={!compiled || exporting}>
            {exporting ? 'Exporting…' : '↓ Export PDF'}
          </Button>
        </div>
      </div>

      <ConfigPanel config={config} onChange={setConfig} />

      <div className={styles.workspace}>
        <div className={styles.formPane}>
          <FormPanel form={form} onChange={setForm} />
        </div>
        <div className={styles.previewPane}>
          <div className="panel-label">Document Preview</div>
          <div className={styles.previewScroll}>
            <PreviewPanel data={compiled} />
          </div>
        </div>
      </div>
    </div>
  )
}


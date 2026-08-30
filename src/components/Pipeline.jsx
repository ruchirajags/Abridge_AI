import { useState, useEffect } from 'react';

const STEP_LABELS = {
  github:       'Builder Signals',
  research:     'Research & Opportunities',
  feasibility:  'Feasibility Assessment',
  architecture: 'Architecture Direction',
  stack:        'Tech Stack',
  builder:      'Builder Plan & Scaffold',
  brief:        'Project Brief',
};

const NEXT_LABELS = {
  github:       'Research & opportunity scan — market signals, risks, and recommended direction.',
  research:     'Feasibility score — a /100 verdict with effort estimate and risk register.',
  feasibility:  'Architecture direction — module breakdown and data-flow blueprint.',
  architecture: 'Tech stack recommendation matched to your comfort level.',
  stack:        'Builder plan — starter scaffold with file tree and milestone checklist.',
  builder:      'Project brief — your complete implementation plan ready to follow.',
  brief:        'Planning complete — download the scaffold or export the project brief.',
};

export default function Pipeline({ statuses, feasibility, pipelineState }) {
  const steps = ['github', 'research', 'feasibility', 'architecture', 'stack', 'builder', 'brief'];
  const lastDone = [...steps].reverse().find(s => statuses[s] === 'done');
  const nextLabel = lastDone ? NEXT_LABELS[lastDone] : 'Add an idea and run the pipeline to get started.';

  return (
    <div className="pipeline-panel">
      <section className="ov-section ov-pipeline">
        <h2>
          Planning pipeline{' '}
          <span id="pipeline-state" style={{ fontWeight: 500, color: 'var(--ink-faint)', textTransform: 'none', letterSpacing: 0 }}>
            · {pipelineState}
          </span>
        </h2>
        <ol className="timeline" id="pipeline">
          {steps.map(step => {
            const state = statuses[step] || 'queued';
            return (
              <li key={step} className={`tl-row${state === 'running' ? ' is-running' : state === 'done' ? ' is-done' : ''}`} data-step={step}>
                <span className="tl-node">
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {state === 'running' && (
                    <svg className="tl-pulse-ring" viewBox="0 0 16 16" width="8" height="8" style={{ position: 'absolute' }} aria-hidden="true">
                      <circle cx="8" cy="8" r="4" fill="none" stroke="var(--lime)" strokeWidth="2" />
                    </svg>
                  )}
                </span>
                <span className="tl-name">{STEP_LABELS[step]}</span>
                <span className="tl-status">
                  {state === 'running' ? 'in progress' : state === 'done' ? 'completed' : 'pending'}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="ov-section ov-feasibility">
        <h2>Feasibility</h2>
        {!feasibility ? (
          <p className="feas-empty" id="feas-empty">Run the pipeline to see a feasibility read here.</p>
        ) : (
          <div id="feas-live">
            <FeasibilityArc feasibility={feasibility} />
            <div className="feas-axes" id="feas-axes">
              {(feasibility.axes || []).map(a => {
                const pct = Math.max(0, Math.min(100, (a.value / a.max) * 100));
                return (
                  <div key={a.label} className="feas-axis-row">
                    <span className="feas-axis-label">{a.label}</span>
                    <span className="feas-axis-track">
                      <span className="feas-axis-fill" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="feas-axis-val">{a.value}/{a.max}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="ov-section ov-next">
        <h2>Next output</h2>
        <p className="next-output-text" id="next-output-text">{nextLabel}</p>
      </section>
    </div>
  );
}

function FeasibilityArc({ feasibility }) {
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, feasibility.score)) / 100;
  const dashOffset = (circumference * (1 - pct)).toFixed(2);

  return (
    <div className="feas-arc-wrap">
      <svg className="feas-arc" width="76" height="76" viewBox="0 0 76 76">
        <circle className="feas-arc-track" cx="38" cy="38" r={r} />
        <circle
          className="feas-arc-fill"
          id="feas-arc-fill"
          cx="38" cy="38" r={r}
          transform="rotate(-90 38 38)"
          style={{
            strokeDasharray: circumference.toFixed(2),
            strokeDashoffset: dashOffset,
          }}
        />
        <text className="feas-arc-num" id="feas-arc-num" x="38" y="35">{feasibility.score}</text>
        <text className="feas-arc-max" x="38" y="50">/100</text>
      </svg>
      <div>
        <p
          className="feas-verdict-line"
          id="feas-verdict-line"
          data-verdict={feasibility.verdictClass || 'good'}
        >
          {feasibility.verdict}
        </p>
      </div>
    </div>
  );
}

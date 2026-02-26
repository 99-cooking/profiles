import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface ScaleScore {
  scaleId: string;
  scaleName: string;
  stenScore: number;
  percentile: number;
  scale?: { domain: string };
}

interface ModelScale {
  scaleId: string;
  scaleName: string;
  stenScore: number | null;
  modelLower: number;
  modelUpper: number;
  inBand: boolean;
}

interface SelectionReport {
  candidate: { firstName: string; lastName: string; email: string };
  assessmentId: string;
  model: { id: string; name: string };
  overallMatch: number;
  domainScores: Record<string, { fit: number }>;
  perScaleData: ModelScale[];
  strengths: { scaleId: string; scaleName: string }[];
  gaps: { scaleId: string; scaleName: string; stenScore: number; targetMin: number; targetMax: number }[];
}

interface PerformanceModel {
  id: string;
  name: string;
}

export default function Results() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [scores, setScores] = useState<ScaleScore[]>([]);
  const [models, setModels] = useState<PerformanceModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [report, setReport] = useState<SelectionReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [scoresRes, modelsRes] = await Promise.all([
          fetch(`/api/scores/${assessmentId}`).then(r => r.json()),
          fetch('/api/performance-models').then(r => r.json()),
        ]);
        setScores(Array.isArray(scoresRes) ? scoresRes : []);
        const m = Array.isArray(modelsRes) ? modelsRes : [];
        setModels(m);
        if (m.length > 0) setSelectedModel(m[0].id);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [assessmentId]);

  // Fetch selection report when model is chosen
  useEffect(() => {
    if (!selectedModel || scores.length === 0) return;
    // Need candidateId — get from assessment
    (async () => {
      try {
        const aRes = await fetch(`/api/assessments/${assessmentId}`);
        const assessment = await aRes.json();
        const rRes = await fetch(`/api/reports/selection?candidateId=${assessment.candidateId}&modelId=${selectedModel}`);
        if (rRes.ok) setReport(await rRes.json());
      } catch { /* ignore */ }
    })();
  }, [selectedModel, scores, assessmentId]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  // Group scores by domain
  const domains = ['cognitive', 'behavioral', 'interests'];
  const grouped: Record<string, ScaleScore[]> = {};
  for (const s of scores) {
    const domain = s.scale?.domain || 'other';
    (grouped[domain] ||= []).push(s);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">STEN Profile</h2>
          {report && <p className="text-gray-500">{report.candidate.firstName} {report.candidate.lastName}</p>}
        </div>
        <Link to="/" className="btn btn-secondary text-sm">← Dashboard</Link>
      </div>

      {/* Model selector & match % */}
      {models.length > 0 && (
        <div className="card flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium text-gray-600">Performance Model:</label>
          <select className="input w-auto" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {report && (
            <div className="ml-auto text-right">
              <div className="text-3xl font-bold text-primary-600">{report.overallMatch}%</div>
              <div className="text-xs text-gray-400">Overall Match</div>
            </div>
          )}
        </div>
      )}

      {/* Horizontal bar charts */}
      {domains.map(domain => {
        const domainScores = grouped[domain];
        if (!domainScores || domainScores.length === 0) return null;

        return (
          <section key={domain}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 capitalize">{domain}</h3>
            <div className="card space-y-4">
              {domainScores.map(s => {
                const modelScale = report?.perScaleData?.find(p => p.scaleId === s.scaleId);
                return (
                  <div key={s.scaleId} className="flex items-center gap-3">
                    <div className="w-36 text-sm text-right text-gray-600 truncate" title={s.scaleName || s.scaleId}>
                      {s.scaleName || s.scaleId}
                    </div>
                    <div className="flex-1">
                      <StenBar
                        score={s.stenScore}
                        modelLower={modelScale?.modelLower}
                        modelUpper={modelScale?.modelUpper}
                      />
                    </div>
                    <div className="w-8 text-sm font-mono text-gray-700 text-center">{s.stenScore}</div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Strengths & Gaps */}
      {report && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
            {report.strengths.length === 0 ? <p className="text-sm text-gray-400">None identified</p> : (
              <ul className="space-y-1">
                {report.strengths.map(s => <li key={s.scaleId} className="text-sm text-gray-700">✓ {s.scaleName}</li>)}
              </ul>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold text-red-700 mb-2">Gaps</h3>
            {report.gaps.length === 0 ? <p className="text-sm text-gray-400">None identified</p> : (
              <ul className="space-y-1">
                {report.gaps.map(g => (
                  <li key={g.scaleId} className="text-sm text-gray-700">
                    ✗ {g.scaleName} (STEN {g.stenScore}, target {g.targetMin}–{g.targetMax})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StenBar({ score, modelLower, modelUpper }: { score: number; modelLower?: number; modelUpper?: number }) {
  // 1-10 scale, each unit = 10%
  const pct = (v: number) => ((v - 0.5) / 10) * 100;

  return (
    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
      {/* Model band */}
      {modelLower != null && modelUpper != null && (
        <div
          className="absolute top-0 h-full bg-primary-100 border-l-2 border-r-2 border-primary-300"
          style={{ left: `${pct(modelLower)}%`, width: `${pct(modelUpper + 1) - pct(modelLower)}%` }}
        />
      )}
      {/* Score dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow"
        style={{ left: `calc(${pct(score)}% - 8px)` }}
      />
      {/* Scale ticks */}
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <div key={n} className="absolute top-0 h-full w-px bg-gray-200" style={{ left: `${pct(n)}%` }} />
      ))}
    </div>
  );
}

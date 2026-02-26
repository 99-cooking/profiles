import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Assessment {
  id: string;
  candidateId: string;
  type: string;
  status: string;
  completedAt: string | null;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [candidates, setCandidates] = useState<Map<string, Candidate>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [aRes, cRes] = await Promise.all([
        fetch('/api/assessments').then(r => r.ok ? r.json() : []),
        fetch('/api/candidates').then(r => r.ok ? r.json() : []),
      ]);
      setAssessments(Array.isArray(aRes) ? aRes : []);
      setCandidates(new Map((Array.isArray(cRes) ? cRes : []).map((c: Candidate) => [c.id, c])));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function startAssessment() {
    if (!form.firstName || !form.email) return;
    setCreating(true);
    try {
      // Create candidate
      const cRes = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const { id: candidateId } = await cRes.json();

      // Create assessment
      const aRes = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, type: 'full' }),
      });
      const { id: assessmentId } = await aRes.json();

      // Start it
      await fetch(`/api/assessments/${assessmentId}/start`, { method: 'POST' });

      navigate(`/assessment/${assessmentId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  const completed = assessments.filter(a => a.status === 'completed');
  const inProgress = assessments.filter(a => a.status === 'in_progress');

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-8">
      {/* Start Assessment */}
      <div className="card">
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn btn-primary w-full text-lg py-3">
            Start Assessment
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">New Assessment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button onClick={startAssessment} disabled={creating || !form.firstName || !form.email} className="btn btn-primary disabled:opacity-50">
                {creating ? 'Starting…' : 'Begin'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">In Progress</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map(a => {
              const c = candidates.get(a.candidateId);
              return (
                <Link key={a.id} to={`/assessment/${a.id}`} className="card hover:shadow-md transition-shadow border-yellow-200">
                  <p className="font-medium">{c ? `${c.firstName} ${c.lastName}` : a.candidateId}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">In Progress</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Completed */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Completed Assessments</h2>
        {completed.length === 0 ? (
          <p className="text-gray-400 text-sm">No completed assessments yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map(a => {
              const c = candidates.get(a.candidateId);
              return (
                <Link key={a.id} to={`/results/${a.id}`} className="card hover:shadow-md transition-shadow">
                  <p className="font-medium">{c ? `${c.firstName} ${c.lastName}` : a.candidateId}</p>
                  {c?.email && <p className="text-xs text-gray-400">{c.email}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Completed</span>
                    {a.completedAt && <span className="text-xs text-gray-400">{new Date(a.completedAt).toLocaleDateString()}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

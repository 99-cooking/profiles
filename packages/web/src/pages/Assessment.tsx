import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Item {
  id: string;
  content: string;
  format: string;
  options: string[];
  domain: string;
  category: string;
}

export default function Assessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [section, setSection] = useState('');
  const [itemIndex, setItemIndex] = useState(0);
  const [response, setResponse] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchNext = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/assessments/${id}/next`);
      const data = await res.json();
      if (data.sectionComplete && !data.nextSection) {
        // All done — finalize
        await fetch(`/api/assessments/${id}/complete`, { method: 'POST' });
        navigate(`/results/${id}`);
        return;
      }
      if (data.sectionComplete && data.nextSection) {
        // Section transition — fetch again
        return fetchNext();
      }
      if (data.item) {
        setItem(data.item);
        setSection(data.section);
        setItemIndex(data.itemIndex);
        setResponse(null);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchNext(); }, [fetchNext]);

  async function submit() {
    if (!id || !item || response === null) return;
    setSubmitting(true);
    try {
      await fetch(`/api/assessments/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, response }),
      });
      await fetchNext();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <div className="card text-red-600">{error}</div>;
  if (loading && !item) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (!item) return <div className="text-center py-20 text-gray-400">No items available.</div>;

  // Rough progress: cognitive ~20, behavioral ~182, interests ~30
  const sectionTotals: Record<string, number> = { cognitive: 20, behavioral: 60, interests: 30 };
  const sectionOffsets: Record<string, number> = { cognitive: 0, behavioral: 20, interests: 80 };
  const totalEst = 110;
  const progress = Math.min(100, Math.round(((sectionOffsets[section] || 0) + itemIndex) / totalEst * 100));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="capitalize">{section} section</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="card">
        <p className="text-lg font-medium mb-6 leading-relaxed">{item.content}</p>

        {/* Multiple Choice */}
        {item.format === 'multiple_choice' && (
          <div className="space-y-2">
            {(item.options || []).map((opt, i) => (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${response === opt ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="mc" className="accent-primary-600" checked={response === opt} onChange={() => setResponse(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* Likert */}
        {item.format === 'likert' && (
          <div className="space-y-3">
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setResponse(v)}
                  className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${response === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        )}

        {/* Forced Choice (A/B) */}
        {item.format === 'forced_choice' && (
          <div className="grid grid-cols-2 gap-4">
            {(item.options || []).map((opt, i) => (
              <button
                key={i}
                onClick={() => setResponse(opt)}
                className={`p-5 rounded-lg border-2 text-left transition-colors ${response === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Fallback text input */}
        {!['multiple_choice', 'likert', 'forced_choice'].includes(item.format) && (
          <input className="input" value={response as string || ''} onChange={e => setResponse(e.target.value)} placeholder="Your answer…" />
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={submit} disabled={response === null || submitting} className="btn btn-primary disabled:opacity-50">
            {submitting ? 'Saving…' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

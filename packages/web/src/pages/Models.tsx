import { useState, useEffect } from 'react';

interface ScaleRange {
  scaleId: string;
  targetStenMin: number;
  targetStenMax: number;
  weight: number;
}

interface Model {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  isTemplate: boolean | number;
  scaleRanges: ScaleRange[];
}

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [library, setLibrary] = useState<Model[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/performance-models').then(r => r.json()),
      fetch('/api/performance-models/library').then(r => r.json()),
    ]).then(([m, l]) => {
      setModels(Array.isArray(m) ? m : []);
      setLibrary(Array.isArray(l) ? l : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  const sections = [
    { title: 'Performance Models', items: models.filter(m => !m.isTemplate) },
    { title: 'Model Library (Templates)', items: library },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Performance Models</h2>

      {sections.map(({ title, items }) => (
        <section key={title}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{title}</h3>
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm">None available.</p>
          ) : (
            <div className="space-y-3">
              {items.map(m => (
                <div key={m.id} className="card">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                    <div>
                      <h4 className="font-semibold">{m.name}</h4>
                      {m.description && <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>}
                      <div className="flex gap-2 mt-2">
                        {m.category && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{m.category}</span>}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">{m.scaleRanges?.length || 0} scales</span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">{expanded === m.id ? '▲' : '▼'}</span>
                  </div>

                  {expanded === m.id && m.scaleRanges?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400 text-xs uppercase">
                            <th className="pb-2">Scale</th>
                            <th className="pb-2">STEN Range</th>
                            <th className="pb-2">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.scaleRanges.map(sr => (
                            <tr key={sr.scaleId} className="border-t border-gray-50">
                              <td className="py-1.5 text-gray-700">{sr.scaleId.replace(/_/g, ' ')}</td>
                              <td className="py-1.5">
                                <span className="font-mono text-primary-700">{sr.targetStenMin}–{sr.targetStenMax}</span>
                              </td>
                              <td className="py-1.5 text-gray-500">{sr.weight}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

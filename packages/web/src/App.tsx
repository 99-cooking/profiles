import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Models from './pages/Models';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm font-medium ${active ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Profiles
          </Link>
          <nav className="flex gap-6">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/models">Models</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route path="/results/:assessmentId" element={<Results />} />
          <Route path="/models" element={<Models />} />
        </Routes>
      </main>
    </div>
  );
}

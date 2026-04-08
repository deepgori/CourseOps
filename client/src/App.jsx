import { Routes, Route } from 'react-router-dom';
import { AssetLibrary } from './components/assets/AssetLibrary';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AppShell } from './components/layout/AppShell';
import { ReportsPage } from './components/reports/ReportsPage';
import { TeamPage } from './components/team/TeamPage';
import { KanbanBoard } from './components/courses/KanbanBoard';

const App = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/courses" element={<KanbanBoard />} />
      <Route path="/assets" element={<AssetLibrary />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/team" element={<TeamPage />} />
    </Route>
  </Routes>
);

export default App;


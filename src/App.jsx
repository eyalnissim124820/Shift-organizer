import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './hooks/useStore.js';
import { useToast } from './hooks/useToast.js';
import { Sidebar } from './components/Sidebar.jsx';
import { ToastContainer } from './components/Toast.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ExportsPage from './pages/ExportsPage.jsx';

export default function App() {
  const store = useStore();
  const { toasts, push: toast, dismiss } = useToast();

  const handleExport = () => {
    store.exportJSON(store.data);
    toast('Backup downloaded!');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await store.importJSON(file);
      toast('Data restored successfully!');
    } catch {
      toast('Invalid backup file. Please use a valid JSON backup.', 'error');
    }
  };

  const saveData = (d) => {
    try {
      localStorage.setItem('shift_organizer_v2', JSON.stringify(d));
    } catch {}
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar onExport={handleExport} onImport={handleImport} />

        <main style={{
          flex: 1,
          padding: '36px 44px',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: 'var(--bg)',
          minWidth: 0,
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/schedule" replace />} />
            <Route
              path="/schedule"
              element={
                <SchedulePage
                  data={store.data}
                  setSchedule={store.setSchedule}
                  assignCell={store.assignCell}
                  saveData={saveData}
                  toast={toast}
                />
              }
            />
            <Route
              path="/employees"
              element={
                <EmployeesPage
                  data={store.data}
                  addEmployee={store.addEmployee}
                  addEmployeesBatch={store.addEmployeesBatch}
                  updateEmployee={store.updateEmployee}
                  deleteEmployee={store.deleteEmployee}
                  toast={toast}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  data={store.data}
                  saveStaffing={store.saveStaffing}
                  toast={toast}
                />
              }
            />
            <Route
              path="/exports"
              element={
                <ExportsPage
                  data={store.data}
                  toast={toast}
                />
              }
            />
          </Routes>
        </main>

        <ToastContainer toasts={toasts} dismiss={dismiss} />
      </div>
    </BrowserRouter>
  );
}

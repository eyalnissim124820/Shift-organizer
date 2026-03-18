import { useState } from 'react';
import {
  Button, Input, Field, Badge, Card, PageHeader,
  EmptyState, Modal, Confirm, ModalFooter, Divider,
} from '../components/UI.jsx';

function AddModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!name.trim()) { setErr('Employee name is required.'); return; }
    onSave(name.trim());
    onClose();
  };

  return (
    <Modal title="Add Employee" onClose={onClose}>
      <Field label="Full Name" error={err}>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(''); }}
          placeholder="e.g. Sarah Cohen"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </Field>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={submit}>Add Employee</Button>
      </ModalFooter>
    </Modal>
  );
}

function EditModal({ employee, onSave, onClose }) {
  const [name, setName] = useState(employee.name);
  const [status, setStatus] = useState(employee.status);
  const [err, setErr] = useState('');

  const submit = () => {
    if (!name.trim()) { setErr('Employee name is required.'); return; }
    onSave(employee.id, { name: name.trim(), status });
    onClose();
  };

  return (
    <Modal title="Edit Employee" onClose={onClose}>
      <Field label="Full Name" error={err} style={{ marginBottom: 16 }}>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(''); }}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </Field>
      <Field label="Status">
        <div style={{ display: 'flex', gap: 8 }}>
          {['active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                flex: 1,
                padding: '8px',
                border: `1.5px solid ${status === s ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8,
                background: status === s ? 'var(--accent-bg)' : 'transparent',
                color: status === s ? 'var(--accent)' : 'var(--ink-3)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={submit}>Save Changes</Button>
      </ModalFooter>
    </Modal>
  );
}

export default function EmployeesPage({ data, addEmployee, updateEmployee, deleteEmployee, toast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [deleteEmp, setDeleteEmp] = useState(null);

  const activeCount = data.employees.filter((e) => e.status === 'active').length;

  return (
    <div className="fade-up">
      <PageHeader
        title="Employees"
        subtitle={`${activeCount} active · ${data.employees.length} total`}
        action={
          <Button variant="accent" onClick={() => setShowAdd(true)}>
            + Add Employee
          </Button>
        }
      />

      {data.employees.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No employees yet"
          message="Add your first team member to start building schedules."
          action={
            <Button variant="accent" onClick={() => setShowAdd(true)}>
              + Add Employee
            </Button>
          }
        />
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                {['Name', 'Status', 'Last Updated', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 20px',
                      textAlign: h === 'Actions' ? 'right' : 'left',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--ink-3)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--bg-2)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.employees.map((emp, i) => (
                <tr
                  key={emp.id}
                  style={{
                    borderBottom: i < data.employees.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 13, color: 'var(--ink-1)' }}>
                    {emp.name}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <Badge color={emp.status === 'active' ? 'green' : 'muted'}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--ink-3)', fontSize: 12 }}>
                    {new Date(emp.updatedAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="secondary" onClick={() => setEditEmp(emp)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateEmployee(emp.id, {
                          status: emp.status === 'active' ? 'inactive' : 'active',
                        })}
                      >
                        {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteEmp(emp)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showAdd && (
        <AddModal
          onSave={(name) => { addEmployee(name); toast('Employee added.'); }}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editEmp && (
        <EditModal
          employee={editEmp}
          onSave={(id, patch) => { updateEmployee(id, patch); toast('Employee updated.'); }}
          onClose={() => setEditEmp(null)}
        />
      )}
      {deleteEmp && (
        <Confirm
          danger
          message={`Delete "${deleteEmp.name}"? They will be removed from all current editable schedules and cannot be undone.`}
          onConfirm={() => {
            deleteEmployee(deleteEmp.id);
            toast('Employee deleted.');
            setDeleteEmp(null);
          }}
          onCancel={() => setDeleteEmp(null)}
        />
      )}
    </div>
  );
}

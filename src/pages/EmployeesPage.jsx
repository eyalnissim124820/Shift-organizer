import { useState, useRef } from 'react';
import { parseEmployeeCSV, employeeDisplayName } from '../utils/helpers.js';
import {
  Button, Input, Field, Badge, Card, PageHeader,
  EmptyState, Modal, Confirm, ModalFooter,
} from '../components/UI.jsx';

function AddModal({ onSave, onClose }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [shabbatKeeper, setShabbatKeeper] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    if (!employeeId.trim()) errs.employeeId = 'Employee ID is required.';
    if (employeeId.trim() && !/^\d+$/.test(employeeId.trim())) errs.employeeId = 'Employee ID must be numeric.';
    return errs;
  };

  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ firstName: firstName.trim(), lastName: lastName.trim(), employeeId: employeeId.trim(), phone: phone.trim(), shabbatKeeper });
    onClose();
  };

  return (
    <Modal title="Add Employee" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="First Name" error={errors.firstName}>
          <Input
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: '' })); }}
            placeholder="e.g. Sarah"
            autoFocus
          />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <Input
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: '' })); }}
            placeholder="e.g. Cohen"
          />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Employee ID (Numeric)" error={errors.employeeId}>
          <Input
            value={employeeId}
            onChange={(e) => { setEmployeeId(e.target.value); setErrors((p) => ({ ...p, employeeId: '' })); }}
            placeholder="e.g. 12345"
          />
        </Field>
        <Field label="Phone Number">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 050-1234567"
          />
        </Field>
      </div>
      <Field label="Shabbat Keeper">
        <button
          onClick={() => setShabbatKeeper(!shabbatKeeper)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: shabbatKeeper ? 'var(--accent-bg)' : 'transparent',
            border: `1.5px solid ${shabbatKeeper ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: shabbatKeeper ? 'var(--accent)' : 'var(--ink-3)',
            fontWeight: shabbatKeeper ? 700 : 400,
            transition: 'all 0.15s',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <span style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            border: `1.5px solid ${shabbatKeeper ? 'var(--accent)' : 'var(--border)'}`,
            background: shabbatKeeper ? 'var(--accent)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            flexShrink: 0,
          }}>
            {shabbatKeeper ? '\u2713' : ''}
          </span>
          Mark as Shabbat keeper (restricted from Friday/Saturday shifts)
        </button>
      </Field>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={submit}>Add Employee</Button>
      </ModalFooter>
    </Modal>
  );
}

function EditModal({ employee, onSave, onClose }) {
  const [firstName, setFirstName] = useState(employee.firstName || '');
  const [lastName, setLastName] = useState(employee.lastName || '');
  const [employeeId, setEmployeeId] = useState(employee.employeeId || '');
  const [phone, setPhone] = useState(employee.phone || '');
  const [shabbatKeeper, setShabbatKeeper] = useState(employee.shabbatKeeper || false);
  const [status, setStatus] = useState(employee.status);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    if (!employeeId.trim()) errs.employeeId = 'Employee ID is required.';
    if (employeeId.trim() && !/^\d+$/.test(employeeId.trim())) errs.employeeId = 'Employee ID must be numeric.';
    return errs;
  };

  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(employee.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      employeeId: employeeId.trim(),
      phone: phone.trim(),
      shabbatKeeper,
      status,
    });
    onClose();
  };

  return (
    <Modal title="Edit Employee" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="First Name" error={errors.firstName}>
          <Input
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: '' })); }}
            autoFocus
          />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <Input
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: '' })); }}
          />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Employee ID (Numeric)" error={errors.employeeId}>
          <Input
            value={employeeId}
            onChange={(e) => { setEmployeeId(e.target.value); setErrors((p) => ({ ...p, employeeId: '' })); }}
          />
        </Field>
        <Field label="Phone Number">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Shabbat Keeper" style={{ marginBottom: 16 }}>
        <button
          onClick={() => setShabbatKeeper(!shabbatKeeper)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: shabbatKeeper ? 'var(--accent-bg)' : 'transparent',
            border: `1.5px solid ${shabbatKeeper ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: shabbatKeeper ? 'var(--accent)' : 'var(--ink-3)',
            fontWeight: shabbatKeeper ? 700 : 400,
            transition: 'all 0.15s',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <span style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            border: `1.5px solid ${shabbatKeeper ? 'var(--accent)' : 'var(--border)'}`,
            background: shabbatKeeper ? 'var(--accent)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            flexShrink: 0,
          }}>
            {shabbatKeeper ? '\u2713' : ''}
          </span>
          Mark as Shabbat keeper
        </button>
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

function CSVUploadModal({ onUpload, onClose }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const employees = parseEmployeeCSV(ev.target.result);
        if (employees.length === 0) {
          setError('No valid employee rows found in CSV.');
          return;
        }
        setPreview(employees);
      } catch {
        setError('Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (preview && preview.length > 0) {
      onUpload(preview);
      onClose();
    }
  };

  return (
    <Modal title="Import Employees from CSV" onClose={onClose} width={560}>
      <p style={{
        fontSize: 12,
        color: 'var(--ink-3)',
        lineHeight: 1.6,
        marginBottom: 16,
      }}>
        Upload a CSV file with columns: <strong>First Name, Last Name, Employee ID, Phone, Shabbat Keeper</strong> (true/false).
        The first row can be a header (auto-detected).
      </p>

      <div style={{ marginBottom: 16 }}>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        <Button variant="secondary" onClick={() => fileRef.current.click()}>
          Choose CSV File
        </Button>
      </div>

      {error && (
        <div style={{
          background: 'var(--red-bg)',
          border: '1.5px solid #F5C6C6',
          borderRadius: 8,
          padding: '10px 14px',
          color: 'var(--red)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {preview && preview.length > 0 && (
        <>
          <p style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Preview ({preview.length} employees)
          </p>
          <div style={{
            maxHeight: 240,
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
                  {['First Name', 'Last Name', 'ID', 'Phone', 'Shabbat'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'var(--ink-3)',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((emp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>{emp.firstName}</td>
                    <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>{emp.lastName}</td>
                    <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>{emp.employeeId}</td>
                    <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>{emp.phone}</td>
                    <td style={{ padding: '6px 12px' }}>
                      {emp.shabbatKeeper ? <Badge color="accent">Yes</Badge> : <Badge color="muted">No</Badge>}
                    </td>
                  </tr>
                ))}
                {preview.length > 20 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                      ...and {preview.length - 20} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          variant="accent"
          onClick={handleConfirm}
          disabled={!preview || preview.length === 0}
        >
          Import {preview ? preview.length : 0} Employees
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default function EmployeesPage({ data, addEmployee, addEmployeesBatch, updateEmployee, deleteEmployee, toast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [deleteEmp, setDeleteEmp] = useState(null);

  const activeCount = data.employees.filter((e) => e.status === 'active').length;
  const shabbatCount = data.employees.filter((e) => e.shabbatKeeper).length;

  return (
    <div className="fade-up">
      <PageHeader
        title="Employees"
        subtitle={`${activeCount} active \u00b7 ${data.employees.length} total \u00b7 ${shabbatCount} Shabbat keepers`}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => setShowCSV(true)}>
              CSV Import
            </Button>
            <Button variant="accent" onClick={() => setShowAdd(true)}>
              + Add Employee
            </Button>
          </div>
        }
      />

      {data.employees.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No employees yet"
          message="Add your first team member to start building schedules."
          action={
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setShowCSV(true)}>
                CSV Import
              </Button>
              <Button variant="accent" onClick={() => setShowAdd(true)}>
                + Add Employee
              </Button>
            </div>
          }
        />
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                {['Name', 'Employee ID', 'Phone', 'Shabbat', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
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
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--ink-1)' }}>
                    {employeeDisplayName(emp)}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>
                    {emp.employeeId || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>
                    {emp.phone || '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {emp.shabbatKeeper
                      ? <Badge color="accent">Shabbat</Badge>
                      : <Badge color="muted">-</Badge>
                    }
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge color={emp.status === 'active' ? 'green' : 'muted'}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
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
          onSave={(empData) => { addEmployee(empData); toast('Employee added.'); }}
          onClose={() => setShowAdd(false)}
        />
      )}
      {showCSV && (
        <CSVUploadModal
          onUpload={(employees) => {
            addEmployeesBatch(employees);
            toast(`${employees.length} employees imported.`);
          }}
          onClose={() => setShowCSV(false)}
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
          message={`Delete "${employeeDisplayName(deleteEmp)}"? They will be removed from all schedules. This cannot be undone.`}
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

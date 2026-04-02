'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #120f14 0%, #1d0723 40%, #260b34 100%);
  color: var(--white);
  padding: 2rem 3rem 3rem;
  width: 100%;
  transition: background 0.4s ease;
`;

const AuthWrapper = styled.div`
  max-width: 420px;
  margin: 5rem auto;
  background: rgba(12, 12, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const AuthTitle = styled.h2`
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: var(--light-bordo);
`;

const ErrorText = styled.p`
  color: #f44336;
  margin: 0 0 1rem;
  font-size: 0.9rem;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;

  h1 {
    font-size: 2rem;
    color: var(--light-bordo);
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  border: 1px solid ${props => (props.active ? 'var(--light-bordo)' : '#555')};
  background: ${props => (props.active ? 'var(--light-bordo)' : 'transparent')};
  color: var(--white);
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
`;

const SectionCard = styled.div`
  background: rgba(24, 24, 32, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.2rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.4);
`;

const SmallButton = styled.button<{ danger?: boolean }>`
  background: ${props => (props.danger ? '#c0392b' : 'var(--bordo)')};
  color: white;
  border: none;
  border-radius: 0.4rem;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  font-size: 0.82rem;
  margin-right: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem;
  border-radius: 0.5rem;
  border: 1px solid #444;
  background: #121212;
  color: white;
  margin-bottom: 0.75rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.65rem;
  border-radius: 0.5rem;
  border: 1px solid #444;
  background: #121212;
  color: white;
  margin-bottom: 0.75rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  background: rgba(15, 15, 20, 0.45);
  border-radius: 0.75rem;
  overflow: hidden;

  th,
  td {
    border: 1px solid rgba(100, 100, 110, 0.45);
    padding: 0.75rem 0.9rem;
    text-align: left;
    color: #eee;
    font-size: 0.95rem;
  }

  th {
    background: rgba(255, 255, 255, 0.08);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-size: 0.8rem;
  }

  tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.03);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMessageList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileCandidateList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const CardListItem = styled(SectionCard)`
  border: 1px solid rgba(255,255,255,0.15);
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

const StatusBadge = styled.span<{ variant: 'inbox' | 'archived' | 'paid' | 'unpaid' | 'done' | 'todo' }>`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-left: 0.5rem;
  background: ${props =>
    props.variant === 'inbox' ? '#2c3e50' :
    props.variant === 'archived' ? '#34495e' :
    props.variant === 'paid' ? '#16a085' :
    props.variant === 'unpaid' ? '#c0392b' :
    props.variant === 'done' ? '#27ae60' : '#7f8c8d'};
  color: #fff;
`;

const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MobileTodoList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: string;
  read: boolean;
};

type Candidate = {
  id: number;
  name: string;
  email: string;
  phone: string;
  paid: boolean;
  notes: string;
  createdAt: string;
};

type TodoItem = {
  id: number;
  text: string;
  done: boolean;
};

const STORAGE_KEYS = {
  messages: 'dolet_contact_messages',
  candidates: 'dolet_candidates',
  todos: 'dolet_todos',
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'candidates' | 'todos'>('messages');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoText, setTodoText] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const auth = sessionStorage.getItem('dolet_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const storedMessages = localStorage.getItem(STORAGE_KEYS.messages);
    if (storedMessages) setMessages(JSON.parse(storedMessages));

    const storedCandidates = localStorage.getItem(STORAGE_KEYS.candidates);
    if (storedCandidates) setCandidates(JSON.parse(storedCandidates));

    const storedTodos = localStorage.getItem(STORAGE_KEYS.todos);
    if (storedTodos) setTodos(JSON.parse(storedTodos));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const username = loginForm.username.trim();
    const password = loginForm.password;

    if (username === 'mirzadolet' && password === 'doletmirza123') {
      setIsAuthenticated(true);
      setLoginForm({ username: '', password: '' });
      setLoginError('');
      if (typeof window !== 'undefined') sessionStorage.setItem('dolet_admin_auth', 'true');
    } else {
      setLoginError('Neispravan username ili lozinka.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') sessionStorage.removeItem('dolet_admin_auth');
  };

  const exportAsPDF = (filename: string, htmlContent: string) => {
    const newWindow = window.open('', '_blank', 'width=900,height=700');
    if (!newWindow) return;

    newWindow.document.write(`
      <html>
        <head><title>${filename}</title></head>
        <body style="font-family: Arial, sans-serif; color: #111; background-color: #fff; padding: 1rem;">
          <h1>${filename}</h1>
          ${htmlContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    setTimeout(() => {
      newWindow.print();
      // newWindow.close(); // Uncomment if auto-close is desired
    }, 500);
  };

  const exportMessagesToPDF = () => {
    const rows = messages.map(m => {
      return `<h3>${m.subject}</h3><p><strong>Ime:</strong> ${m.name} <strong>Email:</strong> ${m.email} <strong>Telefon:</strong> ${m.phone || '-'}<br><strong>Datum:</strong> ${new Date(m.date).toLocaleString()} <strong>Status:</strong> ${m.status}</p><p>${m.message}</p><hr/>`;
    }).join('');

    exportAsPDF('Poruke_DOLET', rows || '<p>Nema poruka.</p>');
  };

  const exportCandidatesToPDF = () => {
    const rows = candidates.map(c => {
      return `<h3>${c.name}</h3><p><strong>Email:</strong> ${c.email} <strong>Telefon:</strong> ${c.phone || '-'} <strong>Plaćeno:</strong> ${c.paid ? 'Da' : 'Ne'}<br><strong>Napomene:</strong> ${c.notes || '-'}<br><strong>Dodano:</strong> ${new Date(c.createdAt).toLocaleString()}</p><hr/>`;
    }).join('');

    exportAsPDF('Kandidati_DOLET', rows || '<p>Nema kandidata.</p>');
  };

  const saveMessages = (next: ContactMessage[]) => {
    setMessages(next as ContactMessage[]);
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(next));
  };

  const saveCandidates = (next: Candidate[]) => {
    setCandidates(next);
    localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(next));
  };

  const saveTodos = (next: TodoItem[]) => {
    setTodos(next);
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(next));
  };

  const selectedMessage = useMemo(
    () => messages.find(msg => msg.id === selectedMessageId) ?? null,
    [messages, selectedMessageId]
  );

  const addCandidate = () => {
    if (!candidateForm.name.trim() || !candidateForm.email.trim()) return;
    const newCandidate: Candidate = {
      id: Date.now(),
      name: candidateForm.name.trim(),
      email: candidateForm.email.trim(),
      phone: candidateForm.phone.trim(),
      paid: false,
      notes: candidateForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    saveCandidates([newCandidate, ...candidates]);
    setCandidateForm({ name: '', email: '', phone: '', notes: '' });
  };

  const addTodo = () => {
    if (!todoText.trim()) return;
    const newTodo: TodoItem = { id: Date.now(), text: todoText.trim(), done: false };
    saveTodos([newTodo, ...todos]);
    setTodoText('');
  };

  const unreadCount = messages.filter(m => !m.read && m.status === 'inbox').length;

  if (!isAuthenticated) {
    return (
      <AdminContainer>
        <AuthWrapper>
          <AuthTitle>Admin prijava</AuthTitle>
          <form onSubmit={handleLogin}>
            <Input
              placeholder="Korisničko ime"
              value={loginForm.username}
              onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Lozinka"
              value={loginForm.password}
              onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            {loginError && <ErrorText>{loginError}</ErrorText>}
            <SmallButton type="submit">Prijavi se</SmallButton>
          </form>
          
        </AuthWrapper>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <TitleRow>
        <h1>Mini Admin Panel (DOLET)</h1>
        <div>
          <SmallButton onClick={handleLogout} style={{ marginRight: '0.75rem' }}>
            Odjava
          </SmallButton>
          <Link href="/" style={{ color: '#fff', textDecoration: 'underline' }}>
            ← Povratak na početnu
          </Link>
        </div>
      </TitleRow>

      <TabRow>
        <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')}>
          Poruke ({unreadCount} nepotvrđeno)
        </TabButton>
        <TabButton active={activeTab === 'candidates'} onClick={() => setActiveTab('candidates')}>
          Lista kandidata
        </TabButton>
        <TabButton active={activeTab === 'todos'} onClick={() => setActiveTab('todos')}>
          To-do lista
        </TabButton>
      </TabRow>

      {activeTab === 'messages' && (
        <>
          <SectionCard>
            <h2>Poruke</h2>
            <SmallButton onClick={exportMessagesToPDF} style={{ marginBottom: '1rem' }}>
              Izvezi poruke (PDF)
            </SmallButton>
            {messages.length === 0 ? (
              <p>Nema poruka.</p>
            ) : (
              <>
                <Table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ime</th>
                    <th>Email</th>
                    <th>Predmet</th>
                    <th>Datum</th>
                    <th>Status</th>
                    <th>Radnje</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg, idx) => (
                    <tr key={msg.id} style={{ fontWeight: msg.read ? '400' : '700' }}>
                      <td>{idx + 1}</td>
                      <td>{msg.name}</td>
                      <td>{msg.email}</td>
                      <td>{msg.subject}</td>
                      <td>{new Date(msg.date).toLocaleString()}</td>
                      <td>{msg.status}</td>
                      <td>
                        <SmallButton onClick={() => {
                          const next = messages.map(m => m.id === msg.id ? { ...m, read: !m.read } : m);
                          saveMessages(next);
                        }}>
                          {msg.read ? 'Ozbilje' : 'Pročitaj'}
                        </SmallButton>
                        <SmallButton onClick={() => {
                          const next = messages.map(m => m.id === msg.id ? { ...m, status: m.status === 'inbox' ? 'archived' : 'inbox' } : m);
                          saveMessages(next);
                        }}>
                          {msg.status === 'inbox' ? 'Arhiva' : 'Vrati'}
                        </SmallButton>
                        <SmallButton danger onClick={() => {
                          const next = messages.filter(m => m.id !== msg.id);
                          saveMessages(next);
                          if (selectedMessageId === msg.id) setSelectedMessageId(null);
                        }}>
                          Izbriši
                        </SmallButton>
                        <SmallButton onClick={() => {
                          setSelectedMessageId(msg.id);
                          if (!msg.read) {
                            const next = messages.map(m => m.id === msg.id ? { ...m, read: true } : m);
                            saveMessages(next);
                          }
                        }}>
                          Otvori
                        </SmallButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <MobileMessageList>
                {messages.map((msg, idx) => (
                  <CardListItem key={msg.id} style={{ borderLeft: msg.read ? '4px solid #7f8c8d' : '4px solid #e74c3c' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{msg.subject}</h3>
                      <StatusBadge variant={msg.status === 'inbox' ? 'inbox' : 'archived'}>{msg.status}</StatusBadge>
                    </div>
                    <p style={{ margin: '0.2rem 0', color: '#bbbbbb' }}><strong>{msg.name}</strong> · {msg.email}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(msg.date).toLocaleString()}</p>
                    <p style={{ whiteSpace: 'pre-wrap', color: '#dcdde1' }}>{msg.message}</p>
                    <div style={{ marginTop: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <SmallButton onClick={() => {
                        const next = messages.map(m => m.id === msg.id ? { ...m, read: !m.read } : m);
                        saveMessages(next);
                      }}>
                        {msg.read ? 'Označi nepročitan' : 'Označi pročitano'}
                      </SmallButton>
                      <SmallButton onClick={() => {
                        const next = messages.map(m => m.id === msg.id ? { ...m, status: m.status === 'inbox' ? 'archived' : 'inbox' } : m);
                        saveMessages(next);
                      }}>
                        {msg.status === 'inbox' ? 'Arhiviraj' : 'Vrati'}
                      </SmallButton>
                      <SmallButton danger onClick={() => {
                        const next = messages.filter(m => m.id !== msg.id);
                        saveMessages(next);
                        if (selectedMessageId === msg.id) setSelectedMessageId(null);
                      }}>
                        Izbriši
                      </SmallButton>
                    </div>
                  </CardListItem>
                ))}
              </MobileMessageList>
            </>
          )}
          </SectionCard>

          {selectedMessage && (
            <SectionCard>
              <h2>Detalji poruke</h2>
              <p><strong>Ime:</strong> {selectedMessage.name}</p>
              <p><strong>Email:</strong> {selectedMessage.email}</p>
              <p><strong>Telefon:</strong> {selectedMessage.phone || '-'} </p>
              <p><strong>Predmet:</strong> {selectedMessage.subject}</p>
              <p><strong>Datum:</strong> {new Date(selectedMessage.date).toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedMessage.status}</p>
              <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
            </SectionCard>
          )}
        </>
      )}

      {activeTab === 'candidates' && (
        <>
          <SectionCard>
            <h2>Dodaj kandidata</h2>
            <Input
              placeholder="Ime i prezime"
              value={candidateForm.name}
              onChange={e => setCandidateForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Email"
              value={candidateForm.email}
              onChange={e => setCandidateForm(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              placeholder="Broj telefona"
              value={candidateForm.phone}
              onChange={e => setCandidateForm(prev => ({ ...prev, phone: e.target.value }))}
            />
            <TextArea
              placeholder="Napomene"
              value={candidateForm.notes}
              onChange={e => setCandidateForm(prev => ({ ...prev, notes: e.target.value }))}
            />
            <SmallButton onClick={addCandidate}>Dodaj kandidata</SmallButton>
          </SectionCard>

          <SectionCard>
            <h2>Lista kandidata</h2>
            <SmallButton onClick={exportCandidatesToPDF} style={{ marginBottom: '1rem' }}>
              Izvezi kandidate (PDF)
            </SmallButton>
            {candidates.length === 0 ? (
              <p>Nema kandidata.</p>
            ) : (
              <>
              <Table>
                <thead>
                  <tr>
                    <th>Ime</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Plaćeno</th>
                    <th>Napomene</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || '-'}</td>
                      <td>{c.paid ? 'Da' : 'Ne'}</td>
                      <td>{c.notes || '-'}</td>
                      <td>
                        <SmallButton onClick={() => {
                          const next = candidates.map(x => x.id === c.id ? { ...x, paid: !x.paid } : x);
                          saveCandidates(next);
                        }}>
                          {c.paid ? 'Označi neplaćeno' : 'Označi plaćeno'}
                        </SmallButton>
                        <SmallButton danger onClick={() => saveCandidates(candidates.filter(x => x.id !== c.id))}>
                          Izbriši
                        </SmallButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <MobileCandidateList>
                {candidates.map(c => (
                  <CardListItem key={c.id} style={{ borderLeft: c.paid ? '4px solid #27ae60' : '4px solid #c0392b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.6rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{c.name}</h3>
                      <StatusBadge variant={c.paid ? 'paid' : 'unpaid'}>
                        {c.paid ? 'Plaćeno' : 'Nije plaćeno'}
                      </StatusBadge>
                    </div>
                    <p style={{ margin: '0.2rem 0', color: '#bbbbbb' }}>{c.email} · {c.phone || '-'}</p>
                    <p style={{ color: '#ddd', margin: '0.2rem 0 0.6rem' }}>{c.notes || 'Bez dodatnih napomena'}</p>
                    <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <SmallButton onClick={() => {
                        const next = candidates.map(x => x.id === c.id ? { ...x, paid: !x.paid } : x);
                        saveCandidates(next);
                      }}>
                        {c.paid ? 'Označi neplaćeno' : 'Označi plaćeno'}
                      </SmallButton>
                      <SmallButton danger onClick={() => saveCandidates(candidates.filter(x => x.id !== c.id))}>
                        Izbriši
                      </SmallButton>
                    </div>
                  </CardListItem>
                ))}
              </MobileCandidateList>
              </>
            )}
          </SectionCard>
        </>
      )}

      {activeTab === 'todos' && (
        <SectionCard>
          <h2>To-do</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Input
              value={todoText}
              onChange={e => setTodoText(e.target.value)}
              placeholder="Nova stavka"
            />
            <SmallButton onClick={addTodo}>Dodaj</SmallButton>
          </div>

          {todos.length === 0 ? (
            <p>Nema zadataka.</p>
          ) : (
            <>
              <Table>
              <thead>
                <tr>
                  <th>Tekst</th>
                  <th>Stanje</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {todos.map(t => (
                  <tr key={t.id}>
                    <td style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</td>
                    <td>{t.done ? 'Završeno' : 'U toku'}</td>
                    <td>
                      <SmallButton onClick={() => saveTodos(todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}>
                        {t.done ? 'Označi nedovršeno' : 'Označi dovršeno'}
                      </SmallButton>
                      <SmallButton danger onClick={() => saveTodos(todos.filter(x => x.id !== t.id))}>
                        Izbriši
                      </SmallButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

              <MobileTodoList>
                {todos.map(t => (
                  <CardListItem key={t.id} style={{ borderLeft: t.done ? '4px solid #27ae60' : '4px solid #f39c12' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: t.done ? '#a0e7b2' : '#f5f6f9', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</p>
                      <StatusBadge variant={t.done ? 'done' : 'todo'}>{t.done ? 'Završeno' : 'U toku'}</StatusBadge>
                    </div>
                    <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <SmallButton onClick={() => saveTodos(todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}>
                        {t.done ? 'Označi nedovršeno' : 'Označi dovršeno'}
                      </SmallButton>
                      <SmallButton danger onClick={() => saveTodos(todos.filter(x => x.id !== t.id))}>
                        Izbriši
                      </SmallButton>
                    </div>
                  </CardListItem>
                ))}
              </MobileTodoList>
            </>
          )}
        </SectionCard>
      )}
    </AdminContainer>
  );
}

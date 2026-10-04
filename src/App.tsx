import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, Check, ChevronLeft, ChevronRight,
  CircleHelp, CreditCard, LayoutDashboard, Menu, MoreHorizontal, Plus, Search, ShieldCheck,
  SlidersHorizontal, Sparkles, Trash2, Wallet, X,
} from 'lucide-react';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoriesFor, categoryColor, categoryLabel,
  currentMonth, expenseBreakdown, formatDate, formatMoney, formatMonth,
  monthOf, monthlyTotals, moveMonth, spentFor, today, validateBudget,
  validateTransaction, type Budget, type Snapshot, type Transaction, type TransactionType,
} from './domain';
import { loadSnapshot, resetSnapshot, saveSnapshot } from './storage';

type View = 'overview' | 'transactions' | 'budgets';

function Logo({ light = false }: { light?: boolean }) {
  return <a className={`logo ${light ? 'logo-light' : ''}`} href="/" aria-label="Arus, kembali ke beranda"><span className="logo-mark"><span /></span>arus<span className="logo-dot">.</span></a>;
}

function Landing() {
  return (
    <div className="landing">
      <div className="announcement"><Sparkles size={14} /> Ruang kecil untuk keputusan finansial yang lebih tenang <ArrowRight size={14} /></div>
      <header className="site-header page-container">
        <Logo />
        <nav aria-label="Navigasi utama" className="site-nav"><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><a href="#tentang">Tentang Arus</a></nav>
        <a className="button button-dark header-cta" href="/app">Buka demo <ArrowUpRight size={17} /></a>
      </header>

      <main>
        <section className="hero page-container">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> KEUANGAN PRIBADI, DIBUAT SEDERHANA</span>
            <h1>Uangmu lebih jelas.<br /><em>Harimu lebih tenang.</em></h1>
            <p>Catat yang masuk, pahami yang keluar, dan buat ruang untuk hal yang paling berarti. Semua dalam satu tempat yang terasa ringan.</p>
            <div className="hero-actions"><a className="button button-primary" href="/app">Coba demo gratis <ArrowUpRight size={18} /></a><a className="text-link" href="#cara-kerja">Lihat cara kerjanya <ArrowRight size={17} /></a></div>
            <div className="hero-proof"><span className="proof-icon"><ShieldCheck size={19} /></span><span>Data demo tersimpan di browser perangkatmu.<br />Tanpa akun atau koneksi bank.</span></div>
          </div>
          <div className="hero-art" aria-label="Ilustrasi dashboard Arus menampilkan ringkasan keuangan">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="hero-dashboard">
              <div className="preview-top"><span className="mini-logo">arus<span>.</span></span><span className="preview-top-right">Ringkasan bulan ini <span className="preview-avatar">R</span></span></div>
              <div className="preview-greeting">Selamat pagi, kamu 👋<br /><strong>Semua terkendali.</strong></div>
              <div className="preview-grid">
                <div className="preview-balance"><span>Total saldo bulan ini</span><strong>Rp7.294.000</strong><small><span>↗ 12%</span> dari bulan lalu</small></div>
                <div className="preview-chart"><span>Pengeluaran</span><div className="preview-bars"><i /><i /><i /><i /><i /><i /><i /></div><small>Per minggu · Oktober</small></div>
              </div>
              <div className="preview-bottom"><span>Anggaran bulan ini</span><span>68% digunakan</span><div className="preview-progress"><i /></div></div>
            </div>
            <div className="floating-note floating-note-one"><span className="note-icon"><ArrowDownLeft size={18} /></span><span><small>Pemasukan bulan ini</small><strong>+ Rp10.250.000</strong></span></div>
            <div className="floating-note floating-note-two"><span className="tiny-sparkle">✦</span><span>Lebih sadar.<br /><strong>Lebih leluasa.</strong></span></div>
            <span className="hero-star star-one">✳</span><span className="hero-star star-two">✦</span>
          </div>
        </section>

        <section className="trust-strip"><div className="page-container trust-inner"><span>Mulai dari yang sederhana</span><span className="trust-separator" /><strong>CATAT</strong><strong>PAHAMI</strong><strong>RENCANAKAN</strong><span className="trust-separator" /><span>Ulangi sesuai ritmemu</span></div></section>

        <section id="fitur" className="features page-container section-space">
          <div className="section-heading"><span className="eyebrow">FITUR YANG TERASA BERGUNA</span><h2>Lebih dekat dengan<br /><em>gambaran besarnya.</em></h2><p>Angka seharusnya membantu kamu mengambil keputusan, bukan menambah beban pikiran.</p></div>
          <div className="feature-grid">
            <article className="feature-card feature-purple"><span className="feature-icon"><Wallet size={24} /></span><div className="feature-visual visual-transactions"><div><span>Hari ini</span><strong>Rp78.000</strong></div><div><span>☕</span><span>Kopi & sarapan<small>Makanan & minuman</small></span><b>−78.000</b></div><div><span>✦</span><span>Proyek desain<small>Freelance</small></span><b>+1.750.000</b></div></div><h3>Catat tanpa ribet</h3><p>Pemasukan dan pengeluaran, rapi dalam hitungan detik.</p></article>
            <article className="feature-card feature-peach"><span className="feature-icon"><BarChart3 size={24} /></span><div className="feature-visual visual-budget"><span>Anggaran makanan</span><strong>Rp877.000 <small>/ Rp1.600.000</small></strong><div><i /></div><small>Masih ada ruang untuk yang kamu suka.</small></div><h3>Anggaran yang masuk akal</h3><p>Lihat batas dan pemakaian per kategori setiap bulan.</p></article>
            <article className="feature-card feature-cream"><span className="feature-icon"><Sparkles size={24} /></span><div className="feature-visual visual-insight"><div className="insight-ring"><span>68%<small>terpakai</small></span></div><div className="insight-dots"><span>Makanan</span><span>Tagihan</span><span>Lainnya</span></div></div><h3>Pahami polanya</h3><p>Ringkasan yang jelas membantu kamu melihat kebiasaan belanja.</p></article>
          </div>
        </section>

        <section id="cara-kerja" className="how-section"><div className="page-container how-inner"><div><span className="eyebrow">CARA KERJA ARUS</span><h2>Mulai kecil.<br /><em>Terasa bedanya.</em></h2><p>Tidak perlu menunggu awal bulan atau punya sistem yang sempurna. Mulai dengan satu catatan hari ini.</p><a className="button button-dark" href="/app">Mulai dari demo <ArrowUpRight size={18} /></a></div><div className="steps"><div><span>01</span><div><h3>Catat aliran uang</h3><p>Tambahkan transaksi dengan kategori dan tanggal yang jelas.</p></div></div><div><span>02</span><div><h3>Tentukan ruang belanja</h3><p>Pasang anggaran untuk kategori yang ingin kamu jaga.</p></div></div><div><span>03</span><div><h3>Lihat gambaran bulan ini</h3><p>Pahami total, kategori, dan sisa anggaran dalam satu layar.</p></div></div></div></div></section>

        <section id="tentang" className="last-cta page-container"><div><span className="eyebrow">KEUANGAN YANG TERASA MANUSIAWI</span><h2>Ruang untuk<br /><em>melangkah lebih ringan.</em></h2><p>Coba semua fitur dengan data contoh. Tidak perlu daftar, dan tidak ada data yang dikirim ke server.</p><a className="button button-primary" href="/app">Jelajahi Arus <ArrowUpRight size={18} /></a></div><div className="last-cta-shape"><div className="shape-ring" /><span>✦</span></div></section>
      </main>
      <footer className="site-footer"><div className="page-container footer-inner"><Logo light /><p>Demo portofolio. Data hanya tersimpan di browser ini.</p><span>© {new Date().getFullYear()} Arus</span></div></footer>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>('input, select, textarea')?.focus();
    return () => {
      if (dialog?.open) dialog.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return <dialog
    ref={dialogRef}
    className="modal"
    aria-label={title}
    // Strict Mode reopens the dialog before its cleanup close event is delivered.
    onClose={(event) => { if (!event.currentTarget.open) onClose(); }}
    onCancel={onClose}
    onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}
    onKeyDown={(event) => {
      if (event.key !== 'Tab') return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea, a[href]')]
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
  ><div className="modal-content">{children}</div></dialog>;
}

function TransactionForm({ initial, month, onSave, onClose }: { initial?: Transaction; month: string; onSave: (item: Transaction) => string | null; onClose: () => void }) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category ?? EXPENSE_CATEGORIES[0].id);
  const [date, setDate] = useState(initial?.date ?? (month === currentMonth() ? today() : `${month}-01`));
  const [note, setNote] = useState(initial?.note ?? '');
  const [error, setError] = useState('');

  function switchType(next: TransactionType) { setType(next); setCategory(next === 'expense' ? EXPENSE_CATEGORIES[0].id : INCOME_CATEGORIES[0].id); setError(''); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item: Transaction = { id: initial?.id ?? crypto.randomUUID(), type, title: title.trim(), amount: Number(amount), category, date, note: note.trim() };
    const problem = validateTransaction(item);
    if (problem) { setError(problem); return; }
    const saveError = onSave(item);
    if (saveError) setError(saveError);
    else onClose();
  }

  return <Modal onClose={onClose} title={initial ? 'Edit transaksi' : 'Tambah transaksi'}><div className="modal-head"><div><span className="eyebrow">CATATAN KEUANGAN</span><h2>{initial ? 'Edit transaksi' : 'Transaksi baru'}</h2></div><button className="icon-button" type="button" aria-label="Tutup formulir" onClick={onClose}><X size={20} /></button></div><form noValidate onSubmit={submit} className="entry-form"><div className="segmented" role="group" aria-label="Jenis transaksi"><button type="button" aria-pressed={type === 'expense'} className={type === 'expense' ? 'active' : ''} onClick={() => switchType('expense')}>Pengeluaran</button><button type="button" aria-pressed={type === 'income'} className={type === 'income' ? 'active' : ''} onClick={() => switchType('income')}>Pemasukan</button></div><label>Judul transaksi<input autoFocus required maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Belanja mingguan" /></label><label>Nominal (Rp)<input required type="number" inputMode="numeric" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></label><div className="form-row"><label>Kategori<select value={category} onChange={(event) => setCategory(event.target.value)}>{categoriesFor(type).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Tanggal<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div><label>Catatan <span className="optional">(opsional)</span><textarea maxLength={240} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tambahkan detail jika perlu" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Batal</button><button type="submit" className="button button-primary">{initial ? 'Simpan perubahan' : 'Simpan transaksi'}</button></div></form></Modal>;
}

function BudgetForm({ initial, month, existing, onSave, onClose }: { initial?: Budget; month: string; existing: Budget[]; onSave: (item: Budget) => string | null; onClose: () => void }) {
  const [category, setCategory] = useState(initial?.category ?? EXPENSE_CATEGORIES.find((item) => !existing.some((budget) => budget.category === item.id))?.id ?? EXPENSE_CATEGORIES[0].id);
  const [limit, setLimit] = useState(initial ? String(initial.limit) : '');
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item: Budget = { id: initial?.id ?? crypto.randomUUID(), category, month, limit: Number(limit) };
    const problem = validateBudget(item);
    if (problem) { setError(problem); return; }
    if (existing.some((budget) => budget.category === category && budget.id !== item.id)) { setError('Kategori ini sudah memiliki anggaran bulan ini.'); return; }
    const saveError = onSave(item);
    if (saveError) setError(saveError);
    else onClose();
  }
  return <Modal onClose={onClose} title={initial ? 'Edit anggaran' : 'Tambah anggaran'}><div className="modal-head"><div><span className="eyebrow">RENCANA BULANAN</span><h2>{initial ? 'Edit anggaran' : 'Anggaran baru'}</h2><p>{formatMonth(month)}</p></div><button type="button" className="icon-button" aria-label="Tutup formulir" onClick={onClose}><X size={20} /></button></div><form noValidate className="entry-form" onSubmit={submit}><label>Kategori<select autoFocus value={category} onChange={(event) => setCategory(event.target.value)}>{EXPENSE_CATEGORIES.map((item) => <option key={item.id} value={item.id} disabled={!initial && existing.some((budget) => budget.category === item.id)}>{item.label}</option>)}</select></label><label>Batas pengeluaran (Rp)<input required type="number" min="1" step="1" inputMode="numeric" value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="Contoh: 1500000" /></label><p className="form-hint">Anggaran berlaku hanya untuk bulan yang dipilih. Transaksi tetap tersimpan jika anggaran dihapus.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Batal</button><button type="submit" className="button button-primary">{initial ? 'Simpan perubahan' : 'Buat anggaran'}</button></div></form></Modal>;
}

function TransactionRows({ items, onEdit, onDelete, compact = false }: { items: Transaction[]; onEdit: (item: Transaction) => void; onDelete: (item: Transaction) => void; compact?: boolean }) {
  if (items.length === 0) return <div className="empty-state"><span className="empty-icon"><CreditCard size={25} /></span><h3>Belum ada transaksi</h3><p>Catat transaksi pertama untuk melihat aliran uang di sini.</p></div>;
  return <div className={`transaction-list ${compact ? 'compact' : ''}`}>{items.map((item) => <div className="transaction-row" key={item.id}><span className={`transaction-icon ${item.type}`} style={{ '--icon-color': categoryColor(item.category) } as React.CSSProperties}>{item.type === 'income' ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}</span><div className="transaction-main"><strong>{item.title}</strong><span>{categoryLabel(item.category)} · {formatDate(item.date)}</span></div><span className={`transaction-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'} {formatMoney(item.amount)}</span><div className="row-actions"><button type="button" aria-label={`Edit ${item.title}`} title="Edit" onClick={() => onEdit(item)}><MoreHorizontal size={19} /></button><button type="button" aria-label={`Hapus ${item.title}`} title="Hapus" onClick={() => onDelete(item)}><Trash2 size={17} /></button></div></div>)}</div>;
}

function BudgetCards({ budgets, transactions, onEdit, onDelete }: { budgets: Budget[]; transactions: Transaction[]; onEdit: (item: Budget) => void; onDelete: (item: Budget) => void }) {
  if (budgets.length === 0) return <div className="empty-state"><span className="empty-icon"><SlidersHorizontal size={25} /></span><h3>Belum ada anggaran</h3><p>Buat batas bulanan untuk kategori yang ingin kamu pantau.</p></div>;
  return <div className="budget-grid">{budgets.map((budget) => { const used = spentFor(transactions, budget.category, budget.month); const percent = Math.round((used / budget.limit) * 100); const over = used > budget.limit; return <article className="budget-card" key={budget.id}><div className="budget-top"><span className="budget-icon" style={{ '--icon-color': categoryColor(budget.category) } as React.CSSProperties}><Wallet size={19} /></span><div className="row-actions"><button type="button" aria-label={`Edit anggaran ${categoryLabel(budget.category)}`} onClick={() => onEdit(budget)}><MoreHorizontal size={19} /></button><button type="button" aria-label={`Hapus anggaran ${categoryLabel(budget.category)}`} onClick={() => onDelete(budget)}><Trash2 size={17} /></button></div></div><h3>{categoryLabel(budget.category)}</h3><p><strong>{formatMoney(used)}</strong> <span>/ {formatMoney(budget.limit)}</span></p><div className="progress-track"><i className={over ? 'over' : ''} style={{ width: `${Math.min(percent, 100)}%`, background: over ? undefined : categoryColor(budget.category) }} /></div><small className={over ? 'over-text' : ''}>{over ? `Melebihi ${formatMoney(used - budget.limit)}` : `${formatMoney(budget.limit - used)} tersisa`} · {percent}% terpakai</small></article>; })}</div>;
}

function FinanceApp() {
  const [initial] = useState(() => { try { return { snapshot: loadSnapshot(), error: '' }; } catch (error) { return { snapshot: null, error: error instanceof Error ? error.message : 'Data tidak dapat dibuka.' }; } });
  const [snapshot, setSnapshot] = useState<Snapshot | null>(initial.snapshot);
  const [fatalError, setFatalError] = useState(initial.error);
  const [notice, setNotice] = useState('');
  const [noticeError, setNoticeError] = useState(false);
  const [view, setView] = useState<View>('overview');
  const [month, setMonth] = useState(currentMonth());
  const [transactionModal, setTransactionModal] = useState<Transaction | 'new' | null>(null);
  const [budgetModal, setBudgetModal] = useState<Budget | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 650px)').matches);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 650px)');
    const update = () => { setIsMobile(media.matches); setMobileMenu(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileMenu) return;
    const sidebar = sidebarRef.current;
    const trigger = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMobileMenu(false); }
      if (event.key !== 'Tab' || !sidebar) return;
      const controls = [...sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [isMobile, mobileMenu]);

  const monthTransactions = useMemo(() => (snapshot?.transactions ?? []).filter((item) => monthOf(item.date) === month).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [snapshot, month]);
  const monthBudgets = useMemo(() => (snapshot?.budgets ?? []).filter((item) => item.month === month).sort((a, b) => a.category.localeCompare(b.category)), [snapshot, month]);
  const totals = useMemo(() => monthlyTotals(snapshot?.transactions ?? [], month), [snapshot, month]);
  const breakdown = useMemo(() => expenseBreakdown(snapshot?.transactions ?? [], month), [snapshot, month]);
  const filteredTransactions = useMemo(() => monthTransactions.filter((item) => (filter === 'all' || item.type === filter) && (categoryFilter === 'all' || item.category === categoryFilter) && `${item.title} ${item.note} ${categoryLabel(item.category)}`.toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))), [monthTransactions, filter, categoryFilter, search]);

  function commit(next: Snapshot, success: string, reportFailure = true): string | null {
    try { saveSnapshot(next); setSnapshot(next); setNotice(success); setNoticeError(false); return null; }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan perubahan.';
      if (reportFailure) { setNotice(message); setNoticeError(true); }
      return message;
    }
  }
  function saveTransaction(item: Transaction): string | null {
    if (!snapshot) return 'Data belum bisa dibuka.';
    const exists = snapshot.transactions.some((entry) => entry.id === item.id);
    return commit({ ...snapshot, transactions: exists ? snapshot.transactions.map((entry) => entry.id === item.id ? item : entry) : [item, ...snapshot.transactions] }, exists ? 'Transaksi diperbarui.' : 'Transaksi tersimpan.', false);
  }
  function deleteTransaction(item: Transaction) {
    if (!snapshot || !window.confirm(`Hapus transaksi “${item.title}”?`)) return;
    commit({ ...snapshot, transactions: snapshot.transactions.filter((entry) => entry.id !== item.id) }, 'Transaksi dihapus.');
  }
  function saveBudget(item: Budget): string | null {
    if (!snapshot) return 'Data belum bisa dibuka.';
    const exists = snapshot.budgets.some((entry) => entry.id === item.id);
    return commit({ ...snapshot, budgets: exists ? snapshot.budgets.map((entry) => entry.id === item.id ? item : entry) : [...snapshot.budgets, item] }, exists ? 'Anggaran diperbarui.' : 'Anggaran dibuat.', false);
  }
  function deleteBudget(item: Budget) {
    if (!snapshot || !window.confirm(`Hapus anggaran ${categoryLabel(item.category)}? Transaksi tidak akan dihapus.`)) return;
    commit({ ...snapshot, budgets: snapshot.budgets.filter((entry) => entry.id !== item.id) }, 'Anggaran dihapus.');
  }
  function resetData() {
    if (!window.confirm('Atur ulang data contoh? Semua perubahan di browser ini akan dihapus.')) return;
    try { setSnapshot(resetSnapshot()); setFatalError(''); setMonth(currentMonth()); setView('overview'); setNotice('Data contoh berhasil dipulihkan.'); setNoticeError(false); setSearch(''); setFilter('all'); setCategoryFilter('all'); setMobileMenu(false); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Gagal memulihkan data contoh.'); setNoticeError(true); }
  }

  function retryLoad() {
    try { setSnapshot(loadSnapshot()); setFatalError(''); setNotice(''); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Data belum bisa dibuka.'); setNoticeError(true); }
  }

  if (fatalError || !snapshot) return <div className="recovery-screen"><Logo /><div className="recovery-card"><CircleHelp size={30} /><h1>Data belum bisa dibuka</h1><p>{fatalError}</p>{notice && <p className="form-error" role="alert">{notice}</p>}<button className="button button-outline" onClick={retryLoad}>Coba buka lagi</button><p>Pengaturan ulang akan mengganti data tersimpan di browser ini dengan data contoh.</p><button className="button button-primary" onClick={resetData}>Atur ulang data contoh</button><a href="/">Kembali ke beranda</a></div></div>;

  const navItems: { id: View; icon: ReactNode; label: string }[] = [
    { id: 'overview', icon: <LayoutDashboard size={19} />, label: 'Ringkasan' },
    { id: 'transactions', icon: <CreditCard size={19} />, label: 'Transaksi' },
    { id: 'budgets', icon: <BarChart3 size={19} />, label: 'Anggaran' },
  ];
  const chooseView = (next: View) => { setView(next); setMobileMenu(false); setNotice(''); };

  return <div className="app-layout"><aside ref={sidebarRef} id="app-navigation" inert={isMobile && !mobileMenu} role={isMobile && mobileMenu ? 'dialog' : undefined} aria-modal={isMobile && mobileMenu ? true : undefined} aria-label={isMobile && mobileMenu ? 'Menu aplikasi' : undefined} className={`app-sidebar ${mobileMenu ? 'open' : ''}`}><div className="sidebar-head"><Logo /><button className="icon-button mobile-close" aria-label="Tutup menu" onClick={() => setMobileMenu(false)}><X size={20} /></button></div><p className="sidebar-label">MENU UTAMA</p><nav className="sidebar-nav" aria-label="Navigasi aplikasi">{navItems.map((item) => <button type="button" key={item.id} aria-current={view === item.id ? 'page' : undefined} className={view === item.id ? 'active' : ''} onClick={() => chooseView(item.id)}>{item.icon}{item.label}{view === item.id && <span className="active-dot" />}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-tip"><span><Sparkles size={18} /></span><strong>Satu langkah kecil, setiap hari.</strong><p>Catat pengeluaran hari ini dan lihat ceritanya di akhir bulan.</p></div><div className="sidebar-foot"><span className="avatar">A</span><span><strong>Akun demo</strong><small>Data di browser ini</small></span><button aria-label="Atur ulang data contoh" title="Atur ulang data contoh" onClick={resetData}><MoreHorizontal size={19} /></button></div></div></aside>{mobileMenu && <button tabIndex={-1} className="menu-backdrop" aria-label="Tutup menu" onClick={() => setMobileMenu(false)} />}
    <main className="app-main" inert={isMobile && mobileMenu}><div className="app-topbar"><div className="topbar-left"><button ref={menuButtonRef} className="icon-button mobile-menu-button" aria-expanded={mobileMenu} aria-controls="app-navigation" aria-label="Buka menu" onClick={() => setMobileMenu(true)}><Menu size={23} /></button><span>Keuangan pribadi / <strong>{navItems.find((item) => item.id === view)?.label}</strong></span></div><div className="topbar-right"><span className="demo-pill"><span /> Mode demo</span><span className="top-avatar">A</span></div></div>
      <div className="app-content"><div className="content-header"><div><p className="eyebrow">{view === 'overview' ? 'SELAMAT DATANG DI ARUS' : view === 'transactions' ? 'CATATAN KEUANGANMU' : 'RENCANA PENGELUARAN'}</p><h1>{view === 'overview' ? 'Ringkasan keuangan' : view === 'transactions' ? 'Semua transaksi' : 'Anggaran bulanan'}</h1><p>{view === 'overview' ? 'Lihat aliran uangmu, satu bulan pada satu waktu.' : view === 'transactions' ? 'Setiap catatan membantu kamu memahami gambaran besarnya.' : 'Beri ruang untuk kebutuhan dan hal yang kamu sukai.'}</p></div><div className="header-controls"><div className="month-picker"><button aria-label="Bulan sebelumnya" onClick={() => setMonth((value) => moveMonth(value, -1))}><ChevronLeft size={18} /></button><span>{formatMonth(month)}</span><button aria-label="Bulan berikutnya" onClick={() => setMonth((value) => moveMonth(value, 1))}><ChevronRight size={18} /></button></div><button className="button button-primary add-button" onClick={() => view === 'budgets' ? setBudgetModal('new') : setTransactionModal('new')}><Plus size={18} /> {view === 'budgets' ? 'Buat anggaran' : 'Catat transaksi'}</button></div></div>
        {notice && <div className={`notice ${noticeError ? 'notice-error' : ''}`} role={noticeError ? 'alert' : 'status'}>{noticeError ? <CircleHelp size={17} /> : <Check size={17} />}<span>{notice}</span><button aria-label="Tutup pemberitahuan" onClick={() => setNotice('')}><X size={16} /></button></div>}
        {view === 'overview' && <><div className="summary-grid"><article className="summary-card summary-primary"><div className="summary-card-top"><span>Arus uang bulan terpilih</span><span className="summary-icon"><Wallet size={19} /></span></div><strong>{formatMoney(totals.net)}</strong><p>{totals.net >= 0 ? 'Saldo positif untuk bulan terpilih' : 'Pengeluaran melebihi pemasukan'}</p><span className="card-decoration">✳</span></article><article className="summary-card"><div className="summary-card-top"><span>Total pemasukan</span><span className="summary-icon income"><ArrowDownLeft size={19} /></span></div><strong>{formatMoney(totals.income)}</strong><p><span className="dot income" /> Dari {monthTransactions.filter((item) => item.type === 'income').length} transaksi</p></article><article className="summary-card"><div className="summary-card-top"><span>Total pengeluaran</span><span className="summary-icon expense"><ArrowUpRight size={19} /></span></div><strong>{formatMoney(totals.expense)}</strong><p><span className="dot expense" /> Dari {monthTransactions.filter((item) => item.type === 'expense').length} transaksi</p></article></div>
          <div className="overview-grid"><section className="panel spending-panel"><div className="panel-heading"><div><span className="eyebrow">LIHAT POLANYA</span><h2>Pengeluaran per kategori</h2></div><span className="subtle-label">{formatMonth(month)}</span></div>{breakdown.length ? <div className="spending-content"><div className="donut" style={{ background: `conic-gradient(${breakdown.reduce<{ parts: string[]; at: number }>((acc, item) => { const next = acc.at + item.amount / totals.expense * 100; acc.parts.push(`${item.color} ${acc.at}% ${next}%`); acc.at = next; return acc; }, { parts: [], at: 0 }).parts.join(', ')})` }}><span><small>Total keluar</small><strong>{formatMoney(totals.expense)}</strong></span></div><div className="legend">{breakdown.map((item) => <div key={item.id}><span className="legend-dot" style={{ background: item.color }} /><span>{item.short}</span><strong>{Math.round(item.amount / totals.expense * 100)}%</strong></div>)}</div></div> : <div className="empty-state"><p>Belum ada pengeluaran pada bulan ini.</p></div>}</section><section className="panel budget-overview"><div className="panel-heading"><div><span className="eyebrow">TETAP DI JALUR</span><h2>Anggaranmu</h2></div><button className="panel-link" onClick={() => chooseView('budgets')}>Lihat semua <ArrowRight size={16} /></button></div>{monthBudgets.length ? <div className="budget-mini-list">{monthBudgets.slice(0, 4).map((budget) => { const used = spentFor(snapshot.transactions, budget.category, month); const percent = Math.round(used / budget.limit * 100); return <div className="budget-mini" key={budget.id}><div><span>{categoryLabel(budget.category)}</span><strong>{percent}%</strong></div><div className="progress-track"><i style={{ width: `${Math.min(percent, 100)}%`, background: percent > 100 ? '#d77474' : categoryColor(budget.category) }} /></div><small>{formatMoney(used)} dari {formatMoney(budget.limit)}</small></div>; })}</div> : <div className="empty-state"><p>Belum ada anggaran untuk bulan ini.</p><button className="button button-outline" onClick={() => setBudgetModal('new')}>Buat anggaran</button></div>}</section></div>
          <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">AKTIVITAS TERBARU</span><h2>Transaksi terakhir</h2></div><button className="panel-link" onClick={() => chooseView('transactions')}>Lihat semua <ArrowRight size={16} /></button></div><TransactionRows items={monthTransactions.slice(0, 5)} compact onEdit={setTransactionModal} onDelete={deleteTransaction} /></section></>}
        {view === 'transactions' && <section className="panel full-panel"><div className="list-toolbar"><div className="search-box"><Search size={18} /><input aria-label="Cari transaksi" placeholder="Cari transaksi atau kategori..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><label className="category-filter">Filter kategori<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">Semua kategori</option>{(filter === 'all' ? [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] : categoriesFor(filter)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div className="filter-tabs" role="group" aria-label="Filter transaksi"><button aria-pressed={filter === 'all'} className={filter === 'all' ? 'active' : ''} onClick={() => { setFilter('all'); setCategoryFilter('all'); }}>Semua</button><button aria-pressed={filter === 'expense'} className={filter === 'expense' ? 'active' : ''} onClick={() => { setFilter('expense'); setCategoryFilter('all'); }}>Pengeluaran</button><button aria-pressed={filter === 'income'} className={filter === 'income' ? 'active' : ''} onClick={() => { setFilter('income'); setCategoryFilter('all'); }}>Pemasukan</button></div></div><div className="list-count">{filteredTransactions.length} transaksi · {formatMonth(month)}</div>{filteredTransactions.length === 0 && (search.trim() || filter !== 'all' || categoryFilter !== 'all') ? <div className="empty-state"><h3>Tidak ada transaksi yang cocok</h3><p>Coba kata kunci atau kategori lain untuk bulan ini.</p><button className="button button-outline" onClick={() => { setSearch(''); setFilter('all'); setCategoryFilter('all'); }}>Hapus filter</button></div> : <TransactionRows items={filteredTransactions} onEdit={setTransactionModal} onDelete={deleteTransaction} />}</section>}
        {view === 'budgets' && <><div className="budget-banner"><div><span className="eyebrow">ANGGARAN {formatMonth(month).toLocaleUpperCase('id-ID')}</span><h2>Rencanakan dengan ruang untuk hidup.</h2><p>Anggaran membantu kamu memilih dengan sadar, bukan membatasi setiap langkah.</p></div><span className="banner-symbol">✳</span></div><BudgetCards budgets={monthBudgets} transactions={snapshot.transactions} onEdit={setBudgetModal} onDelete={deleteBudget} />{monthBudgets.length < EXPENSE_CATEGORIES.length && <button className="add-budget-card" onClick={() => setBudgetModal('new')}><Plus size={20} /><strong>Tambah kategori anggaran</strong><span>Buat batas baru untuk {formatMonth(month)}</span></button>}</>}
        <div className="app-disclaimer"><ShieldCheck size={16} /> Data contoh dan perubahan hanya tersimpan di browser perangkat ini. Tidak ada sinkronisasi akun.</div>
      </div></main>
    {transactionModal && <TransactionForm key={typeof transactionModal === 'string' ? 'new' : transactionModal.id} initial={typeof transactionModal === 'string' ? undefined : transactionModal} month={month} onSave={saveTransaction} onClose={() => setTransactionModal(null)} />}
    {budgetModal && <BudgetForm key={typeof budgetModal === 'string' ? 'new' : budgetModal.id} initial={typeof budgetModal === 'string' ? undefined : budgetModal} month={month} existing={monthBudgets} onSave={saveBudget} onClose={() => setBudgetModal(null)} />}
  </div>;
}

export default function App() {
  return window.location.pathname.startsWith('/app') ? <FinanceApp /> : <Landing />;
}

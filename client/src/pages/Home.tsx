import { useEffect, useMemo, useState } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Activity, ArrowRight, Bell, Brain, CalendarCheck, Check, ChevronRight, Clock3, HeartHandshake,
  Home as HomeIcon, Lightbulb, LogIn, LogOut, Menu, Plus, RotateCcw, ShieldCheck, Sparkles,
  Target, Trash2, Trophy, UserRound, UsersRound, X, Zap,
} from "lucide-react";

const demoMemories = [
  { id: 1, title: "Family Birthday", description: "A joyful dinner together with Meena and Ravi.", memoryDate: "2025-05-18", category: "Family", people: "Meena, Ravi", place: "Home" },
  { id: 2, title: "Visit to the Beach", description: "Family visited the beach and watched the sunset.", memoryDate: "2024-12-11", category: "Travel", people: "Meena, Arun", place: "Marina Beach" },
  { id: 3, title: "School Memories", description: "Old friends and stories from school days.", memoryDate: "1988-06-01", category: "Milestone", people: "Anil", place: "Chennai" },
];
const demoReminders = [
  { id: 1, title: "Morning walk", description: "A gentle walk around the garden.", reminderDate: new Date().toISOString().slice(0, 10), reminderTime: "08:00", repeatFrequency: "Daily", priority: "Normal", completed: 1 },
  { id: 2, title: "Family call", description: "Call Meena after breakfast.", reminderDate: new Date().toISOString().slice(0, 10), reminderTime: "10:30", repeatFrequency: "Daily", priority: "High", completed: 0 },
  { id: 3, title: "Afternoon tea", description: "Take a quiet break and drink water.", reminderDate: new Date().toISOString().slice(0, 10), reminderTime: "16:00", repeatFrequency: "Daily", priority: "Normal", completed: 0 },
];
const demoGames = [
  { id: 1, gameType: "Memory Matching", score: 8, accuracy: 80, timeTaken: 42, difficulty: "Beginner", completedAt: "2026-09-09T09:00:00Z" },
  { id: 2, gameType: "Picture Recognition", score: 9, accuracy: 90, timeTaken: 31, difficulty: "Easy", completedAt: "2026-09-08T11:30:00Z" },
  { id: 3, gameType: "Number Recall", score: 7, accuracy: 70, timeTaken: 48, difficulty: "Easy", completedAt: "2026-09-07T08:15:00Z" },
  { id: 4, gameType: "Daily Orientation", score: 5, accuracy: 100, timeTaken: 24, difficulty: "Gentle", completedAt: "2026-09-06T08:00:00Z" },
];
const gameCatalog = [
  { name: "Memory Matching", icon: "🧩", description: "Find two matching pictures.", color: "peach" },
  { name: "Number Recall", icon: "🔢", description: "Remember a short number sequence.", color: "mint" },
  { name: "Picture Recognition", icon: "🌿", description: "Name familiar everyday objects.", color: "lavender" },
  { name: "Daily Orientation", icon: "☀️", description: "Connect with the day and time.", color: "sky" },
];
const matchSymbols = ["🌼", "🌼", "☕", "☕", "🌿", "🌿", "🏠", "🏠"];

function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(" "); }
function formatDate(value: string | Date | undefined) { return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""; }
function initials(name: string) { return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase(); }

type Tab = "overview" | "games" | "memories" | "reminders" | "progress" | "caregiver";
type Memory = typeof demoMemories[number];
type Reminder = typeof demoReminders[number];
type Game = Omit<typeof demoGames[number], "completedAt"> & { completedAt: string | Date };
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [demo, setDemo] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [memories, setMemories] = useState<Memory[]>(demoMemories);
  const [reminders, setReminders] = useState<Reminder[]>(demoReminders);
  const [games, setGames] = useState<Game[]>(demoGames);
  const [memoryModal, setMemoryModal] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [memoryPrompt, setMemoryPrompt] = useState("Do you remember going to the beach with your family?");
  const [promptAnswered, setPromptAnswered] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<Game | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("Arun");

  const realMemories = trpc.memories.list.useQuery(undefined, { enabled: isAuthenticated && !demo });
  const realReminders = trpc.reminders.list.useQuery(undefined, { enabled: isAuthenticated && !demo });
  const realGames = trpc.games.list.useQuery(undefined, { enabled: isAuthenticated && !demo });
  const recommendation = trpc.ai.recommendation.useQuery(undefined, { enabled: isAuthenticated && !demo });
  const addMemory = trpc.memories.add.useMutation({ onSuccess: data => { setMemories(data as Memory[]); toast.success("Memory saved"); setMemoryModal(false); } });
  const removeMemory = trpc.memories.remove.useMutation({ onSuccess: data => setMemories(data as Memory[]) });
  const addReminder = trpc.reminders.add.useMutation({ onSuccess: data => { setReminders(data as Reminder[]); toast.success("Reminder added"); setReminderModal(false); } });
  const toggleReminder = trpc.reminders.toggle.useMutation({ onSuccess: data => setReminders(data as Reminder[]) });
  const removeReminder = trpc.reminders.remove.useMutation({ onSuccess: data => setReminders(data as Reminder[]) });
  const addGame = trpc.games.add.useMutation({ onSuccess: data => setGames(data as Game[]) });
  const saveProfile = trpc.profile.save.useMutation({ onSuccess: () => toast.success("Profile updated") });

  useEffect(() => {
    if (!demo && isAuthenticated) {
      if (realMemories.data) setMemories(realMemories.data as Memory[]);
      if (realReminders.data) setReminders(realReminders.data as Reminder[]);
      if (realGames.data) setGames(realGames.data as Game[]);
    }
  }, [demo, isAuthenticated, realMemories.data, realReminders.data, realGames.data]);

  const displayName = demo ? profileName : (user?.name || "Friend");
  const averageAccuracy = Math.round(games.reduce((sum, item) => sum + item.accuracy, 0) / Math.max(games.length, 1));
  const todayReminders = reminders.filter(item => item.reminderDate === new Date().toISOString().slice(0, 10));
  const completedToday = todayReminders.filter(item => item.completed).length;
  const recommendationText = demo ? { gameType: "Memory Matching", difficulty: "Beginner", reason: "A short visual activity is a comfortable way to warm up today." } : (recommendation.data || { gameType: "Daily Orientation", difficulty: "Gentle", reason: "A calm way to begin today." });

  const go = (next: Tab) => { setTab(next); setMobileNav(false); setGameResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleMode = (nextDemo: boolean) => { setDemo(nextDemo); setTab("overview"); toast.success(nextDemo ? "Demo mode is ready" : "Signed-in workspace ready"); };
  const markReminder = (item: Reminder) => {
    const completed = !Boolean(item.completed);
    setReminders(current => current.map(row => row.id === item.id ? { ...row, completed: completed ? 1 : 0 } : row));
    if (!demo && isAuthenticated && typeof item.id === "number") toggleReminder.mutate({ id: item.id, completed });
    else toast.success(completed ? "Reminder completed" : "Reminder reopened");
  };
  const saveNewMemory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = { title: String(form.get("title")), description: String(form.get("description")), memoryDate: String(form.get("memoryDate") || ""), category: String(form.get("category") || "Family"), people: String(form.get("people") || ""), place: String(form.get("place") || ""), id: Date.now() };
    if (!item.title || !item.description) return toast.error("Add a title and a short description");
    if (!demo && isAuthenticated) addMemory.mutate(item);
    else { setMemories(current => [item, ...current]); setMemoryModal(false); toast.success("Memory added to your timeline"); }
  };
  const saveNewReminder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = { title: String(form.get("title")), description: String(form.get("description") || ""), reminderDate: String(form.get("reminderDate")), reminderTime: String(form.get("reminderTime")), repeatFrequency: String(form.get("repeatFrequency")), priority: String(form.get("priority")), completed: 0, id: Date.now() };
    if (!item.title || !item.reminderDate || !item.reminderTime) return toast.error("Add a title, date, and time");
    if (!demo && isAuthenticated) addReminder.mutate(item);
    else { setReminders(current => [...current, item].sort((a, b) => a.reminderTime.localeCompare(b.reminderTime))); setReminderModal(false); toast.success("Reminder added"); }
  };
  const recordGame = (result: Game) => {
    setGames(current => [result, ...current]);
    if (!demo && isAuthenticated) addGame.mutate({ gameType: result.gameType, score: result.score, accuracy: result.accuracy, timeTaken: result.timeTaken, difficulty: result.difficulty, attempts: 1 });
    setGameResult(result); setActiveGame(null); toast.success("Activity complete — nice work!");
  };

  if (loading) return <div className="loading-screen"><div className="logo-mark"><Brain size={24} /></div><p>Preparing your calm space…</p></div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go("overview")} aria-label="Go to overview"><span className="logo-mark"><Brain size={21} /></span><span>Cogniva</span></button>
        <div className="topbar-actions">
          <span className="mode-pill"><span className="status-dot" /> {demo ? "Demo workspace" : "Private workspace"}</span>
          {isAuthenticated && <button className="avatar-button" onClick={() => setProfileOpen(true)} aria-label="Open profile">{initials(displayName)}</button>}
          {!isAuthenticated ? <button className="button button-ghost" onClick={() => startLogin()}><LogIn size={17} /> Sign in</button> : <button className="button button-ghost" onClick={() => logout()}><LogOut size={17} /> Sign out</button>}
          <button className="mobile-menu" onClick={() => setMobileNav(value => !value)} aria-label="Toggle navigation"><Menu size={22} /></button>
        </div>
      </header>

      <div className="workspace">
        <aside className={cn("sidebar", mobileNav && "sidebar-open")}>
          <div className="sidebar-intro"><span className="eyebrow">YOUR SPACE</span><p>Simple steps for a brighter day.</p></div>
          <nav aria-label="Primary navigation">
            <NavButton active={tab === "overview"} icon={<HomeIcon size={18} />} label="Today" onClick={() => go("overview")} />
            <NavButton active={tab === "games"} icon={<Brain size={18} />} label="Cognitive games" onClick={() => go("games")} />
            <NavButton active={tab === "memories"} icon={<HeartHandshake size={18} />} label="Memory assistant" onClick={() => go("memories")} />
            <NavButton active={tab === "reminders"} icon={<Bell size={18} />} label="Reminders" onClick={() => go("reminders")} />
            <NavButton active={tab === "progress"} icon={<Activity size={18} />} label="My progress" onClick={() => go("progress")} />
            <div className="nav-divider" />
            <NavButton active={tab === "caregiver"} icon={<UsersRound size={18} />} label="Caregiver view" onClick={() => go("caregiver")} />
          </nav>
          <div className="sidebar-bottom"><div className="safety-card"><ShieldCheck size={18} /><div><strong>Supportive tool</strong><p>Not a diagnosis or medical treatment.</p></div></div><button className="button button-soft" onClick={() => setProfileOpen(true)}><UserRound size={17} /> My profile</button></div>
        </aside>

        <main className="main-content">
          <div className="page-wrap">
            <div className="mode-switcher" role="group" aria-label="Workspace mode"><span>Explore</span><button className={cn("mode-toggle", !demo && "is-on")} onClick={() => handleMode(!demo)} aria-label="Toggle demo mode"><span /></button><span>{demo ? "Demo mode" : "Signed in"}</span></div>
            {tab === "overview" && <Overview displayName={displayName} reminders={todayReminders} completedToday={completedToday} recommendation={recommendationText} memoryPrompt={memoryPrompt} promptAnswered={promptAnswered} onPromptAnswer={() => setPromptAnswered(true)} onGames={() => go("games")} onReminders={() => go("reminders")} onMemories={() => go("memories")} onProgress={() => go("progress")} averageAccuracy={averageAccuracy} games={games} />}
            {tab === "games" && <Games activeGame={activeGame} setActiveGame={setActiveGame} result={gameResult} onResult={recordGame} onGo={go} />}
            {tab === "memories" && <Memories memories={memories} onAdd={() => setMemoryModal(true)} onRemove={(id) => { if (!demo && isAuthenticated) removeMemory.mutate({ id }); else { setMemories(current => current.filter(item => item.id !== id)); toast.success("Memory removed"); } }} onPrompt={(memory) => setMemoryPrompt(memory.people ? `Do you remember ${memory.title.toLowerCase()} with ${memory.people}?` : `Do you remember ${memory.title.toLowerCase()}?`)} />}
            {tab === "reminders" && <Reminders reminders={reminders} onAdd={() => setReminderModal(true)} onToggle={markReminder} onRemove={(id) => { if (!demo && isAuthenticated) removeReminder.mutate({ id }); else { setReminders(current => current.filter(item => item.id !== id)); toast.success("Reminder removed"); } }} />}
            {tab === "progress" && <Progress games={games} averageAccuracy={averageAccuracy} />}
            {tab === "caregiver" && <Caregiver games={games} reminders={reminders} memories={memories} averageAccuracy={averageAccuracy} onMemory={() => setMemoryModal(true)} onReminder={() => setReminderModal(true)} />}
          </div>
        </main>
      </div>

      {memoryModal && <Modal title="Add a memory" onClose={() => setMemoryModal(false)}><form className="form-grid" onSubmit={saveNewMemory}><Field label="Memory title" name="title" placeholder="Family picnic" required /><Field label="What happened?" name="description" placeholder="A sunny afternoon together…" required textarea /><div className="form-row"><Field label="Date" name="memoryDate" type="date" /><label className="field"><span>Category</span><select name="category" defaultValue="Family"><option>Family</option><option>Travel</option><option>Milestone</option><option>Everyday</option></select></label></div><div className="form-row"><Field label="People" name="people" placeholder="Meena, Ravi" /><Field label="Place" name="place" placeholder="Home" /></div><button className="button button-primary full" type="submit"><Plus size={18} /> Save memory</button></form></Modal>}
      {reminderModal && <Modal title="Add a reminder" onClose={() => setReminderModal(false)}><form className="form-grid" onSubmit={saveNewReminder}><Field label="Reminder title" name="title" placeholder="Call family" required /><Field label="Details" name="description" placeholder="A friendly note…" textarea /><div className="form-row"><Field label="Date" name="reminderDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /><Field label="Time" name="reminderTime" type="time" defaultValue="10:00" required /></div><div className="form-row"><label className="field"><span>Repeat</span><select name="repeatFrequency" defaultValue="Once"><option>Once</option><option>Daily</option><option>Weekly</option></select></label><label className="field"><span>Priority</span><select name="priority" defaultValue="Normal"><option>Normal</option><option>High</option><option>Low</option></select></label></div><button className="button button-primary full" type="submit"><Plus size={18} /> Save reminder</button></form></Modal>}
      {profileOpen && <Modal title="My profile" onClose={() => setProfileOpen(false)}><form className="form-grid" onSubmit={(event) => { event.preventDefault(); if (!demo && isAuthenticated) saveProfile.mutate({ preferredName: profileName, favoriteActivities: "Walking, music, family stories" }); setProfileOpen(false); toast.success("Profile saved"); }}><div className="profile-preview"><span className="big-avatar">{initials(displayName)}</span><div><strong>{displayName}</strong><p>Private profile · fictional demo data</p></div></div><Field label="Preferred name" name="preferredName" value={profileName} onChange={(event) => setProfileName(event.target.value)} /><Field label="Favorite activities" name="activities" defaultValue="Walking, music, family stories" textarea /><button className="button button-primary full" type="submit"><Check size={18} /> Save profile</button></form></Modal>}
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) { return <button className={cn("nav-button", active && "active")} onClick={onClick}>{icon}<span>{label}</span>{active && <ChevronRight className="nav-chevron" size={16} />}</button>; }
function Field({ label, name, placeholder, type = "text", required, textarea, defaultValue, value, onChange }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean; textarea?: boolean; defaultValue?: string; value?: string; onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void }) { return <label className="field"><span>{label}</span>{textarea ? <textarea name={name} placeholder={placeholder} required={required} defaultValue={defaultValue} /> : <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} value={value} onChange={onChange} />}</label>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal"><div className="modal-head"><div><span className="eyebrow">PERSONAL SPACE</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>{children}</div></div>; }

function Overview({ displayName, reminders, completedToday, recommendation, memoryPrompt, promptAnswered, onPromptAnswer, onGames, onReminders, onMemories, onProgress, averageAccuracy, games }: { displayName: string; reminders: Reminder[]; completedToday: number; recommendation: { gameType: string; difficulty: string; reason: string }; memoryPrompt: string; promptAnswered: boolean; onPromptAnswer: () => void; onGames: () => void; onReminders: () => void; onMemories: () => void; onProgress: () => void; averageAccuracy: number; games: Game[] }) {
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  return <>
    <section className="welcome-row"><div><span className="eyebrow">{formatDate(new Date())}</span><h1>{greeting}, <em>{displayName}</em></h1><p className="lede">A gentle place for practice, memories, and the little things that make today yours.</p></div><div className="streak-card"><span className="streak-icon"><Zap size={18} /></span><div><strong>4 day rhythm</strong><span>Keep going, gently.</span></div></div></section>
    <section className="hero-panel"><div className="hero-copy"><span className="eyebrow light">YOUR NEXT STEP</span><h2>Small moments add up.</h2><p>Try one simple activity, revisit a memory, or check what is next in your day.</p><button className="button button-light" onClick={onGames}>Start a gentle activity <ArrowRight size={17} /></button></div><div className="hero-orbit"><div className="orbit-dot dot-one">🌼</div><div className="orbit-dot dot-two">☕</div><div className="orbit-dot dot-three">🏠</div><div className="orbit-center"><Brain size={40} /></div></div></section>
    <section className="stat-grid"><Stat icon={<CalendarCheck />} label="Today’s reminders" value={`${completedToday}/${reminders.length}`} tone="mint" /><Stat icon={<Target />} label="Average accuracy" value={`${averageAccuracy}%`} tone="peach" /><Stat icon={<Trophy />} label="Activities completed" value={String(games.length + 12)} tone="lavender" /><Stat icon={<HeartHandshake />} label="Memories saved" value="24" tone="sky" /></section>
    <div className="content-grid two-one"><section className="section-card"><CardHeading eyebrow="FOR TODAY" title="Your reminders" action="See all" onAction={onReminders} /><div className="reminder-list">{reminders.length ? reminders.slice(0, 3).map(item => <ReminderRow item={item} key={item.id} compact />) : <EmptyState text="Nothing planned yet." />}</div></section><section className="section-card recommendation-card"><CardHeading eyebrow="A THOUGHTFUL SUGGESTION" title="Recommended for you" /><div className="recommendation-icon">🧩</div><h3>{recommendation.gameType}</h3><span className="tag tag-mint">{recommendation.difficulty}</span><p>{recommendation.reason}</p><button className="text-button" onClick={onGames}>Start activity <ArrowRight size={16} /></button></section></div>
    <div className="content-grid two-one"><section className="section-card memory-prompt-card"><div className="prompt-art">✦</div><div><span className="eyebrow">MEMORY ASSISTANT</span><h2>A little question for you</h2><p>{promptAnswered ? "That was lovely. You can explore another memory whenever you like." : memoryPrompt}</p><div className="prompt-actions"><button className="button button-primary" onClick={onPromptAnswer}>{promptAnswered ? "Thank you" : "I remember"}</button><button className="button button-soft" onClick={onMemories}>Explore memories</button></div></div></section><section className="section-card quick-card"><CardHeading eyebrow="YOUR RHYTHM" title="Recent activity" action="View progress" onAction={onProgress} />{games.slice(0, 3).map(game => <div className="activity-row" key={game.id}><span className="activity-icon">{game.gameType === "Memory Matching" ? "🧩" : game.gameType === "Number Recall" ? "🔢" : "☀️"}</span><div><strong>{game.gameType}</strong><span>{game.accuracy}% accuracy</span></div><span className="activity-time">{game.timeTaken}s</span></div>)}</section></div>
  </>;
}
function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) { return <div className="stat-card"><span className={cn("stat-icon", tone)}>{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>; }
function CardHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) { return <div className="card-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <button className="text-button" onClick={onAction}>{action} <ArrowRight size={15} /></button>}</div>; }
function ReminderRow({ item, compact, onToggle, onRemove }: { item: Reminder; compact?: boolean; onToggle?: () => void; onRemove?: () => void }) { return <div className={cn("reminder-row", Boolean(item.completed) && "completed")}><button className="check-button" onClick={onToggle} aria-label={item.completed ? "Mark incomplete" : "Mark complete"}><Check size={16} /></button><div className="reminder-details"><strong>{item.title}</strong><span>{item.description || "A small step in your routine."}</span></div><span className="reminder-time"><Clock3 size={14} /> {item.reminderTime}</span>{!compact && onRemove && <button className="icon-button subtle" onClick={onRemove} aria-label="Delete reminder"><Trash2 size={16} /></button>}</div>; }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><Sparkles size={18} /><span>{text}</span></div>; }

function Games({ activeGame, setActiveGame, result, onResult, onGo }: { activeGame: string | null; setActiveGame: (value: string | null) => void; result: Game | null; onResult: (result: Game) => void; onGo: (tab: Tab) => void }) {
  const [flipped, setFlipped] = useState<number[]>([]); const [matched, setMatched] = useState<number[]>([]); const [sequence, setSequence] = useState(""); const [answer, setAnswer] = useState(""); const [showSequence, setShowSequence] = useState(false); const [startedAt, setStartedAt] = useState<number | null>(null);
  useEffect(() => { if (activeGame === "Memory Matching") { setFlipped([]); setMatched([]); setStartedAt(Date.now()); } if (activeGame === "Number Recall") { const next = String(Math.floor(1000 + Math.random() * 8999)); setSequence(next); setAnswer(""); setShowSequence(true); setStartedAt(Date.now()); const timer = window.setTimeout(() => setShowSequence(false), 2800); return () => window.clearTimeout(timer); } return undefined; }, [activeGame]);
  useEffect(() => { if (flipped.length === 2) { const [first, second] = flipped; if (matchSymbols[first] === matchSymbols[second]) { setMatched(current => [...current, first, second]); setFlipped([]); if (matched.length + 2 === matchSymbols.length) onResult({ id: Date.now(), gameType: "Memory Matching", score: 8, accuracy: 100, timeTaken: Math.max(1, Math.round((Date.now() - (startedAt || Date.now())) / 1000)), difficulty: "Beginner", completedAt: new Date().toISOString() }); } else { const timer = window.setTimeout(() => setFlipped([]), 650); return () => window.clearTimeout(timer); } } return undefined; }, [flipped, matched.length]);
  const start = (game: string) => { setActiveGame(game); };
  if (result) return <section className="game-result"><div className="result-badge"><Trophy size={28} /></div><span className="eyebrow">ACTIVITY COMPLETE</span><h1>Great job!</h1><p>You gave that activity your attention. That is worth celebrating.</p><div className="result-stats"><div><strong>{result.score}/{result.gameType === "Memory Matching" ? 8 : 1}</strong><span>Score</span></div><div><strong>{result.accuracy}%</strong><span>Accuracy</span></div><div><strong>{result.timeTaken}s</strong><span>Time</span></div></div><div className="result-actions"><button className="button button-primary" onClick={() => setActiveGame(result.gameType)}>Play again</button><button className="button button-soft" onClick={() => onGo("games")}>Try another game</button><button className="text-button" onClick={() => onGo("progress")}>View progress <ArrowRight size={16} /></button></div><div className="adaptive-note"><Lightbulb size={18} /><span>Your next activity will stay gentle while you build a comfortable rhythm.</span></div></section>;
  if (activeGame === "Memory Matching") return <section className="game-stage"><button className="back-link" onClick={() => setActiveGame(null)}>← All games</button><span className="eyebrow">MEMORY MATCHING</span><h1>Find the matching pairs</h1><p>Turn over two cards at a time. Take your time — there is no rush.</p><div className="matching-board">{matchSymbols.map((symbol, index) => <button key={index} className={cn("match-card", (flipped.includes(index) || matched.includes(index)) && "revealed", matched.includes(index) && "matched")} onClick={() => { if (!flipped.includes(index) && !matched.includes(index) && flipped.length < 2) setFlipped(current => [...current, index]); }} aria-label={`Card ${index + 1}`}>{flipped.includes(index) || matched.includes(index) ? symbol : "?"}</button>)}</div><span className="game-helper">{matched.length / 2} of 4 pairs found</span></section>;
  if (activeGame === "Number Recall") return <section className="game-stage"><button className="back-link" onClick={() => setActiveGame(null)}>← All games</button><span className="eyebrow">NUMBER RECALL</span><h1>What numbers did you see?</h1>{showSequence ? <div className="sequence-display"><span>Remember this number</span><strong>{sequence.slice(0, 2)} {sequence.slice(2)}</strong></div> : <form className="number-form" onSubmit={(event) => { event.preventDefault(); const accuracy = answer.replace(/\s/g, "") === sequence ? 100 : 50; onResult({ id: Date.now(), gameType: "Number Recall", score: accuracy === 100 ? 1 : 0, accuracy, timeTaken: Math.max(1, Math.round((Date.now() - (startedAt || Date.now())) / 1000)), difficulty: "Easy", completedAt: new Date().toISOString() }); }}><p>Enter the 4-digit number you remember.</p><input autoFocus inputMode="numeric" value={answer} onChange={event => setAnswer(event.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="Remembered number" /><button className="button button-primary" type="submit" disabled={answer.length < 4}>Check answer <ArrowRight size={16} /></button></form>}</section>;
  return <><section className="page-heading"><div><span className="eyebrow">COGNITIVE GAMES</span><h1>Choose an activity</h1><p>Short, friendly activities designed to be practiced at your own pace.</p></div><div className="heading-note"><Brain size={20} /><span>There are no wrong ways to practice.</span></div></section><div className="games-grid">{gameCatalog.map(game => <button className={cn("game-card", game.color)} key={game.name} onClick={() => start(game.name)}><span className="game-emoji">{game.icon}</span><span className="game-card-copy"><strong>{game.name}</strong><span>{game.description}</span></span><ArrowRight size={20} /></button>)}</div><section className="section-card games-note"><Lightbulb size={20} /><div><strong>A gentle reminder</strong><p>Game performance is for personal practice and reflection. It is not a diagnosis or a measure of dementia severity.</p></div></section></>;
}

function Memories({ memories, onAdd, onRemove, onPrompt }: { memories: Memory[]; onAdd: () => void; onRemove: (id: number) => void; onPrompt: (memory: Memory) => void }) { const [filter, setFilter] = useState("All"); const filtered = filter === "All" ? memories : memories.filter(item => item.category === filter); return <><section className="page-heading"><div><span className="eyebrow">MEMORY ASSISTANT</span><h1>Your memory garden</h1><p>Keep meaningful moments close, in a simple timeline you can revisit together.</p></div><button className="button button-primary" onClick={onAdd}><Plus size={18} /> Add memory</button></section><div className="filter-row"><span>Show:</span>{["All", "Family", "Travel", "Milestone", "Everyday"].map(item => <button key={item} className={cn("filter-chip", filter === item && "selected")} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="timeline">{filtered.map(memory => <article className="memory-card" key={memory.id}><div className="timeline-dot" /><div className="memory-date">{formatDate(memory.memoryDate)}</div><div className="memory-card-body"><div className="memory-card-top"><span className="tag tag-lavender">{memory.category}</span><button className="icon-button subtle" onClick={() => onRemove(memory.id)} aria-label="Delete memory"><Trash2 size={16} /></button></div><h2>{memory.title}</h2><p>{memory.description}</p><div className="memory-meta"><span><UsersRound size={14} /> {memory.people || "Together"}</span><span><HomeIcon size={14} /> {memory.place || "A special place"}</span></div><button className="text-button" onClick={() => onPrompt(memory)}><Sparkles size={15} /> Make a prompt</button></div></article>)}{!filtered.length && <EmptyState text="No memories in this category yet." />}</div></>; }
function Reminders({ reminders, onAdd, onToggle, onRemove }: { reminders: Reminder[]; onAdd: () => void; onToggle: (item: Reminder) => void; onRemove: (id: number) => void }) { const [showCompleted, setShowCompleted] = useState(true); const visible = showCompleted ? reminders : reminders.filter(item => !item.completed); return <><section className="page-heading"><div><span className="eyebrow">DAILY RHYTHM</span><h1>Reminders</h1><p>Helpful nudges for the things that matter to you.</p></div><button className="button button-primary" onClick={onAdd}><Plus size={18} /> Add reminder</button></section><div className="reminders-toolbar"><div className="date-chip"><CalendarCheck size={17} /><span>{formatDate(new Date())}</span></div><label className="check-label"><input type="checkbox" checked={showCompleted} onChange={event => setShowCompleted(event.target.checked)} /> Show completed</label></div><section className="section-card reminder-page-card"><div className="reminder-list">{visible.map(item => <ReminderRow key={item.id} item={item} onToggle={() => onToggle(item)} onRemove={() => onRemove(item.id)} />)}{!visible.length && <EmptyState text="You are all caught up." />}</div></section><p className="disclaimer-line"><ShieldCheck size={15} /> Reminder content is entered by you or a caregiver. It does not provide medical advice.</p></>; }
function Progress({ games, averageAccuracy }: { games: Game[]; averageAccuracy: number }) { const [range, setRange] = useState("7 days"); const byType = useMemo(() => Object.entries(games.reduce<Record<string, number[]>>((acc, game) => { (acc[game.gameType] ||= []).push(game.accuracy); return acc; }, {})).map(([label, values]) => ({ label, value: Math.round(values.reduce((a, b) => a + b, 0) / values.length) })), [games]); return <><section className="page-heading"><div><span className="eyebrow">PERSONAL PROGRESS</span><h1>Your activity story</h1><p>Notice patterns in your practice without turning them into a judgement.</p></div><div className="segmented">{["7 days", "30 days", "All time"].map(item => <button key={item} className={range === item ? "selected" : ""} onClick={() => setRange(item)}>{item}</button>)}</div></section><div className="stat-grid progress-stats"><Stat icon={<Trophy />} label="Activities played" value={String(games.length)} tone="lavender" /><Stat icon={<Target />} label="Average accuracy" value={`${averageAccuracy}%`} tone="mint" /><Stat icon={<Zap />} label="Current rhythm" value="4 days" tone="peach" /><Stat icon={<Sparkles />} label="Favorite activity" value="Matching" tone="sky" /></div><div className="content-grid progress-grid"><section className="section-card chart-card"><CardHeading eyebrow={`ACCURACY · ${range.toUpperCase()}`} title="A steady view" /><div className="line-chart"><div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 600 240" role="img" aria-label="Accuracy over time"><path d="M10 200 C 90 180, 110 100, 190 130 S 300 145, 365 70 S 470 110, 590 36" fill="none" stroke="#ef8b68" strokeWidth="5" strokeLinecap="round" /><path d="M10 200 C 90 180, 110 100, 190 130 S 300 145, 365 70 S 470 110, 590 36 L590 240 L10 240Z" fill="url(#chartFill)" opacity=".45" /><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ef8b68" /><stop offset="1" stopColor="#fff8f3" /></linearGradient></defs></svg><div className="chart-x"><span>Sep 4</span><span>Sep 6</span><span>Sep 8</span><span>Today</span></div></div></section><section className="section-card"><CardHeading eyebrow="BY ACTIVITY" title="What you enjoy" />{byType.map(item => <div className="bar-row" key={item.label}><div><span>{item.label}</span><strong>{item.value}%</strong></div><div className="bar-track"><span style={{ width: `${item.value}%` }} /></div></div>)}</section></div><section className="section-card recent-table"><CardHeading eyebrow="RECENT ACTIVITY" title="Your latest sessions" />{games.map(game => <div className="table-row" key={game.id}><span className="activity-icon">{game.gameType === "Memory Matching" ? "🧩" : "🔢"}</span><strong>{game.gameType}</strong><span>{formatDate(game.completedAt)}</span><span className="table-score">{game.accuracy}%</span><span className="tag tag-mint">{game.difficulty}</span></div>)}</section></>; }
function Caregiver({ games, reminders, memories, averageAccuracy, onMemory, onReminder }: { games: Game[]; reminders: Reminder[]; memories: Memory[]; averageAccuracy: number; onMemory: () => void; onReminder: () => void }) { const completed = reminders.filter(item => item.completed).length; return <><section className="page-heading"><div><span className="eyebrow">CAREGIVER VIEW</span><h1>A clear picture of the week</h1><p>Descriptive activity information to support helpful conversations — never a diagnosis.</p></div><div className="caregiver-badge"><UsersRound size={18} /> Shared with care</div></section><div className="stat-grid"><Stat icon={<Brain />} label="Games completed" value={String(games.length + 18)} tone="lavender" /><Stat icon={<Target />} label="Average accuracy" value={`${averageAccuracy}%`} tone="mint" /><Stat icon={<CalendarCheck />} label="Reminders completed" value={`${completed}/${reminders.length}`} tone="peach" /><Stat icon={<HeartHandshake />} label="Memories saved" value={String(memories.length)} tone="sky" /></div><div className="content-grid progress-grid"><section className="section-card insight-card"><CardHeading eyebrow="ACTIVITY INSIGHTS" title="What we can see" /><div className="insight"><span>✦</span><p>Recent activity shows a comfortable rhythm across {games.length} different sessions.</p></div><div className="insight"><span>✦</span><p>Short activities may be useful when the day feels busy. Keep practice optional and encouraging.</p></div><div className="ai-disclaimer"><ShieldCheck size={17} /><span>These are descriptive notes based only on app activity, not clinical conclusions.</span></div></section><section className="section-card caregiver-actions"><CardHeading eyebrow="QUICK SUPPORT" title="Make it personal" /><button className="action-tile" onClick={onMemory}><span className="tile-icon peach"><HeartHandshake size={20} /></span><span><strong>Add a memory</strong><small>Keep an important moment close.</small></span><ArrowRight size={17} /></button><button className="action-tile" onClick={onReminder}><span className="tile-icon mint"><Bell size={20} /></span><span><strong>Add a reminder</strong><small>Offer a helpful nudge.</small></span><ArrowRight size={17} /></button></section></div></>; }

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { FieldError, ToastStack, type Notice } from "./Feedback";
import {
  ADVISORS,
  CATALOG,
  DEFAULT_GROUPS,
  GLOBAL_NAV,
  REPRESENTATIVES,
  type GroupRow,
  type Investment,
} from "./data";

type View = "list" | "create" | "detail";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`fig-icon ${className ?? ""}`} aria-hidden="true">
      <img src={`/assets/icons/${name}.png`} alt="" />
    </span>
  );
}

function useMenuPosition(open: boolean, wrapRef: RefObject<HTMLElement | null>) {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const maxH = 280;
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < 160 && r.top > Math.min(maxH, 200);
      setStyle({
        position: "fixed",
        top: openUp ? undefined : r.bottom + 4,
        bottom: openUp ? window.innerHeight - r.top + 4 : undefined,
        left: r.left,
        width: Math.max(r.width, 240),
        zIndex: 80,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, wrapRef]);

  return style;
}

export default function App() {
  const [view, setView] = useState<View>("list");
  const [groups, setGroups] = useState<GroupRow[]>(DEFAULT_GROUPS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listBanner, setListBanner] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const noticeId = useRef(0);
  const [listQuery, setListQuery] = useState("");
  const [nameError, setNameError] = useState("");
  const [investError, setInvestError] = useState("");
  const [repError, setRepError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [advisor, setAdvisor] = useState("");
  const [reps, setReps] = useState<string[]>([]);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [repOpen, setRepOpen] = useState(false);
  const [repQ, setRepQ] = useState("");
  const [globalOpen, setGlobalOpen] = useState(true);
  const advisorWrapRef = useRef<HTMLDivElement>(null);
  const repWrapRef = useRef<HTMLDivElement>(null);
  const advisorMenuStyle = useMenuPosition(advisorOpen, advisorWrapRef);
  const repMenuStyle = useMenuPosition(repOpen && Boolean(advisor), repWrapRef);

  const [slideover, setSlideover] = useState(false);
  const [draft, setDraft] = useState<Investment[]>([]);
  const [leftQ, setLeftQ] = useState("");
  const [rightQ, setRightQ] = useState("");

  function pushNotice(kind: Notice["kind"], title: string, description?: string) {
    noticeId.current += 1;
    const id = noticeId.current;
    setNotices((cur) => [...cur, { id, kind, title, description }]);
  }

  function dismissNotice(id: number) {
    setNotices((cur) => cur.filter((n) => n.id !== id));
  }

  const visibleGroups = groups.filter((g) =>
    `${g.name} ${g.advisor}`.toLowerCase().includes(listQuery.toLowerCase()),
  );

  const leftList = useMemo(
    () =>
      CATALOG.filter(
        (p) =>
          !draft.some((d) => d.id === p.id) &&
          `${p.name} ${p.code}`.toLowerCase().includes(leftQ.toLowerCase()),
      ),
    [draft, leftQ],
  );
  const rightList = useMemo(
    () => draft.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(rightQ.toLowerCase())),
    [draft, rightQ],
  );

  function openCreate() {
    setName("");
    setDescription("");
    setInvestments([]);
    setAdvisor("");
    setReps([]);
    setAdvisorOpen(false);
    setRepOpen(false);
    setNameError("");
    setInvestError("");
    setRepError("");
    setEditingId(null);
    setListBanner(false);
    setView("create");
  }

  function openGroup(g: GroupRow) {
    setEditingId(g.id);
    setName(g.name);
    setDescription(g.description);
    setInvestments([...g.items]);
    setAdvisor(g.advisor === "—" ? "" : g.advisor);
    setReps([...g.reps]);
    setAdvisorOpen(false);
    setRepOpen(false);
    setNameError("");
    setInvestError("");
    setRepError("");
    setSlideover(false);
    setView("detail");
  }

  function backToList() {
    setView("list");
    setSlideover(false);
    setEditingId(null);
  }

  function openSlideover() {
    setDraft([...investments]);
    setLeftQ("");
    setRightQ("");
    setSlideover(true);
    setAdvisorOpen(false);
    setRepOpen(false);
  }

  function saveSlideover() {
    if (!draft.length) {
      pushNotice("warning", "Warning", "Add at least one investment before saving.");
      setInvestError("Add at least one investment");
      return;
    }
    setInvestments(draft);
    setInvestError("");
    setSlideover(false);
  }

  function addInvestment(p: Investment) {
    setDraft((cur) => (cur.some((x) => x.id === p.id) ? cur : [...cur, p]));
  }

  function removeInvestment(id: string) {
    setDraft((cur) => cur.filter((x) => x.id !== id));
  }

  function submitGroup() {
    const trimmed = name.trim();
    const isEdit = Boolean(editingId);
    let blocked = false;
    if (!trimmed) {
      setNameError("Enter the Investment group name");
      blocked = true;
    } else {
      setNameError("");
    }
    if (!investments.length) {
      setInvestError("Add at least one investment");
      blocked = true;
    } else {
      setInvestError("");
    }
    if (blocked) {
      pushNotice(
        "critical",
        "Something went wrong!",
        !trimmed
          ? "Enter the Investment group name to continue."
          : !investments.length
            ? "Add at least one investment to continue."
            : "Fix the highlighted fields and try again.",
      );
      return;
    }
    const next: GroupRow = {
      id: editingId ?? `g-${Date.now()}`,
      name: trimmed,
      description,
      items: [...investments],
      advisor: advisor || "—",
      reps: advisor ? [...reps] : [],
      status: "Open",
    };
    if (editingId) {
      setGroups((prev) => prev.map((g) => (g.id === editingId ? next : g)));
    } else {
      setGroups((prev) => [...prev, next]);
    }
    setEditingId(null);
    setView("list");
    setListBanner(true);
    pushNotice(
      "success",
      isEdit ? "Investment group updated successfully" : "Investment group created successfully",
    );
  }

  return (
    <div className="shell">
      <ToastStack notices={notices} onDismiss={dismissNotice} />
      <aside className="app-bar">
        <img className="core" src="/assets/core-logo.svg" alt="CORE" />
        <Rail icon="rail-dashboard" label="Dashboard" />
        <Rail icon="rail-payroll" label="Payroll" />
        <Rail icon="rail-employee" label="Employee" />
        <Rail icon="rail-plan-config" label="Plan Config" active />
        <Rail icon="rail-transaction" label="Transact..." />
        <Rail icon="rail-others" label="Others" />
      </aside>

      <header className="top-nav">
        <img className="tenant" src="/assets/tenant-logo.svg" alt="Galileo" />
        <div className="top-nav-right">
          <div className="bell-wrap">
            <Icon name="bell" className="icon-24" />
            <span className="badge">+25</span>
          </div>
          <Icon name="help" className="icon-24" />
          <div className="avatar-wrap">
            <img className="avatar" src="/assets/extra.jpeg" alt="User" />
            <span className="online" />
          </div>
        </div>
      </header>

      <div className="body">
        <nav className="side">
          <div className="side-title">Plan Config</div>
          <div className="side-menu">
            <button type="button" className="side-item">
              Plan
            </button>
            <button type="button" className="side-item">
              Company
            </button>
            <div className={`global-wrap ${globalOpen ? "open" : ""}`}>
              <button
                type="button"
                className="global-head"
                aria-expanded={globalOpen}
                onClick={() => setGlobalOpen((v) => !v)}
              >
                <span>Global configuration</span>
                <Icon name={globalOpen ? "chevron-up" : "chevron-down"} className="icon-chevron-nav" />
              </button>
              {globalOpen &&
                GLOBAL_NAV.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`global-item ${item === "Investment group" ? "active" : ""}`}
                    onClick={() => {
                      if (item === "Investment group") backToList();
                    }}
                  >
                    {item}
                  </button>
                ))}
            </div>
          </div>
        </nav>

        <main className="main">
          {view === "list" && (
            <>
              <div className="page-head">
                <h1>Manage Investment group</h1>
                <button type="button" className="btn-primary" onClick={openCreate}>
                  Create Investment group
                </button>
              </div>
              {listBanner && (
                <div className="list-banner">
                  <span>
                    <Icon name="check-circle" className="icon-16" /> Investment group created successfully
                  </span>
                  <button type="button" className="list-banner-close" onClick={() => setListBanner(false)} aria-label="Dismiss">
                    <Icon name="close" className="icon-12" />
                  </button>
                </div>
              )}
              <div className="search-row">
                <div className="search-box">
                  <Icon name="search" className="icon-14" />
                  <input
                    placeholder="Search by company name"
                    value={listQuery}
                    onChange={(e) => setListQuery(e.target.value)}
                  />
                </div>
                <button type="button" className="btn-outline">
                  Search
                </button>
              </div>
              <div className="records">
                {pad(visibleGroups.length)}/{pad(groups.length)} Records found
              </div>
              <div className="table">
                <div className="table-head ig-cols">
                  <HeaderCell label="Group name" />
                  <HeaderCell label="Investments" />
                  <HeaderCell label="Advisor" />
                  <HeaderCell label="Representative" />
                  <HeaderCell label="Investment Status" />
                </div>
                {visibleGroups.map((g) => (
                  <div className="table-row ig-cols" key={g.id}>
                    <div>
                      <button type="button" className="group-link" onClick={() => openGroup(g)}>
                        {g.name}
                      </button>
                    </div>
                    <div>{pad(g.items.length)}</div>
                    <div>{g.advisor}</div>
                    <div>{pad(g.reps.length)}</div>
                    <div className="status">{g.status}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(view === "create" || view === "detail") && (
            <>
              <div className="create-head">
                <div>
                  <button type="button" className="back" onClick={backToList}>
                    <Icon name="arrow-left" className="icon-back" /> Back
                  </button>
                  <h1>{view === "create" ? "Create Investment group" : name || "Investment group"}</h1>
                </div>
                <div className="head-actions">
                  <button type="button" className="btn-outline" onClick={backToList}>
                    Cancel
                  </button>
                  <button type="button" className="btn-primary" onClick={submitGroup}>
                    {view === "detail" ? "Save" : "Create"}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Investment group Name</label>
                <input
                  className={nameError ? "has-error" : ""}
                  placeholder="Enter the Investment group name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                />
                {nameError ? <FieldError message={nameError} /> : null}
              </div>
              <div className="field">
                <label>Investment group description (Optional)</label>
                <textarea
                  placeholder="Enter the description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="section-row">
                <h2>Investment</h2>
                <button type="button" className="btn-outline" onClick={openSlideover}>
                  {investments.length ? "Add & Edit" : "Add"}
                </button>
              </div>
              <div className={`table ${investError ? "has-error" : ""}`} style={{ maxWidth: 995 }}>
                <div className="table-head inv-cols">
                  <HeaderCell label="Investment Name" />
                  <HeaderCell label="CUSIP" />
                  <HeaderCell label="Investment type" />
                </div>
                {investments.length === 0 ? (
                  <div className="empty-row">No Investment added</div>
                ) : (
                  investments.map((inv) => (
                    <div className="table-row inv-cols" key={inv.id}>
                      <div className="name">{inv.name}</div>
                      <div>{inv.code}</div>
                      <div>{inv.type}</div>
                    </div>
                  ))
                )}
              </div>
              {investError ? <FieldError message={investError} /> : null}

              <div className="field" style={{ marginTop: 16 }}>
                <label>Select Advisor (Optional)</label>
                <div className="dropdown" ref={advisorWrapRef}>
                  <button
                    type="button"
                    className={`select-trigger ${advisorOpen ? "open" : ""}`}
                    onClick={() => {
                      setAdvisorOpen((v) => !v);
                      setRepOpen(false);
                    }}
                  >
                    <span className={advisor ? "" : "ph"}>{advisor || "Select advisor"}</span>
                    <span>
                      {advisor && (
                        <span
                          className="clear"
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdvisor("");
                            setReps([]);
                            setRepOpen(false);
                            setRepError("");
                          }}
                        >
                          ×
                        </span>
                      )}
                      <Icon name={advisorOpen ? "chevron-up" : "chevron-down"} className="icon-12" />
                    </span>
                  </button>
                  {advisorOpen &&
                    createPortal(
                      <div className="menu figma-dd" style={advisorMenuStyle}>
                        {ADVISORS.map((a) => (
                          <button
                            type="button"
                            key={a}
                            className="opt"
                            onClick={() => {
                              setAdvisor(a);
                              setAdvisorOpen(false);
                              setRepError("");
                              if (a !== advisor) setReps([]);
                            }}
                          >
                            {a}
                          </button>
                        ))}
                      </div>,
                      document.body,
                    )}
                </div>
              </div>

              <div className="field">
                <label>Advisor Representative (Optional)</label>
                <div className="dropdown" ref={repWrapRef}>
                  <button
                    type="button"
                    className={`select-trigger ${repOpen ? "open" : ""} ${repError ? "has-error" : ""}`}
                    onClick={() => {
                      if (!advisor) {
                        setRepError("Select an advisor before adding a representative");
                        setRepOpen(false);
                        pushNotice(
                          "critical",
                          "Something went wrong!",
                          "Select an advisor before adding a representative.",
                        );
                        return;
                      }
                      setRepError("");
                      setRepOpen((v) => !v);
                      setAdvisorOpen(false);
                    }}
                  >
                    <span className={reps.length ? "" : "ph"}>
                      {reps.length ? `${pad(reps.length)} Selected` : "Select advisor representative"}
                    </span>
                    <Icon name={repOpen ? "chevron-up" : "chevron-down"} className="icon-12" />
                  </button>
                  {advisor &&
                    repOpen &&
                    createPortal(
                      <div className="menu figma-dd" style={repMenuStyle}>
                        <div className="search-box">
                          <Icon name="search" className="icon-14" />
                          <input placeholder="Search content" value={repQ} onChange={(e) => setRepQ(e.target.value)} />
                        </div>
                        <div className="menu-actions">
                          <button type="button" className="link" onClick={() => setReps([...REPRESENTATIVES])}>
                            Select All
                          </button>
                          <button type="button" className="link" onClick={() => setReps([])}>
                            Clear
                          </button>
                        </div>
                        {REPRESENTATIVES.filter((r) => r.toLowerCase().includes(repQ.toLowerCase())).map((r) => (
                          <label className="opt" key={r}>
                            <input
                              type="checkbox"
                              checked={reps.includes(r)}
                              onChange={() =>
                                setReps((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]))
                              }
                            />
                            {r}
                          </label>
                        ))}
                      </div>,
                      document.body,
                    )}
                </div>
                {repError ? <FieldError message={repError} /> : null}
              </div>
            </>
          )}
        </main>
      </div>

      {slideover && (
        <div className="slideover-root">
          <button type="button" className="slideover-scrim" aria-label="Close slideover" onClick={() => setSlideover(false)} />
          <aside className="slideover-panel">
            <div className="drawer-head">
              <h2>Select Investment</h2>
              <div className="head-actions">
                <button type="button" className="btn-outline" onClick={() => setSlideover(false)}>
                  Close
                </button>
                <button type="button" className="btn-primary" onClick={saveSlideover}>
                  Save
                </button>
              </div>
            </div>
            <div className="picker">
              <div className="col">
                <h3>Add Investements</h3>
                <div className="search-box">
                  <Icon name="search" className="icon-14" />
                  <input
                    placeholder="Search by plan name & ID"
                    value={leftQ}
                    onChange={(e) => setLeftQ(e.target.value)}
                  />
                </div>
                <div className="meta-row">
                  <span>
                    <b>{CATALOG.length}</b> Plan(s)
                  </span>
                  <button type="button" className="link" onClick={() => setDraft([...CATALOG])}>
                    Add all <Icon name="angles-right" className="icon-10" />
                  </button>
                </div>
                <div className="plan-list">
                  {leftList.map((p) => (
                    <PlanCard key={p.id} plan={p} action="add" onAction={() => addInvestment(p)} />
                  ))}
                </div>
              </div>
              <div className="divider-v" />
              <div className="col">
                <h3>Added Investments</h3>
                <div className="search-box">
                  <Icon name="search" className="icon-14" />
                  <input
                    placeholder="Search by plan name & ID"
                    value={rightQ}
                    onChange={(e) => setRightQ(e.target.value)}
                  />
                </div>
                <div className="meta-row">
                  <button type="button" className="link danger" onClick={() => setDraft([])}>
                    × Remove all
                  </button>
                  <span>
                    <b>{pad(draft.length)}</b> Plan(s) added
                  </span>
                </div>
                <div className="plan-list">
                  {rightList.map((p) => (
                    <PlanCard key={p.id} plan={p} action="remove" onAction={() => removeInvestment(p.id)} />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Rail({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button type="button" className={`rail-item ${active ? "active" : ""}`}>
      <Icon name={icon} className="icon-rail" />
      <span>{label}</span>
    </button>
  );
}

function HeaderCell({ label }: { label: string }) {
  return (
    <div>
      {label}
      <Icon name="sort" className="icon-sort" />
    </div>
  );
}

function PlanCard({
  plan,
  action,
  onAction,
}: {
  plan: Investment;
  action: "add" | "remove";
  onAction: () => void;
}) {
  return (
    <article className="plan-card">
      <div className="top">
        <div className="id">
          <span style={{ fontWeight: 600, color: "#575757" }}>{plan.idKind}</span>
          <span style={{ fontWeight: 700 }}>{plan.code}</span>
        </div>
        {action === "add" ? (
          <button type="button" className="link" onClick={onAction}>
            Click to add <Icon name="angles-right" className="icon-10" />
          </button>
        ) : (
          <button type="button" className="link danger" onClick={onAction}>
            Click to Remove ×
          </button>
        )}
      </div>
      <h4>{plan.name}</h4>
      <div className="type">
        Investment type : <b>{plan.type}</b>
      </div>
    </article>
  );
}

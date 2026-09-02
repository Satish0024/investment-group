export type Investment = {
  id: string;
  idKind: "CUSIP" | "Plan ID";
  code: string;
  name: string;
  type: string;
};

export type Company = {
  id: string;
  name: string;
  plans: number;
  logo?: string;
  initials?: string;
};

export type GroupRow = {
  id: string;
  name: string;
  description: string;
  items: Investment[];
  advisor: string;
  reps: string[];
  status: "Open";
};

export const COMPANIES: Company[] = [
  {
    id: "fhf",
    name: "Family Health of Five Corporation",
    plans: 10,
    logo: "/assets/growth-logo.png",
  },
  { id: "gc", name: "Global Corporation", plans: 10, initials: "GC" },
  { id: "md", name: "Massive Dynamic", plans: 10, initials: "MD" },
];

export const GLOBAL_NAV = [
  "Investment",
  "Clearing partner",
  "Advisor",
  "Holiday calendar",
  "Plan group",
  "Investment group",
  "Annuity factor",
  "Schedule extension",
];

export const ADVISORS = ["Captrust advisors", "Fidelity advisors", "Vanguard advisors"];

export const REPRESENTATIVES = ["Jon Carter", "Paul Jason", "Samuel Johnson", "Peter", "Maria Chen", "Alex Rivera"];

export const CATALOG: Investment[] = [
  { id: "i1", idKind: "CUSIP", code: "123NJK123", name: "Target retirement fund", type: "Mutual Fund" },
  { id: "i2", idKind: "CUSIP", code: "124542ADD", name: "Vanguard Total stock market fund", type: "Mutual Fund" },
  { id: "i3", idKind: "CUSIP", code: "123NJK123", name: "Target retirement fund", type: "Mutual Fund" },
  { id: "i4", idKind: "CUSIP", code: "ABCI09WER", name: "NLG annuity", type: "Annuity" },
  { id: "i5", idKind: "CUSIP", code: "9220912312", name: "Aggressive growth fund", type: "ETF" },
  { id: "i6", idKind: "Plan ID", code: "124542", name: "Employee stock ownership plan", type: "Mutual Fund" },
  { id: "i7", idKind: "CUSIP", code: "99120K441", name: "Balanced income fund", type: "Mutual Fund" },
  { id: "i8", idKind: "CUSIP", code: "44821L009", name: "International equity index", type: "ETF" },
  { id: "i9", idKind: "Plan ID", code: "778210", name: "Stable value fund", type: "Annuity" },
];

const SEED_ITEMS = CATALOG.slice(0, 3);
const SEED_REPS = ["Jon Carter", "Paul Jason", "Samuel Johnson", "Peter"];

export const DEFAULT_GROUPS: GroupRow[] = [
  {
    id: "g1",
    name: "Target Retirement Fund",
    description: "",
    items: SEED_ITEMS,
    advisor: "Captrust advisors",
    reps: SEED_REPS,
    status: "Open",
  },
  {
    id: "g2",
    name: "Target Retirement Fund",
    description: "",
    items: SEED_ITEMS,
    advisor: "Captrust advisors",
    reps: SEED_REPS,
    status: "Open",
  },
];

export const SUCCESS_GROUP: GroupRow = {
  id: "g-success",
  name: "401(k) NLG Investment",
  description: "Testing group 001",
  items: SEED_ITEMS,
  advisor: "Captrust advisors",
  reps: SEED_REPS,
  status: "Open",
};

export const PROTOTYPE_NAME = "401(k) NLG Investment";
export const PROTOTYPE_DESC = "Testing group 001";

export const PICKED_IDS = ["i1", "i4", "i5"];

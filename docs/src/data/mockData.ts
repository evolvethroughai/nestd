import {
  TodayTask,
  ChitItem,
  EmiLoanItem,
  BillItem,
  SubBillItem,
  GroceryItem,
  QuickTaskCategory,
  AutomationLog,
} from '../types';

export const USER_AVATAR = '/src/assets/images/user_avatar_jeevan_1791962658260.jpg';
export const MINDFULNESS_ANCHOR = '/src/assets/images/morning_mindfulness_anchor_1791962658077.jpg';

// Initial Chits (matching docs/js/data.js & life-chits.js)
export const INITIAL_CHITS: ChitItem[] = [
  {
    id: 'ch-1',
    name: 'Shriram 15K',
    monthlyAmt: 15000,
    pot: 450000,
    totalMonths: 30,
    startDate: '2024-05-05',
    dueDay: 5,
    status: 'paying',
    note: 'Shriram Chits Hyderabad',
    lifted: true,
    liftedDate: '2025-06-05',
    liftedMonth: 14,
    commission: 5000,
    amtReceived: 445000,
  },
  {
    id: 'ch-2',
    name: 'Kapil Chit 10K',
    monthlyAmt: 10000,
    pot: 250000,
    totalMonths: 25,
    startDate: '2025-01-10',
    dueDay: 10,
    status: 'paying',
    note: 'Kapil Chits Jubilee Hills (Payout pool in 3 months)',
    lifted: false,
  },
];

// Initial EMIs / Loans (matching docs/js/life-emis.js)
export const INITIAL_EMIS: EmiLoanItem[] = [
  {
    id: 'em-1',
    name: 'SBI Maxgain Home Loan',
    loanAmt: 2800000,
    interestRate: 8.5,
    tenureMonths: 240,
    emiAmt: 24800,
    startDate: '2022-03-10',
    dueDay: 10,
    note: 'SBI Maxgain OD Account',
    status: 'active',
    partPayments: [
      { id: 'pp-1', amt: 50000, date: '2024-04-12' },
      { id: 'pp-2', amt: 75000, date: '2024-11-20' },
    ],
  },
  {
    id: 'em-2',
    name: 'Car Loan (HDFC)',
    loanAmt: 650000,
    interestRate: 9.2,
    tenureMonths: 60,
    emiAmt: 13560,
    startDate: '2023-08-05',
    dueDay: 5,
    note: 'HDFC Auto Loan',
    status: 'active',
    partPayments: [],
  },
];

// Initial Bills & Connections (matching docs/js/data.js & life-bills.js)
export const INITIAL_BILLS: BillItem[] = [
  { id: 'bill1', name: 'Electricity (TGSPDCL)', icon: '💡', amt: '2140', due: 'In 2 days', note: 'TSSPDCL Meters', paid: false },
  { id: 'bill2', name: 'Water', icon: '💧', amt: '450', due: '15th', note: 'HMWS&SB', paid: false },
  { id: 'bill3', name: 'Jio Fibernet', icon: '📡', amt: '785', due: '22nd', note: 'High-speed broadband', paid: false },
  { id: 'bill4', name: 'Mobile Recharge', icon: '📱', amt: '699', due: '28th', note: 'Airtel / Jio postpaid', paid: false },
  { id: 'bill5', name: 'Property Tax', icon: '🏠', amt: '4200', due: 'Annual', note: 'GHMC municipal tax', paid: false, yearly: true },
  { id: 'bill6', name: 'Gas (LPG / Indane)', icon: '🔥', amt: '680', due: '15th', note: 'Indane Gas cylinders', paid: false },
];

export const INITIAL_SUB_BILLS: SubBillItem[] = [
  { id: 'sb01', parentId: 'bill1', name: 'Meter 1 (Main Residence)', consumerNo: '104829104', dueDay: 15, paid: false, lastAmt: 1240 },
  { id: 'sb02', parentId: 'bill1', name: 'Meter 2 (Upper Floor)', consumerNo: '104829105', dueDay: 15, paid: false, lastAmt: 900 },
  { id: 'sb03', parentId: 'bill2', name: 'Water – Connection 1', consumerNo: '8820419', dueDay: 15, paid: false, lastAmt: 450 },
  { id: 'sb04', parentId: 'bill4', name: 'Airtel Primary (98490XXXXX)', consumerNo: '9849012345', dueDay: 28, paid: false, lastAmt: 699 },
  { id: 'sb05', parentId: 'bill6', name: 'Indane Cylinder 1', consumerNo: 'LPG-829104', dueDay: 15, paid: false, lastAmt: 680 },
];

// Initial Groceries matching docs/js/data.js and grocery.js
export const INITIAL_GROCERIES: GroceryItem[] = [
  // --- BUY NOW (Pending Shopping List) ---
  { id: 'g-cur-1', name: 'Ghee', group: 'Staples / food', store: 'Ratnadeep', needed: true, completed: false, quantity: '500 ml', price: '380' },
  { id: 'g-cur-2', name: 'Kandi pappu', group: 'Staples / food', store: 'DMart', needed: true, completed: false, quantity: '2 kg', price: '340' },
  { id: 'g-cur-3', name: 'Minapappu', group: 'Staples / food', store: 'DMart', needed: true, completed: false, quantity: '500 g', price: '95' },
  { id: 'g-cur-4', name: 'Shanagapappu', group: 'Staples / food', store: 'DMart', needed: true, completed: false, quantity: '1 kg', price: '120' },
  { id: 'g-cur-5', name: 'Upma rava', group: 'Staples / food', store: 'Ratnadeep', needed: true, completed: false, quantity: '1 kg', price: '65' },
  { id: 'g-cur-6', name: 'Santoor', group: 'Household / personal', store: 'Ratnadeep', needed: true, completed: false, quantity: '3 pack', price: '110' },
  { id: 'g-cur-7', name: 'Gillette / shaving blades', group: 'Household / personal', store: 'DMart', needed: true, completed: false, quantity: '1 pack', price: '145' },
  { id: 'g-cur-8', name: 'Agarbathi', group: 'Pooja', store: 'General Store', needed: true, completed: false, quantity: '2 boxes', price: '80' },
  { id: 'g-cur-9', name: 'Aarti kapoor', group: 'Pooja', store: 'General Store', needed: true, completed: false, quantity: '1 box', price: '60' },
  { id: 'g-cur-10', name: 'Pomegranate', group: 'Fruit', store: 'Ratnadeep', needed: true, completed: false, quantity: '1 kg', price: '180' },
  { id: 'g-cur-11', name: 'Almonds / Badam', group: 'Nuts, seeds and snacks', store: 'DMart', needed: true, completed: false, quantity: '500 g', price: '450' },

  // --- MASTER LIST (Staples / food) ---
  { id: 'gm-s-1', name: 'Idly rava', group: 'Staples / food', store: 'DMart', needed: false, completed: false, quantity: '1 kg', lastBought: '28 Sep 2026' },
  { id: 'gm-s-2', name: 'Semiya', group: 'Staples / food', store: 'DMart', needed: false, completed: false, quantity: '500 g', lastBought: '15 Sep 2026' },
  { id: 'gm-s-3', name: 'Murmuralu', group: 'Staples / food', store: 'General Store', needed: false, completed: false, quantity: '1 pack', lastBought: '20 Sep 2026' },
  { id: 'gm-s-4', name: 'Soya mini', group: 'Staples / food', store: 'DMart', needed: false, completed: false, quantity: '2 packets', lastBought: '10 Sep 2026' },
  { id: 'gm-s-5', name: 'Otti mirapakaya', group: 'Staples / food', store: 'General Store', needed: false, completed: false, quantity: '200 g', lastBought: '05 Sep 2026' },
  { id: 'gm-s-6', name: 'Avalu (small)', group: 'Staples / food', store: 'General Store', needed: false, completed: false, quantity: '100 g' },
  { id: 'gm-s-7', name: 'Nuvvulu', group: 'Staples / food', store: 'Ratnadeep', needed: false, completed: false, quantity: '200 g' },
  { id: 'gm-s-8', name: 'Jeelakarra', group: 'Staples / food', store: 'Ratnadeep', needed: false, completed: false, quantity: '200 g' },
  { id: 'gm-s-9', name: 'Oils (Sunflower & Groundnut)', group: 'Staples / food', store: 'DMart', needed: false, completed: false, quantity: '2 L', lastBought: '02 Oct 2026' },
  { id: 'gm-s-10', name: 'Rock salt', group: 'Staples / food', store: 'DMart', needed: false, completed: false, quantity: '1 kg', lastBought: '18 Sep 2026' },
  { id: 'gm-s-11', name: 'Plain oats', group: 'Staples / food', store: 'Ratnadeep', needed: false, completed: false, quantity: '1 kg' },
  { id: 'gm-s-12', name: 'Masala oats', group: 'Staples / food', store: 'Ratnadeep', needed: false, completed: false, quantity: '500 g' },

  // --- MASTER LIST (Household / personal) ---
  { id: 'gm-h-1', name: 'Moisturizer', group: 'Household / personal', store: 'Ratnadeep', needed: false, completed: false, quantity: '1 bottle' },
  { id: 'gm-h-2', name: 'Floor cleaner (2)', group: 'Household / personal', store: 'DMart', needed: false, completed: false, quantity: '2 bottles', lastBought: '25 Sep 2026' },
  { id: 'gm-h-3', name: 'Harpic', group: 'Household / personal', store: 'DMart', needed: false, completed: false, quantity: '1 L', lastBought: '12 Oct 2026' },
  { id: 'gm-h-4', name: 'Pitamber', group: 'Household / personal', store: 'General Store', needed: false, completed: false, quantity: '200 g', lastBought: '12 Oct 2026' },
  { id: 'gm-h-5', name: 'Sabena', group: 'Household / personal', store: 'General Store', needed: false, completed: false, quantity: '1 kg', lastBought: '12 Oct 2026' },

  // --- MASTER LIST (Fruit) ---
  { id: 'gm-f-1', name: 'Guava', group: 'Fruit', store: 'Local Mandi', needed: false, completed: false, quantity: '1 kg' },
  { id: 'gm-f-2', name: 'Dragon fruit', group: 'Fruit', store: 'Ratnadeep', needed: false, completed: false, quantity: '2 pcs' },
  { id: 'gm-f-3', name: 'Apple', group: 'Fruit', store: 'Ratnadeep', needed: false, completed: false, quantity: '1 kg', lastBought: '08 Oct 2026' },
  { id: 'gm-f-4', name: 'Banana', group: 'Fruit', store: 'Local Mandi', needed: false, completed: false, quantity: '1 dozen' },
  { id: 'gm-f-5', name: 'Papaya', group: 'Fruit', store: 'Local Mandi', needed: false, completed: false, quantity: '1 pc' },
  { id: 'gm-f-6', name: 'Orange / Mosambi', group: 'Fruit', store: 'Local Mandi', needed: false, completed: false, quantity: '1 kg' },
  { id: 'gm-f-7', name: 'Kiwi', group: 'Fruit', store: 'Ratnadeep', needed: false, completed: false, quantity: '3 pcs' },

  // --- MASTER LIST (Nuts, seeds and snacks) ---
  { id: 'gm-n-1', name: 'Walnuts', group: 'Nuts, seeds and snacks', store: 'DMart', needed: false, completed: false, quantity: '250 g' },
  { id: 'gm-n-2', name: 'Cashews / Jeedi pappu', group: 'Nuts, seeds and snacks', store: 'DMart', needed: false, completed: false, quantity: '250 g', lastBought: '22 Sep 2026' },
  { id: 'gm-n-3', name: 'Pistachios', group: 'Nuts, seeds and snacks', store: 'DMart', needed: false, completed: false, quantity: '200 g' },
  { id: 'gm-n-4', name: 'Peanuts / Pallilu', group: 'Nuts, seeds and snacks', store: 'DMart', needed: false, completed: false, quantity: '1 kg' },
  { id: 'gm-n-5', name: 'Chia seeds', group: 'Nuts, seeds and snacks', store: 'Ratnadeep', needed: false, completed: false, quantity: '200 g' },
  { id: 'gm-n-6', name: 'Dates (fresh and dry)', group: 'Nuts, seeds and snacks', store: 'Ratnadeep', needed: false, completed: false, quantity: '500 g' },

  // --- WEEKLY VEGETABLES (Friday / Saturday Mandi list) ---
  { id: 'gv-1', name: 'Spinach', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '2 bunches', price: '40' },
  { id: 'gv-2', name: 'Aloo (Potatoes)', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '2 kg', price: '70' },
  { id: 'gv-3', name: 'Tomato', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '1 kg', price: '45' },
  { id: 'gv-4', name: 'Bhindi (okra)', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '500 g', price: '35' },
  { id: 'gv-5', name: 'Carrot', group: 'Vegetables', store: 'Organic Farm', needed: true, completed: false, quantity: '500 g', price: '40' },
  { id: 'gv-6', name: 'Cucumber', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '500 g', price: '30' },
  { id: 'gv-7', name: 'Lemon', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '4 pcs', price: '20' },
  { id: 'gv-8', name: 'Bottle gourd', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '1 pc', price: '30' },
  { id: 'gv-9', name: 'Brinjal', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '500 g', price: '35' },
  { id: 'gv-10', name: 'Green dark chillies', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '250 g', price: '25' },
  { id: 'gv-11', name: 'Beetroot', group: 'Vegetables', store: 'Organic Farm', needed: true, completed: false, quantity: '500 g', price: '30' },
  { id: 'gv-12', name: 'Broccoli', group: 'Vegetables', store: 'Organic Farm', needed: false, completed: false, quantity: '1 pc', price: '60' },
  { id: 'gv-13', name: 'Cabbage', group: 'Vegetables', store: 'Local Mandi', needed: false, completed: false, quantity: '1 pc', price: '35' },
  { id: 'gv-14', name: 'Capsicum', group: 'Vegetables', store: 'Organic Farm', needed: false, completed: false, quantity: '500 g', price: '50' },
  { id: 'gv-15', name: 'Ridge gourd', group: 'Vegetables', store: 'Local Mandi', needed: false, completed: false, quantity: '500 g', price: '35' },
  { id: 'gv-16', name: 'Drumstick', group: 'Vegetables', store: 'Local Mandi', needed: false, completed: false, quantity: '3 pcs', price: '30' },
  { id: 'gv-17', name: 'Pumpkin', group: 'Vegetables', store: 'Local Mandi', needed: false, completed: false, quantity: '1 slice', price: '30' },
  { id: 'gv-18', name: 'Methi leaves', group: 'Vegetables', store: 'Local Mandi', needed: false, completed: false, quantity: '2 bunches', price: '30' },
  { id: 'gv-19', name: 'Coriander leaves', group: 'Vegetables', store: 'Local Mandi', needed: true, completed: false, quantity: '1 bunch', price: '15' },

  // --- ALREADY BOUGHT (History in last 3 months) ---
  { id: 'gb-1', name: 'Double-edge blades', group: 'Household / personal', store: 'DMart', needed: false, completed: true, quantity: '1 pack', price: '120', boughtDate: '2026-10-12', lastBought: '12 Oct 2026' },
  { id: 'gb-2', name: 'Pitamber', group: 'Household / personal', store: 'General Store', needed: false, completed: true, quantity: '200 g', price: '65', boughtDate: '2026-10-12', lastBought: '12 Oct 2026' },
  { id: 'gb-3', name: 'Harpic', group: 'Household / personal', store: 'DMart', needed: false, completed: true, quantity: '1 L', price: '140', boughtDate: '2026-10-12', lastBought: '12 Oct 2026' },
  { id: 'gb-4', name: 'Sabena', group: 'Household / personal', store: 'General Store', needed: false, completed: true, quantity: '1 kg', price: '45', boughtDate: '2026-10-12', lastBought: '12 Oct 2026' },
  { id: 'gb-5', name: 'Oils', group: 'Staples / food', store: 'DMart', needed: false, completed: true, quantity: '2 L', price: '280', boughtDate: '2026-10-05', lastBought: '05 Oct 2026' },
  { id: 'gb-6', name: 'Rock salt', group: 'Staples / food', store: 'DMart', needed: false, completed: true, quantity: '1 kg', price: '30', boughtDate: '2026-10-05', lastBought: '05 Oct 2026' },
];

export const INITIAL_TODAY_TASKS: TodayTask[] = [
  {
    id: 't-1',
    title: 'Approve Q4 Payroll Dist...',
    time: '10:00 AM',
    category: 'Finance team',
    tag: '• Urgent',
    tagType: 'urgent',
    completed: false,
    timeOfDay: 'morning',
  },
  {
    id: 't-2',
    title: 'Prepare Investor Pitch De...',
    time: '1:30 PM',
    category: 'Growth & metrics',
    tag: '• Work',
    tagType: 'work',
    completed: false,
    timeOfDay: 'afternoon',
  },
  {
    id: 't-3',
    title: 'Book Pediatrician Check...',
    time: '4:00 PM',
    category: 'Dr. Warren Clinic',
    tag: '• Family',
    tagType: 'family',
    completed: false,
    timeOfDay: 'afternoon',
  },
  {
    id: 't-4',
    title: 'Pick up dry cleaning & ...',
    time: '6:45 PM',
    category: 'Main Street',
    tag: '• Personal',
    tagType: 'personal',
    completed: false,
    timeOfDay: 'evening',
  },
  {
    id: 't-5',
    title: 'Drink 500ml morning water...',
    time: '7:00 AM',
    category: 'Hydration anchor',
    tag: 'Done',
    tagType: 'done',
    completed: true,
    completedAt: '7:15 AM',
    timeOfDay: 'morning',
  },
  {
    id: 't-6',
    title: '15-minute sunlight walk & stretch',
    time: '7:30 AM',
    category: 'Morning routine',
    tag: 'Done',
    tagType: 'done',
    completed: true,
    completedAt: '7:45 AM',
    timeOfDay: 'morning',
  },
  {
    id: 't-7',
    title: 'Review daily priority list & standup prep',
    time: '8:45 AM',
    category: 'Team alignment',
    tag: 'Done',
    tagType: 'done',
    completed: true,
    completedAt: '8:55 AM',
    timeOfDay: 'morning',
  },
];

export const INITIAL_QUICK_TASKS: QuickTaskCategory[] = [
  {
    id: 'qt-biz',
    name: 'Primary Business',
    icon: '🚀',
    tasksCount: 4,
    colorScheme: 'purple',
    tasks: [
      { id: 'b-1', title: 'Define product concept, naming and target audience', completed: false },
      { id: 'b-2', title: 'Define course structure (DevOps, AI, Cloud)', completed: false },
      { id: 'b-3', title: 'Build landing page and website', completed: false },
      { id: 'b-4', title: 'Plan live classes (~2x/week) and session portal', completed: false },
    ],
  },
  {
    id: 'qt-car',
    name: 'Career & DevOps',
    icon: '💼',
    tasksCount: 4,
    colorScheme: 'blue',
    tasks: [
      { id: 'w-1', title: 'Azure DevOps YAML / Terraform state learning module', completed: false },
      { id: 'w-2', title: 'GitLab CI/CD and SonarQube quality gates', completed: false },
      { id: 'w-3', title: 'Kubernetes Gateway API & Helm configs', completed: false },
      { id: 'w-4', title: 'Azure DevOps YAML and cloud architecture interview prep', completed: false },
    ],
  },
  {
    id: 'qt-urg',
    name: 'Urgent & Time-sensitive',
    icon: '🔴',
    tasksCount: 2,
    colorScheme: 'rose',
    tasks: [
      { id: 'u-1', title: "Call for Mom's dental appointment / sleep study", completed: false },
      { id: 'u-2', title: "Submit Mom's medical bills online / NUID apply", completed: false },
    ],
  },
  {
    id: 'qt-fin',
    name: 'Finance & Admin',
    icon: '💰',
    tasksCount: 3,
    colorScheme: 'amber',
    tasks: [
      { id: 'f-1', title: 'Bills and time-sensitive payments review', completed: false },
      { id: 'f-2', title: 'Savings and investments portfolio balancing', completed: false },
      { id: 'f-3', title: 'Marriage-related financial planning & gold planning', completed: false },
    ],
  },
  {
    id: 'qt-fam',
    name: 'Family & Personal',
    icon: '👨‍👩‍👦',
    tasksCount: 3,
    colorScheme: 'emerald',
    tasks: [
      { id: 'fa-1', title: 'Marriage-related tasks and follow-ups', completed: false },
      { id: 'fa-2', title: 'Family shopping and responsibilities', completed: false },
      { id: 'fa-3', title: 'Medical / admin requirements for parents', completed: false },
    ],
  },
  {
    id: 'qt-err',
    name: 'Errands & Outings',
    icon: '🚗',
    tasksCount: 3,
    colorScheme: 'purple',
    tasks: [
      { id: 'e-1', title: 'Mom sarees for Dussehra', completed: false },
      { id: 'e-2', title: 'Gold ring check / purchase', completed: false },
      { id: 'e-3', title: 'Rat mesh & dashcam installation for car', completed: false },
    ],
  },
  {
    id: 'qt-home',
    name: 'Home Setup',
    icon: '🏠',
    tasksCount: 3,
    colorScheme: 'emerald',
    tasks: [
      { id: 'h-1', title: 'Gas stove servicing', completed: false },
      { id: 'h-2', title: 'Extra CC cameras fitting', completed: false },
      { id: 'h-3', title: 'Concrete work in front of main gate', completed: false },
    ],
  },
  {
    id: 'qt-olx',
    name: 'OLX: Sell',
    icon: '📦',
    tasksCount: 3,
    colorScheme: 'blue',
    tasks: [
      { id: 'o-1', title: 'Sell old laptop', completed: false },
      { id: 'o-2', title: 'Sell gaming mouse', completed: false },
      { id: 'o-3', title: 'Sell exhaust fan', completed: false },
    ],
  },
  {
    id: 'qt-med',
    name: 'Content & Media',
    icon: '🎬',
    tasksCount: 3,
    colorScheme: 'amber',
    tasks: [
      { id: 'm-1', title: 'YouTube / Instagram video recording', completed: false },
      { id: 'm-2', title: 'Telugu song recording / Sangeetham practice', completed: false },
      { id: 'm-3', title: 'Podcast setup & mic calibration', completed: false },
    ],
  },
];

// Initial Investments (matching docs/js/data.js & life.js)
export const INITIAL_INVESTMENTS: import('../types').InvestmentItem[] = [
  { id: 'inv-1', name: 'Nippon India Small Cap SIP', amt: '5000', due: '10th', paid: false, note: 'Direct Growth Plan', icon: '📈' },
  { id: 'inv-2', name: 'Parag Parikh Flexi Cap Fund', amt: '10000', due: '15th', paid: false, note: 'Long term compounding', icon: '🌱' },
  { id: 'inv-3', name: 'Sovereign Gold Bonds (SGB)', amt: '15000', due: 'Quarterly', paid: true, note: 'RBI tranche gold hedge', icon: '🪙' },
  { id: 'inv-4', name: 'Public Provident Fund (PPF)', amt: '12500', due: '5th', paid: true, note: 'SBI PPF Account', icon: '🛡️' },
];

// Initial Health (Medicines & Appointments from docs/js/data.js & life.js)
export const INITIAL_HEALTH: import('../types').HealthItem[] = [
  { id: 'hl-1', name: "Mom's Calcium & Vit D3 restock", htype: 'med', amt: '850', due: 'In 3 days', note: 'Ratnadeep Pharmacy / Apollo', icon: '💊' },
  { id: 'hl-2', name: 'Omega 3 Fish Oil & Multivitamins', htype: 'med', amt: '1200', due: 'Next week', note: '1 daily after breakfast', icon: '💊' },
  { id: 'hl-3', name: 'Dental Checkup & Sleep Study Follow-up', htype: 'appt', amt: '1500', due: 'Tomorrow 10:30 AM', note: 'Dr. Warren Dental Care', icon: '🏥' },
  { id: 'hl-4', name: 'Annual Executive Health Checkup', htype: 'appt', amt: '3500', due: '25th Oct', note: 'Apollo Health City', icon: '🏥' },
];

// Initial Business (matching st.biz2 from docs/js/data.js)
export const INITIAL_BUSINESS: import('../types').BusinessState = {
  ideas: [
    { id: 'biz-id-1', name: 'DevOps & AI Cloud Masterclass', note: 'Live interactive weekend batches + self-paced labs' },
    { id: 'biz-id-2', name: 'Faceless Tech & AI Channel', note: 'YouTube & Instagram high-retention explainers' },
    { id: 'biz-id-3', name: 'Educational Podcast & Sangeetham Practice', note: 'Audio episodes on tech & music' },
  ],
  activeId: 'biz-id-1',
  tasks: [
    { id: 'bt-1', title: 'Define course curriculum: Terraform, Helm, CI/CD gates', completed: true },
    { id: 'bt-2', title: 'Design landing page and pricing tiers', completed: false },
    { id: 'bt-3', title: 'Set up Razorpay / Stripe subscription gateway', completed: false },
    { id: 'bt-4', title: 'Schedule announcement webinar for community', completed: false },
  ],
};

export const INITIAL_AUTOMATIONS: AutomationLog[] = [
  {
    id: 'auto-1',
    item: 'Fresh Coriander (1 bunch)',
    destination: 'Pantry',
    destinationCategory: 'Grocery',
    timeAgo: 'Just now',
    timestamp: Date.now() - 1000 * 30,
  },
  {
    id: 'auto-2',
    item: 'BESCOM electricity bill',
    destination: 'Life OS · Bills',
    destinationCategory: 'Bills',
    timeAgo: '12m ago',
    timestamp: Date.now() - 1000 * 60 * 12,
  },
];

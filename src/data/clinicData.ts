export interface Doctor {
  id: string;
  name: string;
  role: string;
  experience: string;
  education: string;
  specialization: string;
  image: string;
  scheduleBadge?: string;
  days?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: {
    name: string;
    price: string;
    note?: string;
  }[];
}

export interface CaseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  service: string;
  beforeImg: string;
  afterImg: string;
  tabLabel?: string;
  duration?: string;
  doctor?: string;
  resultMetric?: string;
}

export interface ReviewItem {
  author: string;
  rating: number;
  date: string;
  text: string;
  source: string;
  tag: string;
}

export const DOCTORS: Doctor[] = [
  {
    id: "gnatenko",
    name: "Гнатенко Євген Валерійович",
    role: "Головний лікар, хірург-імплантолог",
    experience: "8 років досвіду",
    education: "Одеський національний медичний університет",
    specialization: "Дентальна імплантація Straumann & NeoDent, синусліфтинг, кісткова пластика за 3D-шаблонами",
    image: "assets/team/gnatenko.jpg",
    scheduleBadge: "🟢 Найближчий запис: Завтра, 11:00",
  },
  {
    id: "sribnyak",
    name: "Срібняк Олексій Богданович",
    role: "Стоматолог-хірург вищої категорії",
    experience: "15 років досвіду",
    education: "Українська медична стоматологічна академія",
    specialization: "Атипове видалення зубів мудрості, кісткова регенерація, робота під седацією",
    image: "assets/team/sribnyak.jpg",
    scheduleBadge: "🟢 Прийом під седацією: Вт, Чт",
  },
  {
    id: "kostenko",
    name: "Костенко Світлана Сергіївна",
    role: "Лікар-ортодонт, магістр ОНМедУ",
    experience: "6 років досвіду",
    education: "Магістр ОНМедУ, управління охороною здоров'я",
    specialization: "Самолігуючі брекет-системи, виправлення складних патологій прикусу, сплінт-терапія СНЩС",
    image: "assets/team/kostenko.jpg",
    scheduleBadge: "🟢 Консультація ортодонта: Завтра",
  },
  {
    id: "sheremet",
    name: "Шеремет Юлія Валентинівна",
    role: "Терапевт-ортопед",
    experience: "6 років досвіду",
    education: "ОНМедУ, інтернатура ВМКЦ Південного регіону",
    specialization: "Ендодонтія під дентальним мікроскопом, нанокерамічні реставрації, лікування TMD",
    image: "assets/team/sheremet.jpg",
    scheduleBadge: "🟢 Вільні години: Сьогодні о 16:30",
  },
  {
    id: "purlo",
    name: "Пурло Яна Ігорівна",
    role: "Терапевт-ендодонтист",
    experience: "7 років досвіду",
    education: "ОНМедУ, сертифікація інституту Fenestra (ENDO5)",
    specialization: "Складне переліковування кореневих каналів, збереження безнадійних зубів",
    image: "assets/team/purlo.jpg",
    scheduleBadge: "🟢 Ендодонтія під мікроскопом: Пт",
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "diag",
    title: "Діагностика",
    icon: "Scan",
    description: "Власний діагностичний центр 3D КЛКТ у центрі Одеси",
    items: [
      { name: "Первинна консультація лікаря-стоматолога", price: "300 грн" },
      { name: "Складання комплексного плану лікування", price: "500 грн" },
      { name: "Прицільний комп'ютерний рентген-знімок", price: "100 грн" },
      { name: "Панорамний знімок (ОПТГ)", price: "300 грн" },
      { name: "Телерентгенографія (ТРГ)", price: "350 грн" },
      { name: "3D КЛКТ томографія (1 щелепа)", price: "700 грн" },
      { name: "3D КЛКТ томографія (2 щелепи)", price: "900 грн" },
      { name: "КЛКТ 2 щелеп + суглоби СНЩС", price: "1 400 грн" },
    ],
  },
  {
    id: "hygiene",
    title: "Гігієна та Відбілювання",
    icon: "Sparkles",
    description: "Дбайливий швейцарський протокол без пошкодження емалі",
    items: [
      { name: "Професійна гігієна апаратом EMS Air-Flow", price: "2 000 грн", note: "Ультразвук + полірування + ремінералізація" },
      { name: "Апаратне відбілювання Beyond Advanced Power", price: "5 000 грн", note: "Освітлення на 6 тонів за 45 хв" },
      { name: "Глибоке фторування та ремінералізація зубів", price: "600 грн" },
    ],
  },
  {
    id: "therapy",
    title: "Терапія та Мікроскоп",
    icon: "Activity",
    description: "Лікування карієсу та каналів під 20-кратним збільшенням",
    items: [
      { name: "Лікування поверхневого карієсу (реставрація)", price: "2 600 грн" },
      { name: "Лікування середнього карієсу", price: "2 800 грн" },
      { name: "Лікування глибокого карієсу", price: "3 100 грн" },
      { name: "Скловолоконний штифт + нарощування", price: "700 грн" },
      { name: "Ендодонтія каналів (1-канальний зуб)", price: "4 300 грн" },
      { name: "Ендодонтія каналів (3-4 канальний зуб)", price: "6 000 грн" },
      { name: "Повторне переліковування каналів під мікроскопом", price: "від 6 000 грн" },
    ],
  },
  {
    id: "ortho",
    title: "Ортодонтія та Брекети",
    icon: "Smile",
    description: "Гармонійна посмішка та правильний прикус",
    items: [
      { name: "Металева брекет-система (1 щелепа / 2 щелепи)", price: "14 000 / 25 000 грн" },
      { name: "Самолігуюча металева брекет-система", price: "22 000 / 36 000 грн" },
      { name: "Сапфірова естетична брекет-система", price: "22 000 / 36 000 грн" },
      { name: "Самолігуюча сапфірова брекет-система", price: "27 000 / 44 000 грн" },
      { name: "Ортодонтичний мікрогвинт (титан)", price: "100 $" },
      { name: "Сплінт-терапія дисфункції СНЩС", price: "від 20 000 грн" },
    ],
  },
  {
    id: "surgery",
    title: "Імплантація та Хірургія",
    icon: "ShieldCheck",
    description: "Швейцарські протоколи Straumann та навігаційні шаблони",
    items: [
      { name: "Атравматичне видалення зуба", price: "1 000 грн" },
      { name: "Атипове видалення зуба мудрості", price: "2 500 – 4 000 грн" },
      { name: "Дентал-імплантація NeoDent GM Helix (Straumann Group)", price: "450 $ (+50 $)" },
      { name: "Преміум-імплантація Straumann (Швейцарія)", price: "700 $ (+50 $)" },
      { name: "Керамічний вінір E-max (прес-кераміка)", price: "300 $ / од." },
      { name: "Цирконієва коронка на свій зуб / на імплант", price: "250 $ / 350 $" },
      { name: "Седація (лікування уві сні) 1-ша година", price: "150 $" },
    ],
  },
];

export const CASES: CaseItem[] = [
  {
    id: "case-whitening",
    tabLabel: "✨ Відбілювання",
    title: "Офісне апаратне відбілювання Beyond",
    subtitle: "Освітлення емалі на 6 тонів за 45 хвилин",
    description: "Дбайливе лазерно-світлодіодне відбілювання Beyond Power без підвищення чутливості та пошкодження структури емалі.",
    service: "Професійна гігієна та відбілювання",
    duration: "45 хвилин",
    doctor: "Шеремет Ю. В.",
    resultMetric: "+6 тонів",
    beforeImg: "assets/before_after/whitening_before.jpg",
    afterImg: "assets/before_after/whitening_after.jpg",
  },
  {
    id: "case-restoration",
    tabLabel: "💎 Реставрація",
    title: "Художня нанокерамічна реставрація",
    subtitle: "Закриття діастеми та усунення сколу",
    description: "Пряме анатомічне моделювання фронтальної зони з ідеальним відтворенням мікрорельєфу та світлопроникності емалі.",
    service: "Лікування карієсу",
    duration: "1 візит (2 год)",
    doctor: "Пурло Я. І.",
    resultMetric: "100% анатомія",
    beforeImg: "assets/before_after/case1_before.jpg",
    afterImg: "assets/before_after/case1_after.jpg",
  },
  {
    id: "case-ortho",
    tabLabel: "🦷 Брекети",
    title: "Виправлення прикусу брекет-системою",
    subtitle: "Усунення скупченості зубного ряду без видалення",
    description: "Самолігуюча система вирівнювання: створення гармонійної арки посмішки та фізіологічного змикання за 14 місяців.",
    service: "Ортодонтія та брекети",
    duration: "14 місяців",
    doctor: "Костенко С. С.",
    resultMetric: "Ідеальна дуга",
    beforeImg: "assets/before_after/case2_before.jpg",
    afterImg: "assets/before_after/case2_after.jpg",
  },
  {
    id: "case-veneers",
    tabLabel: "👑 Вініри E-max",
    title: "Керамічні прес-вініри E-max",
    subtitle: "Ювелірна естетика фронтальних зубів",
    description: "Мінімальне препарування в межах емалі (до 0.3 мм). Відновлення правильної висоти прикусу та природного білосніжного сяйва.",
    service: "Вініри та коронки",
    duration: "2 візити (7 днів)",
    doctor: "Гнатенко Є. В.",
    resultMetric: "Ультратонкі 0.3 мм",
    beforeImg: "assets/before_after/case3_before.jpg",
    afterImg: "assets/before_after/case3_after.jpg",
  },
];

export const REVIEWS: ReviewItem[] = [
  {
    author: "Олена М.",
    rating: 5,
    date: "2 тижні тому",
    text: "Дуже боялася видаляти зуби мудрості, але з седацією це просто казка — заснула, прокинулася і все готово! Жодного набряку, лікар Срібняк справжній профі!",
    source: "Google Maps",
    tag: "Видалення під седацією",
  },
  {
    author: "Максим Д.",
    rating: 5,
    date: "1 місяць тому",
    text: "Встановлював імплант Straumann у Євгена Валерійовича. Все зробили за хірургічним 3D шаблоном за 20 хвилин. Прижився ідеально. Дуже вдячний!",
    source: "Google Maps",
    tag: "Імплантація Straumann",
  },
  {
    author: "Катерина В.",
    rating: 5,
    date: "2 місяці тому",
    text: "Лікували канали під мікроскопом у Юлії Валентинівни. В іншій клініці казали видаляти, а тут зуб врятували! Величезне спасибі за збережений зуб.",
    source: "Google Maps",
    tag: "Ендодонтія під мікроскопом",
  },
  {
    author: "Артем П.",
    rating: 5,
    date: "3 місяці тому",
    text: "Ставив брекети у Світлани Сергіївни. Дуже зручно, що є оплата частинами на 3 платежі без переплат — розбили суму і бюджет взагалі не постраждав.",
    source: "Google Maps",
    tag: "Брекети • 3 платежі",
  },
  {
    author: "Ірина К.",
    rating: 5,
    date: "4 місяці тому",
    text: "Чищення зубів EMS — це небо і земля порівняно зі звичайним ультразвуком. Жодного болю, ясна не кровили, зуби стали світлішими на тон!",
    source: "Google Maps",
    tag: "Професійна гігієна EMS",
  },
];

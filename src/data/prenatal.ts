/**
 * 产检时间表的数据。孕周一律换算成"孕龄天数"存，w(11, 0) 表示孕 11 周整。
 * 依据：中华医学会妇产科学分会《孕前和孕期保健指南（2018）》。
 * 各医院的具体安排会有出入，以建档医院为准。
 */

export const w = (week: number, day = 0) => week * 7 + day;

export interface ExamWindow {
  id: string;
  name: string;
  from: number;
  to: number;
  /** 窗口内的最佳时段 */
  best?: [number, number];
  /** routine = 人人都做；choice = 几选一或按情况做 */
  kind: 'routine' | 'choice';
  /** 只有筛查高风险等情况才做的，不出现在“现在在窗口内”的提示里 */
  indicatedOnly?: boolean;
  note: string;
}

/** 有时间窗的检查：错过就不能补，所以单独拎出来 */
export const windows: ExamWindow[] = [
  { id: 'first-us', name: '首次 B 超', from: w(6), to: w(8, 6), kind: 'routine', note: '确认宫内孕、胎心胎芽，核对孕周。' },
  { id: 'nt', name: 'NT', from: w(11), to: w(13, 6), kind: 'routine', note: '只有这三周能做，热门医院要提前约。' },
  { id: 'nipt', name: '无创 DNA', from: w(12), to: w(22, 6), kind: 'choice', note: '和中期唐筛二选一，或唐筛临界风险后再做。' },
  { id: 'serum', name: '中期唐筛', from: w(15), to: w(20), best: [w(16), w(18)], kind: 'choice', note: '抽血，16–18 周做最准。' },
  { id: 'amnio', name: '羊膜腔穿刺', from: w(16), to: w(22, 6), kind: 'choice', indicatedOnly: true, note: '只有筛查高风险或有指征时才做，是诊断不是筛查。' },
  { id: 'anatomy', name: '大排畸', from: w(20), to: w(24), kind: 'routine', note: '系统超声看胎儿结构，同样要提前约。' },
  { id: 'ogtt', name: '糖耐 OGTT', from: w(24), to: w(28), kind: 'routine', note: '空腹 8 小时以上，喝糖水后 1、2 小时各抽一次血。' },
  { id: 'gbs', name: 'GBS 筛查', from: w(35), to: w(37), kind: 'routine', note: '阴道和直肠拭子，阳性的话临产时用抗生素。' },
];

export interface Visit {
  id: string;
  from: number;
  to: number;
  focus: string;
  must: string[];
  optional: string[];
  tips: string[];
}

export const visits: Visit[] = [
  {
    id: 'v1',
    from: w(6),
    to: w(13, 6),
    focus: '确认怀孕、建档、第一轮全面抽血、NT',
    must: [
      '建立孕期保健手册，核对孕周和预产期',
      '血常规、尿常规、血型（ABO 和 Rh）',
      '空腹血糖、肝功能、肾功能',
      '乙肝表面抗原、梅毒、HIV 筛查',
      '地中海贫血筛查（广东、广西、海南、湖南、湖北、四川、重庆等高发地区）',
      '早孕期超声：确认宫内孕、孕周、胎数',
    ],
    optional: [
      'NT 超声（11–13⁺⁶ 周）',
      '早期唐筛（10–13⁺⁶ 周，和 NT 一起算风险）',
      '甲状腺功能（TSH）',
      '丙肝筛查、血清铁蛋白',
      'Rh 阴性者查抗 D 抗体滴度',
      '宫颈细胞学（一年内没查过的）',
      '高危者做绒毛穿刺（10–13⁺⁶ 周）',
      '心电图',
    ],
    tips: [
      '这次抽血最多，通常要空腹。',
      '建档要带的材料各院不同，先打电话或看公众号问清楚。',
      'NT 名额紧张的医院，确认怀孕后就该约。',
    ],
  },
  {
    id: 'v2',
    from: w(14),
    to: w(19, 6),
    focus: '决定做唐筛、无创还是羊穿',
    must: ['血压、体重、宫底高度、胎心率', '分析第一次产检的结果'],
    optional: [
      '中期唐筛（15–20 周）',
      '无创 DNA（12–22⁺⁶ 周）',
      '羊膜腔穿刺（16–22 周，针对高风险）',
    ],
    tips: ['从这次起开始补铁和钙的话题，按医生建议和血常规结果定。', '把大排畸约上。'],
  },
  {
    id: 'v3',
    from: w(20),
    to: w(24),
    focus: '大排畸',
    must: ['胎儿系统超声筛查（大排畸）', '血常规、尿常规', '血压、体重、宫高、胎心'],
    optional: ['阴道超声测宫颈长度（有早产风险的）'],
    tips: ['大排畸看的是结构，宝宝姿势不配合时可能要走一走再照，或改天复查，这很常见。'],
  },
  {
    id: 'v4',
    from: w(25),
    to: w(28),
    focus: '糖耐',
    must: ['75 g 口服葡萄糖耐量试验（OGTT）', '血常规、尿常规', '血压、体重、宫高、胎心'],
    optional: ['Rh 阴性者复查抗 D 滴度', '早产高危者查胎儿纤维连接蛋白'],
    tips: [
      '糖耐前一晚 22 点后不吃东西，当天早上空腹去。前三天正常吃，不要刻意少吃主食。',
      '整个过程要在医院待两个多小时，带本书。',
    ],
  },
  {
    id: 'v5',
    from: w(29),
    to: w(32),
    focus: '看胎儿长得怎么样',
    must: ['产科超声：胎儿生长、羊水量、胎位、胎盘位置', '血常规、尿常规', '血压、体重、宫高、胎心'],
    optional: [],
    tips: ['从 28 周起每天数胎动。', '从这时起产检间隔一般缩到两周一次。'],
  },
  {
    id: 'v6',
    from: w(33),
    to: w(36),
    focus: '为分娩做评估',
    must: ['尿常规', '血压、体重、宫高、胎心、胎位'],
    optional: [
      'GBS 筛查（35–37 周）',
      '肝功能、血清胆汁酸（32–34 周，怀疑胆汁淤积时）',
      '胎心监护 NST（34 周起，高危孕妇）',
      '心电图复查',
    ],
    tips: ['待产包在 36 周前装好。', '和医生谈分娩方式和镇痛。'],
  },
  {
    id: 'v7',
    from: w(37),
    to: w(41),
    focus: '每周一次，等发动',
    must: ['产科超声：估计胎儿大小、羊水、胎位', '胎心监护 NST，每周一次', '血压、体重、宫高、胎心'],
    optional: ['宫颈检查，评估成熟度'],
    tips: ['满 41 周还没动静，医生会和你谈引产。', '见红、破水、规律宫缩，任何一个出现就按医院的要求联系或直接去。'],
  },
];

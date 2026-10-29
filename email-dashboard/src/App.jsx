import React, { useState, useEffect, useRef } from 'react';
import { Menu, Input, Select, Avatar, Button, Dropdown, Popover, Tooltip, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  SendOutlined,
  FilterOutlined,
  ThunderboltOutlined,
  DownOutlined,
  EllipsisOutlined,
  PlusOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  LoadingOutlined,
  SearchOutlined,
  SettingOutlined,
  UpOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  BarChartOutlined,
  GlobalOutlined,
  AuditOutlined,
  UserOutlined,
} from '@ant-design/icons';

/* ------------------------------ data ------------------------------ */

const topNav = ['工作台', 'AI 团队', '邮件', 'WA', '客户发现', '客户开发', '客户管理', '客户履约', '品牌建设', '协同办公'];

const sideItems = [
  {
    key: 'agent', icon: <RobotOutlined />, label: '拓客Agent',
    children: [
      {
        key: 'leads',
        label: (
          <div className="menu-badge-row">
            <span>潜客会话</span>
            <span className="pill-red">3个新会话</span>
          </div>
        ),
      },
      { key: 'comm', label: '沟通列表' },
    ],
  },
  {
    key: 'data', icon: <BarChartOutlined />, label: '数据获客',
    children: ['全球搜索', '海关数据', '场景获客', '智能引擎搜索', '智能推荐', '展会获客', '地图搜索', '社媒搜索', '工商搜索', '一带一路专题']
      .map((l) => ({ key: l, label: l })),
  },
  {
    key: 'market', icon: <GlobalOutlined />, label: '市场洞察',
    children: ['贸易分析', '智能监测'].map((l) => ({ key: l, label: l })),
  },
  { key: 'tools', icon: <AuditOutlined />, label: '找客工具', children: [{ key: 'tools-1', label: '邮箱验证' }] },
];

// level: high/mid/low；status.k: action=需要你行动 / wait=等待中 / done=你已接管
const TAKEN = { t: '你已接管 · 跟进中', k: 'done' };
const mk = (id, name, country, role, level, reasons, status, o = {}) => ({
  id, name, country, role, level, reasons, status,
  taken: false, unread: 0, isNew: false, tags: [], time: '05/29 08:00', last: '', replied: true, silent: false, ...o,
});
const A = (t) => ({ t, k: 'action' });
const W = (t) => ({ t, k: 'wait' });

const initialConvs = [
  mk(1, 'Hassan Trading', '阿联酋', '农业薄膜进口商', 'high', ['询问报价', '要求产品目录', '连续回复3次'], A('建议人工接管'), { isNew: true, unread: 2, time: '05/29 08:52', tags: ['近期在线', '需求明确', '关键买家', '有邮箱'], last: 'Hi, we need 12 tons of greenhouse film, what is your best price?' }),
  mk(2, 'Agro business', '坦桑尼亚', '农用设备经销商', 'high', ['表达采购需求', '询问 MOQ', '主动发送联系人'], A('建议人工接管'), { isNew: true, time: '05/29 08:40', tags: ['近期在线', '关键买家', '需求明确'], last: 'Hello! This is Agro from Tanzania. I would like to ask about MOQ.' }),
  mk(3, 'Auarez', '秘鲁', '印刷设备经销商', 'high', ['询问报价', '发送产品图片'], A('等待发送报价'), { unread: 1, time: '05/29 08:40', tags: ['近期在线', '关键买家', '需求明确', '有邮箱'], last: 'From this company please' }),
  mk(4, 'Al Noor Agri', '沙特', '温室工程承包商', 'high', ['表达采购需求', '要求样品'], A('建议人工接管'), { unread: 3, time: '05/29 08:12', tags: ['需求明确', '有邮箱'], last: 'Can you send samples to Riyadh? We need to test strength.' }),
  mk(5, 'Gulf Greenhouse', '阿曼', '温室建材批发商', 'high', ['询问交期', '连续回复4次'], W('等待买家回复'), { time: '05/29 07:58', tags: ['关键买家'], last: 'What is your delivery time for 10 tons?' }),
  mk(6, 'Oladotun', '加拿大', '农场主', 'high', ['要求产品目录', '询问付款方式'], TAKEN, { taken: true, time: '05/29 07:40', tags: ['关键买家', '需求明确'], last: 'Hello! This is Oladotun from Canada.' }),
  mk(7, 'Karim Farms', '约旦', '农场主', 'high', ['询问报价', '要求样品'], TAKEN, { taken: true, time: '05/29 07:21', last: 'Please send the quotation by email.' }),
  mk(8, 'Delta Agro', '埃及', '农资分销商', 'high', ['表达采购需求', '连续回复3次'], TAKEN, { taken: true, time: '05/29 07:05', last: 'We buy every month, need a stable supplier.' }),
  mk(9, 'Sahara Supply', '摩洛哥', '温室建材批发商', 'high', ['询问 MOQ', '询问付款方式'], TAKEN, { taken: true, time: '05/29 06:48', last: 'What is the payment term?' }),
  mk(10, 'Bosphorus Ag', '土耳其', '农业薄膜进口商', 'high', ['询问报价'], TAKEN, { taken: true, time: '05/29 06:30', last: 'Price for UV-resistant film?' }),
  mk(11, 'Punjab Agro', '巴基斯坦', '农资分销商', 'high', ['要求产品目录', '主动发送联系人'], TAKEN, { taken: true, time: '05/28 22:14', last: 'Sharing my WhatsApp, please call.' }),
  mk(12, 'Nile Traders', '苏丹', '农用设备经销商', 'high', ['表达采购需求'], TAKEN, { taken: true, time: '05/28 20:02', last: 'We are looking for greenhouse film suppliers.' }),
  mk(13, 'Mei Agri', '阿曼', '农资零售商', 'mid', ['询问产品规格'], W('等待买家回复'), { time: '05/29 07:10', tags: ['有邮箱'], last: 'Hello! This is Mei Agri from Oman.' }),
  mk(14, 'Green Valley', '以色列', '温室种植企业', 'mid', ['比较竞品价格'], W('Agent 跟进中'), { time: '05/29 06:55', tags: ['近期在线'], last: 'Another supplier offered a lower price.' }),
  mk(15, 'Kazan Agro', '哈萨克斯坦', '农资分销商', 'mid', ['询问运费'], A('等待发送报价'), { unread: 1, time: '05/29 06:12', last: 'How much is shipping to Almaty?' }),
  mk(16, 'Terra Farm', '伊拉克', '农场主', 'mid', ['询问认证资质'], W('等待买家回复'), { time: '05/28 23:40', last: 'Do you have ISO certificates?' }),
  mk(17, 'Fresh Plus', '科威特', '蔬果种植商', 'mid', ['询问产品规格'], W('Agent 跟进中'), { time: '05/28 21:30', last: 'What thickness do you recommend?' }),
  mk(18, 'Tom Lee', '美国', '个人买家', 'low', ['简单问候'], W('Agent 跟进中'), { isNew: true, time: '05/29 08:30', last: 'Hi there.' }),
  mk(19, 'Sunrise Co.', '印度', '贸易公司', 'low', ['简单问候'], W('等待买家回复'), { time: '05/28 18:20', last: 'Hello, nice to meet you.' }),
  mk(20, 'Baku Agri', '阿塞拜疆', '农资零售商', 'low', ['3 天未回复'], W('沉默 3 天 · 将再次触达'), { silent: true, time: '05/26 10:00', last: 'Thanks, I will check and reply.' }),
  mk(21, 'Lima Print', '秘鲁', '印刷厂', 'low', ['5 天未回复'], W('沉默 5 天 · 将再次触达'), { silent: true, replied: false, time: '05/24 09:10', last: '—' }),
  mk(22, 'Ocean Agro', '菲律宾', '农资零售商', 'low', ['7 天未回复'], W('沉默 7 天 · 将再次触达'), { silent: true, replied: false, time: '05/22 09:10', last: '—' }),
];

const VIEW_LABEL = { replied: '有效回复', high: '高意向', pending: '待接管', reply: '需回复', silent: '沉默客户' };
const isPending = (c) => c.level === 'high' && !c.taken;
const needAction = (c) => c.status.k === 'action';
const matchView = (c, v) =>
  !v || (v === 'replied' && c.replied) || (v === 'high' && c.level === 'high') || (v === 'pending' && isPending(c)) ||
  (v === 'reply' && needAction(c)) || (v === 'silent' && c.silent);
const score = (c) =>
  (isPending(c) ? 100 : 0) + (needAction(c) ? 50 : 0) + { high: 30, mid: 15, low: 0 }[c.level] + Math.min(c.unread, 3) * 2 - (c.silent ? 200 : 0);
const lvRank = { high: 3, mid: 2, low: 1 };
const SORTS = {
  smart: (a, b) => score(b) - score(a) || b.time.localeCompare(a.time),
  latest: (a, b) => b.time.localeCompare(a.time),
  featured: (a, b) => lvRank[b.level] - lvRank[a.level] || b.time.localeCompare(a.time),
  recommend: (a, b) => b.reasons.length - a.reasons.length || b.time.localeCompare(a.time),
};
const CHIP_TEST = {
  近期在线: (c) => c.tags.includes('近期在线'), 需求明确: (c) => c.tags.includes('需求明确'),
  关键买家: (c) => c.tags.includes('关键买家'), 有邮箱: (c) => c.tags.includes('有邮箱'),
  新会话: (c) => c.isNew, 未接管: (c) => !c.taken, 有新消息: (c) => c.unread > 0,
};

const initialTasks = [
  { id: 't1', title: '农用温室塑料膜', market: '中东', qty: '> 10 吨', status: 'running', reached: 328, total: 500, replied: 54, high: 12, pending: 3 },
  { id: 't2', title: '工业数码印刷机', market: '南美', qty: '> 20 台', status: 'preparing', progress: 35, reached: 0, total: 500, replied: 0, high: 0, pending: 0 },
  { id: 't3', title: '服装/服装加工辅料/拉锁及...', market: '东南亚', qty: '> 5 万件', status: 'ended', reached: 500, total: 500, replied: 86, high: 21, pending: 0 },
];

const chips = [
  { l: '近期在线' }, { l: '需求明确' }, { l: '关键买家' }, { l: '有邮箱' },
  { l: '新会话' }, { l: '未接管' }, { l: '有新消息' },
];


/* ---------------------------- components ---------------------------- */

const StatusText = ({ s }) =>
  s.k === 'action' ? <span className="status-chip">{s.t}</span> : <><span className="st-dot" />{s.t}</>;

const AVATARS = import.meta.glob('./avatars/*.svg', { eager: true, query: '?url', import: 'default' });
const avatarOf = (i) => AVATARS[`./avatars/a${String(i).padStart(2, '0')}.svg`];
const ConvAvatar = ({ size = 40, id }) =>
  id && avatarOf(id - 1)
    ? <Avatar size={size} src={avatarOf(id - 1)} />
    : <Avatar size={size} style={{ background: '#e4e2dc', color: '#6b6b66' }} icon={<UserOutlined />} />;

function TopNav() {
  return (
    <header className="topnav">
      <div className="brand">
        <span className="brand-mark">W</span>
        网易外贸通
      </div>
      <nav className="topnav-items">
        {topNav.map((t) => (
          <div key={t} className={`topnav-item ${t === '客户发现' ? 'active' : ''}`}>
            {t.startsWith('AI') ? (<><span className="ai-badge">AI</span>{t.slice(3)}</>) : t}
          </div>
        ))}
      </nav>
    </header>
  );
}

function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="side-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? '展开菜单' : '收起菜单'}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <div className="side-quick">
        <div className="side-quick-head">
          <span>常用功能</span>
          <span style={{ color: '#8f959e' }}><SettingOutlined /> &nbsp;<UpOutlined style={{ fontSize: 10 }} /></span>
        </div>
        <div className="side-quick-grid">
          <span>营销托管</span><span>全球搜索</span>
          <span>海关数据</span><span>展会获客</span>
        </div>
      </div>
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        defaultOpenKeys={['agent', 'data', 'market', 'tools']}
        defaultSelectedKeys={['leads']}
        items={sideItems}
        expandIcon={({ isOpen }) => <UpOutlined style={{ fontSize: 10, transform: isOpen ? 'none' : 'rotate(180deg)' }} />}
      />
    </aside>
  );
}

function useCountUp(target, duration = 700) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const f = from.current;
    let raf;
    const tick = () => {
      const t = performance.now();
      const p = Math.max(0, Math.min(1, (t - start) / duration));
      const val = Math.round(f + (target - f) * (1 - Math.pow(1 - p, 3)));
      from.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

const Num = ({ value }) => <>{useCountUp(value)}</>;
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const STATUS = {
  running: { text: '执行中', cls: 'running' },
  paused: { text: '已暂停', cls: 'paused' },
  preparing: { text: '准备中', cls: 'preparing' },
  ended: { text: '已结束', cls: 'ended' },
};

function Metric({ label, value, unit, sub, active, onClick, accent, children }) {
  const clickable = !!onClick;
  return (
    <div className={`metric ${clickable ? 'clickable' : ''} ${active ? 'active' : ''} ${accent ? 'accent' : ''}`} onClick={onClick}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        <Num value={value} />
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {children}
      <div className="metric-sub">{sub}</div>
    </div>
  );
}

function AgentHeader({ tasks, setTasks, curId, setCurId, metric, setMetric, pendingCount, onGo, collapsed, setCollapsed }) {
  const t = tasks.find((x) => x.id === curId);
  const st = STATUS[t.status];
  const patch = (p) => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, ...p } : x)));

  // 执行中：数据实时增长
  useEffect(() => {
    if (t.status !== 'running') return;
    const timer = setInterval(() => {
      setTasks((prev) =>
        prev.map((x) => {
          if (x.id !== curId || x.reached >= x.total) return x;
          const reached = Math.min(x.total, x.reached + 1 + Math.floor(Math.random() * 3));
          const replied = x.replied + (Math.random() < 0.3 ? 1 : 0);
          return { ...x, reached, replied };
        })
      );
    }, 2500);
    return () => clearInterval(timer);
  }, [t.status, curId, setTasks]);

  // 准备中：进度推进，完成后自动开始
  useEffect(() => {
    if (t.status !== 'preparing') return;
    const timer = setInterval(() => {
      setTasks((prev) =>
        prev.map((x) => {
          if (x.id !== curId) return x;
          const progress = Math.min(100, x.progress + 5);
          return progress >= 100 ? { ...x, progress, status: 'running', reached: 1 } : { ...x, progress };
        })
      );
    }, 1200);
    return () => clearInterval(timer);
  }, [t.status, curId, setTasks]);

  const switchItems = [
    ...tasks.map((x) => ({
      key: x.id,
      label: (
        <div className="sw-item">
          <span className={`dot ${STATUS[x.status].cls}`} />
          <span className="sw-name">{x.title}</span>
          <span className="sw-state">{STATUS[x.status].text}</span>
          {x.id === curId && <CheckOutlined style={{ color: '#3b5bdb' }} />}
        </div>
      ),
    })),
    { type: 'divider' },
    { key: 'all', label: <span style={{ color: '#3b5bdb' }}>全部任务 <RightOutlined style={{ fontSize: 10 }} /></span> },
  ];

  const moreItems = [
    t.status === 'running' && { key: 'pause', icon: <PauseCircleOutlined />, label: '暂停任务' },
    t.status === 'paused' && { key: 'resume', icon: <PlayCircleOutlined />, label: '继续任务' },
    { key: 'edit', icon: <EditOutlined />, label: '编辑任务' },
    { key: 'renew', icon: <ReloadOutlined />, label: '续期' },
  ].filter(Boolean);

  const onMore = ({ key }) => {
    if (key === 'pause') { patch({ status: 'paused' }); message.success('任务已暂停'); }
    if (key === 'resume') { patch({ status: 'running' }); message.success('任务已继续'); }
    if (key === 'edit') message.info('编辑任务（原型）');
    if (key === 'renew') { patch({ status: 'running', reached: Math.min(t.reached, t.total - 100) }); message.success('已续期，Agent 继续跟进'); }
  };

  const pending = t.id === 't1' ? pendingCount : t.pending;
  const showFunnel = t.status !== 'preparing';

  return (
    <section className={`agent-header ${collapsed ? 'collapsed' : ''}`}>
      {/* 第一行：状态 + 目标 + 操作 */}
      <div className="ah-top">
        <div className={`ah-status ${st.cls}`}>
          <span className={`dot ${st.cls}`} />
          <span className={`ah-status-text ${st.cls}`}>
            {t.status === 'running' ? 'Agent 正在跟进' : t.status === 'preparing' ? 'Agent 准备中' : t.status === 'paused' ? '任务已暂停' : '任务已结束'}
          </span>
        </div>
        <span className="ah-sep" />
        <h2 className="ah-title">寻找：{t.title}采购商</h2>
        <span className="goal-tag">市场 · {t.market}</span>
        <span className="goal-tag">预计采购量 · {t.qty}</span>

        {collapsed && showFunnel && (
          <span className="mini">触达 <b>{t.reached}</b> · 回复 <b>{t.replied}</b> · 高意向 <b>{t.high}</b></span>
        )}
        {collapsed && pending > 0 && t.status !== 'preparing' && t.status !== 'ended' && (
          <Button type="primary" className="mini-go" onClick={onGo}>{pending} 个待接管 · 去处理</Button>
        )}
        <div className="ah-actions">
          <Dropdown
            trigger={['click']}
            menu={{ items: switchItems, onClick: ({ key }) => (key === 'all' ? message.info('全部任务列表（原型）') : (setCurId(key), setMetric(null))) }}
          >
            <Button className="switcher">
              {tasks.length} 个任务 <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
          <Button type="primary" className="btn-create" icon={<PlusOutlined />} onClick={() => message.info('新建任务（原型）')}>新建任务</Button>
          <Dropdown trigger={['click']} menu={{ items: moreItems, onClick: onMore }}>
            <Button icon={<EllipsisOutlined />} aria-label="更多" />
          </Dropdown>
          <Button icon={collapsed ? <DownOutlined /> : <UpOutlined />} aria-label={collapsed ? '展开' : '收起'} title={collapsed ? '展开任务看板' : '收起任务看板'} onClick={() => setCollapsed(!collapsed)} />
        </div>
      </div>

      {/* 第二行：成果漏斗 + 下一步 */}
      <div className="ah-bottom" key={t.id + t.status}>
        {showFunnel ? (
          <div className="funnel">
            <Metric label="已触达买家" value={t.reached} unit={`/ ${t.total}`} sub={`完成 ${pct(t.reached, t.total)}%`}>
              <div className="bar"><i style={{ width: `${pct(t.reached, t.total)}%` }} className={st.cls} /></div>
            </Metric>
            <ArrowRightOutlined className="f-arrow" />
            <Metric
              label="有效回复" value={t.replied} sub={`回复率 ${pct(t.replied, t.reached)}%`}
              active={metric === 'replied'} onClick={() => setMetric(metric === 'replied' ? null : 'replied')}
            />
            <ArrowRightOutlined className="f-arrow" />
            <Metric
              label="高意向客户" value={t.high} sub={`占回复 ${pct(t.high, t.replied)}%`} accent
              active={metric === 'high'} onClick={() => setMetric(metric === 'high' ? null : 'high')}
            />
          </div>
        ) : (
          <div className="prepare">
            <div className="prepare-head"><LoadingOutlined spin /> Agent 正在准备，完成后自动开始触达 <b>{t.progress}%</b></div>
            <div className="bar lg"><i style={{ width: `${t.progress}%` }} className="preparing" /></div>
            <div className="steps">
              {['筛选目标买家', '生成沟通话术', '开始自动触达'].map((s, i) => {
                const done = t.progress >= (i + 1) * 33;
                return <span key={s} className={done ? 'done' : t.progress >= i * 33 ? 'cur' : ''}>{done ? <CheckOutlined /> : i + 1}. {s}</span>;
              })}
            </div>
          </div>
        )}

        {/* 下一步 */}
        <div className={`next ${pending && t.status !== 'preparing' ? 'has' : ''}`}>
          {t.status === 'ended' ? (
            <>
              <div className="next-text"><b>任务已结束</b><span>共沉淀 {t.high} 个高意向客户</span></div>
              <Button type="primary" icon={<ReloadOutlined />} onClick={() => onMore({ key: 'renew' })}>续期</Button>
            </>
          ) : t.status === 'preparing' ? (
            <div className="next-text"><b>暂无需处理事项</b><span>预计几分钟后开始触达</span></div>
          ) : pending ? (
            <>
              <div className="next-num">{pending}</div>
              <div className="next-text"><b>个高意向会话待接管</b><span>建议优先处理，避免错过商机</span></div>
              <Button type="primary" onClick={onGo}>去处理 <ArrowRightOutlined /></Button>
            </>
          ) : (
            <div className="next-text"><b>暂无待处理</b><span>Agent 持续跟进中</span></div>
          )}
        </div>
      </div>
    </section>
  );
}

function ConvList({ convs, setConvs, metric, setMetric, active, setActive, width }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('smart');
  const [on, setOn] = useState({});
  const listRef = useRef(null);
  const nOn = Object.values(on).filter(Boolean).length;

  const count = (v) => convs.filter((c) => matchView(c, v)).length;
  const shown = convs
    .filter((c) => matchView(c, metric))
    .filter((c) => !q || (c.name + c.country + c.role).toLowerCase().includes(q.toLowerCase()))
    .filter((c) => Object.keys(on).every((k) => !on[k] || CHIP_TEST[k](c)))
    .sort(SORTS[sort]);

  useEffect(() => { listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [metric, sort]);

  const take = (e, id) => {
    e.stopPropagation();
    setConvs((prev) => prev.map((x) => (x.id === id ? { ...x, taken: true, unread: 0, status: TAKEN } : x)));
    message.success('已接管该会话，Agent 暂停自动回复');
  };

  const TABS = [['all', '全部', null], ['high', '高意向', 'high'], ['pending', '待接管', 'pending'], ['reply', '需回复', 'reply']];
  const cur = metric ?? 'all';

  const filterPanel = (
    <div className="pop-filter">
      <div className="pop-selects">
        {['行业', '国家', '时间段'].map((p) => <Select key={p} size="small" placeholder={p} options={[]} style={{ flex: 1 }} />)}
      </div>
      <div className="chips">
        {chips.map((c) => (
          <span key={c.l} className={`chip ${on[c.l] ? 'on' : ''}`} onClick={() => setOn({ ...on, [c.l]: !on[c.l] })}>{c.l}</span>
        ))}
      </div>
      <a className="pop-reset" onClick={() => setOn({})}>重置</a>
    </div>
  );

  return (
    <div className="convs" style={{ width }}>
      <div className="convs-search">
        <Input allowClear value={q} onChange={(e) => setQ(e.target.value)} prefix={<SearchOutlined style={{ color: '#b0b5bd' }} />} placeholder="搜索会话" />
      </div>

      <div className="seg">
        {TABS.map(([k, label, v]) => (
          <div key={k} className={`seg-item ${cur === k ? 'on' : ''} ${k === 'pending' && count('pending') ? 'hotc' : ''}`} onClick={() => setMetric(v)}>
            {label}<b>{count(v)}</b>
          </div>
        ))}
        <Dropdown trigger={['click']} menu={{ items: [{ key: 'silent', label: `沉默客户 ${count('silent')}` }], onClick: ({ key }) => setMetric(key) }}>
          <div className={`seg-item ${cur === 'silent' || cur === 'replied' ? 'on' : ''}`}>
            {cur === 'silent' ? `沉默 ${count('silent')}` : cur === 'replied' ? `有效回复 ${count('replied')}` : '更多'} <DownOutlined style={{ fontSize: 9 }} />
          </div>
        </Dropdown>
      </div>

      <div className="list-bar">
        <Select
          size="small" variant="borderless" value={sort} onChange={setSort} style={{ width: 112, marginLeft: -8 }}
          options={[{ value: 'smart', label: '智能优先级' }, { value: 'latest', label: '最新消息' }, { value: 'featured', label: '精选' }, { value: 'recommend', label: '推荐' }]}
        />
        <Popover trigger="click" placement="bottomRight" content={filterPanel}>
          <span className={`filter-btn ${nOn ? 'on' : ''}`}><FilterOutlined /> 筛选{nOn ? ` · ${nOn}` : ''}</span>
        </Popover>
      </div>

      <div className="conv-list" ref={listRef}>
        {shown.map((c) => (
          <div key={c.id} className={`conv ${active === c.id ? 'active' : ''} ${isPending(c) ? 'hot' : ''}`} onClick={() => setActive(c.id)}>
            <div className="av-wrap">
              <ConvAvatar id={c.id} />
              {c.tags.includes('近期在线') && <i className="online" />}
            </div>
            <div className="conv-main">
              <div className="conv-top">
                <span className="conv-name">
                  <span className="nm">{c.name}</span>
                  {c.level !== 'low' && <span className={`lv ${c.level}`}>{c.level === 'high' ? '高意向' : '中意向'}</span>}
                  {c.isNew && <span className="dot-new">新</span>}
                  {c.unread > 0 && <span className="dot-num">{c.unread}</span>}
                </span>
                <span className="conv-time">{c.time}</span>
              </div>
              <div className="conv-profile">{c.country} · {c.role}</div>
              <Tooltip
                placement="right"
                title={<div><div>Agent 判断依据：{c.reasons.join('、')}</div><div style={{ opacity: .7, marginTop: 4 }}>最近消息：{c.last}</div></div>}
              >
                <div className="conv-why"><ThunderboltOutlined />{c.reasons.slice(0, 3).join(' · ')}</div>
              </Tooltip>
              <div className={`conv-status ${c.status.k}`}>
                <StatusText s={c.status} />
                {needAction(c) && !c.taken && <Button size="small" className="take" onClick={(e) => take(e, c.id)}>立即接管</Button>}
              </div>
            </div>
          </div>
        ))}
        {!shown.length && (
          <div className="empty">没有符合条件的会话<br /><a onClick={() => { setMetric(null); setOn({}); setQ(''); }}>清除全部筛选</a></div>
        )}
      </div>
    </div>
  );
}

// kind: buyer / agent / human；zh = 中文译文
const AUAREZ_MSGS = [
  { kind: 'buyer', text: 'I communicated with the Boss', zh: '我已经和老板沟通过了' },
  { kind: 'buyer', text: 'I needed you to help me include a brand printer from her', zh: '我需要你帮我加上她的一台品牌打印机' },
  {
    kind: 'agent',
    text: 'Got it boss. About the “brand printer from her”, what exact type or model do you want to include? You can tell me the printer name/brand and model, or send a clear photo or a link from her so we can add the correct one.',
    zh: '好的老板。关于“她的品牌打印机”，您具体想加入哪种类型或型号？可以告诉我打印机的名称/品牌和型号，或发一张清晰的照片或链接，方便我们添加正确的产品。',
  },
  { kind: 'buyer', text: 'Our UV2513 is great for printing rigid flat materials, such as acrylic, wood, PVC, paper, etc.', zh: '我们的 UV2513 非常适合打印亚克力、木材、PVC、纸张等硬质平面材料。' },
  { kind: 'buyer', text: 'From this company please', zh: '请用这家公司的' },
  { kind: 'buyer', image: true },
];
const ZH_LAST = {
  1: '你好，我们需要 12 吨温室薄膜，你们的最优价格是多少？',
  2: '你好！我是来自坦桑尼亚的 Agro，想咨询最小起订量。',
  4: '你好，请把报价单发到我的邮箱。',
  5: '10 吨的交货期是多久？',
};
const chatFor = (c) =>
  c.id === 3
    ? AUAREZ_MSGS
    : [
        { kind: 'buyer', text: c.last, zh: ZH_LAST[c.id] },
        { kind: 'agent', text: 'Thanks for your message! I am checking the details and will get back to you shortly.', zh: '感谢您的留言！我正在核实细节，稍后回复您。' },
      ];

function Chat({ conv, setConvs, profileOpen, setProfileOpen, next, onNext }) {
  const [extra, setExtra] = useState({});
  const [zh, setZh] = useState(true);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const msgs = [...chatFor(conv), ...(extra[conv.id] || [])];
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [conv.id, msgs.length]);

  const take = () => {
    setConvs((p) => p.map((x) => (x.id === conv.id ? { ...x, taken: true, unread: 0, status: TAKEN } : x)));
    message.success('已接管该会话，现在可以手动发送消息');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };
  const release = () => {
    setConvs((p) => p.map((x) => (x.id === conv.id ? { ...x, taken: false, status: W('Agent 跟进中') } : x)));
    message.info('已交还 Agent，将继续自动跟进');
  };
  const send = () => {
    const v = text.trim();
    if (!v) return;
    setExtra({ ...extra, [conv.id]: [...(extra[conv.id] || []), { kind: 'human', text: v }] });
    setText('');
  };
  const urgent = conv.status.k === 'action' && !conv.taken;

  return (
    <div className="chat">
      {/* 决策条 */}
      <div className="chat-head2">
        <div className="ch-row">
          <div className="ch-click" onClick={() => setProfileOpen(!profileOpen)} title="查看买家档案">
            <ConvAvatar size={40} id={conv.id} />
            <div className="ch-id">
              <div className="ch-name">
                {conv.name}
                {conv.level !== 'low' && <span className={`lv ${conv.level}`}>{conv.level === 'high' ? '高意向' : '中意向'}</span>}
              </div>
              <div className="ch-sub">{conv.country} · {conv.role}</div>
            </div>
          </div>
          <div className="ch-actions">
            <span className={`profile-btn ${profileOpen ? 'on' : ''}`} onClick={() => setProfileOpen(!profileOpen)}>
              <ProfileOutlined /> 买家档案
            </span>
            <span className="tr-switch" onClick={() => setZh(!zh)}>
              <i className={zh ? 'on' : ''} /> 中文译文
            </span>
            {conv.taken ? (
              <Button size="middle" onClick={release}>交还 Agent</Button>
            ) : (
              <span className="chat-mode-tag">
                <RobotOutlined /> Agent 托管中
              </span>
            )}
          </div>
        </div>
        <div className="ch-why">
          <span className="why"><ThunderboltOutlined /> {conv.reasons.join(' · ')}</span>
          <span className="facts">采购 {profileOf(conv).qty} · {profileOf(conv).product}</span>
          <span className={`conv-status ${conv.status.k}`}><StatusText s={conv.status} /></span>
        </div>
      </div>

      <div className="chat-scroll">
        {conv.unread > 0 && <div className="divider-new">以下为新消息</div>}
        <div className="chat-time">今天 14:10</div>
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.kind}`}>
            {m.kind === 'buyer' ? <ConvAvatar id={conv.id} /> : m.kind === 'agent'
              ? <Avatar size={40} className="av-ai" icon={<RobotOutlined />} />
              : <Avatar size={40} src={avatarOf(23)} />}
            <div className="msg-body">
              {m.kind !== 'buyer' && <div className="sender">{m.kind === 'agent' ? <><span className="ai-tag">AI</span> Agent 代发</> : '你（人工）'}</div>}
              <div className="bubble">
                {m.image
                  ? <div className="img-ph" />
                  : <>
                      <div>{m.text}</div>
                      {zh && m.zh && <div className="trans">{m.zh}</div>}
                    </>}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* 输入区 */}
      {conv.taken ? (
        <div className="composer">
          <Input.TextArea
            ref={inputRef}
            autoSize={{ minRows: 2, maxRows: 4 }} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行" onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <div className="composer-bar">
            <span className="hint">你已接管，Agent 已暂停自动回复</span>
            {next && <Button className="next-btn" onClick={onNext}>下一个待接管 · {next.name} <ArrowRightOutlined /></Button>}
            <Button type="primary" icon={<SendOutlined />} disabled={!text.trim()} onClick={send}>发送</Button>
          </div>
        </div>
      ) : (
        <div className="composer locked">
          <div className="lock-content">
            <div className="lock-text">
              <span className="pulse-dot" />
              <span className="lock-sub">接管后可手动发送消息，Agent 将暂停自动回复</span>
            </div>
            <Button
              type="primary"
              className="take-btn-bottom"
              onClick={take}
            >
              立即接管
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const PROFILES = {
  3: {
    summary: '个人买家，想为自家温室采购透明塑料薄膜（约 34×16×2.5 米），同时咨询来自中国的水培设备，希望在 8×34 米空间内高密度种植。',
    qty: '3 sets', region: '非洲 / 坦桑尼亚', industry: '工业机械 / 印刷机 / 数字印刷机', product: '平板打印机',
    company: '暂无公司信息，买家为个人身份，无公司背景',
  },
};
const profileOf = (c) => PROFILES[c.id] || {
  summary: `${c.role}，${c.reasons.join('、')}。`,
  qty: '待确认', region: c.country, industry: '农业 / 农用设备', product: '农用温室塑料膜', company: '暂无更多公司信息',
};

function ProfileDrawer({ conv, open, onClose }) {
  const p = profileOf(conv);
  const rows = [['采购量', p.qty], ['国家', p.region], ['行业', p.industry], ['产品', p.product]];
  return (
    <aside className={`profile-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="pp-inner">
        <div className="pp-head">
          <b>买家档案</b>
          <span className="pp-close" onClick={onClose}><CloseOutlined /></span>
        </div>
        <div className="pp-who">
          <ConvAvatar size={44} id={conv.id} />
          <div>
            <div className="pp-name">{conv.name}{conv.level !== 'low' && <span className={`lv ${conv.level}`}>{conv.level === 'high' ? '高意向' : '中意向'}</span>}</div>
            <div className="ch-sub">{conv.country} · {conv.role}</div>
          </div>
        </div>
        <div className="ai-card">
          <h5><i className="ai-tag">AI</i> 摘要</h5>
          <p>{p.summary}</p>
        </div>
        <div className="pp-sec">采购需求</div>
        {rows.map(([k, v]) => <div key={k} className="info-row"><span className="k">{k}</span><span>{v}</span></div>)}
        <div className="pp-sec">公司信息</div>
        <div className="pp-text">{p.company}</div>
        {conv.tags.filter((t) => !['近期在线'].includes(t)).length > 0 && (
          <>
            <div className="pp-sec">标签</div>
            <div className="tags">{conv.tags.filter((t) => t !== '近期在线').map((t) => <span key={t} className="tag">{t}</span>)}</div>
          </>
        )}
      </div>
    </aside>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [curId, setCurId] = useState('t1');
  const [metric, setMetric] = useState(null);
  const [convs, setConvs] = useState(initialConvs);
  const [active, setActive] = useState(3);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [headCollapsed, setHeadCollapsed] = useState(false);
  const [convW, setConvW] = useState(396);
  const startResize = (e) => {
    e.preventDefault();
    const x0 = e.clientX, w0 = convW;
    const move = (ev) => setConvW(Math.max(340, Math.min(620, w0 + ev.clientX - x0)));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.body.classList.remove('resizing'); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.body.classList.add('resizing');
  };
  const firstPending = [...convs].filter(isPending).sort(SORTS.smart)[0];
  const nextPending = [...convs].filter((c) => isPending(c) && c.id !== active).sort(SORTS.smart)[0];
  const curConv = convs.find((c) => c.id === active) || convs[0];
  return (
    <div className="app">
      <TopNav />
      <div className="body">
        <Sidebar collapsed={sideCollapsed} setCollapsed={setSideCollapsed} />
        <main className="main">
          <AgentHeader tasks={tasks} setTasks={setTasks} curId={curId} setCurId={setCurId} metric={metric} setMetric={setMetric} pendingCount={convs.filter(isPending).length} onGo={() => { setMetric('pending'); if (firstPending) setActive(firstPending.id); }} collapsed={headCollapsed} setCollapsed={setHeadCollapsed} />
          <div className="workspace">
            <ConvList convs={convs} setConvs={setConvs} metric={metric} setMetric={setMetric} active={active} setActive={setActive} width={convW} />
            <div className="resizer" onMouseDown={startResize} onDoubleClick={() => setConvW(396)} title="拖动调整宽度，双击恢复"><i /></div>
            <Chat conv={curConv} setConvs={setConvs} next={nextPending} onNext={() => nextPending && setActive(nextPending.id)} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
            <ProfileDrawer conv={curConv} open={profileOpen} onClose={() => setProfileOpen(false)} />
          </div>
        </main>
      </div>
    </div>
  );
}

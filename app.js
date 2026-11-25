const { roles, dateAt, min, end, summarize } = OPS_DATA
const { menus, menuNames, exposureOnly, describeFeature } = OPS_CATALOG
const number = new Intl.NumberFormat('zh-CN')
const format = value => number.format(value)
const percent = (value, total) => total ? (value / total * 100).toFixed(1) + '%' : '—'
const shortDate = date => date.slice(5).replace('-', '.')
const $ = selector => document.querySelector(selector)
const $$ = selector => [...document.querySelectorAll(selector)]

const viewNames = {
  overview: ['运营看板', '掌握教师端与学生端的访问表现，追踪核心功能的使用情况。'],
  pages: ['页面分析', '按教师端和学生端实际菜单查看页面访问与有效曝光。'],
  features: ['功能分析', '按所属页面查看核心按钮的曝光、点击与业务结果。']
}

const indicators = [
  { key: 'pv', label: '页面访问量', unit: 'PV', icon: 'pages', color: 'blue', definition: '统计期内成功进入业务页面的总次数' },
  { key: 'uv', label: '独立访客', unit: 'UV', icon: 'users', color: 'teal', definition: '按访问端和登录账号在统计期内去重' },
  { key: 'exposure', label: '有效曝光', icon: 'eye', color: 'violet', definition: '页面主体至少有一半连续可见 1 秒的访问次数' },
  { key: 'click', label: '核心功能点击', icon: 'cursor', color: 'amber', definition: '清单内核心按钮和功能的点击总次数' }
]

const state = {
  view: 'overview',
  role: 'all',
  group: '',
  start: dateAt(end, -6),
  end,
  metric: 'pv',
  pageQuery: '',
  pageKind: '',
  featureQuery: '',
  featurePage: '',
  pageSort: { key: null, direction: -1 },
  featureSort: { key: 'click', direction: -1 },
  selectedDay: null
}

let current
let previous

const iconPaths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  pages: 'M8 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M3 17V5a2 2 0 0 1 2-2h11 M10 11h6 M10 15h6',
  activity: 'M3 12h4l3-7 4 14 3-7h4',
  users: 'M12 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M5 20v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1 M18 4a3 3 0 0 1 0 6 M21 15a4 4 0 0 1 1 3',
  eye: 'M2 12s3.7-6 10-6 10 6 10 6-3.7 6-10 6S2 12 2 12z M12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z',
  cursor: 'M6 3l13 10-6 1-3 6L6 3z M4 9l-2 2 M11 3l2-2',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M3 10h18 M8 3v4 M16 3v4 M8 14h2 M14 14h2',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  book: 'M12 6c-2-2-5-3-9-2v14c4-1 7 0 9 2 2-2 5-3 9-2V4c-4-1-7 0-9 2z M12 6v14',
  external: 'M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6 M14 4h6v6 M20 4l-9 9',
  close: 'M6 6l12 12 M18 6L6 18',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z M16 16l4 4'
}

function drawIcons(container = document) {
  for (const icon of container.querySelectorAll('[data-icon]:empty')) {
    const name = icon.dataset.icon
    const size = ['chevronDown', 'chevronRight', 'external'].includes(name) ? 13 : 17
    const canvas = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    const context = canvas.getContext('2d')
    context.scale(canvas.width / 24, canvas.height / 24)
    context.strokeStyle = getComputedStyle(icon).color
    context.lineWidth = 1.8
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke(new Path2D(iconPaths[name]))
    icon.setAttribute('aria-hidden', 'true')
    icon.append(canvas)
  }
}

function selectPressed(selector, key, value) {
  for (const button of $$(selector)) {
    button.setAttribute('aria-pressed', String(button.dataset[key] === value))
  }
}

function renderKpis() {
  const grid = $('#kpis')
  grid.innerHTML = indicators.map(({ key, label, unit, icon, color, definition }) => {
    const comparison = previous.totals[key]
    const change = comparison ? (current.totals[key] - comparison) / comparison * 100 : null
    const difference = change === null ? '—' : (change > 0 ? '+' : '') + change.toFixed(1) + '%'
    return `<article class="kpi-card accent-${color}" title="${definition}">
      <div class="kpi-label">${label}${unit ? '<small>' + unit + '</small>' : ''}</div>
      <span class="kpi-icon"><span data-icon="${icon}"></span></span>
      <strong class="kpi-value">${format(current.totals[key])}</strong>
      <div class="kpi-foot"><strong class="${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}">${difference}</strong><span>较上一等长周期</span></div>
    </article>`
  }).join('')
  drawIcons(grid)
}

function roleDot(role) {
  return `<i class="color-dot" style="--series:${roles[role].color}" aria-hidden="true"></i>`
}

function renderShare() {
  const total = current.totals.pv
  $('#total-pv').textContent = format(total)
  $('#donut').classList.toggle('is-empty', total === 0)
  $('#donut').style.setProperty('--teacher-share', ((current.totalsByRole.teacher || 0) / total * 100 || 0) + '%')
  $('#share-key').innerHTML = Object.entries(current.totalsByRole).map(([role, count]) =>
    `<div class="share-row">${roleDot(role)}<span>${roles[role].label}</span><strong>${format(count)}</strong><span>${percent(count, total)}</span></div>`
  ).join('')
}

function renderChartKey() {
  $('#chart-key').innerHTML = Object.keys(current.totalsByRole)
    .map(role => `<span>${roleDot(role)}${roles[role].label}</span>`).join('')
}

const chart = $('#trend-chart')
const tooltip = $('#chart-tooltip')
let chartFrame

function traceCurve(ctx, points) {
  ctx.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < points.length; index++) {
    const prior = points[index - 1]
    const point = points[index]
    const middleX = (prior.x + point.x) / 2
    ctx.bezierCurveTo(middleX, prior.y, middleX, point.y, point.x, point.y)
  }
}

function axisStep(maximum) {
  const ideal = Math.max(1, maximum / 4)
  const power = 10 ** Math.floor(Math.log10(ideal))
  return [1, 2, 2.5, 5, 10].find(step => step * power >= ideal) * power
}

function renderChart() {
  const { width, height } = chart.getBoundingClientRect()
  if (!width || !height) return
  const scale = window.devicePixelRatio || 1
  chart.width = Math.round(width * scale)
  chart.height = Math.round(height * scale)
  const ctx = chart.getContext('2d')
  ctx.scale(chart.width / width, chart.height / height)
  ctx.font = '12px system-ui, sans-serif'
  const dayCount = current.trend.length
  const series = Object.keys(current.totalsByRole)
  const trend = current.trend
  const largest = Math.max(...trend.flatMap(day => series.map(role => day.daily[role][state.metric])))
  const step = axisStep(largest)
  const maximum = Math.ceil(Math.max(largest, 1) / step) * step
  const xStart = ctx.measureText(format(maximum)).width + 14
  const xEnd = width - 19
  const chartTop = 15
  const chartBottom = height - 30
  const xAt = i => dayCount === 1 ? (xStart + xEnd) / 2 : xStart + i * (xEnd - xStart) / (dayCount - 1)
  const yAt = value => chartBottom - value / maximum * (chartBottom - chartTop)
  const points = Object.fromEntries(series.map(role => [role,
    trend.map((day, index) => ({ x: xAt(index), y: yAt(day.daily[role][state.metric]) }))
  ]))
  chartFrame = { xStart, xEnd, dayCount, width }

  ctx.fillStyle = '#61728a'
  ctx.strokeStyle = '#e5ebf5'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let tick = 0; tick <= maximum; tick += step) {
    const y = yAt(tick)
    ctx.setLineDash(tick === 0 ? [] : [3, 4])
    ctx.beginPath()
    ctx.moveTo(xStart, y)
    ctx.lineTo(xEnd, y)
    ctx.stroke()
    ctx.fillText(format(tick), xStart - 9, y)
  }
  ctx.setLineDash([])

  ctx.textAlign = 'center'
  const labels = Math.min(dayCount, Math.max(2, Math.floor((xEnd - xStart) / 49) + 1))
  for (let label = 0; label < labels; label++) {
    const index = labels === 1 ? 0 : Math.round(label * (dayCount - 1) / (labels - 1))
    ctx.fillText(shortDate(trend[index].date), xAt(index), height - 12)
  }

  for (const role of [...series].reverse()) {
    const values = points[role]
    const color = roles[role].color
    if (dayCount > 1) {
      const gradient = ctx.createLinearGradient(0, chartTop, 0, chartBottom)
      gradient.addColorStop(0, color + '29')
      gradient.addColorStop(1, color + '03')
      ctx.beginPath()
      traceCurve(ctx, values)
      ctx.lineTo(xEnd, chartBottom)
      ctx.lineTo(xStart, chartBottom)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.beginPath()
      traceCurve(ctx, values)
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
  }

  const selected = state.selectedDay
  if (selected !== null) {
    ctx.strokeStyle = '#a6b8d2'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    ctx.moveTo(xAt(selected), chartTop)
    ctx.lineTo(xAt(selected), chartBottom)
    ctx.stroke()
    ctx.setLineDash([])
  }
  if (dayCount < 10 || selected !== null) {
    for (const role of series) {
      points[role].forEach((point, index) => {
        if (index !== selected && dayCount >= 10) return
        ctx.beginPath()
        ctx.arc(point.x, point.y, index === selected ? 5 : 3, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = roles[role].color
        ctx.stroke()
      })
    }
  }

  tooltip.hidden = selected === null
  if (selected !== null) {
    const day = trend[selected]
    tooltip.innerHTML = `<strong>${day.date}</strong>` + series.map(role =>
      `<div>${roleDot(role)}${roles[role].label}<b>${format(day.daily[role][state.metric])}</b></div>`
    ).join('')
    const x = xAt(selected)
    tooltip.style.left = Math.max(2, x + tooltip.offsetWidth + 12 < width ? x + 10 : x - tooltip.offsetWidth - 10) + 'px'
  }
}

function inspectDay(index, announce = false) {
  if (index === state.selectedDay && !announce) return
  state.selectedDay = index
  renderChart()
  if (announce && index !== null) {
    const { date, daily } = current.trend[index]
    const metricName = indicators.find(metric => metric.key === state.metric).label
    const values = Object.keys(daily).map(role => roles[role].label + format(daily[role][state.metric]))
    $('#chart-reading').textContent = [date, metricName, ...values].join('，')
  }
}

const pageColumns = [
  ['name', '页面 / 菜单路径'], ['role', '访问端'], ['kind', '页面类型'], ['pv', '访问量 PV'], ['uv', '访客 UV'],
  ['exposure', '有效曝光'], ['exposureRate', '曝光率']
]
const featureColumns = [
  ['label', '核心功能'], ['page', '所属页面'], ['role', '访问端'], ['exposed', '曝光人数'],
  ['click', '点击量'], ['clicked', '点击人数'], ['ctr', '点击率'], ['success', '成功次数']
]
const pageColumnsCompact = [['name', '页面'], ...pageColumns.filter(([key]) => ['role', 'pv', 'exposure'].includes(key))]
const featureColumnsCompact = featureColumns.filter(([key]) => ['label', 'role', 'click', 'ctr'].includes(key))

function pageMetric(page, key) {
  if (key === 'uv') return page.visitors.size
  if (key === 'exposureRate') return page.pv ? page.exposure / page.pv : 0
  return page[key]
}

function featureMetric(feature, key) {
  if (key === 'exposed' || key === 'clicked') return feature[key].size
  if (key === 'ctr') return feature.exposed.size ? feature.clicked.size / feature.exposed.size : 0
  return feature[key]
}

function badge(role) {
  return `<span class="role-tag role-${role}">${roles[role].label}</span>`
}

function numeric(key) {
  return ['pv', 'uv', 'exposure', 'exposureRate', 'click', 'exposed', 'clicked', 'ctr', 'success'].includes(key)
}

function pagePath(page) {
  const groups = state.group ? [state.group] : page.groups
  const labels = groups.map(group => menuNames[group])
  if (page.kind === 'menu') {
    return labels[0] === page.name ? labels[0] : labels[0] + ' / ' + page.name
  }
  if (page.groups.length > 1) return labels.join('、') + ' → ' + page.name
  const parentIsPage = page.parent && page.parent !== labels[0]
  const parentIsMenu = parentIsPage && Object.values(OPS_CATALOG.pages).flat().some(item =>
    item.kind === 'menu' && item.groups[0] === groups[0] && item.name === page.parent
  )
  const parent = parentIsPage ? (parentIsMenu ? ' / ' : ' → ') + page.parent : ''
  return labels[0] + parent + ' → ' + page.name
}

function pageCell(page, key, compact = false) {
  if (key === 'name') {
    const showPath = !compact && pagePath(page) !== page.name
    const hierarchy = showPath ? `<span class="page-path">${pagePath(page)}</span>` : ''
    return `<button class="row-link" type="button" data-page-detail="${page.id}">${page.name}</button>${hierarchy}`
  }
  if (key === 'role') return badge(page.role)
  if (key === 'kind') return `<span class="route-label">${page.kind === 'menu' ? '菜单' : '跳转'}</span>`
  if (key === 'exposureRate') return percent(page.exposure, page.pv)
  return format(pageMetric(page, key))
}

function featureCell(feature, key, compact = false) {
  if (key === 'label') {
    const noteId = `feature-note-${feature.page.id}-${feature.id}${compact ? '-overview' : ''}`
    const note = describeFeature(feature.page.id, feature.id)
    const context = compact ? feature.page.name + ' · ' : ''
    return `<button class="row-link" type="button" data-feature-detail="${feature.id}" data-feature-context="${feature.page.id}" aria-haspopup="dialog" aria-describedby="${noteId}">${feature.label}</button>
      <span id="${noteId}" class="visually-hidden">${context}${note}</span>`
  }
  if (key === 'page') return pagePath(feature.page)
  if (key === 'role') return badge(feature.role)
  if (key === 'ctr') return percent(feature.clicked.size, feature.exposed.size)
  const value = featureMetric(feature, key)
  return value === null ? '—' : format(value)
}

function rowSort(rows, sort, getMetric) {
  const { key, direction } = sort
  if (!key) return rows
  return [...rows].sort((left, right) => {
    const a = getMetric(left, key)
    const b = getMetric(right, key)
    if (a === b) return 0
    if (a === null) return 1
    if (b === null) return -1
    return direction * (a - b)
  })
}

function renderTable(target, rows, columns, getCell, options = {}) {
  const { caption, sort, type, grouped } = options
  if (!rows.length) {
    target.innerHTML = '<p class="table-empty">当前筛选没有匹配结果</p>'
    return
  }
  const header = columns.map(([key, label]) => {
    const sorting = sort && numeric(key)
    const active = sorting && sort.key === key
    const ariaSort = active ? ` aria-sort="${sort.direction === 1 ? 'ascending' : 'descending'}"` : ''
    const marker = active ? (sort.direction === 1 ? '▴' : '▾') : '↕'
    const text = sorting ? `<button class="sort-button" type="button" data-sort="${type}" data-sort-key="${key}">${label} <span class="sort-indicator" aria-hidden="true">${marker}</span></button>` : label
    return `<th scope="col" class="${numeric(key) ? 'table-number' : ''}"${ariaSort}>${text}</th>`
  }).join('')
  const renderRows = items => items.map(row => `<tr>${columns.map(([key]) =>
    `<td class="${numeric(key) ? 'table-number' : ''}">${getCell(row, key)}</td>`
  ).join('')}</tr>`).join('')
  let bodies
  if (grouped) {
    const orderedGroups = Object.values(menus).flat().map(([id]) => [id, menuNames[id]])
    orderedGroups.push(['linked-routes', '业务跳转页面'])
    bodies = orderedGroups.map(([id, label]) => {
      const items = rows.filter(row => (row.kind === 'route' ? 'linked-routes' : row.groups[0]) === id)
      if (!items.length) return ''
      const heading = id === 'linked-routes' ? label : roles[items[0].role].label + ' / ' + label
      return `<tbody><tr class="group-row"><th scope="rowgroup" colspan="${columns.length}">${heading}<span class="group-count">${items.length} 个页面</span></th></tr>${renderRows(items)}</tbody>`
    }).join('')
  } else bodies = '<tbody>' + renderRows(rows) + '</tbody>'
  target.innerHTML = `<table><caption class="visually-hidden">${caption}</caption><thead><tr>${header}</tr></thead>${bodies}</table>`
}

function matches(query, ...fields) {
  const normalized = query.trim().toLocaleLowerCase('zh-CN')
  return fields.some(value => value.toLocaleLowerCase('zh-CN').includes(normalized))
}

function renderPages() {
  const pages = current.pages.filter(page =>
    (!state.pageKind || page.kind === state.pageKind) &&
    matches(state.pageQuery, page.name, pagePath(page), page.path, page.source)
  )
  renderTable($('#all-pages'), rowSort(pages, state.pageSort, pageMetric), pageColumns, pageCell, {
    caption: '页面访问、访客与有效曝光，组内按所选指标排序', sort: state.pageSort, type: 'page', grouped: true
  })
  $('#page-count').textContent = `显示 ${pages.length} 个页面，共 ${current.pages.length} 个页面`
}

function renderFeatures() {
  closeFeatureHelp()
  const features = current.features.filter(feature =>
    (!state.featurePage || feature.page.id === state.featurePage) &&
    matches(state.featureQuery, feature.label, feature.page.name, pagePath(feature.page), feature.id,
      describeFeature(feature.page.id, feature.id))
  )
  renderTable($('#all-features'), rowSort(features, state.featureSort, featureMetric), featureColumns, featureCell, {
    caption: '核心功能的使用数据', sort: state.featureSort, type: 'feature'
  })
  $('#feature-count').textContent = `显示 ${features.length} 个页面内功能，共 ${current.features.length} 个`
}

function renderPageOptions() {
  const select = $('#feature-page')
  select.replaceChildren(new Option('全部页面', ''))
  for (const page of current.pages) {
    if (page.featureStats.size) select.add(new Option(roles[page.role].label + ' · ' + pagePath(page), page.id))
  }
  if (![...select.options].some(option => option.value === state.featurePage)) state.featurePage = ''
  select.value = state.featurePage
}

function renderMenuOptions() {
  const select = $('#menu-filter')
  select.replaceChildren(new Option('全部一级菜单', ''))
  for (const [role, entries] of Object.entries(menus)) {
    if (state.role !== 'all' && state.role !== role) continue
    const group = document.createElement('optgroup')
    group.label = roles[role].label
    for (const [id, name] of entries) group.append(new Option(name, id))
    select.append(group)
  }
  select.value = state.group
}

function renderOverview() {
  renderKpis()
  renderChartKey()
  renderChart()
  renderShare()
  renderTable($('#top-pages'), rowSort(current.pages, { key: 'pv', direction: -1 }, pageMetric).slice(0, 5),
    pageColumnsCompact, (page, key) => pageCell(page, key, true), { caption: '访问量最高的五个页面' })
  renderTable($('#top-features'), rowSort(current.features, { key: 'click', direction: -1 }, featureMetric).slice(0, 5),
    featureColumnsCompact, (feature, key) => featureCell(feature, key, true), { caption: '点击量最高的五个核心功能' })
}

function renderActiveView() {
  closeFeatureHelp()
  const directorySelected = exposureOnly.includes(state.group)
  for (const view of Object.keys(viewNames)) {
    $('#' + view + '-view').hidden = directorySelected || view !== state.view
  }
  const directory = $('#directory-view')
  directory.hidden = current.menus.length === 0 || (!directorySelected && state.view === 'features')
  if (!directory.hidden) {
    const columns = [['name', '一级菜单'], ['exposure', '入口曝光次数'], ['uv', '入口曝光人数']]
    const cell = (item, key) => {
      if (key === 'name') return menuNames[item.id]
      return format(key === 'uv' ? item.visitors.size : item.exposure)
    }
    renderTable($('#directory-metrics'), current.menus, columns, cell, { caption: '管理员一级菜单曝光' })
  }
  if (directorySelected) return
  if (state.view === 'pages') renderPages()
  else if (state.view === 'features') renderFeatures()
  else renderOverview()
}

function updateData(announce = true) {
  current = summarize(state.start, state.end, state.role, state.group)
  const days = current.trend.length
  previous = summarize(dateAt(state.start, -days), dateAt(state.start, -1), state.role, state.group)
  state.selectedDay = null
  $('#date-label').textContent = shortDate(state.start) + ' – ' + shortDate(state.end)
  $('#date-start').value = state.start
  $('#date-end').value = state.end
  selectPressed('[data-role]', 'role', state.role)
  selectPressed('[data-days]', 'days', state.end === end ? String(days) : '')
  renderMenuOptions()
  renderPageOptions()
  renderActiveView()
  if (announce) {
    const roleLabel = state.role === 'all' ? '全部访问端' : roles[state.role].label
    const scope = state.group ? roleLabel + ' / ' + menuNames[state.group] : roleLabel
    const metric = exposureOnly.includes(state.group)
      ? format(current.menus[0].exposure) + ' 次菜单入口曝光'
      : format(current.totals.pv) + ' 次访问'
    $('#filter-announcement').textContent = `${scope}，${state.start} 至 ${state.end}，共 ${metric}`
  }
}

function showView(focus) {
  const hash = location.hash.slice(1)
  if (hash === 'main-content') return
  state.view = Object.hasOwn(viewNames, hash) ? hash : 'overview'
  for (const link of $$('[data-view]')) {
    if (link.dataset.view === state.view) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
    link.querySelector('[data-icon]').replaceChildren()
    drawIcons(link)
  }
  const [title, description] = viewNames[state.view]
  $('#page-title').textContent = title
  $('#page-description').textContent = description
  renderActiveView()
  if (focus) {
    window.scrollTo(0, 0)
    $('#page-title').focus({ preventScroll: true })
  }
}

const dialog = $('#detail-dialog')
const featureHelp = $('#feature-help')
let helpTrigger = null
let helpCloseTimer

function closeFeatureHelp() {
  clearTimeout(helpCloseTimer)
  if (!helpTrigger) return
  featureHelp.hidePopover()
  helpTrigger = null
}

function showFeatureHelp(trigger) {
  clearTimeout(helpCloseTimer)
  if (trigger === helpTrigger) return
  closeFeatureHelp()
  helpTrigger = trigger
  featureHelp.textContent = trigger.nextElementSibling.textContent
  featureHelp.showPopover()

  const anchor = trigger.getBoundingClientRect()
  const { width, height } = featureHelp.getBoundingClientRect()
  const center = anchor.left + anchor.width / 2
  const left = Math.max(8, Math.min(center - width / 2, innerWidth - width - 8))
  const above = anchor.top >= height + 16
  const top = above ? anchor.top - height - 8 : Math.min(anchor.bottom + 8, innerHeight - height - 8)
  featureHelp.style.left = left + 'px'
  featureHelp.style.top = Math.max(8, top) + 'px'
  featureHelp.style.setProperty('--help-anchor', center - left + 'px')
  featureHelp.classList.toggle('feature-help-above', above)
}

function deferFeatureHelpClose() {
  clearTimeout(helpCloseTimer)
  if (helpTrigger && !helpTrigger.matches(':focus-visible')) {
    helpCloseTimer = setTimeout(closeFeatureHelp, 160)
  }
}

function detailStats(stats) {
  return `<dl class="dialog-stats">${stats.map(([label, value]) =>
    `<div><dt>${label}</dt><dd>${value}</dd></div>`
  ).join('')}</dl>`
}

function showPageDetail(id) {
  const page = current.pages.find(row => row.id === id)
  if (!page) return
  $('#detail-title').textContent = page.name
  $('#detail-context').textContent = roles[page.role].label + ' / ' + pagePath(page)
  const stats = [['访问量 PV', format(page.pv)], ['访客 UV', format(page.visitors.size)], ['有效曝光', format(page.exposure)]]
  const action = page.featureStats.size
    ? `<a class="text-link" href="#features" data-filter-page="${page.id}">查看此页面的功能使用</a>`
    : '此页面采集页面访问与有效曝光。'
  const reference = page.path || page.source
  $('#detail-body').innerHTML = detailStats(stats) +
    `<p class="dialog-note dialog-context">${page.path ? '路由' : '菜单组件'} <code>${reference}</code><br>有效曝光率 ${percent(page.exposure, page.pv)}。<br>${action}</p>`
  dialog.showModal()
}

function showFeatureDetail(id, context) {
  const feature = current.features.find(row => row.id === id && row.page.id === context)
  if (!feature) return
  $('#detail-title').textContent = feature.label
  $('#detail-context').textContent = roles[feature.role].label + ' / ' + pagePath(feature.page)
  const stats = [
    ['曝光人数', format(feature.exposed.size)], ['点击量', format(feature.click)], ['点击人数', format(feature.clicked.size)],
    ['点击率', percent(feature.clicked.size, feature.exposed.size)]
  ]
  if (feature.success !== null) {
    stats.push(['成功次数', format(feature.success)], ['点击成功率', percent(feature.success, feature.click)])
  }
  const note = describeFeature(feature.page.id, feature.id)
  const resultNote = feature.success === null ? '' : ' 业务成功次数只计与点击关联的结果。'
  $('#detail-body').innerHTML = `<div class="dialog-feature-note"><p>${note}</p></div>` + detailStats(stats) +
    `<p class="dialog-note">点击率 = 点击人数 ÷ 曝光人数。${resultNote}<br>事件键 <code>${feature.id}</code></p>`
  dialog.showModal()
}

$('#page-search').addEventListener('input', event => {
  state.pageQuery = event.target.value
  renderPages()
})
$('#page-kind').addEventListener('change', event => {
  state.pageKind = event.target.value
  renderPages()
})
$('#menu-filter').addEventListener('change', event => {
  state.group = event.target.value
  updateData()
})
$('#feature-search').addEventListener('input', event => {
  state.featureQuery = event.target.value
  renderFeatures()
})
$('#feature-page').addEventListener('change', event => {
  state.featurePage = event.target.value
  renderFeatures()
})

const datePanel = $('#date-panel')
const dateStart = $('#date-start')
const dateEnd = $('#date-end')
for (const input of [dateStart, dateEnd]) {
  input.min = min
  input.max = end
  input.addEventListener('input', () => dateEnd.setCustomValidity(''))
}

datePanel.addEventListener('beforetoggle', event => {
  if (event.newState !== 'open') return
  dateStart.value = state.start
  dateEnd.value = state.end
  dateEnd.setCustomValidity('')
  const box = $('#date-trigger').getBoundingClientRect()
  const panelTop = box.bottom + 8 + 233 < innerHeight ? box.bottom + 8 : Math.max(12, box.top - 241)
  datePanel.style.setProperty('--popover-top', panelTop + 'px')
  datePanel.style.setProperty('--popover-right', Math.max(12, innerWidth - box.right) + 'px')
})

$('#date-form').addEventListener('submit', event => {
  event.preventDefault()
  if (dateEnd.value < dateStart.value) {
    dateEnd.setCustomValidity('结束日期需要晚于或等于开始日期')
    dateEnd.reportValidity()
    return
  }
  state.start = dateStart.value
  state.end = dateEnd.value
  datePanel.hidePopover()
  $('#date-trigger').focus()
  updateData()
})

document.addEventListener('pointerover', event => {
  const trigger = event.target.closest('[data-feature-detail]')
  if (event.pointerType === 'mouse' && trigger) showFeatureHelp(trigger)
})

document.addEventListener('pointerout', event => {
  if (event.target === helpTrigger && event.pointerType === 'mouse') deferFeatureHelpClose()
})

featureHelp.addEventListener('pointerenter', () => clearTimeout(helpCloseTimer))
featureHelp.addEventListener('pointerleave', deferFeatureHelpClose)

document.addEventListener('focusin', event => {
  if (event.target.matches('[data-feature-detail]:focus-visible')) showFeatureHelp(event.target)
})

document.addEventListener('focusout', event => {
  if (event.target === helpTrigger) closeFeatureHelp()
})

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !helpTrigger) return
  event.preventDefault()
  closeFeatureHelp()
})

document.addEventListener('scroll', closeFeatureHelp, true)
window.addEventListener('resize', closeFeatureHelp)

document.addEventListener('click', event => {
  if (!featureHelp.contains(event.target)) closeFeatureHelp()

  const button = event.target.closest('button, a')
  if (!button) return
  const { role, days, metric, sort, sortKey, pageDetail, featureDetail, featureContext, filterPage } = button.dataset
  if (role && state.role !== role) {
    state.role = role
    if (role !== 'all' && !menus[role].some(([id]) => id === state.group)) state.group = ''
    updateData()
  }
  if (days) {
    state.start = dateAt(end, 1 - Number(days))
    state.end = end
    datePanel.hidePopover()
    $('#date-trigger').focus()
    updateData()
  }
  if (metric) {
    state.metric = metric
    state.selectedDay = null
    selectPressed('[data-metric]', 'metric', metric)
    renderChart()
  }
  if (sort) {
    const choice = state[sort + 'Sort']
    choice.direction = choice.key === sortKey ? -choice.direction : -1
    choice.key = sortKey
    renderActiveView()
    $(`[data-sort="${sort}"][data-sort-key="${sortKey}"]`)?.focus()
  }
  if (pageDetail) showPageDetail(pageDetail)
  if (featureDetail) showFeatureDetail(featureDetail, featureContext)
  if (filterPage) {
    state.featurePage = filterPage
    state.featureQuery = ''
    $('#feature-search').value = ''
    $('#feature-page').value = filterPage
    dialog.close()
  }
})

chart.addEventListener('pointermove', event => {
  if (!chartFrame) return
  const { xStart, xEnd, dayCount } = chartFrame
  const x = event.clientX - chart.getBoundingClientRect().left
  const index = Math.round((x - xStart) / (xEnd - xStart) * (dayCount - 1))
  inspectDay(Math.max(0, Math.min(dayCount - 1, index)))
})
chart.addEventListener('pointerleave', () => inspectDay(null))
chart.addEventListener('focus', () => inspectDay(state.selectedDay ?? 0, true))
chart.addEventListener('blur', () => inspectDay(null))
chart.addEventListener('keydown', event => {
  const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key]
  if (!direction) return
  event.preventDefault()
  const index = (state.selectedDay ?? 0) + direction
  inspectDay(Math.max(0, Math.min(current.trend.length - 1, index)), true)
})

window.addEventListener('hashchange', () => showView(true))
new ResizeObserver(renderChart).observe($('#trend-plot'))

drawIcons()
updateData(false)
showView(false)

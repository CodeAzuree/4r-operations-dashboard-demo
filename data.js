const OPS_DATA = (() => {
  const roles = {
    teacher: { label: '教师端', color: '#409eff', pool: 390, daily: 160, week: [1.02, 1.04, .92, .56, .48, 1.12, 1.16] },
    student: { label: '学生端', color: '#67c23a', pool: 1480, daily: 670, week: [1.00, 1.08, .88, .69, .83, 1.14, 1.24] }
  }

  const { pages: catalog, exposureOnly } = OPS_CATALOG

  const dateAt = (start, offset) => {
    const date = new Date(start + 'T00:00:00Z')
    return new Date(date.getTime() + offset * 86400000).toISOString().slice(0, 10)
  }
  const end = '2026-11-24'
  const min = dateAt(end, -29)
  const firstDate = dateAt(end, -59)
  const dates = Array.from({ length: 60 }, (_, index) => dateAt(firstDate, index))

  let seed = 167819
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }

  function shuffle(items) {
    for (let index = items.length - 1; index > 0; index--) {
      const pick = Math.floor(random() * (index + 1))
      ;[items[index], items[pick]] = [items[pick], items[index]]
    }
    return items
  }

  function samplePage(page, group, active, scale) {
    const reach = Math.min(active.length, Math.round(page.reach * scale * (.90 + random() * .20)))
    const offset = Math.floor(random() * active.length)
    const visitors = Array.from({ length: reach }, (_, index) => active[(offset + index) % active.length])
    const exposedVisitors = []
    let pv = 0
    let exposure = 0

    for (const visitor of visitors) {
      const visits = 1 + (random() < .47 ? 1 : 0) + (random() < .14 ? 1 : 0)
      let seen = false
      pv += visits
      for (let index = 0; index < visits; index++) {
        if (random() < .88) {
          exposure++
          seen = true
        }
      }
      if (seen) exposedVisitors.push(visitor)
    }

    const features = page.features.map(([id, label, visibility, probability, successRate]) => {
      const exposed = []
      const clicked = []
      let click = 0
      let success = 0

      for (const visitor of exposedVisitors) {
        if (random() >= visibility) continue
        exposed.push(visitor)
        if (random() >= probability) continue
        clicked.push(visitor)
        const attempts = random() < .15 ? 2 : 1
        click += attempts
        if (successRate) {
          for (let attempt = 0; attempt < attempts; attempt++) {
            if (random() < successRate) success++
          }
        }
      }
      return { id, label, successRate, exposed, clicked, click, success }
    })

    return { page, group, visitors, pv, exposure, features }
  }

  const history = Object.fromEntries(dates.map((date, index) => {
    const weekday = (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7
    const menus = {}
    const samples = Object.fromEntries(Object.entries(roles).map(([id, role]) => {
      const scale = role.week[weekday] * (.75 + .24 * (index / 59)) * (.92 + random() * .16)
      const audience = shuffle(Array.from({ length: role.pool }, (_, actor) => id + actor))
      const active = audience.slice(0, Math.round(role.daily * scale))
      if (id === 'teacher') {
        for (const [position, group] of exposureOnly.entries()) {
          const visitors = active.filter(() => random() < .15 - position * .035)
          menus[group] = { visitors, exposure: visitors.length + visitors.filter(() => random() < .22).length }
        }
      }
      const pageSamples = catalog[id].flatMap(page => page.groups.map(group =>
        samplePage(page, group, active, scale / page.groups.length)
      ))
      return [id, pageSamples]
    }))
    return [date, { ...samples, menus }]
  }))

  function newPageSummary(page, role) {
    return { ...page, role, visitors: new Set(), pv: 0, exposure: 0, featureStats: new Map() }
  }

  function summarize(start, end, selectedRole, selectedGroup = '') {
    const days = dates.filter(date => date >= start && date <= end)
    const permittedRoles = selectedRole === 'all' ? Object.keys(roles) : [selectedRole]
    const activeRoles = permittedRoles.filter(role => !selectedGroup ||
      OPS_CATALOG.menus[role].some(([id]) => id === selectedGroup) ||
      catalog[role].some(page => page.groups.includes(selectedGroup))
    )
    const totals = { pv: 0, uv: 0, exposure: 0, click: 0 }
    const totalsByRole = Object.fromEntries(activeRoles.map(role => [role, 0]))
    const uniqueVisitors = new Set()
    const pages = new Map()
    const menuTotals = new Map()
    if (activeRoles.includes('teacher')) {
      for (const group of exposureOnly) {
        if (!selectedGroup || selectedGroup === group) {
          menuTotals.set(group, { id: group, exposure: 0, visitors: new Set() })
        }
      }
    }
    const trend = days.map(date => {
      const daily = {}
      for (const [group, total] of menuTotals) {
        const sample = history[date].menus[group]
        total.exposure += sample.exposure
        for (const visitor of sample.visitors) total.visitors.add(visitor)
      }
      for (const role of activeRoles) {
        const dayVisitors = new Set()
        const metrics = { pv: 0, exposure: 0 }
        for (const sample of history[date][role]) {
          if (selectedGroup && sample.group !== selectedGroup) continue
          if (!pages.has(sample.page.id)) pages.set(sample.page.id, newPageSummary(sample.page, role))
          const summary = pages.get(sample.page.id)
          summary.pv += sample.pv
          summary.exposure += sample.exposure
          metrics.pv += sample.pv
          metrics.exposure += sample.exposure
          for (const visitor of sample.visitors) {
            dayVisitors.add(visitor)
            uniqueVisitors.add(visitor)
            summary.visitors.add(visitor)
          }
          for (const feature of sample.features) {
            if (!summary.featureStats.has(feature.id)) {
              summary.featureStats.set(feature.id, {
                id: feature.id, label: feature.label, page: sample.page, role,
                click: 0, success: feature.successRate ? 0 : null, exposed: new Set(), clicked: new Set()
              })
            }
            const target = summary.featureStats.get(feature.id)
            target.click += feature.click
            if (target.success !== null) target.success += feature.success
            feature.exposed.forEach(visitor => target.exposed.add(visitor))
            feature.clicked.forEach(visitor => target.clicked.add(visitor))
            totals.click += feature.click
          }
        }
        totals.pv += metrics.pv
        totals.exposure += metrics.exposure
        totalsByRole[role] += metrics.pv
        daily[role] = { ...metrics, uv: dayVisitors.size }
      }
      return { date, daily }
    })
    totals.uv = uniqueVisitors.size
    return {
      totals, totalsByRole, trend, pages: [...pages.values()], menus: [...menuTotals.values()],
      features: [...pages.values()].flatMap(page => [...page.featureStats.values()])
    }
  }

  return { roles, catalog, dateAt, min, end, summarize }
})()

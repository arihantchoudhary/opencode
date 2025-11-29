# Cerebras Visibility & Usage Analytics Enhancements

## Current State Analysis

### ✅ What We Already Have

#### 1. **Telemetry System** (`src/session/telemetry.ts`)

- Real-time request tracking
- RPM (Requests Per Minute) monitoring
- Token usage tracking (input/output/total)
- Cache hit rate analysis
- Average response time tracking
- Provider/model breakdown
- Session-level and global metrics
- Auto-cleanup of old data (1 hour retention for requests)

#### 2. **Stats Command** (`src/cli/cmd/stats.ts`)

- Historical usage statistics
- Cost tracking and analysis
- Token usage aggregation
- Tool usage analytics with visual bars
- Date range filtering
- Project-level filtering
- Per-day cost calculations

#### 3. **Token Budget System** (`src/session/token-budget.ts`)

- Session-level token limits
- Budget warnings and alerts
- Token consumption tracking

---

## 🚀 Proposed Enhancements

### **Phase 1: Enhanced Terminal UI Dashboard**

#### 1.1 Real-Time Usage Dashboard (TUI Component)

**Location**: New file `packages/cerebras/src/cli/cmd/tui/routes/dashboard.tsx`

**Features**:

```typescript
// Live dashboard showing:
- Real-time RPM meter (animated gauge)
- Token consumption graph (last 60 minutes)
- Cost tracker (session + total)
- Provider distribution pie chart (ASCII art)
- Top 5 most-used tools
- Cache hit rate sparkline
- Current session health status
```

**UI Mockup**:

```
┌─ Cerebras Live Dashboard ─────────────────────────────────────┐
│                                                                │
│ ⚡ Session: abc123     Status: ● Active    Duration: 15m 32s   │
│                                                                │
│ 📊 PERFORMANCE                      💰 COST                   │
│ ├─ RPM: 12.5 ▓▓▓▓▓▓▓▓░░░░  (62%)   ├─ Session: $0.45        │
│ ├─ Avg Response: 1.2s               ├─ Total: $12.34         │
│ └─ Cache Hit: 78% ▓▓▓▓▓▓▓▓▓▓▓▓░░     └─ Rate: $0.03/min      │
│                                                                │
│ 🎯 TOKEN USAGE (Last Hour)                                    │
│ 45K ┤         ╭─╮                                             │
│ 30K ┤    ╭────╯ ╰╮                                            │
│ 15K ┤ ╭──╯       ╰─╮                                          │
│  0K ┴──────────────────────────────────────                   │
│     15m  12m  9m   6m   3m   now                              │
│                                                                │
│ 🔧 TOP TOOLS              📦 PROVIDERS                         │
│ ├─ Read      ▓▓▓▓▓ 42    ├─ Anthropic  65%                   │
│ ├─ Edit      ▓▓▓▓  38    ├─ OpenAI     25%                   │
│ ├─ Bash      ▓▓▓   25    └─ Cerebras   10%                   │
│ └─ Grep      ▓▓    18                                         │
│                                                                │
│ [F5: Refresh] [Q: Quit] [S: Stats] [E: Export]                │
└────────────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
export function DashboardRoute() {
  const [metrics, setMetrics] = createSignal<Telemetry.SessionMetrics>()

  // Auto-refresh every 2 seconds
  onMount(() => {
    const interval = setInterval(() => {
      const latest = Telemetry.getSessionMetrics(sessionID)
      setMetrics(latest)
    }, 2000)

    onCleanup(() => clearInterval(interval))
  })

  return (
    <box flexDirection="column">
      <Header />
      <PerformancePanel metrics={metrics()} />
      <TokenUsageGraph data={metrics()?.requests} />
      <ToolsAndProviders metrics={metrics()} />
      <Footer />
    </box>
  )
}
```

---

#### 1.2 Enhanced Session Header

**Location**: `packages/cerebras/src/cli/cmd/tui/routes/session/header.tsx`

**Add**:

- Visual budget indicator (progress bar)
- Color-coded status (green/yellow/red based on usage)
- Cost-per-minute rate
- Estimated remaining budget

**Current**:

```
Context | Session: 45,234/100,000 (45%) $0.12
```

**Enhanced**:

```
📊 45.2K/100K [▓▓▓▓▓░░░░░] 45% | 💰$0.12 ($0.03/min) | ⚡12 RPM | 🎯78% cache
Status: ● Healthy
```

---

### **Phase 2: Advanced Analytics & Reporting**

#### 2.1 Export & Reporting System

**New file**: `packages/cerebras/src/analytics/exporter.ts`

**Formats**:

```typescript
export namespace Analytics {
  // Export to CSV
  export function toCSV(sessionID: string): string

  // Export to JSON (detailed)
  export function toJSON(sessionID: string): object

  // Generate markdown report
  export function toMarkdown(sessionID: string): string

  // Export to SQLite for analysis
  export function toSQLite(sessions: string[]): void
}
```

**CLI Commands**:

```bash
# Export current session
cerebras export --format=csv --output=session-stats.csv

# Export all sessions from last 7 days
cerebras export --days=7 --format=json --output=weekly-report.json

# Generate summary report
cerebras report --days=30 --save=monthly-report.md
```

---

#### 2.2 Insights & Recommendations Engine

**New file**: `packages/cerebras/src/analytics/insights.ts`

**Features**:

```typescript
export namespace Insights {
  // Analyze usage patterns
  export function analyzePatterns(sessionID: string): {
    peakUsageHours: number[]
    mostUsedTools: string[]
    costOptimizationTips: string[]
    unusualActivity: Alert[]
  }

  // Cost optimization suggestions
  export function suggestOptimizations(): {
    switchToProvider: string // Cheaper alternative
    cacheImprovements: string[]
    budgetRecommendations: number
  }

  // Quality metrics
  export function calculateQuality(): {
    averageTaskCompletionTime: number
    errorRate: number
    retryRate: number
    userSatisfactionScore: number
  }
}
```

**Example Output**:

```
💡 INSIGHTS & RECOMMENDATIONS

🎯 Usage Patterns:
  • Peak hours: 2pm-4pm (45% of requests)
  • Most productive: Tuesday, Thursday
  • Avg session length: 18 minutes

💰 Cost Optimization:
  • Consider switching to Cerebras for simple tasks (40% cost reduction)
  • Cache hit rate is low (45%) - increase context window
  • Estimated savings: $15/month

⚠️  Alerts:
  • Unusual spike in token usage yesterday (+250%)
  • 3 sessions exceeded budget limits this week
```

---

### **Phase 3: Web Dashboard Integration**

#### 3.1 Console Dashboard (Web UI)

**Location**: `packages/console/app/src/routes/dashboard`

**Features**:

- Interactive charts (Recharts/D3)
- Real-time WebSocket updates
- Historical trend analysis
- Team usage (if enterprise)
- Cost forecasting
- Provider comparison
- Export to PDF/Excel

**Components**:

```tsx
<Dashboard>
  <UsageChart type="line" timeRange="30d" />
  <CostBreakdown by="provider" />
  <ToolsHeatmap />
  <SessionsList filters={...} />
  <Alerts />
  <Recommendations />
</Dashboard>
```

---

#### 3.2 Shared Session Analytics

**For teams/enterprise**:

```typescript
// Team-level metrics
export namespace TeamAnalytics {
  export function getTeamUsage(teamID: string): {
    totalMembers: number
    totalSessions: number
    topContributors: User[]
    totalCost: number
    budgetUtilization: number
  }

  // User comparison
  export function compareUsers(userIDs: string[]): ComparisonReport
}
```

---

### **Phase 4: Advanced Features**

#### 4.1 Predictive Analytics

```typescript
export namespace Predictions {
  // Forecast costs based on historical data
  export function forecastCost(days: number): {
    estimated: number
    confidence: number
    factors: string[]
  }

  // Predict when budget will be exhausted
  export function budgetExhaustion(): Date

  // Recommend optimal budget allocation
  export function optimizeBudget(): {
    recommended: number
    reasoning: string[]
  }
}
```

---

#### 4.2 Anomaly Detection

```typescript
export namespace AnomalyDetection {
  // Detect unusual patterns
  export function detectAnomalies(sessionID: string): {
    type: "cost_spike" | "token_surge" | "error_rate"
    severity: "low" | "medium" | "high"
    description: string
    recommendation: string
  }[]

  // Alert on budget risks
  export function budgetAlerts(): Alert[]
}
```

---

#### 4.3 Usage Benchmarking

```typescript
export namespace Benchmarks {
  // Compare against anonymous aggregate data
  export function compareToAverage(): {
    tokensPerSession: "below" | "average" | "above"
    costEfficiency: number // 0-100 score
    toolUsagePattern: string
  }

  // Best practices recommendations
  export function suggestBestPractices(): string[]
}
```

---

### **Phase 5: Integrations**

#### 5.1 Slack Notifications

```yaml
# .cerebras/config.yml
integrations:
  slack:
    webhook: https://hooks.slack.com/...
    notifications:
      - budget_warning: 80%
      - daily_summary: true
      - anomaly_detection: true
```

---

#### 5.2 Grafana/Prometheus Metrics

```typescript
// Export metrics in Prometheus format
export namespace Prometheus {
  export function exposeMetrics(port: number): void

  // Metrics endpoint: http://localhost:9090/metrics
}
```

---

#### 5.3 GitHub Integration

```typescript
// Auto-comment on PRs with usage stats
export namespace GitHub {
  export function commentOnPR(prNumber: number, stats: SessionStats): void

  // Track which PRs used most tokens
  export function trackPRUsage(): Map<number, UsageStats>
}
```

---

## 📊 Data Schema Enhancements

### New Storage Structure

```typescript
// Enhanced session metadata
interface SessionMetadata {
  id: string
  projectID: string
  userID?: string
  teamID?: string

  // Enhanced tracking
  tags: string[] // e.g., ['bug-fix', 'feature-dev']
  category: "development" | "research" | "debugging" | "learning"
  quality: {
    userRating?: 1 | 2 | 3 | 4 | 5
    taskCompleted: boolean
    errorsEncountered: number
  }

  // Context
  repository?: string
  branch?: string
  files: string[] // Files touched in this session

  // Performance
  performance: {
    firstResponseTime: number
    averageResponseTime: number
    totalDuration: number
  }
}
```

---

## 🎯 Quick Wins (Implement First)

### 1. **Enhanced Stats Command** (2 hours)

Add new flags:

```bash
cerebras stats --visualize    # ASCII charts
cerebras stats --compare      # Week-over-week comparison
cerebras stats --export=csv   # Export to CSV
cerebras stats --insights     # Show recommendations
```

### 2. **Budget Alerts in TUI** (3 hours)

Show visual warnings when approaching limits:

```
⚠️  WARNING: 85% of session budget used (42.5K/50K tokens)
   Consider starting a new session or increasing budget.
```

### 3. **Real-time Cost Display** (2 hours)

Update header to show:

- Cost incrementing in real-time
- Cost-per-minute rate
- Projected session cost

### 4. **Session Summary on Exit** (1 hour)

```
📊 SESSION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duration: 23 minutes
Requests: 18
Tokens: 45,234
Cost: $0.87 ($0.04/min)
Tools: Read (12), Edit (8), Bash (5)
Cache Hit: 78%

💡 Tip: Your cache hit rate is excellent!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏗️ Implementation Roadmap

### Week 1: Foundation

- [ ] Enhance telemetry with additional metrics
- [ ] Add session quality tracking
- [ ] Implement CSV/JSON export

### Week 2: Terminal UI

- [ ] Build real-time dashboard component
- [ ] Enhanced session header with budget visualization
- [ ] Session summary on exit

### Week 3: Analytics

- [ ] Insights engine
- [ ] Anomaly detection
- [ ] Cost forecasting

### Week 4: Web Dashboard

- [ ] React dashboard components
- [ ] Charts and visualizations
- [ ] Real-time updates via WebSocket

### Week 5: Integrations

- [ ] Slack notifications
- [ ] Prometheus metrics
- [ ] GitHub integration

---

## 💡 Usage Examples

### For Individual Developers

```bash
# Check today's usage
cerebras stats --days=1

# See real-time dashboard
cerebras dashboard

# Export weekly report
cerebras report --days=7 --output=weekly.md
```

### For Teams

```bash
# Team summary
cerebras stats --team=engineering

# Compare team members
cerebras compare --users=alice,bob,charlie

# Set team budget
cerebras budget set --team=engineering --limit=1000
```

### For Cost Optimization

```bash
# Find cost-saving opportunities
cerebras optimize --suggestions

# Compare providers for your workload
cerebras compare-providers --days=30

# Forecast next month's cost
cerebras forecast --days=30
```

---

## 🎨 UI/UX Enhancements

### Color Coding

```typescript
const statusColors = {
  healthy: "#10b981", // Green - under 50% budget
  warning: "#f59e0b", // Orange - 50-80% budget
  critical: "#ef4444", // Red - over 80% budget
  excellent: "#3b82f6", // Blue - great cache hit rate
}
```

### Progress Indicators

```
Budget:  [▓▓▓▓▓▓░░░░] 60%  ⚠️
Cache:   [▓▓▓▓▓▓▓▓▓░] 85%  ✓
RPM:     [▓▓▓░░░░░░░] 30%  ✓
```

### Sparklines for Trends

```
Tokens: ▁▂▃▅▇█▇▅▃▂▁ (trending down)
Cost:   ▁▁▂▂▃▄▅▆▇█▇ (trending up)
```

---

## 📈 Success Metrics

Track these to measure success of visibility enhancements:

1. **User Engagement**
   - % of users who run `stats` command
   - Dashboard views per session
   - Export/report generation frequency

2. **Cost Awareness**
   - % reduction in budget overages
   - % users who optimize provider selection
   - Avg cost per session (should decrease)

3. **Efficiency**
   - Cache hit rate improvement
   - Avg tokens per task (should decrease)
   - Tool usage optimization

4. **Satisfaction**
   - User ratings after implementing recommendations
   - Feature request rate for analytics
   - Community feedback on visibility

---

## 🔐 Privacy & Security

### Data Collection

- **Anonymous by default**: No PII collected
- **Opt-in for advanced analytics**: User must explicitly enable
- **Local-first**: All data stored locally unless user opts into cloud sync
- **Transparent**: Clear documentation on what's tracked

### Configuration

```yaml
# .cerebras/config.yml
analytics:
  enabled: true
  anonymous: true # Don't send data to servers
  detailed_tracking: false # Minimal tracking only
  share_aggregate: false # Don't contribute to benchmarks
```

---

## 🚀 Next Steps

1. **Prioritize quick wins** (Week 1)
2. **Build TUI dashboard** (Week 2)
3. **Add insights engine** (Week 3)
4. **Launch web dashboard** (Week 4)
5. **Roll out integrations** (Week 5)

---

## 📝 Notes

- All analytics should be **opt-in** for detailed tracking
- Keep terminal UI **lightweight** (no heavy dependencies)
- Ensure **fast queries** (index properly, use caching)
- Make it **actionable** (not just pretty charts)
- **Privacy-first** approach (local storage, no tracking without consent)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Owner**: Product Team

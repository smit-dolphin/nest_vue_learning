<script setup lang="ts">
import { ref } from 'vue'
import {
  Captions,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Play,
  MoreHorizontal,
  Sparkles,
  Zap,
  FileVideo,
} from 'lucide-vue-next'

const stats = [
  {
    label: 'Total Subtitles',
    value: '1,284',
    change: '+12.5%',
    trend: 'up',
    icon: Captions,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
  {
    label: 'Hours Processed',
    value: '348h',
    change: '+8.2%',
    trend: 'up',
    icon: Clock,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
  },
  {
    label: 'Accuracy Rate',
    value: '98.4%',
    change: '+0.3%',
    trend: 'up',
    icon: TrendingUp,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    label: 'Completed Today',
    value: '24',
    change: '+4',
    trend: 'up',
    icon: CheckCircle2,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
]

const recentJobs = [
  { title: 'Product Demo Q3.mp4', lang: 'English', duration: '4:32', status: 'done', time: '2 min ago' },
  { title: 'CEO Interview Final.mov', lang: 'Spanish', duration: '12:18', status: 'done', time: '1 hr ago' },
  { title: 'Tutorial Episode 7.mp4', lang: 'French', duration: '8:45', status: 'processing', time: 'In progress' },
  { title: 'Marketing Reel.mp4', lang: 'German', duration: '1:20', status: 'done', time: '3 hr ago' },
  { title: 'Webinar Recording.mkv', lang: 'Japanese', duration: '58:02', status: 'queued', time: 'Queued' },
]

const languages = [
  { name: 'English', pct: 44, color: '#8b5cf6' },
  { name: 'Spanish', pct: 22, color: '#06b6d4' },
  { name: 'French', pct: 18, color: '#10b981' },
  { name: 'German', pct: 10, color: '#f59e0b' },
  { name: 'Other', pct: 6, color: '#6b7280' },
]

const statusClass = (s: string) => ({
  'done': 'badge--success',
  'processing': 'badge--info',
  'queued': 'badge--warning',
}[s] ?? '')
</script>

<template>
  <div class="dashboard">
    <!-- Hero Banner -->
    <div class="dashboard__hero">
      <div class="dashboard__hero-content">
        <div class="dashboard__hero-badge">
          <Sparkles :size="13" />
          <span>AI-Powered Subtitle Engine</span>
        </div>
        <h2 class="dashboard__hero-title">Welcome back, <span class="gradient-text">Smit</span> 👋</h2>
        <p class="dashboard__hero-sub">Your subtitle generator is running smoothly. Here's an overview of your activity.</p>
        <div class="dashboard__hero-actions">
          <router-link to="/generate-subtitle" class="btn btn--primary">
            <Zap :size="15" />
            Generate Subtitles
          </router-link>
          <router-link to="/library" class="btn btn--ghost">
            <FileVideo :size="15" />
            View Library
          </router-link>
        </div>
      </div>
      <div class="dashboard__hero-visual">
        <div class="hero-orb hero-orb--1"></div>
        <div class="hero-orb hero-orb--2"></div>
        <div class="hero-card">
          <Captions :size="28" class="hero-card__icon" />
          <p class="hero-card__label">Subtitle Engine</p>
          <p class="hero-card__status"><span class="status-dot"></span> Active</p>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="dashboard__stats">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-card__header">
          <div class="stat-card__icon" :style="{ background: stat.bg, color: stat.color }">
            <component :is="stat.icon" :size="18" />
          </div>
          <span class="stat-card__change" :class="stat.trend === 'up' ? 'stat-card__change--up' : ''">
            <ArrowUpRight :size="13" /> {{ stat.change }}
          </span>
        </div>
        <p class="stat-card__value">{{ stat.value }}</p>
        <p class="stat-card__label">{{ stat.label }}</p>
        <div class="stat-card__bar">
          <div class="stat-card__bar-fill" :style="{ background: stat.color, width: '65%' }"></div>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="dashboard__bottom">
      <!-- Recent Jobs -->
      <div class="card card--wide">
        <div class="card__header">
          <div>
            <h3 class="card__title">Recent Jobs</h3>
            <p class="card__sub">Latest subtitle generation tasks</p>
          </div>
          <button class="btn btn--ghost btn--sm">View All</button>
        </div>
        <div class="jobs-table">
          <div class="jobs-table__head">
            <span>File</span>
            <span>Language</span>
            <span>Duration</span>
            <span>Status</span>
            <span>Time</span>
            <span></span>
          </div>
          <div v-for="job in recentJobs" :key="job.title" class="jobs-table__row">
            <div class="jobs-table__file">
              <div class="jobs-table__file-icon"><Play :size="11" /></div>
              <span class="jobs-table__filename">{{ job.title }}</span>
            </div>
            <span class="jobs-table__lang">{{ job.lang }}</span>
            <span class="jobs-table__dur">{{ job.duration }}</span>
            <span class="badge" :class="statusClass(job.status)">{{ job.status }}</span>
            <span class="jobs-table__time">{{ job.time }}</span>
            <button class="jobs-table__more"><MoreHorizontal :size="15" /></button>
          </div>
        </div>
      </div>

      <!-- Language Breakdown -->
      <div class="card">
        <div class="card__header">
          <div>
            <h3 class="card__title">Language Breakdown</h3>
            <p class="card__sub">Top languages this month</p>
          </div>
        </div>
        <div class="lang-list">
          <div v-for="lang in languages" :key="lang.name" class="lang-item">
            <div class="lang-item__info">
              <span class="lang-item__dot" :style="{ background: lang.color }"></span>
              <span class="lang-item__name">{{ lang.name }}</span>
              <span class="lang-item__pct">{{ lang.pct }}%</span>
            </div>
            <div class="lang-item__bar-track">
              <div
                class="lang-item__bar-fill"
                :style="{ width: lang.pct + '%', background: lang.color }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Donut visual -->
        <div class="donut-wrap">
          <svg class="donut" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--card-color)" stroke-width="14"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" stroke-width="14"
              stroke-dasharray="106 133" stroke-dashoffset="0" stroke-linecap="round"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" stroke-width="14"
              stroke-dasharray="53 186" stroke-dashoffset="-106" stroke-linecap="round"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" stroke-width="14"
              stroke-dasharray="43 196" stroke-dashoffset="-159" stroke-linecap="round"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" stroke-width="14"
              stroke-dasharray="24 215" stroke-dashoffset="-202" stroke-linecap="round"/>
            <text x="50" y="53" text-anchor="middle" fill="#f3f4f6" font-size="13" font-weight="700">1,284</text>
            <text x="50" y="63" text-anchor="middle" fill="#6b7280" font-size="6">total</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Hero */
.dashboard__hero {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.dashboard__hero::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.dashboard__hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--team-color-light);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 0.3rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #c4b5fd;
  margin-bottom: 0.75rem;
}

.dashboard__hero-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.dashboard__hero-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
  max-width: 420px;
}

.dashboard__hero-actions {
  display: flex;
  gap: 0.75rem;
}

/* Hero Visual */
.dashboard__hero-visual {
  position: relative;
  width: 160px;
  height: 120px;
  flex-shrink: 0;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
}

.hero-orb--1 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%);
  top: 0; right: 0;
  animation: float 3s ease-in-out infinite;
}

.hero-orb--2 {
  width: 70px;
  height: 70px;
  background: radial-gradient(circle, rgba(217,70,239,0.3), transparent 70%);
  bottom: 0; left: 0;
  animation: float 3s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hero-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--card-color);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  text-align: center;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.hero-card__icon { color: var(--primary-color); margin-bottom: 4px; }
.hero-card__label { font-size: 0.7rem; color: var(--text-secondary); margin: 0; }
.hero-card__status { font-size: 0.68rem; color: var(--success-color); margin: 4px 0 0; display: flex; align-items: center; justify-content: center; gap: 5px; }

.status-dot {
  width: 6px; height: 6px;
  background: var(--success-color);
  border-radius: 50%;
  display: inline-block;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Stats */
.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  transition: border-color 0.2s, transform 0.2s;
  cursor: default;
}

.stat-card:hover {
  border-color: var(--border-light);
  transform: translateY(-2px);
}

.stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.stat-card__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card__change {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}

.stat-card__change--up { color: var(--success-color); }

.stat-card__value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 2px;
  line-height: 1;
}

.stat-card__label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0 0 0.85rem;
}

.stat-card__bar {
  height: 3px;
  background: var(--card-color);
  border-radius: 4px;
  overflow: hidden;
}

.stat-card__bar-fill {
  height: 100%;
  border-radius: 4px;
  opacity: 0.8;
}

/* Bottom Grid */
.dashboard__bottom {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
}

/* Card */
.card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
}

.card--wide { grid-column: 1; }

.card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.card__sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

/* Jobs Table */
.jobs-table__head {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 32px;
  gap: 0.5rem;
  padding: 0 0.5rem 0.6rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.jobs-table__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 32px;
  gap: 0.5rem;
  padding: 0.7rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  transition: background 0.15s;
}

.jobs-table__row:last-child { border-bottom: none; }
.jobs-table__row:hover { background: var(--hover-color); border-radius: 8px; }

.jobs-table__file {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.jobs-table__file-icon {
  width: 24px;
  height: 24px;
  background: var(--team-color-light);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.jobs-table__filename {
  font-size: 0.82rem;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.jobs-table__lang,
.jobs-table__dur,
.jobs-table__time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.jobs-table__more {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  transition: background 0.15s;
}
.jobs-table__more:hover { background: var(--hover-color); color: var(--text-primary); }

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 600;
  width: fit-content;
}

.badge--success { background: rgba(16,185,129,0.12); color: #10b981; }
.badge--info { background: rgba(6,182,212,0.12); color: #06b6d4; }
.badge--warning { background: rgba(245,158,11,0.12); color: #f59e0b; }

/* Language List */
.lang-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.lang-item__info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.lang-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lang-item__name {
  font-size: 0.82rem;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}

.lang-item__pct {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.lang-item__bar-track {
  height: 4px;
  background: var(--card-color);
  border-radius: 4px;
  overflow: hidden;
}

.lang-item__bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}

/* Donut */
.donut-wrap {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.donut {
  width: 120px;
  height: 120px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.55rem 1.1rem;
  border: none;
  text-decoration: none;
}

.btn--primary {
  background: var(--team-gradient);
  color: #fff;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(139, 92, 246, 0.5);
}

.btn--ghost {
  background: var(--card-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn--ghost:hover {
  background: var(--hover-color);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.btn--sm {
  font-size: 0.78rem;
  padding: 0.35rem 0.85rem;
}

/* Gradient text */
.gradient-text {
  background: var(--team-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 1200px) {
  .dashboard__stats { grid-template-columns: repeat(2, 1fr); }
  .dashboard__bottom { grid-template-columns: 1fr; }
}
</style>

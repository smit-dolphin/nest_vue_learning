<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  History, Search, Captions, Globe2, Clock, CheckCircle2,
  AlertCircle, Loader2, Download, RotateCcw, Trash2,
  CalendarDays, TrendingUp, ChevronDown
} from 'lucide-vue-next'

const searchQuery = ref('')
const filterStatus = ref('all')
const filterPeriod = ref('all')

interface HistoryItem {
  id: number
  title: string
  lang: string
  format: string
  duration: string
  segments: number
  status: 'done' | 'failed' | 'processing'
  date: string
  time: string
  accuracy?: number
}

const items: HistoryItem[] = [
  { id: 1, title: 'Product Demo Q3 2026.mp4', lang: 'English', format: 'SRT', duration: '4:32', segments: 42, status: 'done', date: 'Today', time: '2:05 PM', accuracy: 98.4 },
  { id: 2, title: 'CEO Interview Final.mov', lang: 'Spanish', format: 'WebVTT', duration: '12:18', segments: 98, status: 'done', date: 'Today', time: '11:32 AM', accuracy: 97.8 },
  { id: 3, title: 'Tutorial Episode 7.mp4', lang: 'French', format: 'SRT', duration: '8:45', segments: 0, status: 'processing', date: 'Today', time: '9:14 AM' },
  { id: 4, title: 'Marketing Reel.mp4', lang: 'German', format: 'SRT', duration: '1:20', segments: 14, status: 'done', date: 'Yesterday', time: '6:50 PM', accuracy: 99.1 },
  { id: 5, title: 'Webinar Recording.mkv', lang: 'Japanese', format: 'ASS', duration: '58:02', segments: 412, status: 'done', date: 'Yesterday', time: '3:10 PM', accuracy: 96.2 },
  { id: 6, title: 'Onboarding v2.mp4', lang: 'Korean', format: 'SRT', duration: '6:14', segments: 0, status: 'failed', date: 'Yesterday', time: '1:25 PM' },
  { id: 7, title: 'Conference Talk AI 2026.mp4', lang: 'English', format: 'WebVTT', duration: '32:48', segments: 278, status: 'done', date: 'Aug 17', time: '10:00 AM', accuracy: 98.9 },
  { id: 8, title: 'Product Teaser Short.mp4', lang: 'Portuguese', format: 'SRT', duration: '0:45', segments: 8, status: 'done', date: 'Aug 16', time: '4:30 PM', accuracy: 99.5 },
  { id: 9, title: 'Sales Training Part 3.mp4', lang: 'English', format: 'JSON', duration: '22:10', segments: 182, status: 'done', date: 'Aug 15', time: '2:15 PM', accuracy: 97.3 },
]

// Group by date
const grouped = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const filtered = items.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(q) || i.lang.toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'all' || i.status === filterStatus.value
    return matchSearch && matchStatus
  })
  const groups: Record<string, HistoryItem[]> = {}
  for (const item of filtered) {
    if (!groups[item.date]) groups[item.date] = []
    groups[item.date].push(item)
  }
  return groups
})

const statusIcon = (s: string) => ({ done: CheckCircle2, processing: Loader2, failed: AlertCircle }[s] ?? CheckCircle2)
const statusColor = (s: string) => ({ done: '#10b981', processing: '#8b5cf6', failed: '#ef4444' }[s] ?? '')
const statusBg = (s: string) => ({ done: 'rgba(16,185,129,0.1)', processing: 'rgba(139,92,246,0.1)', failed: 'rgba(239,68,68,0.1)' }[s] ?? '')

const totalDone = computed(() => items.filter(i => i.status === 'done').length)
const avgAccuracy = computed(() => {
  const doneItems = items.filter(i => i.accuracy)
  return (doneItems.reduce((a, b) => a + (b.accuracy ?? 0), 0) / doneItems.length).toFixed(1)
})
</script>

<template>
  <div class="history-page">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon"><History :size="22" /></div>
        <div>
          <h2 class="page-header__title">History</h2>
          <p class="page-header__sub">All your subtitle generation jobs</p>
        </div>
      </div>
      <button class="btn btn--ghost btn--sm">
        <Trash2 :size="14" /> Clear All
      </button>
    </div>

    <!-- Summary Strip -->
    <div class="summary-strip">
      <div class="summary-item">
        <div class="summary-item__icon summary-item__icon--purple"><Captions :size="16" /></div>
        <div>
          <p class="summary-item__value">{{ items.length }}</p>
          <p class="summary-item__label">Total Jobs</p>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-item__icon summary-item__icon--green"><CheckCircle2 :size="16" /></div>
        <div>
          <p class="summary-item__value">{{ totalDone }}</p>
          <p class="summary-item__label">Completed</p>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-item__icon summary-item__icon--cyan"><TrendingUp :size="16" /></div>
        <div>
          <p class="summary-item__value">{{ avgAccuracy }}%</p>
          <p class="summary-item__label">Avg. Accuracy</p>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-item__icon summary-item__icon--yellow"><Clock :size="16" /></div>
        <div>
          <p class="summary-item__value">48h</p>
          <p class="summary-item__label">Total Processed</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="toolbar">
      <div class="toolbar__search">
        <Search :size="15" class="toolbar__search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Search history..." class="toolbar__search-input" />
      </div>
      <div class="toolbar__filters">
        <button v-for="s in ['all','done','processing','failed']" :key="s"
          class="filter-btn" :class="{ 'filter-btn--active': filterStatus === s }"
          @click="filterStatus = s"
        >{{ s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1) }}</button>
      </div>
    </div>

    <!-- Timeline Groups -->
    <div class="timeline">
      <div v-for="(group, date) in grouped" :key="date" class="timeline__group">
        <!-- Date Header -->
        <div class="timeline__date-header">
          <CalendarDays :size="14" />
          <span>{{ date }}</span>
          <span class="timeline__date-count">{{ group.length }} job{{ group.length > 1 ? 's' : '' }}</span>
        </div>

        <!-- Items -->
        <div class="timeline__items">
          <div v-for="item in group" :key="item.id" class="history-item">
            <!-- Status line -->
            <div class="history-item__line">
              <div class="history-item__dot" :style="{ background: statusColor(item.status), boxShadow: `0 0 8px ${statusColor(item.status)}66` }">
                <component :is="statusIcon(item.status)" :size="10" :class="item.status === 'processing' ? 'spin' : ''" />
              </div>
            </div>

            <!-- Card -->
            <div class="history-card">
              <div class="history-card__top">
                <div class="history-card__info">
                  <p class="history-card__title">{{ item.title }}</p>
                  <div class="history-card__meta">
                    <span><Globe2 :size="11" /> {{ item.lang }}</span>
                    <span>{{ item.format }}</span>
                    <span><Clock :size="11" /> {{ item.duration }}</span>
                    <span v-if="item.segments"><Captions :size="11" /> {{ item.segments }} segments</span>
                    <span v-if="item.accuracy" class="history-card__accuracy">
                      <TrendingUp :size="11" /> {{ item.accuracy }}%
                    </span>
                  </div>
                </div>

                <div class="history-card__right">
                  <span class="status-chip"
                    :style="{ background: statusBg(item.status), color: statusColor(item.status) }"
                  >
                    <component :is="statusIcon(item.status)" :size="11" :class="item.status === 'processing' ? 'spin' : ''" />
                    {{ item.status }}
                  </span>
                  <p class="history-card__time">{{ item.time }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div class="history-card__actions">
                <button class="action-btn" :disabled="item.status !== 'done'">
                  <Download :size="13" /> Download
                </button>
                <button class="action-btn" :disabled="item.status === 'processing'">
                  <RotateCcw :size="13" /> Regenerate
                </button>
                <button class="action-btn action-btn--danger">
                  <Trash2 :size="13" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!Object.keys(grouped).length" class="empty-state">
        <History :size="40" />
        <p>No history found</p>
        <span>Your past jobs will appear here</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.history-page { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-header__left { display: flex; align-items: center; gap: 1rem; }
.page-header__icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 20px rgba(245,158,11,0.3); flex-shrink: 0;
}
.page-header__title { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin: 0 0 2px; }
.page-header__sub { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }

/* Summary Strip */
.summary-strip {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 1rem 1.5rem;
  display: flex; align-items: center; gap: 1.5rem;
}
.summary-item { display: flex; align-items: center; gap: 10px; }
.summary-item__icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.summary-item__icon--purple { background: rgba(139,92,246,0.12); color: #8b5cf6; }
.summary-item__icon--green { background: rgba(16,185,129,0.12); color: #10b981; }
.summary-item__icon--cyan { background: rgba(6,182,212,0.12); color: #06b6d4; }
.summary-item__icon--yellow { background: rgba(245,158,11,0.12); color: #f59e0b; }
.summary-item__value { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1; }
.summary-item__label { font-size: 0.72rem; color: var(--text-muted); margin: 2px 0 0; }
.summary-divider { width: 1px; height: 36px; background: var(--border-color); }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.toolbar__search {
  display: flex; align-items: center; gap: 8px;
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 0.5rem 0.85rem;
  transition: border-color 0.2s, box-shadow 0.2s; min-width: 250px;
}
.toolbar__search:focus-within { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
.toolbar__search-icon { color: var(--text-muted); flex-shrink: 0; }
.toolbar__search-input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.83rem; width: 100%; }
.toolbar__search-input::placeholder { color: var(--text-muted); }
.toolbar__filters { display: flex; gap: 4px; background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 10px; padding: 4px; }
.filter-btn { padding: 0.35rem 0.85rem; border-radius: 7px; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); background: transparent; border: none; cursor: pointer; transition: all 0.2s; }
.filter-btn--active { background: var(--active-color); color: var(--primary-color); }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 1.5rem; }
.timeline__group { display: flex; flex-direction: column; gap: 0.75rem; }
.timeline__date-header {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.78rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.timeline__date-count {
  background: var(--card-color); border: 1px solid var(--border-color);
  border-radius: 20px; padding: 1px 8px; font-size: 0.68rem;
}
.timeline__items { display: flex; flex-direction: column; gap: 0.5rem; padding-left: 1rem; border-left: 2px solid var(--border-color); }

/* History Item */
.history-item { display: flex; align-items: flex-start; gap: 0.85rem; position: relative; }
.history-item__line { display: flex; flex-direction: column; align-items: center; padding-top: 1rem; flex-shrink: 0; margin-left: -1.4rem; }
.history-item__dot {
  width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; border: 2px solid var(--secondary-color);
}

/* History Card */
.history-card {
  flex: 1; background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 12px; padding: 0.85rem 1rem; transition: border-color 0.2s;
}
.history-card:hover { border-color: var(--border-light); }
.history-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; }
.history-card__title { font-size: 0.86rem; font-weight: 600; color: var(--text-primary); margin: 0 0 5px; }
.history-card__meta { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
.history-card__meta span { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-muted); }
.history-card__accuracy { color: var(--success-color) !important; }
.history-card__right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.history-card__time { font-size: 0.7rem; color: var(--text-muted); }
.history-card__actions { display: flex; gap: 6px; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 0.55rem 1.1rem; border: none; }
.btn--ghost { background: var(--card-color); color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn--ghost:hover { background: var(--hover-color); color: var(--text-primary); border-color: var(--border-light); }
.btn--sm { font-size: 0.78rem; padding: 0.35rem 0.85rem; }

.action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0.3rem 0.7rem; border-radius: 7px; font-size: 0.75rem; font-weight: 500;
  background: var(--card-color); border: 1px solid var(--border-color);
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover:not(:disabled) { background: var(--hover-color); color: var(--text-primary); border-color: var(--border-light); }
.action-btn--danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.action-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.status-chip {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 3px 10px; font-size: 0.7rem; font-weight: 700;
  text-transform: capitalize; white-space: nowrap;
}

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 4rem; color: var(--text-muted); text-align: center; }
.empty-state p { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin: 0; }
.empty-state span { font-size: 0.8rem; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

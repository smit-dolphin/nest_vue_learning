<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileVideo, Search, Filter, Plus, Play, Download, Trash2,
  MoreHorizontal, Clock, Globe2, Captions, CheckCircle2,
  Loader2, AlertCircle, Grid3x3, List, SortAsc, Upload
} from 'lucide-vue-next'

type Status = 'all' | 'done' | 'processing' | 'failed'
type ViewMode = 'grid' | 'list'

const searchQuery = ref('')
const activeFilter = ref<Status>('all')
const viewMode = ref<ViewMode>('grid')
const sortBy = ref('newest')

const filters: { label: string; value: Status }[] = [
  { label: 'All Files', value: 'all' },
  { label: 'Completed', value: 'done' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
]

interface VideoItem {
  id: number
  title: string
  duration: string
  size: string
  lang: string
  status: 'done' | 'processing' | 'failed'
  segments: number
  date: string
  color: string
}

const videos: VideoItem[] = [
  { id: 1, title: 'Product Demo Q3 2026.mp4', duration: '4:32', size: '128 MB', lang: 'English', status: 'done', segments: 42, date: 'Aug 19, 2026', color: '#8b5cf6' },
  { id: 2, title: 'CEO Interview Final Cut.mov', duration: '12:18', size: '384 MB', lang: 'Spanish', status: 'done', segments: 98, date: 'Aug 19, 2026', color: '#06b6d4' },
  { id: 3, title: 'Tutorial Episode 7 - Setup.mp4', duration: '8:45', size: '210 MB', lang: 'French', status: 'processing', segments: 0, date: 'Aug 19, 2026', color: '#10b981' },
  { id: 4, title: 'Marketing Reel Summer.mp4', duration: '1:20', size: '45 MB', lang: 'German', status: 'done', segments: 14, date: 'Aug 18, 2026', color: '#f59e0b' },
  { id: 5, title: 'Webinar Recording Full.mkv', duration: '58:02', size: '1.2 GB', lang: 'Japanese', status: 'done', segments: 412, date: 'Aug 18, 2026', color: '#ec4899' },
  { id: 6, title: 'Onboarding Video v2.mp4', duration: '6:14', size: '156 MB', lang: 'Korean', status: 'failed', segments: 0, date: 'Aug 17, 2026', color: '#ef4444' },
  { id: 7, title: 'Conference Talk - AI in 2026.mp4', duration: '32:48', size: '780 MB', lang: 'English', status: 'done', segments: 278, date: 'Aug 17, 2026', color: '#8b5cf6' },
  { id: 8, title: 'Product Teaser Short.mp4', duration: '0:45', size: '18 MB', lang: 'Portuguese', status: 'done', segments: 8, date: 'Aug 16, 2026', color: '#06b6d4' },
]

const filtered = computed(() => {
  return videos
    .filter(v => activeFilter.value === 'all' || v.status === activeFilter.value)
    .filter(v => v.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const statusIcon = (s: string) => ({ done: CheckCircle2, processing: Loader2, failed: AlertCircle }[s] ?? CheckCircle2)
const statusColor = (s: string) => ({ done: '#10b981', processing: '#8b5cf6', failed: '#ef4444' }[s] ?? '#10b981')
const statusBg = (s: string) => ({ done: 'rgba(16,185,129,0.1)', processing: 'rgba(139,92,246,0.1)', failed: 'rgba(239,68,68,0.1)' }[s] ?? '')
</script>

<template>
  <div class="library-page">

    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon"><FileVideo :size="22" /></div>
        <div>
          <h2 class="page-header__title">Video Library</h2>
          <p class="page-header__sub">{{ videos.length }} videos · {{ videos.filter(v => v.status === 'done').length }} subtitled</p>
        </div>
      </div>
      <button class="btn btn--primary">
        <Upload :size="15" /> Upload Video
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <!-- Search -->
      <div class="toolbar__search">
        <Search :size="15" class="toolbar__search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Search videos..." class="toolbar__search-input" />
      </div>

      <!-- Filters -->
      <div class="toolbar__filters">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="{ 'filter-btn--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Sort + View -->
      <div class="toolbar__right">
        <select v-model="sortBy" class="sort-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="duration">By Duration</option>
          <option value="size">By Size</option>
        </select>
        <div class="view-toggle">
          <button class="view-btn" :class="{ 'view-btn--active': viewMode === 'grid' }" @click="viewMode = 'grid'">
            <Grid3x3 :size="15" />
          </button>
          <button class="view-btn" :class="{ 'view-btn--active': viewMode === 'list' }" @click="viewMode = 'list'">
            <List :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="video-grid">
      <div
        v-for="video in filtered"
        :key="video.id"
        class="video-card"
      >
        <!-- Thumbnail -->
        <div class="video-card__thumb" :style="{ background: `linear-gradient(135deg, ${video.color}22, ${video.color}08)` }">
          <div class="video-card__play-icon" :style="{ color: video.color }">
            <Play :size="22" fill="currentColor" />
          </div>
          <div class="video-card__duration">{{ video.duration }}</div>
          <!-- Status overlay -->
          <div
            class="video-card__status-badge"
            :style="{ background: statusBg(video.status), color: statusColor(video.status) }"
          >
            <component :is="statusIcon(video.status)" :size="11" :class="video.status === 'processing' ? 'spin' : ''" />
            {{ video.status }}
          </div>
        </div>

        <!-- Info -->
        <div class="video-card__body">
          <p class="video-card__title">{{ video.title }}</p>
          <div class="video-card__meta">
            <span><Globe2 :size="11" /> {{ video.lang }}</span>
            <span>{{ video.size }}</span>
            <span v-if="video.segments"><Captions :size="11" /> {{ video.segments }} seg</span>
          </div>
          <p class="video-card__date">{{ video.date }}</p>
        </div>

        <!-- Actions -->
        <div class="video-card__actions">
          <button class="action-btn" title="Download SRT" :disabled="video.status !== 'done'">
            <Download :size="14" />
          </button>
          <button class="action-btn action-btn--danger" title="Delete">
            <Trash2 :size="14" />
          </button>
          <button class="action-btn" title="More">
            <MoreHorizontal :size="14" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!filtered.length" class="empty-state">
        <FileVideo :size="40" />
        <p>No videos found</p>
        <span>Try changing your filters or upload a new file</span>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="video-list">
      <div class="video-list__head">
        <span>File</span>
        <span>Language</span>
        <span>Duration</span>
        <span>Size</span>
        <span>Segments</span>
        <span>Status</span>
        <span>Date</span>
        <span></span>
      </div>
      <div
        v-for="video in filtered"
        :key="video.id"
        class="video-list__row"
      >
        <div class="video-list__file">
          <div class="video-list__file-icon" :style="{ background: `${video.color}22`, color: video.color }">
            <FileVideo :size="14" />
          </div>
          <span class="video-list__filename">{{ video.title }}</span>
        </div>
        <span class="video-list__cell">{{ video.lang }}</span>
        <span class="video-list__cell">{{ video.duration }}</span>
        <span class="video-list__cell">{{ video.size }}</span>
        <span class="video-list__cell">{{ video.segments || '—' }}</span>
        <span
          class="status-chip"
          :style="{ background: statusBg(video.status), color: statusColor(video.status) }"
        >
          <component :is="statusIcon(video.status)" :size="11" :class="video.status === 'processing' ? 'spin' : ''" />
          {{ video.status }}
        </span>
        <span class="video-list__cell">{{ video.date }}</span>
        <div class="video-list__actions">
          <button class="action-btn" :disabled="video.status !== 'done'"><Download :size="13" /></button>
          <button class="action-btn action-btn--danger"><Trash2 :size="13" /></button>
        </div>
      </div>

      <div v-if="!filtered.length" class="empty-state">
        <FileVideo :size="40" />
        <p>No videos found</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.library-page { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-header__left { display: flex; align-items: center; gap: 1rem; }
.page-header__icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 20px rgba(6,182,212,0.3); flex-shrink: 0;
}
.page-header__title { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin: 0 0 2px; }
.page-header__sub { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.toolbar__search {
  display: flex; align-items: center; gap: 8px;
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 0.5rem 0.85rem;
  transition: border-color 0.2s, box-shadow 0.2s; min-width: 220px;
}
.toolbar__search:focus-within { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
.toolbar__search-icon { color: var(--text-muted); flex-shrink: 0; }
.toolbar__search-input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.83rem; width: 100%; }
.toolbar__search-input::placeholder { color: var(--text-muted); }

.toolbar__filters { display: flex; gap: 4px; background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 10px; padding: 4px; }
.filter-btn {
  padding: 0.35rem 0.85rem; border-radius: 7px; font-size: 0.78rem; font-weight: 600;
  color: var(--text-muted); background: transparent; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.filter-btn--active { background: var(--active-color); color: var(--primary-color); }
.filter-btn:hover:not(.filter-btn--active) { color: var(--text-primary); }

.toolbar__right { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
.sort-select {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 0.45rem 0.85rem; font-size: 0.8rem; color: var(--text-primary);
  outline: none; cursor: pointer; transition: border-color 0.2s;
}
.sort-select:focus { border-color: var(--border-focus); }

.view-toggle { display: flex; background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
.view-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; border: none; background: transparent; transition: all 0.2s; }
.view-btn--active { background: var(--active-color); color: var(--primary-color); }
.view-btn:hover:not(.view-btn--active) { color: var(--text-primary); }

/* Grid */
.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }

.video-card {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 14px; overflow: hidden; transition: border-color 0.2s, transform 0.2s;
  display: flex; flex-direction: column;
}
.video-card:hover { border-color: var(--border-light); transform: translateY(-3px); }

.video-card__thumb {
  height: 140px; display: flex; align-items: center; justify-content: center;
  position: relative; cursor: pointer;
}
.video-card__play-icon {
  width: 48px; height: 48px; background: rgba(0,0,0,0.4); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); transition: transform 0.2s;
}
.video-card:hover .video-card__play-icon { transform: scale(1.1); }

.video-card__duration {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(0,0,0,0.65); color: #fff; font-size: 0.7rem; font-weight: 700;
  border-radius: 6px; padding: 2px 7px;
}
.video-card__status-badge {
  position: absolute; top: 8px; left: 8px;
  display: flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 3px 8px; font-size: 0.68rem; font-weight: 700;
  text-transform: capitalize; backdrop-filter: blur(6px);
}

.video-card__body { padding: 0.85rem 0.85rem 0.5rem; flex: 1; }
.video-card__title { font-size: 0.83rem; font-weight: 600; color: var(--text-primary); margin: 0 0 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.video-card__meta { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 4px; }
.video-card__meta span { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-muted); }
.video-card__date { font-size: 0.7rem; color: var(--text-muted); }

.video-card__actions { display: flex; gap: 4px; padding: 0.5rem 0.85rem 0.85rem; }

/* List View */
.video-list { background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 14px; overflow: hidden; }
.video-list__head {
  display: grid; grid-template-columns: 3fr 1fr 80px 80px 80px 100px 120px 80px;
  gap: 0.5rem; padding: 0.75rem 1rem;
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); border-bottom: 1px solid var(--border-color);
}
.video-list__row {
  display: grid; grid-template-columns: 3fr 1fr 80px 80px 80px 100px 120px 80px;
  gap: 0.5rem; padding: 0.8rem 1rem; align-items: center;
  border-bottom: 1px solid var(--border-color); transition: background 0.15s;
}
.video-list__row:last-child { border-bottom: none; }
.video-list__row:hover { background: var(--hover-color); }

.video-list__file { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.video-list__file-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.video-list__filename { font-size: 0.82rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.video-list__cell { font-size: 0.8rem; color: var(--text-secondary); }
.video-list__actions { display: flex; gap: 4px; }

.status-chip {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 3px 10px; font-size: 0.7rem; font-weight: 700;
  text-transform: capitalize; width: fit-content;
}

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 0.55rem 1.1rem; border: none; text-decoration: none; }
.btn--primary { background: var(--team-gradient); color: #fff; box-shadow: 0 4px 12px rgba(139,92,246,0.4); }
.btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(139,92,246,0.5); }

.action-btn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  background: var(--card-color); border: 1px solid var(--border-color); border-radius: 7px;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: var(--hover-color); color: var(--text-primary); border-color: var(--border-light); }
.action-btn--danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.action-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Empty */
.empty-state { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 4rem 2rem; color: var(--text-muted); text-align: center; }
.empty-state p { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin: 0; }
.empty-state span { font-size: 0.8rem; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

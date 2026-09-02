<script setup lang="ts">
import { Search, Grid3x3, List } from 'lucide-vue-next'
import type { Status, ViewMode } from './types'
import { filters } from './types'

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const activeFilter = defineModel<Status>('activeFilter', { default: 'all' })
const sortBy = defineModel<string>('sortBy', { default: 'newest' })
const viewMode = defineModel<ViewMode>('viewMode', { default: 'grid' })
</script>

<template>
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
</template>

<style scoped>
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
</style>

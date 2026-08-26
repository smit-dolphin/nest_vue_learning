<script setup lang="ts">
import { ref } from 'vue'
import {
  HelpCircle, Search, ChevronDown, ChevronRight, ExternalLink,
  MessageCircle, Book, Video, Zap, Mail, Github, FileText,
  CheckCircle2, AlertCircle, Clock, Globe2
} from 'lucide-vue-next'

const searchQuery = ref('')
const openFaq = ref<number | null>(null)

const faqs = [
  {
    q: 'What video formats are supported?',
    a: 'We support all major video formats including MP4, MOV, MKV, AVI, WebM, and audio formats like MP3, WAV, AAC, and FLAC. Files up to 500MB can be uploaded directly.'
  },
  {
    q: 'How accurate are the generated subtitles?',
    a: 'Our AI model (Whisper v3 Turbo) achieves an average accuracy of 98.4% across English content. Accuracy varies by language, background noise, and audio quality. You can always edit the output before exporting.'
  },
  {
    q: 'Which subtitle formats can I export?',
    a: 'You can export as SRT (SubRip), WebVTT, ASS/SSA, JSON, and Plain Text. All formats are compatible with major video players, streaming platforms, and editing software.'
  },
  {
    q: 'How long does processing take?',
    a: 'Processing time depends on file duration. A 5-minute video typically completes in 30–60 seconds on the Pro plan. Longer files may take a few minutes. You\'ll receive a notification when it\'s done.'
  },
  {
    q: 'Can I edit subtitles before exporting?',
    a: 'Yes! After generation, you can edit individual subtitle segments directly in the output viewer. Changes are saved automatically before you export.'
  },
  {
    q: 'How does the Auto-Translate feature work?',
    a: 'Enable Auto-Translate in subtitle settings and select your target language. The AI first transcribes the original audio, then translates the subtitles while preserving timing. Translation quality is highest for major world languages.'
  },
  {
    q: 'Is my video data secure?',
    a: 'Yes. Uploaded files are encrypted in transit (TLS 1.3) and at rest (AES-256). Files are automatically deleted from our servers after 30 days unless you save them to your library.'
  },
  {
    q: 'Can I use the API to generate subtitles programmatically?',
    a: 'Yes! We offer a REST API. Go to Settings → API Keys to generate your key. Full documentation is available in our Developer Docs.'
  },
]

const docs = [
  { title: 'Quick Start Guide', desc: 'Get up and running in 5 minutes', icon: Zap, color: '#8b5cf6', href: '#' },
  { title: 'API Reference', desc: 'Full REST API documentation', icon: FileText, color: '#06b6d4', href: '#' },
  { title: 'Subtitle Formats', desc: 'SRT, WebVTT, ASS — explained', icon: Book, color: '#10b981', href: '#' },
  { title: 'Language Support', desc: '50+ supported languages', icon: Globe2, color: '#f59e0b', href: '#' },
]

const tutorials = [
  { title: 'Getting Started with SubAI', duration: '3:45', views: '12K', color: '#8b5cf6' },
  { title: 'Batch Processing Videos', duration: '5:12', views: '8.4K', color: '#06b6d4' },
  { title: 'Using the API Programmatically', duration: '8:30', views: '5.1K', color: '#10b981' },
  { title: 'Editing & Exporting Subtitles', duration: '4:20', views: '9.7K', color: '#ec4899' },
]

const status = [
  { service: 'Subtitle Engine', status: 'operational' },
  { service: 'Video Upload API', status: 'operational' },
  { service: 'Translation Service', status: 'degraded' },
  { service: 'Export Service', status: 'operational' },
]

const statusColor = (s: string) => ({ operational: '#10b981', degraded: '#f59e0b', outage: '#ef4444' }[s] ?? '')
const statusBg = (s: string) => ({ operational: 'rgba(16,185,129,0.1)', degraded: 'rgba(245,158,11,0.1)', outage: 'rgba(239,68,68,0.1)' }[s] ?? '')
</script>

<template>
  <div class="help-page">

    <!-- Hero -->
    <div class="help-hero">
      <div class="help-hero__content">
        <div class="help-hero__badge">
          <HelpCircle :size="13" /> Help Center
        </div>
        <h2 class="help-hero__title">How can we help you?</h2>
        <p class="help-hero__sub">Search the docs, browse FAQs, or reach out to our support team</p>
        <div class="help-hero__search">
          <Search :size="16" />
          <input v-model="searchQuery" type="text" placeholder="Search for answers..." class="help-hero__search-input" />
        </div>
        <div class="help-hero__tags">
          <button v-for="tag in ['Upload Video','API Keys','Export Formats','Billing','Translation']" :key="tag"
            class="tag-btn" @click="searchQuery = tag">{{ tag }}</button>
        </div>
      </div>
    </div>

    <!-- Grid Content -->
    <div class="help-grid">

      <!-- FAQ -->
      <div class="help-section">
        <h3 class="help-section__title">Frequently Asked Questions</h3>
        <div class="faq-list">
          <div
            v-for="(faq, i) in faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === '')"
            :key="i"
            class="faq-item"
            :class="{ 'faq-item--open': openFaq === i }"
          >
            <button class="faq-item__question" @click="openFaq = openFaq === i ? null : i">
              <span>{{ faq.q }}</span>
              <ChevronDown :size="16" class="faq-item__chevron" />
            </button>
            <Transition name="accordion">
              <div v-if="openFaq === i" class="faq-item__answer">
                <p>{{ faq.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="help-right">

        <!-- Documentation Links -->
        <div class="help-card">
          <h3 class="help-card__title"><Book :size="16" /> Documentation</h3>
          <div class="docs-list">
            <a v-for="doc in docs" :key="doc.title" href="#" class="doc-item">
              <div class="doc-item__icon" :style="{ background: `${doc.color}18`, color: doc.color }">
                <component :is="doc.icon" :size="16" />
              </div>
              <div class="doc-item__info">
                <p class="doc-item__title">{{ doc.title }}</p>
                <p class="doc-item__desc">{{ doc.desc }}</p>
              </div>
              <ExternalLink :size="14" class="doc-item__arrow" />
            </a>
          </div>
        </div>

        <!-- System Status -->
        <div class="help-card">
          <h3 class="help-card__title"><CheckCircle2 :size="16" /> System Status</h3>
          <div class="status-list">
            <div v-for="s in status" :key="s.service" class="status-item">
              <span class="status-item__name">{{ s.service }}</span>
              <span class="status-chip" :style="{ background: statusBg(s.status), color: statusColor(s.status) }">
                <span class="status-dot" :style="{ background: statusColor(s.status) }"></span>
                {{ s.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contact Support -->
        <div class="contact-card">
          <div class="contact-card__header">
            <MessageCircle :size="18" />
            <h3>Contact Support</h3>
          </div>
          <p class="contact-card__desc">Our team typically responds within 2 hours on business days</p>
          <div class="contact-card__options">
            <button class="contact-option">
              <Mail :size="16" /> Email Support
            </button>
            <button class="contact-option">
              <Github :size="16" /> GitHub Issues
            </button>
          </div>
          <div class="contact-card__badge">
            <Clock :size="12" /> Response time: ~2 hrs
          </div>
        </div>

      </div>
    </div>

    <!-- Video Tutorials -->
    <div class="tutorials-section">
      <h3 class="tutorials-section__title"><Video :size="18" /> Video Tutorials</h3>
      <div class="tutorials-grid">
        <div v-for="tut in tutorials" :key="tut.title" class="tutorial-card">
          <div class="tutorial-card__thumb" :style="{ background: `linear-gradient(135deg, ${tut.color}22, ${tut.color}08)` }">
            <div class="tutorial-card__play" :style="{ color: tut.color }">
              <span>▶</span>
            </div>
            <span class="tutorial-card__duration">{{ tut.duration }}</span>
          </div>
          <div class="tutorial-card__info">
            <p class="tutorial-card__title">{{ tut.title }}</p>
            <p class="tutorial-card__views">{{ tut.views }} views</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.help-page { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }

/* Hero */
.help-hero {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 2.5rem 2rem; text-align: center;
  position: relative; overflow: hidden;
}
.help-hero::before {
  content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.help-hero__content { position: relative; z-index: 1; }
.help-hero__badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--team-color-light); border: 1px solid rgba(139,92,246,0.3);
  border-radius: 20px; padding: 0.3rem 0.85rem;
  font-size: 0.72rem; font-weight: 700; color: #c4b5fd; margin-bottom: 0.85rem;
}
.help-hero__title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem; }
.help-hero__sub { font-size: 0.9rem; color: var(--text-secondary); margin: 0 0 1.5rem; }

.help-hero__search {
  display: flex; align-items: center; gap: 10px;
  background: var(--card-color); border: 1px solid var(--border-light);
  border-radius: 12px; padding: 0.75rem 1.25rem;
  max-width: 560px; margin: 0 auto 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: var(--text-muted);
}
.help-hero__search:focus-within { border-color: var(--border-focus); box-shadow: 0 0 0 4px rgba(139,92,246,0.15); }
.help-hero__search-input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 1rem; width: 100%; }
.help-hero__search-input::placeholder { color: var(--text-muted); }

.help-hero__tags { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
.tag-btn {
  background: var(--card-color); border: 1px solid var(--border-color);
  border-radius: 20px; padding: 0.3rem 0.85rem; font-size: 0.75rem; font-weight: 600;
  color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
}
.tag-btn:hover { background: var(--active-color); color: var(--primary-color); border-color: rgba(139,92,246,0.3); }

/* Grid */
.help-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; align-items: start; }

/* Section */
.help-section { display: flex; flex-direction: column; gap: 0.5rem; }
.help-section__title, .help-card__title, .tutorials-section__title {
  font-size: 0.95rem; font-weight: 700; color: var(--text-primary);
  margin: 0 0 0.75rem; display: flex; align-items: center; gap: 8px;
}

/* FAQ */
.faq-list { display: flex; flex-direction: column; gap: 4px; }
.faq-item {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 12px; overflow: hidden; transition: border-color 0.2s;
}
.faq-item--open { border-color: var(--border-focus); }
.faq-item--open .faq-item__chevron { transform: rotate(180deg); }

.faq-item__question {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 1rem 1.25rem; background: transparent; border: none;
  color: var(--text-primary); font-size: 0.88rem; font-weight: 600;
  cursor: pointer; text-align: left; gap: 1rem; transition: background 0.15s;
}
.faq-item__question:hover { background: var(--hover-color); }
.faq-item__chevron { color: var(--text-muted); flex-shrink: 0; transition: transform 0.25s ease; }

.faq-item__answer { padding: 0 1.25rem 1rem; border-top: 1px solid var(--border-color); }
.faq-item__answer p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.65; margin: 0.75rem 0 0; }

/* Right column */
.help-right { display: flex; flex-direction: column; gap: 1rem; }

.help-card {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 1.25rem;
}

/* Docs */
.docs-list { display: flex; flex-direction: column; gap: 2px; }
.doc-item {
  display: flex; align-items: center; gap: 10px; padding: 0.65rem 0.5rem;
  border-radius: 8px; text-decoration: none; transition: background 0.15s;
  cursor: pointer;
}
.doc-item:hover { background: var(--hover-color); }
.doc-item__icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.doc-item__info { flex: 1; }
.doc-item__title { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.doc-item__desc { font-size: 0.7rem; color: var(--text-muted); margin: 0; }
.doc-item__arrow { color: var(--text-muted); }

/* Status */
.status-list { display: flex; flex-direction: column; gap: 8px; }
.status-item { display: flex; align-items: center; justify-content: space-between; }
.status-item__name { font-size: 0.82rem; color: var(--text-secondary); }
.status-chip { display: inline-flex; align-items: center; gap: 5px; border-radius: 20px; padding: 2px 10px; font-size: 0.68rem; font-weight: 700; text-transform: capitalize; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; animation: blink 2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Contact Card */
.contact-card {
  background: var(--team-color-light); border: 1px solid rgba(139,92,246,0.25);
  border-radius: 14px; padding: 1.25rem;
}
.contact-card__header { display: flex; align-items: center; gap: 8px; color: #a78bfa; margin-bottom: 0.5rem; }
.contact-card__header h3 { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0; }
.contact-card__desc { font-size: 0.78rem; color: var(--text-secondary); margin: 0 0 1rem; }
.contact-card__options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 0.85rem; }
.contact-option {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px; padding: 0.55rem 0.85rem;
  font-size: 0.82rem; font-weight: 600; color: var(--text-primary);
  cursor: pointer; transition: all 0.2s;
}
.contact-option:hover { background: rgba(255,255,255,0.1); }
.contact-card__badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.7rem; color: var(--text-muted); }

/* Tutorials */
.tutorials-section { display: flex; flex-direction: column; }
.tutorials-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.tutorial-card { background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
.tutorial-card:hover { border-color: var(--border-light); transform: translateY(-3px); }
.tutorial-card__thumb { height: 110px; display: flex; align-items: center; justify-content: center; position: relative; }
.tutorial-card__play { font-size: 1.5rem; }
.tutorial-card__duration { position: absolute; bottom: 6px; right: 8px; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.68rem; font-weight: 700; border-radius: 4px; padding: 1px 6px; }
.tutorial-card__info { padding: 0.65rem 0.85rem 0.85rem; }
.tutorial-card__title { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin: 0 0 3px; line-height: 1.4; }
.tutorial-card__views { font-size: 0.7rem; color: var(--text-muted); margin: 0; }

/* Accordion transition */
.accordion-enter-active, .accordion-leave-active { transition: max-height 0.3s ease, opacity 0.3s ease; overflow: hidden; max-height: 300px; }
.accordion-enter-from, .accordion-leave-to { max-height: 0; opacity: 0; }

@media (max-width: 1100px) {
  .help-grid { grid-template-columns: 1fr; }
  .tutorials-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

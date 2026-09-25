<script setup lang="ts">
import {
  Bot,
  Cpu,
  Eye,
  FileCog,
  Globe2,
  Save,
  Settings2,
  SlidersHorizontal,
  Upload,
} from '@lucide/vue'
import { reactive, ref } from 'vue'
import { toast } from 'vue-sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import PageHeader from '@/components/layout/PageHeader.vue'

const form = reactive({
  appName: 'Subtitle AI',
  maintenanceMode: false,
  allowRegistration: true,
  maxVideoSizeMb: 100,
  maxSubtitleSizeMb: 10,
  maxConcurrentJobs: 5,
  maxVideoDurationMinutes: 60,
  supportedSubtitleFormats: ['SRT', 'VTT'],
  supportedVideoFormats: ['mp4', 'webm', 'mkv', 'avi'],
  aiProvider: 'gemini',
  aiModel: 'gemini-3.7-flash',
  enableGoogleLogin: true,
  enableAutoTranslation: true,
  enableBurnedSubtitles: true,
  enableNotifications: true,
  maintenanceMessage: '',
})

const subtitleFormatOptions = ['SRT', 'VTT']
const videoFormatOptions = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'm4v']
const aiProviderOptions = ['gemini', 'openai', 'anthropic', 'deepseek', 'local']

const toggleChip = (key: 'supportedSubtitleFormats' | 'supportedVideoFormats', value: string) => {
  const list = form[key]
  const index = list.indexOf(value)
  if (index === -1) form[key] = [...list, value] as never
  else form[key] = list.filter((v) => v !== value) as never
}

const dirty = ref(false)

const markDirty = () => {
  dirty.value = true
}

const saveSettings = () => {
  dirty.value = false
  toast.success('System settings saved')
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="Settings2"
      title="System Settings"
      subtitle="Configure global platform behaviour, limits, and integrations"
      gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/30"
    >
      <Button :disabled="!dirty" class="gap-2" @click="saveSettings">
        <Save class="size-4" />
        Save changes
      </Button>
    </PageHeader>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- App settings -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Globe2 class="size-4 text-primary" />
            Application
          </CardTitle>
          <CardDescription>Branding, registration, and maintenance controls</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-2">
            <Label for="appName">Application name</Label>
            <Input id="appName" v-model="form.appName" type="text" @input="markDirty" />
          </div>

          <div class="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
            <div>
              <p class="text-sm font-semibold">Allow registration</p>
              <p class="text-sm text-muted-foreground">Let new users create accounts</p>
            </div>
            <Switch v-model="form.allowRegistration" @update:model-value="markDirty" />
          </div>

          <div class="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
            <div>
              <p class="text-sm font-semibold">Maintenance mode</p>
              <p class="text-sm text-muted-foreground">Temporarily disable public access</p>
            </div>
            <Switch v-model="form.maintenanceMode" @update:model-value="markDirty" />
          </div>

          <div v-if="form.maintenanceMode" class="space-y-2">
            <Label for="maintenanceMessage">Maintenance message</Label>
            <Textarea
              id="maintenanceMessage"
              v-model="form.maintenanceMessage"
              placeholder="We'll be back shortly. Scheduled maintenance in progress..."
              rows="3"
              @input="markDirty"
            />
          </div>
        </CardContent>
        <CardFooter class="border-t px-6 py-3 text-xs text-muted-foreground">
          <Eye class="size-3.5" /> Public pages reflect these changes immediately.
        </CardFooter>
      </Card>

      <!-- Upload limits -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Upload class="size-4 text-primary" />
            Upload limits
          </CardTitle>
          <CardDescription>Maximum file sizes users can upload</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-2">
            <Label for="maxVideoSizeMb">Max video size (MB)</Label>
            <Input id="maxVideoSizeMb" v-model.number="form.maxVideoSizeMb" type="number" min="1" @input="markDirty" />
            <p class="text-xs text-muted-foreground">Filenames larger than this are rejected on upload.</p>
          </div>
          <div class="space-y-2">
            <Label for="maxSubtitleSizeMb">Max subtitle file size (MB)</Label>
            <Input id="maxSubtitleSizeMb" v-model.number="form.maxSubtitleSizeMb" type="number" min="1" @input="markDirty" />
          </div>
        </CardContent>
      </Card>

      <!-- Processing limits -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Cpu class="size-4 text-primary" />
            Processing limits
          </CardTitle>
          <CardDescription>Queue and runtime constraints</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-2">
            <Label for="maxConcurrentJobs">Max concurrent jobs</Label>
            <Input id="maxConcurrentJobs" v-model.number="form.maxConcurrentJobs" type="number" min="1" @input="markDirty" />
            <p class="text-xs text-muted-foreground">Number of subtitle workers allowed to run at once.</p>
          </div>
          <div class="space-y-2">
            <Label for="maxVideoDurationMinutes">Max video duration (minutes)</Label>
            <Input id="maxVideoDurationMinutes" v-model.number="form.maxVideoDurationMinutes" type="number" min="1" @input="markDirty" />
          </div>
        </CardContent>
      </Card>

      <!-- Formats -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileCog class="size-4 text-primary" />
            Supported formats
          </CardTitle>
          <CardDescription>Which formats are accepted and exported</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-2">
            <Label>Subtitle formats</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="f in subtitleFormatOptions"
                :key="f"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                :class="form.supportedSubtitleFormats.includes(f)
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-muted/40 text-muted-foreground hover:bg-accent'"
                @click="toggleChip('supportedSubtitleFormats', f); markDirty()"
              >
                {{ f }}
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Video formats</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="f in videoFormatOptions"
                :key="f"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                :class="form.supportedVideoFormats.includes(f)
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-muted/40 text-muted-foreground hover:bg-accent'"
                @click="toggleChip('supportedVideoFormats', f); markDirty()"
              >
                {{ f }}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- AI configuration -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Bot class="size-4 text-primary" />
            AI configuration
          </CardTitle>
          <CardDescription>Model used for subtitle transcription</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-2">
            <Label>AI provider</Label>
            <Select v-model="form.aiProvider" @update:model-value="markDirty">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="p in aiProviderOptions" :key="p" :value="p" class="capitalize">
                  {{ p }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="aiModel">AI model</Label>
            <Input id="aiModel" v-model="form.aiModel" type="text" placeholder="gemini-3.7-flash" @input="markDirty" />
            <p class="text-xs text-muted-foreground">Any model identifier supported by the selected provider.</p>
          </div>
        </CardContent>
      </Card>

      <!-- Feature toggles -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <SlidersHorizontal class="size-4 text-primary" />
            Feature toggles
          </CardTitle>
          <CardDescription>Enable or disable platform capabilities</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="toggle in [
              { key: 'enableGoogleLogin', title: 'Google sign-in', desc: 'Allow login and registration with Google' },
              { key: 'enableAutoTranslation', title: 'Auto translation', desc: 'Translate subtitles into other languages' },
              { key: 'enableBurnedSubtitles', title: 'Burned subtitles', desc: 'Render burned-in subtitles into the video' },
              { key: 'enableNotifications', title: 'Notifications', desc: 'Send job status updates to users' },
            ]"
            :key="toggle.key"
            class="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4"
          >
            <div>
              <p class="text-sm font-semibold">{{ toggle.title }}</p>
              <p class="text-sm text-muted-foreground">{{ toggle.desc }}</p>
            </div>
            <Switch
              :model-value="form[toggle.key as keyof typeof form] as boolean"
              @update:model-value="(v) => { form[toggle.key as keyof typeof form] = v as never; markDirty() }"
            />
          </div>
        </CardContent>
        <CardFooter class="border-t px-6 py-3">
          <Badge variant="outline" class="text-muted-foreground">Changes apply to all users</Badge>
        </CardFooter>
      </Card>
    </div>

    <!-- Sticky save bar -->
    <div
      class="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/90 p-4 shadow-lg backdrop-blur-md"
    >
      <div class="min-w-0">
        <p class="text-sm font-semibold">Unsaved changes</p>
        <p class="text-xs text-muted-foreground">Click save to persist the system configuration.</p>
      </div>
      <Button :disabled="!dirty" class="gap-2" @click="saveSettings">
        <Save class="size-4" />
        Save changes
      </Button>
    </div>
  </div>
</template>
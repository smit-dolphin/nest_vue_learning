<script setup lang="ts">
import { Eye, Plus, Search, ShieldCheck, UserX, Users } from '@lucide/vue'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import PageHeader from '@/components/layout/PageHeader.vue'

const users = [
  { initials: 'AP', name: 'Aarav Patel', email: 'aarav.patel@gmail.com', role: 'USER', status: 'active', provider: 'Google', joined: 'Jan 12, 2026' },
  { initials: 'RJ', name: 'Riya Joshi', email: 'riya.joshi@outlook.com', role: 'USER', status: 'active', provider: 'Email', joined: 'Jan 09, 2026' },
  { initials: 'MK', name: 'Manav Kulkarni', email: 'manav.k@gmail.com', role: 'USER', status: 'suspended', provider: 'Email', joined: 'Jan 04, 2026' },
  { initials: 'SD', name: 'Sara Dsouza', email: 'sara.d@yahoo.com', role: 'ADMIN', status: 'active', provider: 'Google', joined: 'Dec 28, 2025' },
  { initials: 'VP', name: 'Vivek Patil', email: 'vivek.patil@gmail.com', role: 'USER', status: 'active', provider: 'Email', joined: 'Dec 21, 2025' },
  { initials: 'NA', name: 'Nisha Agarwal', email: 'nisha.agarwal@outlook.com', role: 'USER', status: 'active', provider: 'Email', joined: 'Dec 15, 2025' },
]

const roleStyles: Record<string, string> = {
  ADMIN: 'text-indigo-600 dark:text-indigo-400 border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/15',
  USER: 'text-slate-600 dark:text-slate-400 border-slate-200 bg-slate-50 dark:border-slate-500/30 dark:bg-slate-500/15',
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="Users"
      title="Users"
      subtitle="Manage registered accounts, roles, and access"
      gradient="bg-gradient-to-br from-indigo-500 to-sky-500 shadow-indigo-500/30"
    >
      <Button class="gap-2">
        <Plus class="size-4" />
        Invite user
      </Button>
    </PageHeader>

    <Card>
      <CardHeader class="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>All users</CardTitle>
          <CardDescription>18,402 registered accounts</CardDescription>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search users..." class="h-9 w-56 pl-9" />
          </div>
          <Button variant="outline" size="sm">Filter</Button>
        </div>
      </CardHeader>
      <CardContent class="overflow-x-auto p-0">
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr class="border-b border-border/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th class="px-5 py-3 font-semibold">User</th>
              <th class="px-5 py-3 font-semibold">Role</th>
              <th class="px-5 py-3 font-semibold">Provider</th>
              <th class="px-5 py-3 font-semibold">Status</th>
              <th class="px-5 py-3 font-semibold">Joined</th>
              <th class="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60">
            <tr v-for="u in users" :key="u.email" class="transition-colors hover:bg-accent/40">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <Avatar class="size-9">
                    <AvatarFallback class="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">{{ u.initials }}</AvatarFallback>
                  </Avatar>
                  <div class="min-w-0 leading-tight">
                    <p class="truncate font-semibold">{{ u.name }}</p>
                    <p class="truncate text-xs text-muted-foreground">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <Badge variant="outline" :class="roleStyles[u.role]">{{ u.role }}</Badge>
              </td>
              <td class="px-5 py-3.5 text-xs text-muted-foreground">{{ u.provider }}</td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center gap-1.5">
                  <span class="size-2 rounded-full" :class="u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'" />
                  <span class="text-xs capitalize" :class="u.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">{{ u.status }}</span>
                </span>
              </td>
              <td class="px-5 py-3.5 text-xs text-muted-foreground">{{ u.joined }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    class="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="View user"
                  >
                    <Eye class="size-4" />
                  </button>
                  <button
                    class="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Make admin"
                  >
                    <ShieldCheck class="size-4" />
                  </button>
                  <button
                    class="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Suspend user"
                  >
                    <UserX class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
</template>
<template>
  <div id="app">
    <header class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item">
          <strong>Catenary Controls</strong>
        </NuxtLink>
        <button
          class="navbar-burger"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="menu"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
        <div class="navbar-start is-hidden-desktop">
          <div class="navbar-item">
            <nav-menu :groups="controlsGroups" @navigate="isMenuOpen = false" />
          </div>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <cat-theme-toggle />
          </div>
        </div>
      </div>
    </header>

    <sidebar-layout :groups="controlsGroups">
      <NuxtPage />
    </sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { controlsGroups, navItems } from '../navigation'
import SidebarLayout from './components/sidebar-layout.vue'
import NavMenu from './components/nav-menu.vue'

const isMenuOpen = ref(false)

const route = useRoute()
const pageTitle = computed(() => navItems.find(i => i.path === route.path)?.name ?? null)
useHead({
  title: pageTitle,
  titleTemplate: t => (t ? `${t} · Catenary Controls` : 'Catenary Controls'),
})
</script>

<style lang="scss">
$primary: #9e0e84;
$link: #234d8c;

@use "bulma/sass" with (
    $family-primary: '"Nunito", sans-serif',
    $primary: $primary,
    $link: $link,
);

@use "@mdi/font/css/materialdesignicons.css";

.navbar {
  border-bottom: solid 1px #ccc;
}
</style>

<template>
  <div id="app">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <!-- The header is the banner landmark; the navigation landmarks are the
         nav-menu instances (sidebar on desktop, burger menu on touch). -->
    <header class="navbar">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item">
          <strong>Catenary Controls</strong>
        </NuxtLink>
        <button
          type="button"
          class="navbar-burger"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="Menu"
          :aria-expanded="isMenuOpen"
          aria-controls="navbar-menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      <div id="navbar-menu" class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
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

/* Visible only while focused, so keyboard and screen reader users can jump
   past the chrome to the demos. */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
  padding: 0.5rem 1rem;
  background: var(--bulma-scheme-main);
  border: 1px solid var(--bulma-border);
  border-radius: 4px;
  transform: translateY(-300%);

  &:focus {
    transform: none;
  }
}
</style>

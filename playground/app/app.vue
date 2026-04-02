<template>
  <div id="app">
    <header class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item">
          <strong>Catenary Controls</strong>
        </NuxtLink>
      </div>
      <div class="navbar-menu">
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
import { controlsGroups } from '../navigation'
import SidebarLayout from './components/sidebar-layout.vue'
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

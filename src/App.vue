<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <a class="navbar-brand" href="#">Student Portal</a>
      <div class="navbar-nav">
        <RouterLink class="nav-link" to="/profile">ข้อมูลนิสิต</RouterLink>
        <RouterLink class="nav-link" to="/courses">รายวิชา</RouterLink>
      </div>
    </nav>
    <div class="container mt-4">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
<script setup></script>

<template>
  <v-layout class="rounded rounded-md border">
    <v-app-bar
      color="grey-darken-4"
      title="Генератор флаера рабочки"
      class="text-center"
    ></v-app-bar>

    <v-main class="d-flex align-center justify-center">
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-layout>
</template>

<style>
* {
  font-family: 'Montserrat', sans-serif;
}

body {
  font-family: 'Montserrat', sans-serif;
}

.v-application {
  font-family: 'Montserrat', sans-serif !important;
}

html,
body {
  overflow-x: hidden; /* Скрывает горизонтальный скролл */
  max-width: 100vw; /* Ограничивает максимальную ширину окна просмотра */
}
</style>

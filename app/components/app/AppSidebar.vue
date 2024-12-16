<script setup lang='ts'>

import AppThemeSwitcher from "~/components/app/AppThemeSwitcher.vue";

const config = useRuntimeConfig()
const { menu } = useNavigationMenu()

const auth = useAuthStore()
const themeStore = useThemeStore()



// function onResize() {
//   if (window.innerWidth <= 980) {
//     themeStore.collapsed = true
//     themeStore.isOnMobile = true
//   }
//   else {
//     themeStore.collapsed = true
//     themeStore.isOnMobile = false
//   }
// }

function onToggleCollapse() {

}

function onItemClick(event, item) {
  if (themeStore.isOnMobile) {
    themeStore.collapsed = !themeStore.collapsed;
  }
  if (item.title == "Выйти") {
    auth.logout().then(r => window.location.href = '/login')
  }
}

// onMounted(() => {
//   console.log('Mounted AppSidebar')
//   onResize()
//   window.addEventListener('resize', onResize)
// })
</script>

<template>
  <div v-if="menu.length">
    <sidebar-menu
      v-model:collapsed="themeStore.collapsed"
      link-component-name="nuxt-sidebar-link"
      :menu="menu"
      :show-one-child="true"
      width="180px"
      :width-collapsed="themeStore.isOnMobile && themeStore.collapsed ? '0' : '50px'"
      @update:collapsed="onToggleCollapse"
      @item-click="onItemClick"
      theme=""
      :class="{ mobile: themeStore.isOnMobile }"
    >
      <template #header>
        <div v-if="!themeStore.collapsed" class="flex justify-center">
<!--<AppConfigurator />-->

        </div>
        <div v-else  @click="themeStore.collapsed = false" style="cursor: pointer">
          <img class="ml-4 mt-6 w-6" :src="'/primevue-logo.webp'" alt="PrimeVue">
        </div>
      </template>
      <template #footer>
        <div class="m-2 text-center text-xs text-color-primary">
          <span v-if="!themeStore.collapsed">New CRM {{ config.public.APP_VERSION }}</span>
          <span v-if="themeStore.collapsed">{{ config.public.APP_VERSION }}</span>
        </div>
      </template>
    </sidebar-menu>
    <div
      v-if="themeStore.isOnMobile && !themeStore.collapsed"
      class="sidebar-overlay"
      @click="themeStore.collapsed = true"
    />
  </div>
</template>

<style lang="scss">
.sidebar-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #000;
  opacity: 0.5;
  z-index: 900;
}
</style>

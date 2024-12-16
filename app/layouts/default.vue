<script setup lang='ts'>

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
onMounted(() => {
  settingsStore.fetchAllEntity()
})

// const { layoutConfig, layoutState, isSidebarActive, resetMenu } = useLayout();
//
//
//
// const containerClass = computed(() => {
//   return {
//     'layout-overlay': layoutConfig.menuMode === 'overlay',
//     'layout-static': layoutConfig.menuMode === 'static',
//     'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
//     'layout-overlay-active': layoutState.overlayMenuActive,
//     'layout-mobile-active': layoutState.staticMenuMobileActive
//   };
// });

const redirectToLogin = () => {
  authStore.logout()
  navigateTo('/login')
}


</script>

<template>
  <div class="">
    <ConfirmDialog
        v-if="authStore.pageIsBlock"
        :header="authStore.confirmHeader"
        :message="authStore.confirmMessage"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Да"
        rejectLabel="Нет"
        @accept="redirectToLogin"
    />
    <ConfirmDialog />
    <Toast />
    <AppSidebar />
<!--    <Sidebar />-->
    <div id="workspace" :class="[{ collapsed: themeStore.collapsed }, { mobile: themeStore.isOnMobile }]">
      <AppTopbar />
      <div class="m-1 mt-2">
        <slot />
      </div>
    </div>
  </div>
  <ScrollTop />
</template>

<style lang="scss">

</style>

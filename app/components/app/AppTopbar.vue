<script setup lang="ts">
import AppThemeSwitcher from "~/components/app/AppThemeSwitcher.vue";
const themeStore = useThemeStore()
const auth = useAuthStore()
</script>

<template>
  <nav>
    <Toolbar>
      <template #start >
        <Button v-if="themeStore.isOnMobile" @click="themeStore.collapsed = !themeStore.collapsed" class="custom-toggle-btn">
          <i class="pi pi-bars"/>
        </Button>
      </template>
      <template #center >
        <Image src="/svg/crm-logo.svg" width="100%" style="width: 3rem" />
      </template>
      <template #end>

        <AppThemeSwitcher />
<!--        <Button icon="pi pi-github" class="mr-2" @click="redirectToGithub" />-->
        <Button v-if="auth.user" icon="pi pi-sign-out" @click="auth.logout().then(() => navigateTo('/login'))" severity="danger" />
      </template>
    </Toolbar>
  </nav>
</template>

<style scoped lang="scss">

</style>

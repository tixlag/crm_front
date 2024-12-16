<script setup lang='ts'>

import {useRouter} from "vue-router";

const auth = useAuthStore()
const router = useRouter()

if (!auth.isAuthenticated()) {
  router.push('/login')
} else {
  if (auth.user?.roles.includes("ADMIN")){
    router.push('/orders')
  } else if (auth.user?.roles.includes("MANAGER")){
    router.push('/orders/remind')
  } else {
    router.push('/orders/delivery')
  }
}
</script>

<template>
<h1>Hello =)</h1>
</template>

<style scoped></style>

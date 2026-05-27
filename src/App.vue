<template>
  <div class="app" :class="{ 'md3-dark': true }">
    <NavigationRail @open-auth="showAuth = true" />
    <main class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AuthModal :visible="showAuth" @close="showAuth = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavigationRail from '@/components/NavigationRail.vue'
import AuthModal from '@/components/AuthModal.vue'
import { useAuthStore } from '@/stores/auth'

const showAuth = ref(false)
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
</script>

<style scoped lang="scss">
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  overflow: hidden;

  &-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 28px 36px;
    margin-top: 40px;
  }
}

.page-enter-active {
  animation: pageEnter 400ms var(--md-sys-motion-easing-decelerate);
}

.page-leave-active {
  animation: pageLeave 250ms var(--md-sys-motion-easing-accelerate);
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateX(16px) scale(0.985);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes pageLeave {
  from {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
  to {
    opacity: 0;
    transform: scale(0.99);
    filter: blur(1px);
  }
}
</style>

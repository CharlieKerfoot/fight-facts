<template>
  <div class="spinner-container">
    <div class="spinner"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--color-bg-secondary);
  border-top: 5px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 10px var(--color-primary);
}

.loading-text {
  margin-top: 1rem;
  font-family: var(--font-arcade);
  color: var(--color-primary);
  font-size: 0.8rem;
  animation: blink 1s infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

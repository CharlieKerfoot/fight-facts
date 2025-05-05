<template>
  <div class="all">
    <div class="text">
      <p>
        {{ fighter.first_name }}
        <span v-if="fighter.nickname">"{{ fighter.nickname }}"</span>
        {{ fighter.last_name }}
      </p>
      <div class="weight">
        <p>{{ fighter.weight }}</p>
      </div>
      <p>{{ fighter.record.wins }}-{{ fighter.record.losses }}-{{ fighter.record.draws }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Fighter } from '../../shared/types.ts'
defineProps<{ fighter: Fighter }>()
</script>

<style scoped>
.all,
.text {
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.weight,
.all,
.text {
  display: flex;
}

p {
  margin-bottom: 10px;
  margin-top: 5px;
}
</style>

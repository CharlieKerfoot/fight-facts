<template>
  <div class="all">
    <img :src="fighter.image" :alt="`${fighter.first_name} ${fighter.last_name} image`" />
    <div class="text">
      <p>{{ fighter.first_name }} "{{ fighter.nickname }}" {{ fighter.last_name }}</p>
      <div class="weight">
        <p>{{ fighter.weight }}</p>
        <p v-if="fighter.ranked">Rank {{ fighter.ranking }}</p>
      </div>
      <p>{{ fighter.record.wins }}-{{ fighter.record.losses }}-{{ fighter.record.draws }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Fighter } from '../../shared/fighter.ts'
defineProps<{ fighter: Fighter }>()
</script>

<style scoped>
.all, .text {
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.weight, .all, .text {
  display: flex;
}

.weight > p {
  margin-right: 1em;
}

p {
  margin-bottom: 10px;
  margin-top: 5px;
}
</style>

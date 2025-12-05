<template>
  <div class="fighter-card">
    <div class="fighter-header">
      <h2 class="fighter-name">
        {{ fighter.first_name }}
        <span v-if="fighter.nickname" class="nickname">"{{ fighter.nickname }}"</span>
        {{ fighter.last_name }}
      </h2>
    </div>

    <div class="fighter-stats">
      <div class="stat-row">
        <span class="stat-label">WEIGHT</span>
        <span class="stat-value">{{ fighter.weight }}</span>
      </div>

      <div class="stat-row">
        <span class="stat-label">RECORD</span>
        <span class="stat-value record">
          <span class="wins">{{ fighter.record.wins }}W</span> -
          <span class="losses">{{ fighter.record.losses }}L</span> -
          <span class="draws">{{ fighter.record.draws }}D</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Fighter } from '../../shared/types.ts'
defineProps<{ fighter: Fighter }>()
</script>

<style scoped>
.fighter-card {
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-border);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 8px 8px 0 rgba(0,0,0,0.5);
  margin: 20px auto;
}

.fighter-header {
  border-bottom: 4px solid var(--color-primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  text-align: center;
}

.fighter-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: #fff;
  text-transform: uppercase;
  text-shadow: 2px 2px 0 #000;
  margin: 0;
}

.nickname {
  color: var(--color-accent);
  display: block;
  font-family: var(--font-arcade);
  font-size: 0.8rem;
  margin: 5px 0;
}

.fighter-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
  padding: 10px;
  border: 2px solid #333;
}

.stat-label {
  font-family: var(--font-arcade);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  margin-right: 10px;
}

.stat-value {
  font-family: var(--font-display);
  color: #fff;
  font-size: 1.2rem;
}

.record .wins { color: #00ff00; }
.record .losses { color: var(--color-primary); }
.record .draws { color: var(--color-text-muted); }
</style>

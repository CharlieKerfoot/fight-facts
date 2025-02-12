<script setup lang="ts">
import FighterView from '@/components/FighterView.vue';
import type { Fighter } from '../../shared/fighter.ts'

const fighter: Fighter = {
  image: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2025-01/5/ROYVAL_BRANDON_L_10-12.png?itok=FFq8GMSE",
  first_name: "Brandon",
  last_name: "Royval",
  nickname: "Raw Dawg",
  record: {
    wins: 17,
    losses: 7,
    draws: 0,
  },
  weight: "Flyweight",
  ranked: true,
  ranking: 1
}
</script>

<template>
  <main>
    <p>Guess the fighter</p>
    <img src="" alt="Fighter Photo">
    <FighterView :fighter="fighter"/>
  </main>
</template>

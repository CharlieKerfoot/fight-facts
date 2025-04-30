<script setup lang="ts">
import FighterView from '@/components/FighterView.vue'
import type { Fighter } from '../../shared/types'
import { ref } from 'vue'

const oddsGuess = ref(0)

const fighter1: Fighter = {
  first_name: 'Brandon',
  last_name: 'Royval',
  nickname: 'Raw Dawg',
  female: false,
  record: {
    wins: 17,
    losses: 7,
    draws: 0,
  },
  weight: 'Flyweight',
  stance: 'Orthodox',
  birth_day: new Date('Feb 09, 1987'),
  reach: 78,
  height: `5' 8"`,
}

const fighter2: Fighter = {
  first_name: 'Brandon',
  last_name: 'Royval',
  nickname: 'Raw Dawg',
  female: false,
  record: {
    wins: 17,
    losses: 7,
    // To get data from your `ufcsql.db` database into the web app, you need to set up a backend server to query the database and expose an API endpoint. Then, you can fetch the data from the frontend using Vue's `fetch` or a library like Axios.

    // Here’s how you can modify your code:

    // 1. **Set up a backend server** (e.g., using Node.js with Express and SQLite):
    //   ```javascript
    //   // server.js
    //   const express = require('express');
    //   const sqlite3 = require('sqlite3').verbose();
    //   const cors = require('cors');

    //   const app = express();
    //   const db = new sqlite3.Database('./ufcsql.db');

    //   app.use(cors());

    //   app.get('/fighters', (req, res) => {
    //     db.all('SELECT * FROM fighters', [], (err, rows) => {
    //      if (err) {
    //       res.status(500).json({ error: err.message });
    //       return;
    //      }
    //      res.json(rows);
    //     });
    //   });

    //   const PORT = 3000;
    //   app.listen(PORT, () => {
    //     console.log(`Server running on http://localhost:${PORT}`);
    //   });
    //   ```

    // 2. **Fetch data in your Vue component**:
    //   Replace the hardcoded `fighter1` and `fighter2` objects with data fetched from the backend.

    //   ```vue
    //   <script setup lang="ts">
    //   import FighterView from '@/components/FighterView.vue'
    //   import type { Fighter } from '../../shared/types'
    //   import { ref, onMounted } from 'vue'

    //   const oddsGuess = ref(0)
    //   const fighter1 = ref<Fighter | null>(null)
    //   const fighter2 = ref<Fighter | null>(null)

    //   onMounted(async () => {
    //     try {
    //      const response = await fetch('http://localhost:3000/fighters');
    //      const fighters = await response.json();
    //      fighter1.value = fighters[0];
    //      fighter2.value = fighters[1];
    //     } catch (error) {
    //      console.error('Error fetching fighters:', error);
    //     }
    //   });

    //   <template>
    //     <div class="game" v-if="fighter1 && fighter2">
    //      <FighterView :fighter="fighter1" />
    //      <div class="odds">
    //       <input v-model="oddsGuess" type="range" min="-2500" max="2500" step="10" />
    //       <p>Odds: {{ oddsGuess }}</p>
    //       <button type="submit">Guess</button>
    //      </div>
    //      <div class="middle">
    //       <p>{{ fighter1.weight }} Bout</p>
    //       <p>Event Name</p>
    //       <p>Date</p>
    //       <p>Place</p>
    //      </div>
    //      <FighterView :fighter="fighter2" />
    //     </div>
    //   </template>
    //   ```

    // 3. **Run the backend server**:
    //   Start the server with `node server.js`.

    // 4. **Run the Vue app**:
    //   Start your Vue app and ensure it fetches data from the backend.

    // This approach ensures your app dynamically fetches data from the database.
    draws: 0,
  },
  weight: 'Flyweight',
  stance: 'Orthodox',
  birth_day: new Date('Feb 09, 1987'),
  reach: 78,
  height: `5' 8"`,
}

</script>

<template>
  <div class="game">
    <FighterView :fighter="fighter1" />
    <div class="odds">
      <input v-model="oddsGuess" type="range" min="-2500" max="2500" step="10" />
      <p>Odds: {{ oddsGuess }}</p>
      <button type="submit">Guess</button>
    </div>
    <div class="middle">
      <p>{{ fighter1.weight }} Bout</p>
      <p>Event Name</p>
      <p>Date</p>
      <p>Place</p>
    </div>
    <FighterView :fighter="fighter2" />
  </div>
</template>

<style scoped>
.game {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 90vh;
}

.middle > p {
  margin: 5px 0;
}

.odds > p {
  margin-top: 5px;
  font-size: 30px;
  margin-bottom: 10px;
}

.odds > p,
.odds > button {
  margin-left: 3px;
}

.odds {
  position: absolute;
  top: 70vh;
}

.middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

input {
  width: 20em;
}
</style>

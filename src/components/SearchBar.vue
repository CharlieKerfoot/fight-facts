<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'suggestion-selected', fighter: { firstName: string; lastName: string }): void
}>()

const input = ref('')
const suggestions = ref<Array<{ firstName: string; lastName: string }>>([])
const showSuggestions = ref(false)

const search = async () => {
  if (input.value.length < 2) {
    suggestions.value = []
    return
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/search?q=${encodeURIComponent(input.value)}`,
    )
    const data = await response.json()
    suggestions.value = data
    showSuggestions.value = true
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    suggestions.value = []
  }
}

const selectSuggestion = (fighter: { firstName: string; lastName: string }) => {
  input.value = `${fighter.firstName} ${fighter.lastName}`
  showSuggestions.value = false
  emit('suggestion-selected', fighter)
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(input, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(search, 300)
})
</script>

<template>
  <div class="search-container">
    <input
      v-model="input"
      placeholder="Search for a fighter..."
      @focus="showSuggestions = true"
      @blur="hideSuggestions"
    />
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
      <div
        v-for="fighter in suggestions"
        :key="`${fighter.firstName}-${fighter.lastName}`"
        class="suggestion-item"
        @mousedown="selectSuggestion(fighter)"
      >
        {{ fighter.firstName }} {{ fighter.lastName || '' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}
</style>

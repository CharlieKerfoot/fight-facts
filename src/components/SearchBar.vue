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
      `/api/search?q=${encodeURIComponent(input.value)}`,
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
  padding: 15px;
  font-family: var(--font-arcade);
  font-size: 14px;
  background: #000;
  color: var(--color-primary);
  border: 4px solid var(--color-border);
  outline: none;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
  transition: all 0.2s;
}

input:focus {
  border-color: var(--color-secondary);
  box-shadow: 2px 2px 0 rgba(0,0,0,0.5);
  transform: translate(2px, 2px);
}

input::placeholder {
  color: #555;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-border);
  border-top: none;
  margin-top: 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
}

.suggestion-item {
  padding: 15px;
  cursor: pointer;
  font-family: var(--font-arcade);
  font-size: 12px;
  color: var(--color-text);
  border-bottom: 2px solid #333;
  transition: all 0.1s;
  text-transform: uppercase;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: var(--color-primary);
  color: #fff;
  padding-left: 25px;
}

.suggestion-item:hover::before {
  content: '►';
  position: absolute;
  left: 10px;
}
</style>

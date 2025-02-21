<template>
  <!-- <p>{{response["customer_id"]}}</p> -->
  <h1 v-if="userData != ''">
    {{ userData.first_name }} {{ userData.last_name }} {{ userData.email }}
  </h1>
  <button @click="createUser">Create a User!</button>
  <p>{{ displayNewUser }}</p>

  <button @click="getAllUsers">Get All Users (This one works)</button>
  <p>{{ displayAllUsers }}</p>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const displayNewUser = ref('Press the create user button')
const displayAllUsers = ref('Press the Get All Users Button!!!')
const userData = ref('')

const getUserID = async () => {
  const response = await fetch('https://hm-bookstore-api.onrender.com/user/3')
  const json = await response.json()
  userData.value = json
}

const getAllUsers = async () => {
  // This is from my intro-to-sqlite repo
  const response = await fetch('http://localhost:4000/all-users')
  const json = await response.json()
  console.log(json)
  displayAllUsers.value = json
}

const createUser = async () => {
  const response = await fetch('https://hm-bookstore-api.onrender.com/user/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // mode: "no-cors",
    body: JSON.stringify({
      first_name: 'xxx',
      last_name: 'xxx',
      email: 'name@example.com',
    }),
  })
  const json = await response.json()
  console.log(json.id);
  displayNewUser.value = json.id

}

onMounted(() => {
  getUserID()
})
</script>

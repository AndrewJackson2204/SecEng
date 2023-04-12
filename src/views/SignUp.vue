<template>
  <div class="min-h-screen flex items-start justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md mt-8">
      <div class="bg-blue-500 px-6 py-8 rounded-t-lg">
        <h2 class="text-2xl font-semibold text-white mb-4">Sign Up</h2>
        <p class="text-sm text-gray-200">Create an account to get started</p>
      </div>
      <form @submit.prevent="signUp" class="px-6 py-8 space-y-4">
        <input v-model.trim="displayName" type="text" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Display Name" required/>
        <input v-model.trim="email" type="email" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Email" required/>
        <input v-model.trim="password" type="password" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Password" required/>
        <button type="submit" class="w-full py-3 px-6 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none">
          Sign Up
        </button>
        <p v-if="error" class="text-red-500 text-center">Error: {{ error }}</p>
      </form>
      <div class="px-6 py-4 bg-gray-100 rounded-b-lg">
        <p class="text-sm text-gray-600 text-center">
          Already have an account?
          <router-link to="/sign-in" class="text-blue-500">Sign In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import router from '@/router';

export default {
  setup() {
    const store = useStore();
    const displayName = ref('');
    const email = ref('');
    const password = ref('');
    const error = computed(() => store.getters.error);

    const signUp = async () => {
      try {
        await store.dispatch('signUp', { displayName: displayName.value, email: email.value, password: password.value });
        router.push('/practice');
      } catch (err) {
        console.error(err);
      }
    };

    return {
      displayName,
      email,
      password,
      error,
      signUp,
    };
  },
};
</script>

<style scoped>
/* Tailwind CSS classes */
</style>

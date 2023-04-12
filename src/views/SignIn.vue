<template>
  <div class="min-h-screen flex items-start justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md mt-8">
      <div class="bg-blue-500 px-6 py-8 rounded-t-lg">
        <h2 class="text-2xl font-semibold text-white mb-4">Sign In</h2>
        <p class="text-sm text-gray-200">Sign in to your account</p>
      </div>
      <form @submit.prevent="signIn" class="px-6 py-8 space-y-4">
        <input v-model.trim="email" type="email" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Email" />
        <input v-model.trim="password" type="password" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Password" />
        <button type="submit" class="w-full py-3 px-6 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none">
          Sign In
        </button>
        <p v-if="error" class="text-red-500 text-center">Error: {{ error }}</p>
      </form>
      <div class="px-6 py-4 bg-gray-100 rounded-b-lg">
        <p class="text-sm text-gray-600 text-center">
          Don't have an account?
          <router-link to="/sign-up" class="text-blue-500">Sign Up</router-link>
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
    const email = ref('');
    const password = ref('');
    const error = computed(() => store.getters.error);

    const signIn = async () => {
      try {
        await store.dispatch('signIn', { email: email.value, password: password.value });
        router.push('/practice');
      } catch (err) {
        console.error(err);
      }
    };

    return {
      email,
      password,
      error,
      signIn,
    };
  },
};
</script>

<style scoped>
/* Tailwind CSS classes */
</style>


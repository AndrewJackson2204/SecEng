<template>
  <nav class="bg-blue-800 shadow-lg">
    <template v-if="authIsReady">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-white text-lg font-bold mx-4"> Home </router-link>
            <router-link to="/about" class="text-white text-lg font-bold mx-4"> About </router-link>
            <router-link v-if="!user" to="/sign-up" class="text-white text-lg font-bold mx-4"> Sign-Up </router-link>
            <router-link v-if="user" to="/practice" class="text-white text-lg font-bold mx-4"> Practice </router-link>
            <router-link v-if="user" to="/scores" class="text-white text-lg font-bold mx-4"> Scores </router-link>
            <a v-if="user" @click="signOut" class="text-white text-lg font-bold mx-4"> Logout </a>
          </div>
        </div>
      </div>
    </template>  
  </nav>
 
  <router-view />
</template>


<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import router from '@/router';


export default {
  setup() {
    const store = useStore();
    const user = computed(() => store.getters.user);

    const signOut = async () => {
      try {
        await store.dispatch('signOut');
        router.push('/');
    } catch (err) {
        console.error(err);
      }
    };

    return {
      user,
      signOut,
      user: computed(() => store.state.user),
      authIsReady: computed(() => store.state.authIsReady)
    };

  },
};
</script>


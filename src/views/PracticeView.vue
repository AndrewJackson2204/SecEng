<template>
  <div @click.self="closeChallengeModal" class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- Loop through challenges and display boxes with animations -->
          <transition-group name="fade" mode="out-in">
            <div v-for="challenge in challenges" :key="challenge.id" class="bg-white shadow-md p-8 rounded-lg cursor-pointer transform hover:bg-gray-100 hover:-translate-y-1 transition-transform duration-300" @click="showChallengeModal(challenge)">
              <div class="flex justify-between mb-4">
                <div class="flex items-center">
                  <p class="text-sm text-gray-500 font-bold">{{ challenge.category }}</p>
                </div>
                <div class="flex items-center">
                  <p class="text-sm text-gray-400 font-bold">| {{ challenge.points }} Points</p>
                </div>
              </div>
              <h2 class="text-lg font-bold mb-2 text-left">{{ challenge.title }}</h2>
              <div class="flex justify-between mt-6">
                <div class="flex items-center">
                  <p class="text-sm text-gray-500">
                  </p>
                </div>
                <div class="flex items-center">
                  <p class="text-sm text-gray-500">
                    <span v-if="isChallengeSolved(challenge)" class="text-green-500">OO</span>
                  </p>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>

<!-- Modal -->
<div v-if="isModalOpen" class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center">
  <div @click.self="closeChallengeModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

  <div class="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all max-w-3xl w-full sm:my-8 sm:align-middle sm:p-6" role="document">
    <div class="sm:flex sm:items-start">
      <div class="flex flex-col sm:w-3/3">
        <p class="text-3xl leading-6 font-extrabold text-gray-900 mb-2">{{ selectedChallenge.title }}</p>
        <br>
        <p class="text-xl text-gray-400 ">{{ selectedChallenge.question }}</p>
	<br>
        <p class="text-xl font-mono text-blue-600">{{ selectedChallenge.challenge }}</p>
	<br>
        <a v-if="selectedChallenge.download_link" class="text-xl 
        hover:underline text-blue-600 hover:text-blue-800 visited:text-purple-600" :href="selectedChallenge.download_link" download target=”_blank”>Download the file here</a>
      </div>
    </div>
    <br>
    <br>
    <label for="user-input"></label>
    <input id="user-input" class="w-2/3 bg-gray-10 border-2 border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-indigo-500 transition duration-300 ease-in-out placeholder-gray-400 text-gray-800" placeholder="CTF{FLAG}" type="text" v-model="userInput">
    <button type="button" @click="checkAnswer" class="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
        Submit Flag
    </button>
    <p v-if="feedbackMessage" class="text-xl text-gray-600 px-4 py-2 rounded-lg ">{{ feedbackMessage }}</p>
  </div>
</div>

</template>


<script>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'App',
  setup() {
    onMounted(fetchSolvedChallenges);

    const store = useStore();

    const challenges = ref([]);
    const isModalOpen = ref(false);
    const selectedChallenge = ref(null);
    const userInput = ref('');
    const feedbackMessage = ref('');
    const points = ref(0);

    const fetchChallenges = async () => {
      try {
        const challengesCollection = collection(db, 'challenges');
        const challengesQuery = query(challengesCollection);
        const querySnapshot = await getDocs(challengesQuery);
        challenges.value = querySnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() }; // Include document ID in the returned object
        });
      } catch (error) {
        console.error('Error fetching challenges:', error);
      }
    };

    // Call the syncSolvedChallenges action using dispatch
    async function fetchSolvedChallenges() {
      try {
        await store.dispatch('syncSolvedChallenges'); // Call the action using dispatch on the store object
        // The store will now be updated with the user's solved challenges
        // You can access the updated solved challenges using store.getters.getSolvedChallenges
      } catch (error) {
        console.error(error);
      }
    }

    // Define computed property for isChallengeSolved
    const isChallengeSolved = computed(() => {
      const user = store.state.user; // Assuming user object is stored in Vuex as 'user'
      const solvedChallenges = user.solvedChallenges || []; // Assuming challenges array is stored in user object as 'solvedChallenges'
      console.log(solvedChallenges);
      return (challenge) => solvedChallenges.some(solvedChallenge => solvedChallenge.id === challenge.id);
    });

    const showChallengeModal = challenge => {
      selectedChallenge.value = challenge;
      isModalOpen.value = true;

      // Accessing the Firebase document ID
      const documentId = selectedChallenge.value.id;
      //console.log('Firebase Document ID:', documentId);
    };

    const closeChallengeModal = () => {
      isModalOpen.value = false;
      feedbackMessage.value = '';
      userInput.value = '';
    };

    const markChallengeAsSolved = async (challengeId) => { // Pass the challengeId as an argument
      try {
      await store.dispatch('markChallengeAsSolved', challengeId); // Dispatch the action with the challengeId
      } catch (err) {
        console.error(err);
      }
    };

    const checkAnswer = () => {
      if (userInput.value === selectedChallenge.value.answer) {
        feedbackMessage.value = 'Correct! You solved the challenge!';
        // Call markChallengeAsSolved action to mark challenge as solved
        markChallengeAsSolved(selectedChallenge.value.id);
      } else {
        feedbackMessage.value = 'Incorrect. Please try again.';
      }
    };

    fetchChallenges();

    return { fetchSolvedChallenges, isChallengeSolved, points, challenges, isModalOpen, selectedChallenge, userInput, feedbackMessage, showChallengeModal, closeChallengeModal, checkAnswer };
  }
}
</script>


<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <div class="min-h-screen bg-gray-100 flex items-start justify-center">
    <div class="mt-8 bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <h1 class="text-3xl font-semibold mb-6">Scoreboard</h1>
      <table class="w-full">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-left py-2 px-4">User</th>
            <th class="text-left py-2 px-4">Challenges Solved</th>
            <th class="text-left py-2 px-4">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, userId) in sortedUsers"
            :key="userId"
            class="border-b border-gray-300"
          >
            <td v-if="user.displayName" class="py-2 px-4">{{ user.displayName }}</td>
            <td v-if="user.displayName" class="py-2 px-4">{{ user.solvedChallenges.length }}</td>
            <td v-if="user.displayName" class="py-2 px-4">{{ calculatePoints(user) }}</td> <!-- Display calculated points -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

export default {
  setup() {
    const users = ref([]);
    const challenges = ref([]);

    // Fetch users and challenges from Firebase Firestore on component mount
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));

        // Fetch challenges
        const challengesSnapshot = await getDocs(collection(db, "challenges"));

        // Update challenges array with fetched challenges
        challenges.value = challengesSnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });

        const usersData = usersSnapshot.docs.map((doc) => doc.data());

        usersData.forEach((user) => {
          user.points = 0; // Initialize points to 0 for each user

          user.solvedChallenges.forEach((challengeId) => {
            const challenge = challenges.value.find((c) => c.id === challengeId); // Find challenge by ID
            if (challenge) {
              user.points += challenge.points; // Add points of each solved challenge
            }
          });
        });

        users.value = usersData;
      } catch (error) {
        console.error("Error fetching users and challenges:", error);
      }
    };
    onMounted(fetchUsers);

    // Sort the users array by points in descending order
    const sortedUsers = computed(() => {
      return users.value.sort((a, b) => b.points - a.points);
    });

    return { users, calculatePoints: (user) => user.points, sortedUsers };
  },
};
</script>

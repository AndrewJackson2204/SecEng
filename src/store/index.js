import { createStore } from 'vuex';
import { auth, db } from '@/firebase';
import { onAuthStateChanged, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { unsub, doc, setDoc, updateDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';

const store = createStore({
  state: {
    user: null,
    authIsReady: null,
    error: null,
    loading: false
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setAuthIsReady(state, payload) {
      state.authIsReady = payload;
    },
    setError(state, error) {
      state.error = error;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setSolvedChallenges(state, solvedChallenges) {
      state.user.solvedChallenges = solvedChallenges;
    }
  },
  actions: {
    signUp({ commit }, { email, password, displayName }) {
      return new Promise((resolve, reject) => {
        commit('setLoading', true);
        createUserWithEmailAndPassword(auth, email, password)
          .then(async userCredential => {
            const user = userCredential.user;
            // Update user profile in Firebase Auth
            await updateProfile(user, {
              displayName: displayName, // Set display name from input parameter
              // Additional profile data can be added here
            });
            // Create user profile in Firebase Firestore
            await setDoc(doc(db, 'users', user.uid), {
              displayName: displayName, // Set display name from input parameter
              // Additional profile data can be added here
              solvedChallenges: [] // Initialize an empty array for solved challenges
            });
            commit('setUser', user);
            commit('setError', null);
            commit('setLoading', false);
            resolve(user);
          })
          .catch(error => {
            commit('setError', error.message);
            commit('setLoading', false);
            reject(error);
          });
      });
    },    
    signIn({ commit }, { email, password }) {
      return new Promise((resolve, reject) => {
        commit('setLoading', true);
        signInWithEmailAndPassword(auth, email, password)
          .then(userCredential => {
            const user = userCredential.user;
            commit('setUser', user);
            commit('setError', null);
            commit('setLoading', false);
            resolve(user);
          })
          .catch(error => {
            commit('setError', error.message);
            commit('setLoading', false);
            reject(error);
          });
      });
    },
    signOut({ commit }) {
      auth.signOut()
        .then(() => {
          commit('setUser', null);
          commit('setError', null);
        })
        .catch(error => {
          commit('setError', error.message);
        });
    },
    async markChallengeAsSolved({ commit, state }, challengeId) {
      try {
        if (!state.user) {
          throw new Error('User is not logged in'); // Throw an error if user is not logged in
        }
        const userDocRef = doc(db, 'users', state.user.uid);
        // Get the user profile from Firestore
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          // Check if challenge is already marked as solved
          const solvedChallenges = userDoc.data().solvedChallenges || [];
          if (!solvedChallenges.includes(challengeId)) {
            // Update user profile to mark challenge as solved
            await updateDoc(userDocRef, {
              solvedChallenges: [...solvedChallenges, challengeId]
            });
            // Update the user object in Vuex store
            // Check if state.user.solvedChallenges is an array or not
            const updatedUser = { ...state.user };
            if (!Array.isArray(updatedUser.solvedChallenges)) {
              updatedUser.solvedChallenges = []; // Initialize as empty array if not an array
            }
            commit('setUser', { ...updatedUser, solvedChallenges: [...updatedUser.solvedChallenges, challengeId] });
          }
        }
      
      } catch (error) {
        console.error('Failed to mark challenge as solved:', error);
      }
    },
    async syncSolvedChallenges({ commit, state }) {
      try {
        if (!state.user) {
          throw new Error('User is not logged in'); // Throw an error if user is not logged in
        }
        const userDocRef = doc(db, 'users', state.user.uid);
        // Get the user profile from Firestore
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          // Get the solved challenges from Firestore
          const solvedChallenges = userDoc.data().solvedChallenges || [];
          // Update the store with the retrieved solved challenges
          commit('setSolvedChallenges', solvedChallenges);
        }
      } catch (error) {
        console.error(error);
      }
    }
  },    
  getters: {
    user(state) {
      return state.user;
    },
    error(state) {
      return state.error;
    },
    loading(state) {
      return state.loading;
    }
  }
});

onAuthStateChanged(auth, (user) => {
  store.commit('setAuthIsReady', true)
  store.commit('setUser', user)
  unsub()
})

export default store;


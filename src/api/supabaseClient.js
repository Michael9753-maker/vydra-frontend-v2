// TEMP SUPABASE CLIENT (SAFE STUB)

export const supabase = {
  auth: {
    signInWithOtp: async () => {
      return { error: null };
    },
    onAuthStateChange: () => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },
};
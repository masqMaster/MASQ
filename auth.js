// // auth.js

// import { supabase } from './supabaseClient.js';

// export async function signUp(email, password) {
//   const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
//     email,
//     password,
//   });

//   if (signUpError) {
//     if (signUpError.message.includes("User already registered")) {
//       alert("This email is already signed up. Try logging in instead.");
//     } else {
//       alert(`Signup Error: ${signUpError.message}`);
//     }
//     console.error(signUpError);
//     return;
//   }

//   const user = signUpData.user;
//   if (user) {
//     alert("Signup successful! Check your email to verify your account.");
//   }
// }

// export async function login(email, password) {
//   const { data: loginData, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     console.error("Login error:", error.message);
//     return { user: null, username: null, error };
//   }

//   const user = loginData?.user || null;

//   if (user) {
//     await ensureUserInDB(user.id, email);
//     // Fetch the username from the users table
//     const { data: userData, error: fetchError } = await supabase
//       .from('users')
//       .select('username')
//       .eq('id', user.id)
//       .single();

//     if (fetchError) {
//       console.error("Error fetching username:", fetchError.message);
//       return { user, username: null, error: fetchError };
//     }

//     return { user, username: userData.username, error: null };
//   }

//   return { user: null, username: null, error: null };
// }

// export async function playAsGuest() {
//   const guestUser = {
//     id: 'guest_' + Math.random().toString(36).substr(2, 9), // Unique guest ID
//     email: 'guest@example.com',
//   };
//   console.log("Guest mode activated with ID:", guestUser.id);
//   return { user: guestUser, username: 'Anon', error: null }; // Return "Anon" as username for guests
// }

// export async function getUser() {
//   const { data: { user } } = await supabase.auth.getUser();
//   return user;
// }

// export async function logout() {
//   const { error } = await supabase.auth.signOut();
//   if (error) console.error("Logout Error:", error.message);
// }

// export async function getUserStats(userId) {
//   console.log(`Fetching stats for user ${userId}`);
//   if (userId.startsWith('guest_')) {
//     return { total_wins: 0, total_losses: 0, win_streak: 0 };
//   }
//   const { data, error } = await supabase
//     .from('users')
//     .select('total_wins, total_losses, win_streak')
//     .eq('id', userId);

//   if (error) {
//     console.error("Error fetching user stats:", error.message);
//     return { total_wins: 0, total_losses: 0, win_streak: 0 };
//   }

//   if (!data || data.length === 0) {
//     console.log(`No stats found for user ${userId}, returning defaults`);
//     return { total_wins: 0, total_losses: 0, win_streak: 0 };
//   }

//   if (data.length > 1) {
//     console.warn(`Multiple rows found for user ${userId}, using first row`);
//   }

//   console.log(`Stats retrieved for user ${userId}:`, data[0]);
//   return data[0];
// }

// export async function updateUserStats(userId, wins, losses, streak) {
//   console.log(`Attempting to update stats for user ${userId}: Wins=${wins}, Losses=${losses}, Streak=${streak}`);
//   if (userId.startsWith('guest_')) {
//     console.log("Guest mode: Stats not saved to database");
//     return true;
//   }
//   const { data, error } = await supabase
//     .from('users')
//     .update({
//       total_wins: wins,
//       total_losses: losses,
//       win_streak: streak,
//     })
//     .eq('id', userId)
//     .select();

//   if (error) {
//     console.error("Error updating user stats:", error.message);
//     return false;
//   }

//   console.log("Stats updated successfully:", data);
//   return true;
// }

// export async function ensureUserInDB(userId, email) {
//   console.log(`Checking if user ${userId} exists in DB`);
//   if (userId.startsWith('guest_')) {
//     console.log("Guest mode: No database entry created");
//     return;
//   }
//   const { data: existingUser, error: selectError } = await supabase
//     .from('users')
//     .select('id, username')
//     .eq('id', userId)
//     .maybeSingle();

//   if (selectError) {
//     console.error("Error checking user existence:", selectError.message);
//     return;
//   }

//   if (existingUser) {
//     console.log(`User ${userId} already exists with username: ${existingUser.username}`);
//     return;
//   }

//   const defaultUsername = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
//   console.log(`User ${userId} not found, creating with username: ${defaultUsername}`);
//   const { data, error } = await supabase
//     .from('users')
//     .insert({
//       id: userId,
//       username: defaultUsername,
//       total_wins: 0,
//       total_losses: 0,
//       win_streak: 0,
//     })
//     .select();

//   if (error) {
//     console.error("Error inserting new user:", error.message, "Details:", error.details, "Hint:", error.hint);
//     return;
//   }

//   console.log(`User ${userId} created with username: ${data[0].username}`);
// }





export async function signUp(email, password) {
  try {
    const res = await fetch('/api/signup-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Signup failed");

    alert("Signup successful! Check your email to verify your account.");
  } catch (error) {
    if (error.message.includes("User already registered")) {
      alert("This email is already signed up. Try logging in instead.");
    } else {
      alert(`Signup Error: ${error.message}`);
    }
    console.error(error);
  }
}

export async function login(email, password) {
  try {
    const res = await fetch('/api/login-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const { user, username, error } = await res.json();

    if (error) {
      console.error("Login error:", error);
      return { user: null, username: null, error };
    }

    return { user, username, error: null };
  } catch (err) {
    console.error("Unexpected login error:", err);
    return { user: null, username: null, error: err.message };
  }
}

export async function playAsGuest() {
  const guestUser = {
    id: 'guest_' + Math.random().toString(36).substr(2, 9),
    email: 'guest@example.com',
  };
  console.log("Guest mode activated with ID:", guestUser.id);
  return { user: guestUser, username: 'Anon', error: null };
}

export async function getUserStats(userId) {
  if (userId.startsWith('guest_')) {
    return { total_wins: 0, total_losses: 0, win_streak: 0 };
  }

  const res = await fetch('/api/get-user-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    console.error("Error fetching user stats");
    return { total_wins: 0, total_losses: 0, win_streak: 0 };
  }

  return await res.json();
}

export async function updateUserStats(userId, wins, losses, streak) {
  if (userId.startsWith('guest_')) {
    console.log("Guest mode: Stats not saved to database");
    return true;
  }

  const res = await fetch('/api/update-user-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, totalWins: wins, totalLosses: losses, winStreak: streak }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    console.error("Error updating stats:", error);
    return false;
  }

  return true;
}

export async function ensureUserInDB(userId, email) {
  if (userId.startsWith('guest_')) return;

  const res = await fetch('/api/ensure-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    console.error("Error ensuring user in DB:", error);
  }
}

export async function logout() {
  const res = await fetch('/api/logout-user', {
    method: 'POST'
  });

  if (!res.ok) {
    const { error } = await res.json();
    console.error("Logout error:", error);
  }
}

export async function getUser() {
  const res = await fetch('/api/get-user-session');
  if (!res.ok) return null;
  const result = await res.json();
  return result?.user || null;
}

export async function getSessionUser() {
  try {
    const res = await fetch('/api/get-user-session');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error("Session check failed:", err);
    return null;
  }
}

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { getDB } = require("./db");

/**
 * Configure Passport.js with Google OAuth2 Strategy
 */
const configurePassport = () => {
  // Serialize user ID to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser((id, done) => {
    try {
      const db = getDB();
      const user = db
        .prepare(
          "SELECT id, email, name, avatar, authProvider FROM users WHERE id = ?"
        )
        .get(id);

      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth2 Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL ||
            "http://localhost:3001/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const db = getDB();
            const email = profile.emails?.[0]?.value;

            if (!email) {
              return done(new Error("No email found in Google profile"), null);
            }

            // Check if user exists by googleId
            let user = db
              .prepare("SELECT * FROM users WHERE googleId = ?")
              .get(profile.id);

            if (user) {
              // Update user info from Google
              db.prepare(
                `UPDATE users SET 
                 name = ?, 
                 avatar = ?,
                 email = ?
                 WHERE id = ?`
              ).run(
                profile.displayName || user.name,
                profile.photos?.[0]?.value || user.avatar,
                email,
                user.id
              );

              user = db
                .prepare("SELECT * FROM users WHERE id = ?")
                .get(user.id);
              return done(null, user);
            }

            // Check if user exists by email (might have registered with email/password)
            user = db
              .prepare("SELECT * FROM users WHERE email = ?")
              .get(email.toLowerCase());

            if (user) {
              // Link Google account to existing user
              db.prepare(
                `UPDATE users SET 
                 googleId = ?,
                 name = COALESCE(NULLIF(name, ''), ?),
                 avatar = COALESCE(NULLIF(avatar, ''), ?),
                 authProvider = CASE 
                   WHEN authProvider = 'local' THEN 'both' 
                   ELSE authProvider 
                 END
                 WHERE id = ?`
              ).run(
                profile.id,
                profile.displayName || "",
                profile.photos?.[0]?.value || "",
                user.id
              );

              user = db
                .prepare("SELECT * FROM users WHERE id = ?")
                .get(user.id);
              return done(null, user);
            }

            // Create new user
            const result = db
              .prepare(
                `INSERT INTO users (email, googleId, name, avatar, authProvider) 
                 VALUES (?, ?, ?, ?, 'google')`
              )
              .run(
                email.toLowerCase(),
                profile.id,
                profile.displayName || "",
                profile.photos?.[0]?.value || ""
              );

            const userId = result.lastInsertRowid;

            // Initialize preferences and streak for new user
            db.prepare("INSERT INTO preferences (userId) VALUES (?)").run(
              userId
            );
            db.prepare("INSERT INTO streaks (userId) VALUES (?)").run(userId);

            user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

            // Update streak for first login
            const today = new Date().toISOString().split("T")[0];
            db.prepare(
              `UPDATE streaks SET 
               currentStreak = 1, 
               lastActive = ?,
               totalDaysActive = 1
               WHERE userId = ?`
            ).run(today, userId);

            done(null, user);
          } catch (error) {
            console.error("Google OAuth error:", error);
            done(error, null);
          }
        }
      )
    );

    console.log("✅ Google OAuth configured");
  } else {
    console.log(
      "⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)"
    );
  }
};

module.exports = { configurePassport };

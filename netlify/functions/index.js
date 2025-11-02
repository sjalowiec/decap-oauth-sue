import express from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import serverless from "serverless-http";

const app = express();

// 🔑 Environment variables set in Netlify
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL =
  process.env.CALLBACK_URL || "https://decap-oauth-sue.netlify.app/auth/github/callback";

// Configure Passport (no session storage)
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, { profile, accessToken });
    }
  )
);

app.use(passport.initialize());

// --- OAuth routes ---
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["repo", "user"], session: false })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = req.user?.accessToken || "";
    const script = `
      <script>
        if (window.opener) {
          window.opener.postMessage(
            "authorization:github:success:${token}",
            "*"
          );
          window.close();
        } else {
          document.body.innerHTML = "<p>✅ GitHub authorization successful! You can close this window and return to Knit by Machine.</p>";
        }
      </script>`;
    res.send(script);
  }
);

app.get("/", (req, res) => {
  res.send("✅ Decap OAuth Provider running without session middleware.");
});

export const handler = serverless(app);

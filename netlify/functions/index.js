const express = require("express");
const serverless = require("serverless-http");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const app = express();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "replace-me";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "replace-me";
const CALLBACK_URL = process.env.CALLBACK_URL || "https://YOUR-OAUTH-SITE.netlify.app/auth/github/callback";

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => done(null, { profile, accessToken })
  )
);

app.use(passport.initialize());

app.get("/auth/github", passport.authenticate("github", { scope: ["repo", "user"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => res.send("GitHub auth successful. You can close this window.")
);

app.get("/", (req, res) => res.send("Decap OAuth Provider running ✅"));

module.exports.handler = serverless(app);

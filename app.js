var createError    = require('http-errors');
var express        = require('express');
var path           = require('path');
var logger         = require('morgan');

// [ADD] new requires
var cookieParser   = require('cookie-parser');
var session        = require('express-session');

var app = express();

// ── Secrets ──────────────────────────────────────────────────────────────────
var COOKIE_SECRET  = 'replace-with-a-long-random-string';
var SESSION_SECRET = 'replace-with-a-different-long-random-string';

// ── Users (no database) ───────────────────────────────────────────────────────
var users = {
  "admin": {
    username: "admin",
    password: "password123",
    fullName: "System Administrator",
    email:    "admin@university.edu",
    bio:      "Managing the campus network infrastructure."
  },
  "student_dev": {
    username: "student_dev",
    password: "dev_password",
    fullName: "Jane Developer",
    email:    "jane.d@student.edu",
    bio:      "Full-stack enthusiast and coffee drinker."
  }
};

// ── View engine (generator) ───────────────────────────────────────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// ── Middleware (order matters) ────────────────────────────────────────────────
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cookie-parser MUST come before express-session
app.use(cookieParser(COOKIE_SECRET));

app.use(session({
  secret:            SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie:            { httpOnly: true }
}));

app.use(express.static(path.join(__dirname, 'public')));

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Task A — Login page
app.get('/login', function(req, res) {
  if (req.session.user) return res.redirect('/profile');
  var theme = req.signedCookies.theme || 'light';
  res.render('login', { errorMsg: req.query.error, theme: theme });
});

// Task A — Credential check
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var user     = users[username];

  if (user && user.password === password) {
    req.session.user = {
      username: user.username,
      fullName: user.fullName,
      email:    user.email,
      bio:      user.bio
      // never store the password in the session
    };
    res.redirect('/profile');
  } else {
    res.redirect('/login?error=Invalid+username+or+password');
  }
});

// Task A — Logout
app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) console.error(err);
    res.clearCookie('connect.sid');   // remove stale session ID from browser
    res.redirect('/login');
  });
});

// Task B — Protected profile
app.get('/profile', requireAuth, function(req, res) {
  var theme = req.signedCookies.theme || 'light';
  res.render('profile', {
    fullName: req.session.user.fullName,
    email:    req.session.user.email,
    bio:      req.session.user.bio,
    theme:    theme
  });
});

// Task C — Theme toggle
app.get('/toggle-theme', function(req, res) {
  var current  = req.signedCookies.theme || 'light';
  var newTheme = current === 'light' ? 'dark' : 'light';

  res.cookie('theme', newTheme, {
    signed:   true,         // verified via COOKIE_SECRET on every request
    httpOnly: true,         // not accessible from JavaScript
    maxAge:   1000 * 60 * 60 * 24 * 30  // persist for 30 days
  });

  var referer = req.headers.referer || '/login';
  res.redirect(referer);
});

// ── 404 and error handlers (generator — keep at the bottom) ───────────────────
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

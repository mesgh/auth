const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { User } = require('./js/models/User');
const app = express();

const checkAuth = (r, res, next) => {
  if (r.session.auth === 'ok') {
    next();
  } else {
    res.redirect('/login');
  }
};

app
  .set('view engine', 'pug')
  .use(bodyParser.json())

  .use(bodyParser.urlencoded({ extended: true }))

  .use(session({ secret: 'mysecret', resave: true, saveUninitialized: true }))

  .get('/login', r => r.res.render('login'))

  .post('/login/check/', async r => {
    const { body: { login } } = r;
    const user = await User.findOne({ login });
    if (user) {
      if (user.password === r.body.pass) {
        r.session.auth = 'ok';
        r.session.login = login;
        r.res.redirect('/profile');
      } else {
        r.res.send('Неверный	пароль!');
      }
    } else {
      r.res.send('Нет	такого	пользователя!');
    }
  })

  .get('/profile', checkAuth, r => r.res.render('profile', { login: r.session.login }))
  
  .get('/users', checkAuth, async r => {
    const users = await User.find();
    r.res.render('users', { login: r.session.login, users })
  })

  .post('/logout', r => {
    delete r.session.auth;
    delete r.session.login;
    r.res.redirect('/login');
  })

  .get('/', r => r.res.redirect('/login'))

  .use(r => {
    r.res
      .status(404)
      .set({
        'Content-Type': 'text/html; charset=utf-8'
      })
      .send('<h1>Не найдено!</h1>');
  })

  .listen(process.env.PORT || 80);

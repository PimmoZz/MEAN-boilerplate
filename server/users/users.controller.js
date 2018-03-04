const express = require('express');

const router = express.Router();
const userService = require('./users.service');

function authenticate(req, res) {
  userService.authenticate(req.body.username, req.body.password)
    .then((user) => {
      if (user) {
        // authentication successful
        res.send(user);
      } else {
        // authentication failed
        res.status(400).send('Username or password is incorrect');
      }
    })
    .catch((err) => { res.status(400).send(err); });
}

function register(req, res) {
  userService.create(req.body)
    .then(() => { res.json('success'); })
    .catch((err) => { res.status(400).send(err); });
}

function getAll(req, res) {
  userService.getAll()
    .then((users) => { res.send(users); })
    .catch((err) => { res.status(400).send(err); });
}

function getCurrent(req, res) {
  userService.getById(req.user.sub)
    .then((user) => {
      if (user) { res.send(user); } else { res.sendStatus(404); }
    })
    .catch((err) => { res.status(400).send(err); });
}

function update(req, res) {
  userService.update(req.params._id, req.body)
    .then(() => { res.json('success'); })
    .catch((err) => { res.status(400).send(err); });
}

// Remove later after testing
/* eslint-disable no-underscore-dangle */
function _delete(req, res) {
  userService.delete(req.params._id)
    .then(() => { res.json('success'); })
    .catch((err) => { res.status(400).send(err); });
}
/* eslint-enable no-underscore-dangle */

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:_id', update);
router.delete('/:_id', _delete);

module.exports = router;

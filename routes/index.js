const Pet = require('../models/pet');

module.exports = (app) => {

// SEARCH PET
app.get('/search', (req, res) => {
  term = new RegExp(req.query.term, 'i')

  Pet.find({$or:[
    {'name': term},
    {'species': term}
  ]}).exec((err, pets) => {
    res.render('pets-index', { pets: pets });
  })
});}
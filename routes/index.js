const Pet = require('../models/pet');

module.exports = (app) => {

/* GET home page. */
app.get('/', (req, res) => {
  const page = req.query.page || 1;
  
  Pet.paginate({}, { page: page }).then((results) => {
    // If the request is JSON, we want to send a JSON response
    if (req.header('Content-Type') == 'application/json') {
      return res.json({ pets: results.docs, pagesCount: results.pages, currentPage: page });
    // Otherwise we do what we did before
    } else {
      res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });
    }
  });
});

// SEARCH PET - Full-text search with MongoDB $text
app.get('/search', (req, res) => {
  Pet
    .find(
      { $text: { $search: req.query.term } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .exec((err, pets) => {
      if (err) { 
        console.log('Search error:', err);
        return res.status(400).send(err);
      }

      if (req.header('Content-Type') == 'application/json') {
        return res.json({ pets: pets });
      } else {
        return res.render('pets-index', { pets: pets, term: req.query.term });
      }
    });
});
}
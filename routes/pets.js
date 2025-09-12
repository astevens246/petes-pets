// UPLOADING TO AWS S3
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'pets/avatar',
    region: process.env.S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  cleanup: {
    versions: true,
    original: true
  },
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard'
  },{
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square'
  }]
});

// MODELS
const Pet = require('../models/pet');

// PET ROUTES
module.exports = (app) => {

  // INDEX PET => index.js

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', upload.single('avatar'), (req, res, next) => {
    console.log(req.file)
    var pet = new Pet(req.body);
  pet.save(function (err) {
    if (err) { 
      console.log('Validation error:', err.errors);
      return res.status(400).send(err.errors); 
    }
    
    if (req.file) {
      // Upload the images
      client.upload(req.file.path, {}, function (err, versions, meta) {
        if (err) { 
          console.log('S3 upload error:', err);
          return res.status(400).send({ err: err }) 
        };

        // Pop off the -square and -standard and just use the one URL to grab the image
        versions.forEach(function (image) {
          var urlArray = image.url.split('-');
          urlArray.pop();
          var url = urlArray.join('-');
          pet.avatarUrl = url;
        });
        
        // Save the pet with the avatarUrl after setting it
        pet.save(function(err) {
          if (err) {
            console.log('Error saving pet with avatarUrl:', err);
            return res.status(400).send({ err: err });
          }
          res.send({ pet: pet });
        });
      });
    } else {
      res.send({ pet: pet });
    }
  })
  });

  // SHOW PET
  app.get('/pets/:id', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-show', { pet: pet });
    });
  });

  // EDIT PET
  app.get('/pets/:id/edit', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-edit', { pet: pet });
    });
  });

  // UPDATE PET
  app.put('/pets/:id', (req, res) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`)
      })
      .catch((err) => {
        // Handle Errors
      });
  });

  // DELETE PET
  app.delete('/pets/:id', (req, res) => {
    Pet.findByIdAndRemove(req.params.id).exec((err, pet) => {
      return res.redirect('/')
    });
  });
}

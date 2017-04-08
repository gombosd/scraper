const fs = require('fs');
const mongoose = require('mongoose');
const Prod = require('./Product');

mongoose.Promise = Promise;
const db = process.env.MONGODB_URI || 'mongodb://localhost/barflowProducts';
mongoose.connect(db)

Prod.find()
.then((prod) => {
  console.log('start');
  return fs.readdir('./images', (err, data) => {
    if (err) return console.error(err);
    return prod.forEach((pr) => {
      stop = false;
      return data.forEach((nameIt) => {
        if(stop){return;}
        if (pr.images.normal) {
          const kek = pr.images.normal.split('/');
          const name = kek.pop();
          const check = nameIt.split('.');
          if (check[check.length - 1] !== 'jpg' && check[check.length - 1] !== 'png') {
            check.pop();
            check.join('.');
            nameIt = check;
          }
          if (nameIt === name) {
            stop = true;
            const id = pr._id;
            const lel = nameIt.split('.');
            let kiterjesztes = '.' + lel.pop();
            if (kiterjesztes !== ".jpg" && kiterjesztes !== ".png") {
              kiterjesztes = '.' + lel.pop()
            }
            const nev =  lel.join(".");
            return fs.rename('./images/' + nev + kiterjesztes, './images/' + id + '_thumbnail' + kiterjesztes, info => console.log(info));
          }
        }
      })
    });
  });
});

/*
const id = prod.find(pr => pr.images.normal.search(nameIt) != -1 )._id;
const lel = nameIt.split('.');
let kiterjesztes = lel[lel.length -1 ];
lel.pop();
const nev =  lel.join(".");
kiterjesztes = '.' + kiterjesztes;
fs.rename('./images/' + nev + kiterjesztes, './images/' + id + '_original' + kiterjesztes, info => console.log(info));
*/
/*
const kek = pr.images.normal.split('/')
const name = kek.pop();
if (nameIt === name) {
  const id = pr._id;
  const lel = nameIt.split('.');
  const kiterjesztes = '.' + lel[lel.length -1 ];
  lel.pop();
  const nev =  lel.join(".");
  fs.rename('./images/' + nev + kiterjesztes, './images/' + id + '_original' + kiterjesztes, info => console.log(info));
}
*/
/*
console.log('start');
return fs.readdir('./images', (err, data) => {
  if (err) return console.error(err);
  return data.forEach((nameIt) => {
    return prod.forEach((pr) => {
      if (pr.images.normal) {
        const kek = pr.images.normal.split('/')
        const name = kek.pop();
        if (nameIt === name) {
          const id = pr._id;
          const lel = nameIt.split('.');
          const kiterjesztes = '.' + lel[lel.length -1 ];
          lel.pop();
          const nev =  lel.join(".");
          return fs.rename('./images/' + nev + kiterjesztes, './images/' + id + '_thumbnail' + kiterjesztes, info => console.log(info));
        }
      }
    })
  });
});
*/

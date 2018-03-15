const path = require('path');

const teams = require(path.join(__dirname, 'vet360-results.json'));

for (team of teams) {
    console.log(team);
}


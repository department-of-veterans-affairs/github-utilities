const path = require('path');
const columnify = require('columnify');
// const teams = require(path.join(__dirname, 'vet360-results.json'));


module.exports = ((teams) => {
    for (team of teams) {
        console.log(`Team: ${team.name}`);
        console.log('------------------------------------------------------------------');
        console.log('Users: ' + team.users.join(', '));
        console.log('------------------------------------------------------------------');
        
        console.log('------------------------------------------------------------------');
    
        console.log(columnify(team.repos,{columns: ["name", "permission"]}));
        console.log('------------------------------------------------------------------');
    }
})
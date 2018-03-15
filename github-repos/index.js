require('dotenv').config();
const fs = require('fs');
const path = require('path');
const request = require('request');
const commander = require('commander');
if (!process.env.GITHUB_PERSONAL_TOKEN || !process.env.GITHUB_ORGANIZATION) {
    console.log(`Please add a .env file with both: 
        your Github Personal Access Token (GITHUB_PERSONAL_TOKEN) and 
        your Github organization (GITHUB_ORGANIZATION)`);
    process.exit(1);
}

commander
    .option('-t, --table', 'table output')
    .parse(process.argv);
const headers = {
    'Authorization': `token ${process.env.GITHUB_PERSONAL_TOKEN}`,
    'User-Agent': 'request'
};

const resolvePermissions = ((perms) => {
    let permission = 'read';
    if (perms.admin) {
        permission = 'admin'
    } else if (perms.push) {
        permission = 'write'
    }
    return permission;
})

const fetchTeamData = ((team) => {
    let output = {
        name: team.name,
        users: [],
        repos: []
    };
    return new Promise((resolve, reject) => {
        request.get(`https://api.github.com/teams/${team.id}/members`, {
            headers: headers
        }, (err, response, body) => {
            if (err) reject(err);
            const users = JSON.parse(body)
            output.users = users.map(user => user.login);
        })
        request.get(team.repositories_url, {
            headers: headers
        }, (err, response, body) => {
            console.log(response)
            if (err) reject(err);
            const repos = JSON.parse(body);
            for (repo of repos) {
                output.repos.push({
                    "name": repo.name,
                    "permission": resolvePermissions(repo.permissions)
                });
                if (output.repos.length === repos.length) {
                    resolve(output);
                }
            }
        });
    });
})


const getRepoData = ((teams) => {
    return teams.map(fetchTeamData);
  
});
    

let teams = null;
const teamFile = path.join(__dirname, 'data', `${process.argv[2]}.json`);
console.log(teamFile)
if (fs.existsSync(teamFile)) {
    teams = require(teamFile);
} else {
    console.error("Team File doesn't exist");
    process.exit(1);    
}
const outputData = ((output) => {
    if (commander.table){
        const tableOutput = require('tableOutput');
        tableOutput(output);
    } else {
        console.log(JSON.stringify(results, null, 3));
    }
});
if (!teams) {
    request.get(`https://api.github.com/orgs/${process.env.GITHUB_ORGANIZATION}/teams`,
        {
            headers: headers
        }, (err, response, body) => {
            teams = JSON.parse(body);
            output = getRepoData(teams);
            Promise.all(output).then(results => {
                outputData(results);
            })
            .catch(err => {console.log(err)})
        })
} else {
    output = getRepoData(teams);
    Promise.all(output).then(results => {
        outputData(results);
    }).catch(err => {console.log(err)})
}


/*
TODO

-make multiple options
    -one option would be to just drop and reacreate tables
    -another option would be to drop and create tables and also add 10 accounts and fill random food for that day
        -it should also store their IDs in a json file
    -the thir option should use the IDs store in the json file to add random food to those Ids for that day

*/

const uuid = require('uuid');
const mysql = require('mysql2/promise');

require('dotenv').config()

const dbHost = process.env.DBHOST
const dbUser = process.env.DBUSER
const dbPassword = process.env.DBPASSWORD
const database = process.env.DATABASE

//Database connecting stuff
const connection = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: database
})

//bcrypt stuff
const bcrypt = require('bcrypt');
const saltRounds = 12;

//does connectino .execute have a different way of intepreting things from connection.query

async function dropTables(){
    console.log("drop tables")
    await connection.query('DROP TABLE loggedMealItems')
    .then(res => {
        console.log("loggedMealItems Dropped")    
    })
    .catch(error => {
        console.log("loggedMealItems doesnt exist")
    })
    await connection.query('DROP TABLE users')
    .then(res => {
        console.log("users Dropped")    
    })
    .catch(error => {
        console.log("users doesnt exist")
    })
    return(true)
}

async function createTables () {

    console.log("create tables")
    await connection.query(
        `CREATE TABLE users( userID VARCHAR(36) PRIMARY KEY, username VARCHAR(16) NOT NULL UNIQUE, password VARCHAR(60) NOT NULL, name VARCHAR(16) NOT NULL, profilePicture VARCHAR(5) DEFAULT 'none', weight INT DEFAULT 0, age INT DEFAULT 0)`)
    .then(res => {
        console.log("users made")
    })
    .catch(error => {
        throw error
    })


    await connection.query(`CREATE TABLE loggedMealItems(loggedID VARCHAR(36) PRIMARY KEY, foodItemID VARCHAR(36), userID VARCHAR(36), day DATE, amount INT, meal INT, FOREIGN KEY (foodItemID) REFERENCES foodItems(foodItemID), FOREIGN KEY (userID) REFERENCES users(userID))`)
        .then(res => {
            console.log("loggedMealItems made")
        })
    .catch(error => {
        console.log("Couldn't create logged items")
        throw error
    })

    return true
}


async function insertData () {
    const userIDList = [];
    for (let i = 1; i < 11; i++)
    {
        const userID = `'${uuid.v4()}'`;
        userIDList.push(userID);
        const username = `'username${i}'`
        const password = `password${i}`
        const name = `'Name ${i}'`;
        
        /*const weight = Math.floor(Math.random() * (200 - 100) + 100);
        const age = Math.floor(Math.random() * (100 - 18) + 18);*/

        const hash = bcrypt.hashSync(password, saltRounds);

        /* old version
        await connection.query(`INSERT INTO users(
            userID, 
            username, 
            password, 
            name, 
            profilePicture, 
            weight, 
            age) 
            VALUES (${userID}, ${username}, '${hash}', ${name}, FALSE, ${weight}, ${age})`)
        .catch(error => {
            console.log(error)
        })


        */


        //awaiting here for now, should probably do a propmise.all again
        await connection.execute(`INSERT INTO users(userID, username, password, name) VALUES (${userID}, ${username}, '${hash}', ${name})`)
        .catch(error => {
            console.log(error)
        })
    }

    const foodItemIDList = await connection.execute('SELECT foodItemID FROM foodItems ORDER BY RAND() LIMIT 0,10')
    .then(res => {
        return res[0]
    })
    .catch(error => {
        console.log(error)
    })
 
    for (let i = 1; i < 11; i++)
    {
        const userID = userIDList[i-1];
        for (let j = 0; j < 4; j++)
        {
            const meal = j;
            for (let k = 0; k < 3; k++)
            {
                const loggedID = `'${uuid.v4()}'`;
                const foodItemID = `'${foodItemIDList[Math.floor(Math.random() * (10))].foodItemID}'`;
                const amount = Math.floor(Math.random() * (5) + 1);
                //const meal = Math.floor(Math.random() * (4));
    
                await connection.execute(`INSERT INTO loggedMealItems(loggedID, foodItemID, userID, day, amount, meal) VALUES (${loggedID}, ${foodItemID}, ${userID}, CURDATE(), ${amount}, ${meal})`)
                .then(res => {
                })
                .catch(error =>{
                    console.log(error)
                })
            }
        }
    }
    return true
}

dropTables()
.then(res => {
    createTables()
    .then(res => {
        insertData()
        .then(res => {
            connection.end()
            console.log("End")
        })
    })
})
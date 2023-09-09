/*
TODO


-it looks like there might be some left over stuff from the sources I was using to learn mysql2, maybe look through at some point and get rid of any uneccessary stuff
-Not sure if its worth the effort to move over to prepared statements
-should put some try catches around the table drops


*/


const uuid = require('uuid');
const mysql = require('mysql2');



require('dotenv').config()

const dbHost = process.env.DBHOST
const dbUser = process.env.DBUSER
const dbPassword = process.env.DBPASSWORD
const database = process.env.DATABASE

//jwt token
//const bcryptSecret = process.env.BCRYPTSECRET


//Database connecting stuff
const connection = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: database
})
connection.connect()


//bcrypt stuff






const bcrypt = require('bcrypt');
const saltRounds = 12;


/*============================================================

                    TABLE DROPS BEGIN

============================================================*/


connection.query('DROP TABLE loggedMealItems', (err, rows, fields) => {
    if (err) throw err

    //console.log("Table deleted");
    //console.log(rows);
    //console.log(fields);
  //console.log('The solution is: ', rows[0].solution)
})

connection.query('DROP TABLE foodItems', (err, rows, fields) => {
    if (err) throw err

    //console.log("Table deleted");
    //console.log(rows);
    //console.log(fields);
  //console.log('The solution is: ', rows[0].solution)
})

connection.query('DROP TABLE users', (err, rows, fields) => {
    if (err) throw err

    //console.log("Table deleted");
    //console.log(rows);
    //console.log(fields);
  //console.log('The solution is: ', rows[0].solution)
})



/*============================================================

                    TABLE DROPS END

============================================================*/

/*============================================================

                    USERS TABLE BEGIN

============================================================*/


const userIDList = [];

connection.query(
    `CREATE TABLE users(
        userID VARCHAR(36) PRIMARY KEY, 
        username VARCHAR(16) NOT NULL UNIQUE, 
        password VARCHAR(60), 
        name VARCHAR(16), 
        profilePicture BOOL,
        weight INT, 
        age INT)`, (err, rows, fields) => {
    if (err) throw err;
    //console.log("Table created");

    //console.log(rows);
})

for (let i = 1; i < 11; i++)
{
    const userID = `'${uuid.v4()}'`;
    userIDList.push(userID);
    const username = `'username${i}'`
    const password = `password${i}`
    const name = `'Name ${i}'`;
    const weight = Math.floor(Math.random() * (200 - 100) + 100);
    const age = Math.floor(Math.random() * (100 - 18) + 18);

    const hash = bcrypt.hashSync(password, saltRounds);

    connection.query(`INSERT INTO users(userID, username, password, name, profilePicture, weight, age) VALUES (${userID}, ${username}, '${hash}', ${name}, FALSE, ${weight}, ${age})`, (err, rows, fields) => {
        if (err) throw err;
        //console.log(`${name} Inserted`);
        //console.log(rows);
    })
}
/*============================================================

                    USERS TABLE END

============================================================*/

/*============================================================

                    FOOD ITEMS TABLE BEGIN

============================================================*/

const foodItemIDList = [];
//serving unit may change
connection.query('CREATE TABLE foodItems(foodItemID VARCHAR(36) PRIMARY KEY, name VARCHAR(16), servingSize INT, servingUnit VARCHAR(16), calories INT, protein INT, fat INT, carbs INT)', (err, rows, fields) => {
    if (err) throw err;
    //console.log("Table created");

    //console.log(rows);
})

for (let i = 1; i < 11; i++)
{
    const foodItemID = `'${uuid.v4()}'`;
    foodItemIDList.push(foodItemID);
    const name = `'Food Item ${i}'`;

    const servingSize = Math.floor(Math.random() * (10) + 1);
    //whats the point of the (600-100)?
    const servingUnit = "'g'"
    const calories = Math.floor(Math.random() * (600 - 100) + 100);
    const protein = Math.floor(Math.random() * (100 - 10) + 10);
    const fat = Math.floor(Math.random() * (100 - 10) + 10);
    const carbs = Math.floor(Math.random() * (100 - 10) + 10);

    connection.query(`INSERT INTO foodItems(foodItemID, name, servingSize, servingUnit, calories, protein, fat, carbs) VALUES (${foodItemID}, ${name}, ${servingSize}, ${servingUnit}, ${calories}, ${protein}, ${fat}, ${carbs})`, (err, rows, fields) => {
        if (err) throw err;
        //console.log(`${name} Inserted`);
        //console.log(rows);
    })

}
/*============================================================

                    FOOD ITEMS TABLE END

============================================================*/


/*============================================================

                    LOGGED MEAL ITEMS TABLE BEGIN

============================================================*/

connection.query('CREATE TABLE loggedMealItems(loggedID VARCHAR(36) PRIMARY KEY, foodItemID VARCHAR(36), userID VARCHAR(36), day DATE, amount INT, meal INT, FOREIGN KEY (foodItemID) REFERENCES foodItems(foodItemID), FOREIGN KEY (userID) REFERENCES users(userID))', (err, rows, fields) => {
    if (err) throw err;
    //console.log("Table created");amount

    //console.log(rows);
})

//these are shifted up by one because I coppied it from above and am too lazy to change it
for (let i = 1; i < 11; i++)
{
    const userID = userIDList[i-1];

    for (let j = 0; j < 4; j++)
    {
        const meal = j;

        for (let k = 0; k < 3; k++)
        {
            const loggedID = `'${uuid.v4()}'`;
            const foodItemID = foodItemIDList[Math.floor(Math.random() * (10))];
            const amount = Math.floor(Math.random() * (5) + 1);
            //const meal = Math.floor(Math.random() * (4));

            connection.query(`INSERT INTO loggedMealItems(loggedID, foodItemID, userID, day, amount, meal) VALUES (${loggedID}, ${foodItemID}, ${userID}, CURDATE(), ${amount}, ${meal})`, (err, rows, fields) => {
                if (err) throw err;
                //console.log(`Logged Item ${(k+1) * i * j} inserted Inserted`);
                //console.log(rows);
            })

        }

    }

}

//console.log(mealsIDList);
/*============================================================

                    LOGGED MEAL ITEMS TABLE END

============================================================*/

connection.end()
var fs = require('fs');
var express = require('express');
var app = express();
var myParser = require("body-parser");
const { exit } = require('process');
var filename = "./user_data.json";

app.use(myParser.urlencoded({ extended: true }));


if (fs.existsSync(filename)) {
    data = fs.readFileSync(filename, 'utf-8');

    user_data = JSON.parse(data);
    console.log("user_data: ", user_data);

    fileStats = fs.statSync(filename)
    console.log("user_data.json has " + fileStats.size + " characters");
} else {
    console.log("whoopsies");
}

// username = 'newuser';
// user_data[username] = {};
// user_data[username].password = 'newpass';
// user_data[username].email = 'newuser@user.com';
// // write the reg_data object to user_data.json using JSON.stringify() and fs.writeFileSync
// // fs.writeFileSync()

app.get("/login", function (request, response) {
    console.log("request.query()" + JSON.stringify(request.query));
    // Give a simple login form
    let str = "<body>";
    if (request.query['error'] != undefined) {
        str += `<h1>${request.query['error']}!</h1>`;
    }
    // Make the form sticky if they are redirected from the register page
    if (request.query['user'] != undefined && request.query['password'] != undefined) {
        str += `
            <form action="" method="POST">
                <input type="text" name="username" size="40" placeholder="enter username" value="${request.query['user']}"><br />
                <input type="password" name="password" size="40" placeholder="enter password" value="${request.query['password']}"><br />
                <input type="submit" value="Submit" id="submit">
            </form>
        </body>
        `;
    } else {
        str += `
        <body>
            <form action="" method="POST">
                <input type="text" name="username" size="40" placeholder="enter username" ><br />
                <input type="password" name="password" size="40" placeholder="enter password"><br />
                <input type="submit" value="Submit" id="submit">
            </form>
        </body>
        `;
    }
    response.send(str);
});

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    console.log("Got a POST to login")
    // Grab the information
    let POST = request.body;

    let user_name = POST['username'];
    let user_pass = POST['password'];
    console.log("username:", user_name, "password:", user_pass);

    // Is there a user with this user name in the json file
    if (user_data[user_name] != undefined) {
        if(user_data[user_name].password == user_pass) {
            // Good login
            response.send("Good login")
        } else {
            // Bad login, redirect
            response.redirect("/login?error=Bad Login");
        }
    } else {
        // Bad username
        response.redirect("/login?error=Bad username");
    }
});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
    <body>
        <form action="/register" method="POST">
            <input type="text" name="username" size="40" placeholder="enter username" ><br />
            <input type="password" name="password" size="40" placeholder="enter password"><br />
            <input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
            <input type="email" name="email" size="40" placeholder="enter email"><br />
            <input type="submit" value="Submit" id="submit">
        </form>
    </body>
    `;
    response.send(str);
 });

 app.post("/register", function (request, response) {
    // process a simple register form
    console.log("Got a POST to register")
    // Grab the information
    let POST = request.body;

    let user_name = POST['username'];
    let user_pass = POST['password'];
    let user_pass_repeat = POST['repeat_password'];
    let user_email = POST['email'];
    
    // Grab info from JSON file to compare ot
    data = require(filename);
    let names  = [];
    for (const user in data) {
        let username = data[user].name;
        names.push(username);
    }
    console.log("All users: " + JSON.stringify(names));
    // Validate before adding:
    // Check that username doesn't already exist and check that passwords match
    if ((!names.includes(user_name)) && (user_pass == user_pass_repeat)){
        user_data[user_name] = {};
        user_data[user_name].name = user_name;
        user_data[user_name].password = user_pass;
        user_data[user_name].email = user_email;

        data = JSON.stringify(user_data);
        fs.writeFileSync(filename, data, "utf-8");

        // DO NOT DO THIS IN REAL LIFE
        response.redirect("/login?" + "user=" + user_name + "&password=" + user_pass);
    } else {
        response.redirect("/register");
    }
 });

app.listen(8080, () => console.log(`listening on port 8080`));
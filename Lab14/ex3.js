var fs = require('fs');
var express = require('express');
var app = express();
var myParser = require("body-parser");
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

app.get("/login", function (request, response) {
    // Give a simple login form
    let str = `
    <body>
        <form action="" method="POST">
            <input type="text" name="username" size="40" placeholder="enter username" ><br />
            <input type="password" name="password" size="40" placeholder="enter password"><br />
            <input type="submit" value="Submit" id="submit">
        </form>
    </body>
    `;
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
            response.redirect("/login");
        }
    } else {
        // Bad username
        response.send("Bad username")
    }
});

app.listen(8080, () => console.log(`listening on port 8080`));
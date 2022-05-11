// author Sean Sumida used code from various differnt labs, Assignment code examples, StockOverflow, and w3schools will reference when code is used.
// This code initializes the server for the webpage aswell as checks valid inputs for the HTMl form

var express = require('express');
var app = express();
var qs = require("querystring");
var products_array = require('./product_data.json');
var user_data = './user_data.json';
var fs = require('fs');
var qString;
var myParser = require("body-parser");

app.use(myParser.urlencoded({ extended: true }));
app.use(myParser.json());

// Setup session from cookies and sessions lab
var session = require('express-session'); 
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true})); 

// Setup cookies from cookies and sessions lab
var cookieParser = require('cookie-parser'); 
app.use(cookieParser()); 

// Setup nodemailer
const nodemailer = require("nodemailer");

// lab 14 ex2
if (fs.existsSync(user_data)) {
    data = fs.readFileSync(user_data, 'utf-8');
    var user_data_parsed = JSON.parse(data);
} 
else {
    console.log(`${user_data} doesnt exist`);
}

// Code borrowed and modified from Lab 13 ex 5
// Gets data from body
app.use(express.urlencoded({ extended: true }));
// Monitors requests and sends it to the next request
app.all('*', function (request, response, next) {
   console.log(request.method + ' to path ' + request.path);
   if (typeof request.session.cart == "undefined") {request.session.cart = {};}
   next();
});

// Makes products_array accessable for other pages
app.post("/get_products_data", function (request, response, next) {
    response.json(products_array);
});

// Code borrowed and modified from Lab 13 ex 5
// changes the json file to a js file
app.get("/products_data.js", function (request, response, next) {
   response.type('.js');
   var products = `var products_array = ${JSON.stringify(products_array)};`;
   response.send(products);
});
var products_data;
var products_data_file = './product_data.json';
if (fs.existsSync(products_data_file)) {
    console.log("reading the file");
    var products_data = JSON.parse(fs.readFileSync(products_data_file, 'utf-8'));
};
/*

███████╗███╗░░██╗░█████╗░██████╗░██╗░░░██╗██████╗░████████╗██╗░█████╗░███╗░░██╗
██╔════╝████╗░██║██╔══██╗██╔══██╗╚██╗░██╔╝██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║
█████╗░░██╔██╗██║██║░░╚═╝██████╔╝░╚████╔╝░██████╔╝░░░██║░░░██║██║░░██║██╔██╗██║
██╔══╝░░██║╚████║██║░░██╗██╔══██╗░░╚██╔╝░░██╔═══╝░░░░██║░░░██║██║░░██║██║╚████║
███████╗██║░╚███║╚█████╔╝██║░░██║░░░██║░░░██║░░░░░░░░██║░░░██║╚█████╔╝██║░╚███║
╚══════╝╚═╝░░╚══╝░╚════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░░░░░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝
*/
// Password encryption from Stackoverflow
const { count } = require('console');
const e = require('express'); // For encryption
const { Cookie } = require('express-session');
const shift = 4;
function encrypt(password) {
    var encrypted = [];
    var encrypted_result = "";
    // Loops through the passwords then save the new encrypted password
    for (var i = 0; i < password.length; i++) {
        encrypted.push(password.charCodeAt(i) + shift);
        encrypted_result += String.fromCharCode(encrypted[i]);
    }
    return encrypted_result;
}
/*

░█████╗░░█████╗░██████╗░████████╗
██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝
██║░░╚═╝███████║██████╔╝░░░██║░░░
██║░░██╗██╔══██║██╔══██╗░░░██║░░░
╚█████╔╝██║░░██║██║░░██║░░░██║░░░
░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░
*/
// Gets contents of cart
app.post('/get_cart', function (request, response) {
    response.json(request.session.cart);
});
// Gets amount of items in cart
app.post('/cart_qty', function (request, response) {
    var total = 0; // 
    for (product_name in request.session.cart) {
        total += Number(request.session.cart[product_name].map(Number).reduce((a, b) => a + b, 0));
    }
    response.json({ qty: total });
});
// Updates shopping cart with newly udated quantities
app.post("/update_cart", function (request, response) {
    let haserrors = false;
    for (let product_name in request.body.quantities) {
        for (let i in request.body.quantities[product_name]) {
            qty = Number(request.body.quantities[product_name][i]);
            qty = parseInt(Number(qty));
            haserrors = !isNonNegInt(Number(qty)) || haserrors;
        };
    };
    // Send an alert if theres errors
    if (haserrors == true) { 
        msg = "Invalid quantities, cart has not updated.";
    // Updates cart
    } else { 
        msg = "Cart successfully updated. ";
        request.session.cart = request.body.quantities;
    }
    const ref_URL = new URL(request.get('Referrer')); 
    ref_URL.searchParams.set("msg", msg);
    response.redirect(ref_URL.toString()); // Redirect user back to page they were on
});

/*

██████╗░██╗░░░██╗██████╗░░█████╗░██╗░░██╗░█████╗░░██████╗███████╗
██╔══██╗██║░░░██║██╔══██╗██╔══██╗██║░░██║██╔══██╗██╔════╝██╔════╝
██████╔╝██║░░░██║██████╔╝██║░░╚═╝███████║███████║╚█████╗░█████╗░░
██╔═══╝░██║░░░██║██╔══██╗██║░░██╗██╔══██║██╔══██║░╚═══██╗██╔══╝░░
██║░░░░░╚██████╔╝██║░░██║╚█████╔╝██║░░██║██║░░██║██████╔╝███████╗
╚═╝░░░░░░╚═════╝░╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═════╝░╚══════╝
*/
// Process purchase request
app.post('/purchase', function (request, response, next) {
    var qty = request.body["prod_qty"];
    var product_name = request.body["prod_type"];
    var product_index = request.body["prod_index"];
    var cart_info = { 
        "quantity": qty, 
        "type": product_name, 
        "index": product_index 
    };
    response.cookie('cart_info', JSON.stringify(cart_info), { maxAge: 30 * 60 * 2000 }); // sets age of cookie to 1 hour before expiration
    // Data validation
    if (isNonNegInt(qty) && qty != 0 && qty <= products_data[product_name][product_index].quantity) {
        if (typeof request.session.cart[product_name] == "undefined") {
            request.session.cart[product_name] = [];
        }
        // Adds item to cart
        request.session.cart[product_name][product_index] = parseInt(qty);
        response.json({ "status": "Successfully added to cart." });
        // Checks if there are enough in stock
    } else if (qty > products_data[product_name][product_index].quantity) { 
        console.log("products data product_name =" + products_data[product_name]);
        response.json({ "status": "Not enough in stock, cannot add to cart" });
        // Checks if user input anything
    } else if (qty == 0) {
        response.json({ "status": "Invalid quantity, cannot add to cart. Please order an item." });
        // Checks if user put valid data
    } else {
        response.json({ "status": "Invalid quantity, please enter a valid number." })
    }
});
/*

██╗░░░░░░█████╗░░██████╗░██╗███╗░░██╗
██║░░░░░██╔══██╗██╔════╝░██║████╗░██║
██║░░░░░██║░░██║██║░░██╗░██║██╔██╗██║
██║░░░░░██║░░██║██║░░╚██╗██║██║╚████║
███████╗╚█████╔╝╚██████╔╝██║██║░╚███║
╚══════╝░╚════╝░░╚═════╝░╚═╝╚═╝░░╚══╝
*/
// process login modified from lab 14 ex 3
app.post("/process_login", function (request, response) {
    // deletes errors for query when the problem is resolved
    delete request.query.email_error;
    delete request.query.password_error;
    let encrypted_password = encrypt(request.body.password);
    // Checking if user is registered
    if (typeof user_data_parsed[request.body['email'].toLowerCase()] != 'undefined'){
        // Checks if registered user's password is correct
        if(user_data_parsed[request.body.email].password == encrypted_password){
            request.query.name = user_data_parsed[request.body['email'].toLowerCase()].name;
            request.query.email = request.body['email'].toLowerCase();
            redirect_page = 
            `<script> 
            alert('Login for ${user_data_parsed[request.body['email'].toLowerCase()].name} Login Successful.'); 
            location.href = "${'./products_display.html?product_key=Basic&' + qs.stringify(request.query)}"; 
            </script>`;
            var current_user = {"name": user_data_parsed[request.body['email'].toLowerCase()].name, "email": request.body['email'].toLowerCase()};
            response.cookie('current_user',JSON.stringify(current_user), {maxAge: 30 * 60 * 2000}); // sets age of cookie to 1 hour before expiration
            response.send(redirect_page);
            return;
        }
        else{
            // Sends alert if password is wrong
            request.query.email = request.body['email'].toLowerCase()
            request.query.password_error = 'Incorrect Password';
        }
    }
    else{
        // Sends alert if Email is wrong
        request.body['email'].toLowerCase()
        request.query.email_error = 'Incorrect Email';
    } 
    response.redirect(`./login.html?` + qs.stringify(request.query));
});
/*

██████╗░███████╗░██████╗░██╗░██████╗████████╗███████╗██████╗░
██╔══██╗██╔════╝██╔════╝░██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██████╔╝█████╗░░██║░░██╗░██║╚█████╗░░░░██║░░░█████╗░░██████╔╝
██╔══██╗██╔══╝░░██║░░╚██╗██║░╚═══██╗░░░██║░░░██╔══╝░░██╔══██╗
██║░░██║███████╗╚██████╔╝██║██████╔╝░░░██║░░░███████╗██║░░██║
╚═╝░░╚═╝╚══════╝░╚═════╝░╚═╝╚═════╝░░░░╚═╝░░░╚══════╝╚═╝░░╚═╝
*/
// processes registrations adapted from lab 14 ex 4
app.post("/register", function(request, response){
    // creates errors message to later display in the innerHTML
    var errors_reg = {};
    errors_reg['name'] = [];
    errors_reg['email'] = [];
    errors_reg['password'] = [];
    errors_reg['repeat_password'] = [];

    // checks if name is using correct characters
    if (/^[A-Za-z, ]+ [A-Za-z]+$/.test(request.body['name'])) { 
    }
    // checks if name is input correctly 
    else {
    errors_reg['name'].push(`Enter your full name (ex. Dan Port)`);
    }
    // checks if name is less than 30 characters
    if (request.body['name'].length > 30) {
        errors_reg['name'].push(`Please enter your name with less than 30 characters`);
    }
    // email limitations used from w3 schools
    if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email)) {
       // checks if there is a email entered
     } 
     else {
        errors_reg['email'].push(`Enter a valid email (ex. dport@hawaii.edu)`);
     }
        // checks if email is alreaady in use
    if (typeof user_data_parsed[request.body['email'].toLowerCase()] != 'undefined') {
        errors_reg['email'].push(`This email has already in use`);
    }

    // checks if a password is entered
    if (request.body.password == "") { 
        errors_reg['password'].push(`Enter a password`);
      // checks if password has atleast 8 characters
    } else if (request.body.password.length < 8) {
        errors_reg['password'].push(`Please enter a password with a minimum of 8 characters`);
    } 

    // checks if password is re-entered
    if (request.body.password == "") { 
        errors_reg['repeat_password'].push(`Re-enter your password`);
      // checks if the re-entered password matched
    } else if (request.body['password'] != request.body['repeat_password']) {
        errors_reg['repeat_password'].push(`Your passwords do not match`);
    }
    // checking amount of errors
    var amount_errors = 0;
    for (errors in errors_reg) {
        amount_errors += errors_reg[errors].length;
    }
// from assignment 2 code examples and adapted from Tiffany Young
// saves the new registred users data to user_data json file
 if (amount_errors == 0) {
    console.log('no errors in registration')

    // stores the users info in the user_data json file
    user_data_parsed[request.body['email'].toLowerCase()] = {};
    user_data_parsed[request.body['email'].toLowerCase()].name = request.body.name;
    user_data_parsed[request.body['email'].toLowerCase()].password = request.body.password;
    // writes the users info in the the user_data json file
    fs.writeFileSync(user_data, JSON.stringify(user_data_parsed), "utf-8");
    // addes name and email to query
    request.query.name = user_data_parsed[request.body['email'].toLowerCase()].name;
    request.query.email = request.body['email'].toLowerCase();
    redirect_page = 
    `<script> 
    alert('Thank You ${user_data_parsed[request.body['email'].toLowerCase()].name} for Registrating.'); 
    location.href = "${'./products_display.html?product_key=Basic&' + qs.stringify(request.query)}"; 
    </script>`;
    var current_user = {"name": user_data_parsed[request.body['email'].toLowerCase()].name, "email": request.body['email'].toLowerCase()};
    response.cookie('current_user',JSON.stringify(current_user), {maxAge: 30 * 60 * 2000});
    response.send(redirect_page);
    return;
 } 
 else {
    console.log('errors in registration')
    request.body.errors_reg = JSON.stringify(errors_reg)
    response.redirect('./register.html?' + qs.stringify(request.body));
 }
});
/* 

███████╗██████╗░██╗████████╗██╗███╗░░██╗░██████╗░
██╔════╝██╔══██╗██║╚══██╔══╝██║████╗░██║██╔════╝░
█████╗░░██║░░██║██║░░░██║░░░██║██╔██╗██║██║░░██╗░
██╔══╝░░██║░░██║██║░░░██║░░░██║██║╚████║██║░░╚██╗
███████╗██████╔╝██║░░░██║░░░██║██║░╚███║╚██████╔╝
╚══════╝╚═════╝░╚═╝░░░╚═╝░░░╚═╝╚═╝░░╚══╝░╚═════╝░
*/
// processing editing page that allows the user to change their data
app.post("/editing", function (request, response) { 
    var edited_errors = {};
    edited_errors['email'] = [];
    edited_errors['password'] = [];
    edited_errors['new_password'] = [];
    edited_errors['repeat_new_password'] = [];
    // email limitations used from w3 schools
    if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email)) {
        // checks if there is a email entered
    } 
    else {
         edited_errors['email'].push(`Enter a valid email (ex. dport@hawaii.edu)`);
    }
    // checks if there is a registered account with the input email
    if (typeof user_data_parsed[request.body['email'].toLowerCase()] != 'undefined') {
        // checks if the password for the account is correct
        if (user_data_parsed[request.body['email'].toLowerCase()].password == request.body['password']) {
            // checks if password has atleast 8 characters
            if (request.body.new_password.length < 8) {
                edited_errors['new_password'].push('Passwords must have a minimum of 8 characters.');
            }
            // checks for the correct password for the account
            if (user_data_parsed[request.body['email'].toLowerCase()].password != request.body['password']) {
                edited_errors['password'].push('Incorrect password');
            }
            // checks both new passwords are the same
            if (request.body.new_password != request.body.repeat_new_password) {
                edited_errors['repeat_new_password'].push('Both passwords must match');
            }
            // checks if new password is not the same as the old password
            if (request.body.new_password  == request.body['password']) {
                edited_errors['new_password'].push(`New password cannot be the same as the old password`);
            }
        } 
        // input email is incorrect
        else { edited_errors['password'].push(`Incorrect Password`);}
    } 
    // no emails are accounts are registered with input email
    else { edited_errors['email'].push(`Email has not been registered`);}
    // checking amount of errors 
    var amount_errors = 0;
    for (errors in edited_errors) {
        amount_errors += edited_errors[errors].length;
    }
    if (amount_errors == 0) {
        console.log('no errors with changing passwords')

       // stores the users new password in the user_data json file
        user_data_parsed[request.body['email'].toLowerCase()].password = request.body.new_password
 
        // writes the changed password info in the the user_data json file
        fs.writeFileSync(user_data, JSON.stringify(user_data_parsed), "utf-8");
        // addes name and email to query
        request.query.name = user_data_parsed[request.body['email'].toLowerCase()].name;
        request.query.email = request.body['email'].toLowerCase();
        let current_user = qs.stringify(request.query);
        // goes to invoice 
        var confirmation = 'Password successfully changed!'
        response.redirect('./login.html?' + qString + '&' + current_user + '&errors=' + confirmation); 
        return;
    } 
    else {
        console.log('errors with changing passwords')
        request.body['edited_errors'] = JSON.stringify(edited_errors);
        response.redirect('./editing.html?' + qs.stringify(request.body));
    }
 });
/**
 
██╗░░░░░░█████╗░░██████╗░░█████╗░██╗░░░██╗████████╗
██║░░░░░██╔══██╗██╔════╝░██╔══██╗██║░░░██║╚══██╔══╝
██║░░░░░██║░░██║██║░░██╗░██║░░██║██║░░░██║░░░██║░░░
██║░░░░░██║░░██║██║░░╚██╗██║░░██║██║░░░██║░░░██║░░░
███████╗╚█████╔╝╚██████╔╝╚█████╔╝╚██████╔╝░░░██║░░░
╚══════╝░╚════╝░░╚═════╝░░╚════╝░░╚═════╝░░░░╚═╝░░░
 */
 // Process logout request
app.get("/logout", function (request, response) {
    var current_user = request.cookies["current_user"]; 
    console.log(JSON.stringify(current_user));
    // Sends alert if user successfully logs out
    if (current_user != undefined) {
        logout_msg = `<script>alert('Successfully logged out.'); location.href="./index.html";</script>`;
        response.clearCookie('current_user'); // Destroys cookie
        response.send(logout_msg); 
    // If there is no user logged in, sends an error alert and redirects user to index page
    } else { 
        logouterror_msg = `<script>alert("Unable to logout, No user currently logged in."); location.href="./index.html";</script>`;
        response.send(logouterror_msg);
    }
});

/*

███╗░░░███╗░█████╗░██╗██╗░░░░░███████╗██████╗░
████╗░████║██╔══██╗██║██║░░░░░██╔════╝██╔══██╗
██╔████╔██║███████║██║██║░░░░░█████╗░░██████╔╝
██║╚██╔╝██║██╔══██║██║██║░░░░░██╔══╝░░██╔══██╗
██║░╚═╝░██║██║░░██║██║███████╗███████╗██║░░██║
╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝╚══════╝╚══════╝╚═╝░░╚═╝
*/
// Process purchase request and emails the invoice
// Borrowed and modified code from Assignment 3 example code
app.post('/completePurchase', function (request, response) {
    var current_user = JSON.parse(request.cookies["current_user"]); // Sets user info to javascript
    var the_email = current_user["email"]; // Saves the users email as a variable
    console.log(the_email);
    var transporter = nodemailer.createTransport({
        // Sets up a mail server and has it function only on the UH network for security
        host: "mail.hawaii.edu",
        port: 25,
        secure: false,
        tls: {
            // Do not fail on invalid certifications
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: 'sumidase@hawaii.edu',
        to: the_email,
        subject: `Thank You, ${current_user.name} for purchasing from Boris' Item Shop.`, // Message in the email if invoice sent
        html: request.body.invoicehtml
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            status_str = 'There was an error and your invoice could not be emailed.'; // Message if invoice could not be sent
        } else {
            status_str = `Your invoice was mailed to ${the_email}`;
        }
        response.json({ "status": status_str });
    });
    response.clearCookie('current_user'); // Destroys cookie
    request.session.destroy(); // Deletes the session once the email is sent
});

/*

██████╗░░█████╗░████████╗██╗███╗░░██╗░██████╗░
██╔══██╗██╔══██╗╚══██╔══╝██║████╗░██║██╔════╝░
██████╔╝███████║░░░██║░░░██║██╔██╗██║██║░░██╗░
██╔══██╗██╔══██║░░░██║░░░██║██║╚████║██║░░╚██╗
██║░░██║██║░░██║░░░██║░░░██║██║░╚███║╚██████╔╝
╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝╚═╝░░╚══╝░╚═════╝░
*/
// Processes the rating system retrieving the users rating and pushing it to the array of products
// inspired by Prof Port's rating system he posted in the ITMVM
app.post('/rate', function (request,response){
    var product_name = request.body["prod_type"];
    var product_index = request.body["prod_index"];
    var rating = request.body["rating"];
    // pushes users rating to products_array
    products_array[product_name][product_index].rating.push(rating);
    
    
    const ref_URL = new URL(request.get('Referrer')); 
    response.redirect(ref_URL.toString()); // Redirect user back to page they were on
});
// Borrowed and modified from Lab 13 ex 5
function isNonNegInt(q, returnErrors = false) {
    errors = []; // Assume no errors at first
    if (q == ''  || q == null) q = 0;
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    }
    return returnErrors ? errors : (errors.length == 0);
}

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
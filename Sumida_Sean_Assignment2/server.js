// author Sean Sumida used code from various differnt labs.
// This code initializes the server for the webpage aswell as checks valid inputs for the HTMl form

var express = require('express');
var app = express();
var qs = require("querystring");
var products_array = require('./product_data.json');
var user_data = './user_data.json';
var fs = require('fs');
var qString;

app.use(express.urlencoded({ extended: true}));
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
   next();
});

// Code borrowed and modified from Lab 13 ex 5
// changes the json file to a js file
app.get("/product_data.js", function (request, response, next) {
   response.type('.js');
   var products = `var products_array = ${JSON.stringify(products_array)};`;
   response.send(products);
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
   // Variables used for validation
   let textbox = false; // Represents amount put into textbox
   var errors = {}; // Start with empty cart
   qString = qs.stringify(request.body);
   // Checks all entered quantities
   for (i in products_array) {
       q = request.body['quantity' + i];
       // If the quantity is invalid
       if (isNonNegInt(q) == false) {
           errors['invalid_quantity' + i] = `${q} is not a valid input`;
       }
       // If quantity is greater than 0
       if (q > 0) {
           textbox = true;
       }
       // If quantity input is greater than quantity available
       if (q > products_array[i].quantity) {
           errors['quantity' + i] = `${q} of ${products_array[i].name} is not available. Only ${products_array[i].quantity} are available.`;
       }
   }

   // Code borrowed and modified from Lab 13 ex 5
   // No quantities were selected
   if (textbox == false) {
       errors['empty'] = `Please input your quantity.`;
   }
   // If no errors go to invoice, if errors go back to products
   if (Object.keys(errors).length == 0) {
      // If purchase is valid, we remove from quantity available, the refreshes page with new quantity available
      for (i in products_array) {
          products_array[i].quantity -= Number(request.body['quantity' + i]);
      }
      // Goes to login upon valid purchase
      response.redirect("./login.html?" + qString); 
  }
   else {
       // Makes an error message from all errors.
       var err_msg = '';
       for (err in errors) { err_msg += errors[err] + `\n`}
       // Goes back to product display if wrong
       response.redirect(`./products_display.html?errorMessage=${err_msg}&` + qString); 
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
app.post("/login", function (request, response) {
    var login_error = '';
    if (typeof user_data_parsed[request.body['email'].toLowerCase()] != 'undefined'){
        if(user_data_parsed[request.body.email].password == request.body.password){
            request.query.name = user_data_parsed[request.body['email'].toLowerCase()].name;
            request.query.email = request.body['email'].toLowerCase();
            let current_user = qs.stringify(request.query);
            response.redirect('./invoice.html?' + qString + '&' + current_user);
            return;
        }
        else{
            login_error = 'Incorrect Password';
        }
    }
    else{
        login_error = 'Incorrect Email';
    } 
    response.redirect(`./login.html?email=${request.body['email'].toLowerCase()}&errors=` + login_error)
});
/*

██████╗░███████╗░██████╗░██╗░██████╗████████╗███████╗██████╗░
██╔══██╗██╔════╝██╔════╝░██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██████╔╝█████╗░░██║░░██╗░██║╚█████╗░░░░██║░░░█████╗░░██████╔╝
██╔══██╗██╔══╝░░██║░░╚██╗██║░╚═══██╗░░░██║░░░██╔══╝░░██╔══██╗
██║░░██║███████╗╚██████╔╝██║██████╔╝░░░██║░░░███████╗██║░░██║
╚═╝░░╚═╝╚══════╝░╚═════╝░╚═╝╚═════╝░░░░╚═╝░░░╚══════╝╚═╝░░╚═╝
*/
// processes registrations adapted from lab 14 ex 4 and Tiffany Young
app.post("/register", function(request, response){
    //creates errors message to later display in the innerHTML
    var errors_reg = {};
    errors_reg['name'] = [];
    errors_reg['email'] = [];
    errors_reg['password'] = [];
    errors_reg['repeat_password'] = [];

    // checks if name is using correct characters
    if (/^[A-Za-z, ]+ [A-Za-z]+$/.test(request.body['name'])) {
    // checks if name is input correctly   
    } 
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
    let current_user = qs.stringify(request.query);
    // goes to invoice 
    response.redirect('./invoice.html?' + qString + '&' + current_user); 
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
// adapted from Tiffany Young
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

// Borrowed and modified from Lab 13 ex 5
function isNonNegInt(q, returnErrors = false) {
    errors = []; // Assume no errors at first
    if (q == '') q = 0;
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
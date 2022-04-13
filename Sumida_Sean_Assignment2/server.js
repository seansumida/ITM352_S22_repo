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
      // Goes to invoice upon valid purchase
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

// process login modified from lab 14 ex 3
app.post("/login", function (request, response) {
    var login_error = '';
    if (typeof user_data_parsed[request.body['email'].toLowerCase()] != 'undefined'){
        if(user_data_parsed[request.body.email].password == request.body.password){
            response.redirect('./invoice.html?' + qString);
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

// processes registrations adapted from lab 14 ex 4
app.post("/register", function(request, response){
    var errors_reg = {};
    errors_reg['name'] = [];
    errors_reg['email'] = [];
    errors_reg['password'] = [];
    errors_reg['repeat_password'] = [];
    if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email) == false) {
        errors_reg['email'].push(`Please enter a valid email`);
     } else if (request.body['email'].toLowerCase().length == 0) {
        errors_reg['email'] = `Enter an email`;
     }
        //check if email is unique
   if (typeof user_data_parsed[request.body['email'].toLowerCase()] != 'undefined') {
    errors_reg['email'] = `This email has already been registered`;
 }

 //check password > 8 
 if (request.body.password.length < 8) {
    errors_reg['password'] = `Minimum 8 characters`;
 } else if (request.body.password.length == 0) { //nothing entered
    errors_reg['password'] = `Enter a password`;
 }

 //check repeated password for matches
 if (request.body['password'] != request.body['repeat_password']) {
    errors_reg['repeat_password'] = `The passwords do not match`;
 }

 //full name validation
 if (/^[A-Za-z, ]+$/.test(request.body['name'])) {
    //check if the name is correct   
 } else {
    errors_reg['name'] = `Please enter your full name`;
 }
 //check if name is less than 30 characters
 if (request.body['name'].length > 30) {
    errors_reg['name'] = `Please enter less than 30 characters`;
 }

 //assignment 2 code examples
 //save new registration data to user_data.json
 if (Object.keys(errors_reg).length == 0) {
    console.log('no registration errors')//store user data in json file
    user_data_parsed[request.body['email'].toLowerCase()] = {};
    user_data_parsed[request.body['email'].toLowerCase()].password = request.body.password;
    user_data_parsed[request.body['email'].toLowerCase()].name = request.body.name;

    fs.writeFileSync(filename, JSON.stringify(user_data_parsed), "utf-8");

    qty_data_obj['email'] = request.body['email'].toLowerCase();
    qty_data_obj['name'] = user_data_parsed[request.body['email'].toLowerCase()]['name'];
    response.redirect('./invoice.html?' + qString); //all good! => to invoice w/data
 } else {
     request.body.errors_obj = JSON.stringify(errors_reg)
    request.body['errors_reg'] = JSON.stringify(errors_reg);
    response.redirect('./register.html?' + qs.stringify(request.body));
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
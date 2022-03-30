// author Sean Sumida used code from various differnt labs.
// This code initializes the server for the webpage aswell as checks valid inputs for the HTMl form

var express = require('express');
var app = express();
var qs = require("querystring");
var products_array = require('./product_data.json');

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
   var qString = qs.stringify(request.body);
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
      response.redirect("./invoice.html?" + qString); 
  }
   else {
       // Makes an error message from all errors.
       var err_msg = '';
       for (err in errors) { err_msg += errors[err] + `\n`}
       // Goes back to product display if wrong
       response.redirect(`./products_display.html?errorMessage=${err_msg}&` + qString); 
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
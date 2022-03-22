var express = require('express');
var app = express();
var myParser = require("body-parser");

var products = require('./product_data.json');
products.forEach( (prod,i) => {prod.total_sold = 0});

app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});


function isNonNegativeInteger(inputString, returnErrors = false) {
    // Validate than an input value is a non-negative integer
    // inputString is the input stringl returnErrors indicates how the function returns: true means return 
    // the array and false means return a boolean
    errors = []; // assume no errors at first
    if (Number(inputString) != inputString) {
        errors.push("Not a number!"); // Check if string is a number value
    } else {
        if (inputString < 0) {
            errors.push("Negative value!"); // Check if it is non-negative
        }
        if (parseInt(inputString) != inputString) {
            errors.push("Not an integer!"); // Check that it is an integer
        }
    }
    return returnErrors ? errors : (errors.length == 0)
}

app.all('*', function (request, response, next) { // For all request types (GET and POST), respond to any path that matches this first parameter (* means everything) by executing this arrow function
    console.log(request.method + ' to path ' + request.path);
    next();
    console.log("1");
});

// Rule to handle process_form request from order_page.html
app.use(myParser.urlencoded({ extended: true }));

app.post("/process_form", function (request, response) {
    let POST = request.body;
    let brand = products[0]['brand'];
    let brand_price = products[0]['price'];

    if (typeof POST['quantity_textbox'] != 'undefined') {
        let qty = POST['quantity_textbox'];
        if (isNonNegativeInteger(qty)) {
            products[0]['total_sold'] += Number(qty);
            response.send(`<h2>Thank you for purchasing ${qty} ${brand}. Your total is \$${qty * brand_price}!</h2> `);
        } else {
            response.send(`<i>${qty} is not a valid quantity</i>`);
        }
    }
});

app.get('/test', function (request, response, next) { // For all request types (GET and POST), respond to any path that matches this first parameter (* means everything) by executing this arrow function
    response.send("Got a GET request to path: test");
    console.log("2");
});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here, when you're listening, exectue the arrow function

// next says execute the next path that matches the request; lets you move to the next rule
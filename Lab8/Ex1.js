require("./products_data.js");
var num_products = 5;
var itemCounter = 1;
while (itemCounter <= (num_products/2)) {
    console.log(`${itemCounter}. ${eval('name' + itemCounter)}`);
    itemCounter++;
}
console.log("That's all we have!");
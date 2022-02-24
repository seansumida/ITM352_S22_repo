require("./products_data.js");
var num_products = 5;
var itemCounter = 1;
while(itemCounter <= num_products ){
    if (itemCounter >= 0.25*num_products && itemCounter <= 0.75*num_products){
        console.log(`Don't ask for anything else!`)
        process.exit();
    } else{
        console.log(`${itemCounter}. ${eval('name' + itemCounter)}`);
    }
    itemCounter++;
    
}

console.log("That's all we have!");
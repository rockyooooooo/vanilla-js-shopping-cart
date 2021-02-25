
// get all the products from json
async function getProducts() {
    try {
        const data = await fetch("products.json")
            .then( response => response.json() );
        let products = data.items;
        products = products.map( item => {
            const {id} = item.sys;
            const {title, price} = item.fields;
            const img = item.fields.image.fields.file.url;
            return {id, title, price, img};
        })
        return products;
    } catch (error) {
        console.log(error);
    }
}

getProducts().then(data => {
    saveToStorage(data);
});


// save data to localStorage
function saveToStorage(products) {
    localStorage.setItem("products", JSON.stringify(products));
}
const {BOY_CLOTHES, GIRL_CLOTHES, BABY_CLOTHES, ACCESSORIES, OTHER} = require("../../products/enums/category");
const Product = require('../../products/model/product');

async function listingToProduct(listing) {
    try {
        const variants = [];
        const productVariants = [];
        if (listing.variations) {
            listing.variations.forEach(variation => {
                productVariants.push({quantity: variation.quantity, options: [...variation.properties]})
                variation.properties.forEach(prop => {
                    const index = variants.findIndex(variant => variant.name === prop.name)
                    if (index === -1) {
                        variants.push({name: prop.name, options: [{value: prop.value, additionalInfo: undefined}]})
                    } else {
                        if (variants[index].options.findIndex(option => option.value === prop.value) === -1)
                            variants[index].options.push({value: prop.value, additionalInfo: undefined})
                    }
                })
            });
        }
        let category = OTHER;
        if (variants.find(variant => variant.name === "Finish")) {
            category = ACCESSORIES
        } else {
            category = classifyProduct(listing.title, listing.description)
        }
        const productData = {
            title: listing.title,
            description: listing.description,
            category: category,
            etsy_id: listing.id,
            price: listing.price,
            images: listing.images,
            totalQuantity: listing.quantity,
            searchCount: listing.views,
            variants: variants,
            productVariants: productVariants
        };

        await Product.findOneAndUpdate(
            {etsy_id: listing.id},
            productData,
            {upsert: true, new: true, setDefaultsOnInsert: true}
        );

        return {success: true};
    } catch (error) {
        console.error(error);
        return {success: false, error};
    }
}

const girlKeywords = [
    'girl',
    'dress',
    'girl toddler',
    'skirt',
    'blouse',
    'tunic',
    'leggings',
    'girl shoes',
    'girl outfit',
    'girlswear',
    'girl clothes'
];

const boyKeywords = [
    'boy',
    'shirt',
    'pants',
    'boy toddler',
    'trousers',
    'shorts',
    'jacket',
    'boy shoes',
    'boy outfit',
    'boyswear',
    'boy clothes'
];

const babyKeywords = [
    'baby',
    'onesie',
    'romper',
    'bodysuit',
    'babygrow',
    'baby clothes',
    'baby shoes',
    'infant',
    'newborn',
    'baby outfit',
    'babywear'
];
const accessoriesKeywords = [
    'accessory', 'jewelry', 'clip', 'resin', 'hair', 'school set'
];

function classifyProduct(title, description) {
    const categories = [
        {name: BOY_CLOTHES, keywords: boyKeywords},
        {name: GIRL_CLOTHES, keywords: girlKeywords},
        {name: BABY_CLOTHES, keywords: babyKeywords},
        {name: ACCESSORIES, keywords: accessoriesKeywords}
    ]
    const text = (title + ' ' + description).toLowerCase();
    let result = OTHER
    categories.forEach(category => {
        category.keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                result = category.name
            }
        });
    });
    return result;
}

module.exports = listingToProduct;
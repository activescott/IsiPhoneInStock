"use strict";

transformSEModels();

function transformSEModels() { 
    let appleData = require('./modelsFromAppleIphoneSE.js');
    
    
    var modelsDest = {
        name: 'iPhone SE'
    }; 
    
    let products = appleData['products'];
    // first just strip model down to the info we care about:
    let models = products.map(function(product) {
        var model = {
            carrier: product.carrierModel.split('/', 1)[0].toLowerCase(),
            capacity: product.dimensionCapacity.substr(0, product.dimensionCapacity.length - 'gb'.length),
            color: product.dimensionColor == 'space_gray' ? 'gray' : product.dimensionColor,
            fullPrice: product.fullPrice,
            partNumber: product.partNumber,
        }
        return model;
    });
    //console.log('models:', models);


    /* 
    *** now begin the transform into a format like this: ***
    carrierObj = {
        name: 'carrier',
        color: {
            capacity: 'partNo'
        }
    }
    */
    let carrierReducer = (reduceValue, currentValue, currentIndex, array) => {
        var colorObj = getOrInitProperty(reduceValue, currentValue.color, {});
        console.assert(!colorObj[currentValue.capacity], 'capacity "%s" already exists on color "%s" !?!', currentValue.capacity, currentValue.color);
        colorObj[currentValue.capacity] = currentValue.partNumber;
        return reduceValue;
    };
    // use reduce to get an object for each carrier:
    var carrierNames = ['tmobile', 'att', 'verizon', 'sprint', 'unlocked'];
    let carrierObjects = carrierNames.map( (carrierName) => {
        var carrierModels = models.filter((m) => m.carrier == carrierName);
        var carrierObj = carrierModels.reduce(carrierReducer, { name: carrierName });
        return carrierObj;
    });
    let graph = {};
    carrierObjects.forEach((c) => {
       graph[c.name] = c; 
    });
    
    console.log(JSON.stringify(graph, null, '\t' ));
    
    
    
    /*
     * Gets the value of the specified property or initializes the specified property with the specified value.
     * @param {object} targetObject The object to get the value from or init
     * @param {string} propertyName The name of the property to get
     * @param {object} defaultValue The default value of the property to init on the object if the proprty doesn't already exist.
    */
    function getOrInitProperty(targetObject, propertyName, defaultValue) {
        var val = targetObject[propertyName];
        if (!val) {
            val = defaultValue;
            targetObject[propertyName] = val;
        }
        return val;
    }
}
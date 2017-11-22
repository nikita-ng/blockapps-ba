require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const api = common.api;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const productJs = require('../product');

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('Product tests', function() {
  this.timeout(config.timeout);

  let admin;

  before(function*() {
    admin = yield rest.createUser(adminName, adminPassword);
  });

  it.skip('Create Contract', function* () {
      const id = util.uid('id_');
      const name = util.uid('name_');
      const price = 1234;

      // function Product(string _name, string _id)
      const args = {
        _name : name,
        _id : id,
      };
      // create the product with constructor args
      const contract = yield productJs.uploadContract(admin, args);
      assert.isDefined(contract, "contract must be defined");
      const product = yield contract.getState();
      assert.equal(product.name, name, 'name');
      assert.equal(product.id, id, 'id');
      assert.equal(product.price, 0, 'Initial Price');
  });

  it.skip('get/set price', function* () {
      const id = util.uid('id_');
      const name = util.uid('name_');
      const price = 1234;
      // function Product(string _name, string _id)
      const args = {
        _name : name,
        _id : id,
      };
      // create the product with constructor args
      const contract = yield productJs.uploadContract(admin, args);
      assert.isDefined(contract, "contract must be defined");

      // assertions FIRST

      // should not accept 0
      {
      const isSet = yield contract.setPrice(0);
      assert.isFalse(isSet, 'should not accept 0');
      }
      // should not accept negative
      {
      const isSet = yield contract.setPrice(-1);
      assert.isFalse(isSet, 'should not accept negative');
      }
      // positive
      {
      // set
      const isSet = yield contract.setPrice(price);
      assert.isTrue(isSet, 'should accept positive');
      // get
      const result = yield contract.getPrice();
      assert.equal(result, price, 'should match price');
      }
      {
      // set
      const isSet = yield contract.setPrice(price*2);
      assert.isTrue(isSet, 'should accept positive');
      // get
      const result = yield contract.getPrice();
      assert.equal(result, price*2, 'should match price');
      }
  });

  it.skip('Search Contracts', function* () {
      const id = util.uid('id_');
      const name = util.uid('name_');

      // function Product(string _name, string _id)
      const args = {
        _name : name,
        _id : id,
      };
      // create the product with constructor args
      const contract = yield productJs.uploadContract(admin, args);
      assert.isDefined(contract, "contract must be defined");
      // search
      const product = yield productJs.getProductById(id);
      assert.equal(product.name, name, 'name');
      assert.equal(product.id, id, 'id');

      // search ALL
      const products = yield productJs.getProducts();
      const filtered = products.filter(product => {
        return product.id == id;
      });

      assert.equal(filtered.length, 1, 'should find one and only one');
  });

  it('Transfer fund b/w products', function* () {
    //Product A
    const id_A = util.uid('id_');
    const name_A = util.uid('name_');
    const price_A = 12;

    // function Product(string _name, string _id)
    const args_A = {
      _name : name_A,
      _id : id_A,
    };

    // create the product with constructor args
    const product_A = yield productJs.uploadContract(admin, args_A);
    assert.isDefined(product_A, "contract must be defined");
  
    //Setting Price of the contract
    const isSet_A = yield product_A.setPrice(price_A);
    assert.isTrue(isSet_A, 'should set price');

    //Product B
    const id_B = util.uid('id_');
    const name_B = util.uid('name_');
    const price_B = 1;

    // function Product(string _name, string _id)
    const args_B = {
      _name : name_B,
      _id : id_B,
    };

    // create the product with constructor args
    const product_B = yield productJs.uploadContract(admin, args_B);
    assert.isDefined(product_B, "contract must be defined");
  
    //Setting Price of the contract
    const isSet_B = yield product_B.setPrice(price_B);
    assert.isTrue(isSet_B, 'should set price');

    //Transferring Wei from Product_A to Product_B
    yield product_A.pay(product_B, 1);
  })
});

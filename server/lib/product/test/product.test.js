require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const api = common.api;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const BigNumber = common.BigNumber;
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

  it.skip('Create Contract', function*() {
    const id = util.uid('id_');
    const name = util.uid('name_');
    const price = 1234;

    // function Product(string _name, string _id)
    const args = {
      _name: name,
      _id: id,
    };
    // create the product with constructor args
    const contract = yield productJs.uploadContract(admin, args);
    assert.isDefined(contract, "contract must be defined");
    const product = yield contract.getState();
    assert.equal(product.name, name, 'name');
    assert.equal(product.id, id, 'id');
    assert.equal(product.price, 0, 'Initial Price');
  });

  it.skip('get/set price', function*() {
    const id = util.uid('id_');
    const name = util.uid('name_');
    const price = 1234;
    // function Product(string _name, string _id)
    const args = {
      _name: name,
      _id: id,
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
    } {
      // set
      const isSet = yield contract.setPrice(price * 2);
      assert.isTrue(isSet, 'should accept positive');
      // get
      const result = yield contract.getPrice();
      assert.equal(result, price * 2, 'should match price');
    }
  });

  it.skip('Search Contracts', function*() {
    const id = util.uid('id_');
    const name = util.uid('name_');

    // function Product(string _name, string _id)
    const args = {
      _name: name,
      _id: id,
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

  it('Fund a contract', function*() {

    //PRODUCT_A

    const id_A = util.uid('id_');
    const name_A = util.uid('name_');
    // function Product(string _name, string _id)
    const args_A = {
      _name: name_A,
      _id: id_A,
    };
    // create the product_a with constructor args
    const contract_A = yield productJs.uploadContract(admin, args_A);
    assert.isDefined(contract_A, "contract must be defined");

    // fund the contract via admin
    // function* send(fromUser, toUser, value)
    const value = new BigNumber(12345678);
    const receipt = yield rest.send(admin, contract_A, value);
    const txResult = yield rest.transactionResult(receipt.hash);
    assert.equal(txResult[0].status, 'success');

    //Checking Balance of  Product_A
    const balance_A_startingBalance = yield rest.getBalance(contract_A.address);
    //balance.should.be.bignumber.equal(value);
    assert.equal(balance_A_startingBalance.toString(), value.toString(), 'balance must be equal to the deposit');

    //PRODUCT_B

    const id_B = util.uid('id_');
    const name_B = util.uid('name_');
    // function Product(string _name, string _id)
    const args_B = {
      _name: name_B,
      _id: id_B,
    };
    // create the product_a with constructor args
    const contract_B = yield productJs.uploadContract(admin, args_B);
    assert.isDefined(contract_B, "contract must be defined");

    //Checking Balance of  Product_B
    const balance_B_startingBalance = yield rest.getBalance(contract_B.address);
    //balance.should.be.bignumber.equal(value);
    assert.equal(balance_B_startingBalance.toString(), "0", 'balance must be equal to the deposit');

    //Transferring fund from Product A to Product B

    {
    //Case 1: Product A have balance < amount
    const amount = new BigNumber(100000000);
    const result = yield contract_A.pay(contract_B, amount);
    assert.isFalse(result, "Transfer fund not happened");
    }

    {
    //Case 2: Product A have balance >= amount
    const amount = new BigNumber(100000);
    const result = yield contract_A.pay(contract_B, amount);
    assert.isTrue(result, "Transfer fund happened");
    const balance_A_endBalance = yield rest.getBalance(contract_A.address);
    const balance_B_endBalance = yield rest.getBalance(contract_B.address);
    
    //Checking the final balance of Product_A
    balance_A_endBalance.should.be.bignumber.equal(balance_A_startingBalance-amount);

    //Checking the final balance of Product_B
    balance_B_endBalance.should.be.bignumber.equal(balance_B_startingBalance+amount);
    }
  });

});

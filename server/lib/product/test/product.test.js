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

  it('Create Contract', function* () {
      const id = util.uid('id_');
      const name = util.uid('name_');
      const price = 1234;
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

      const isSet = yield contract.setPrice(price);
      assert.isTrue(isSet, 'Price setted');

      const resultPrice = yield contract.getPrice();
      assert.equal(resultPrice, price, "Got the price");
  });

});

const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'Product';
const contractFilename = `${config.libPath}/product/contracts/Product.sol`;

function* uploadContract(admin, args) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args);
  contract.src = 'removed';
  return setContract(admin, contract);
}

function setContract(admin, contract) {
  contract.getState = function* () {
    return yield rest.getState(contract);
  }
  contract.setPrice = function* (price) {
    return yield setPrice(admin, contract, price);
  }
  contract.getPrice = function* () {
    return yield getPrice(admin, contract);
  }
  return contract;
}

function* setPrice(admin, contract, price) {
  rest.verbose('setPrice', price);
  const method = 'setPrice';
  const args = {
    _price: price,
  };

  const result = yield rest.callMethod(admin, contract, method, args);
  const isPriceSetted = (result[0] === true);
  return isPriceSetted;
}

function* getPrice(admin, contract) {
  rest.verbose('getPrice');
  const method = 'getPrice';
  const args = {
  };

  const result = yield rest.callMethod(admin, contract, method, args);
  return result[0];
}

module.exports = {
  uploadContract: uploadContract,
  setPrice: setPrice,
};

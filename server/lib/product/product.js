const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'Product';
const contractFilename = `${config.libPath}/product/contracts/Product.sol`;

function* uploadContract(admin, args) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args);
  yield compileSearch(); // compile for search
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

function* compileSearch() {
  rest.verbose('compileSearch', contractName);

  if (yield rest.isCompiled(contractName)) {
    return;
  }
  const searchable = [contractName];
  yield rest.compileSearch(searchable, contractName, contractFilename);
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

function* getProducts() {
  return yield rest.query(`${contractName}`);
}

//curl -i http://localhost/cirrus/search/Product?id=eq.id__9003_51051

function* getProductById(id) {
  const results = yield rest.waitQuery(`${contractName}?id=eq.${id}`, 1);
  const product = results[0];
  return product;
}

module.exports = {
  uploadContract: uploadContract,
  getProducts: getProducts,
  getProductById: getProductById,
};

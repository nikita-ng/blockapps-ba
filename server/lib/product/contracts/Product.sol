/**
 * Product data contract
 */
contract Product {
  string name;
  string id;
  uint price;

  function Product(string _name, string _id) {
    name = _name;
    id = _id;
  }

  function setPrice(uint _price) returns(bool) {
    if(_price != 0) {
      price = _price;
      return true;
    } else {
      return false;
    }
  }

  function getPrice() returns(uint) {
    return price;
  }
}

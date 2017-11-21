/**
 * Product data contract
 */
contract Product {
  string name;
  string id;
  int price;

  function Product(string _name, string _id) {
    name = _name;
    id = _id;
  }

  function setPrice(int _price) returns(bool) {
    // should be positive
    if(_price <= 0) {
      return false;
    }
    // value valid
    price = _price;
    return true;
  }

  function getPrice() returns(int) {
    return price;
  }
}

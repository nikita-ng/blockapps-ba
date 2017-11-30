import "../../common/ErrorCodes.sol";
import "./BidState.sol";

/**
 * Bid data contract
 */
contract Bid is ErrorCodes, BidState {
  // NOTE: members must be public to be indexed for search
  uint public id;
  string public name;
  string public supplier;
  uint public amount;
  BidState public state;

  function Bid(uint _id, string _name, string _supplier, uint _amount) {
    id = _id;
    name = _name;
    supplier = _supplier;
    amount = _amount;
    state = BidState.OPEN;
  }

  function getState() returns (BidState) {
    return state;
  }

  function setState(BidState _state) {
    state = _state;
  }

  function setBidState(BidState newState) payable returns (ErrorCodes) {
    if (state == BidState.OPEN  &&  newState == BidState.ACCEPTED) {
      setState(newState);
      return ErrorCodes.SUCCESS;
    }
    if (state == BidState.OPEN  &&  newState == BidState.REJECTED) {
      setState(newState);
      return ErrorCodes.SUCCESS;
    }
    if (state == BidState.ACCEPTED  &&  newState == BidState.REJECTED) {
      setState(newState);
      return ErrorCodes.SUCCESS;
    }
    return ErrorCodes.ERROR;
  }

  function settle(address supplierAddress) returns (ErrorCodes) {
    // confirm balance, to return error
    if (this.balance < amount) {
      return ErrorCodes.INSUFFICIENT_BALANCE;
    }
    uint fee = 10000000 wei; // supplier absorbs the fee
    uint amountWei = amount * 1 ether;

    // transfer will throw
    supplierAddress.send(amountWei-fee);
    return ErrorCodes.SUCCESS;
  }

  function reject(address buyerAddress) returns (ErrorCodes) {
    // confirm balance, to return error
    if (this.balance < amount) {
      return ErrorCodes.INSUFFICIENT_BALANCE;
    }
    uint fee = 10000000 wei; // buyer absorbs the fee
    uint amountWei = amount * 1 ether;

    // transfer will throw
    buyerAddress.send(amountWei-fee);
    return ErrorCodes.SUCCESS;
  }

  //Fixture for reducing contract balance
  function testReduceBalance() returns (ErrorCodes) {
    address receiver = 0x000; //Default address to dump ether
    uint amountWei = amount * 1 ether;
    receiver.send(amountWei);
    return ErrorCodes.SUCCESS;
  }
}

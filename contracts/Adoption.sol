pragma solidity ^0.5.0;

contract Adoption{
    address[16] public adopters;

    event Adopted(address owner, uint256 id);

    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15, "Pet ID is invalid!");
        adopters[petId] = msg.sender;
        emit Adopted(adopters[petId], petId);
        return petId;
    }

    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}

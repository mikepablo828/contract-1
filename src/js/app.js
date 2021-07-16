App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers ...
    if (window.ethereum) {
      console.log('modern dapp or Metamask');
      App.web3Provider = window.ethereum;
      try {
        // request account access
        await window.ethereum.enable()
      } catch(error) {
        // user denied account access
        console.error('User denied account access')
      }
    }
    // legacy dapp browsers
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider
    }
    // if no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = Web3.providers.HttpProvider('http://localhost:7545')
    }
    web3 = new Web3(App.web3Provider)
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function (data) {
      var AdoptionArtifact = data;

      App.contracts.Adoption = TruffleContract(AdoptionArtifact)

      App.contracts.Adoption.setProvider(App.web3Provider)
      return App.markAdopted()
    })

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.getAdopters.call();
    }).then(
      function(adopters) {
        console.log('adopters: ', adopters)
        for (var i=0; i < adopters.length; i++) {
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true)
          }
        }
      }
    ).catch(function (err){

    })
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    console.log('petId: ', petId)

    var adoptionInstance;
    web3.eth.getAccounts(function(error, accounts) {
      console.log('linked accounts: ', accounts)

      if (error) {
        console.log(error)
      }

      var account = accounts[0]
      console.log('account: ', account)
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.adopt(petId, {from: account})
      }).then(function(result) {
        console.log('after adopt: ', result)
        return App.markAdopted();
      }).catch(function (err){
        console.log(err.message);
      })
    })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

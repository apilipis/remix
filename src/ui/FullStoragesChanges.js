'use strict'
var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function FullStoragesChanges (_parent, _traceManager, _storageResolver) {
  this.storageResolver = _storageResolver
  this.parent = _parent
  this.traceManager = _traceManager
  this.addresses = []
  this.view
  this.traceLength
  this.basicPanel = new DropdownPanel('Full Storages Changes', {json: true})
  this.init()
}

FullStoragesChanges.prototype.render = function () {
  var view = yo`<div id='fullstorageschangespanel' >${this.basicPanel.render()}</div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

FullStoragesChanges.prototype.init = function () {
  var self = this
  this.parent.event.register('newTraceLoaded', this, function (length) {
    self.panels = []
    self.traceManager.getAddresses(function (error, addresses) {
      if (!error) {
        self.addresses = addresses
        self.basicPanel.update({})
      }
    })

    self.traceManager.getLength(function (error, length) {
      if (!error) {
        self.traceLength = length
      }
    })
  })

  this.parent.event.register('indexChanged', this, function (index) {
    if (index < 0) return
    if (self.parent.currentStepIndex !== index) return

    if (index === self.traceLength - 1) {
      var storageJSON = {}
      for (var k in self.addresses) {
        var address = self.addresses[k]
        self.storageResolver.storageRange(function (error, result) {
          if (!error) {
            result = self.traceManager.traceCache.rebuildStorage(address, result, index)
            storageJSON[address] = result
            self.basicPanel.update(storageJSON)
          }
        }, self.addresses[k])
      }
    }
  })
}

module.exports = FullStoragesChanges

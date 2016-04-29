'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

var testModules = [ coreModule, modelingModule ];


describe('features/modeling - move elements', function() {

  describe('post behavior', function() {

    describe('move tasks with boundary connection', function() {

      var diagramXML = require('./MoveElementsSpec.boundary-connection.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it.only('should properly adjust connection', inject(function(elementRegistry, modeling) {

        // given
        var elements = [
          elementRegistry.get('Task_1'),
          elementRegistry.get('Task_2')
        ];

        var boundaryFlow = elementRegistry.get('Boundary_Flow');

        var delta = { x: 0, y: 20 };

        var expectedWaypoints = moveWaypoints(boundaryFlow.waypoints, delta);

        // when
        modeling.moveElements(elements, delta);

        // then
        expect(boundaryFlow.waypoints).to.eql(expectedWaypoints);
      }));

    });

  });

});


function moveWaypoint(p, delta) {
  return {
    x: p.x + delta.x || 0,
    y: p.y + delta.y || 0
  };
}

function moveWaypoints(waypoints, delta) {

  return waypoints.map(function(p) {

    var original = p.original;

    var moved = moveWaypoint(p, delta);

    if (original) {
      moved.original = moveWaypoint(original, delta);
    }

    return moved;
  });
}
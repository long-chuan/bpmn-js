'use strict';

require('../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('../../../lib/core'),
    bendpointsModule = require('diagram-js/lib/features/bendpoints'),
    modelingModule = require('../../../lib/features/modeling'),
    labelEditingModule = require('../../../lib/features/label-editing');

var LabelUtil = require('../../../lib/features/label-editing/LabelUtil');

var EventBus = require('diagram-js/lib/core/EventBus');
var connectionSegmentMove = require('diagram-js/lib/features/bendpoints/ConnectionSegmentMove');
var dragging = require('diagram-js/lib/features/dragging');


describe('LabelUtil', function() {

  var diagramXML = require('./LabelUtil.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [ coreModule, modelingModule, labelEditingModule, bendpointsModule ]
  }));


  describe('initial label position', function() {

    it.only('should correctly place horizontal label', inject(function(modeling, elementRegistry) {

      // given
      var element1 = elementRegistry.get('StartEvent_1'),
          element2 = elementRegistry.get('ExclusiveGateway_2');

      // when
      var connection = modeling.connect(element1, element2);

      // then
      expect(connection.label.x).to.be.equal(427);
      expect(connection.label.y).to.be.equal(332);
    }));

    it('should correctly place vertical label', inject(function(modeling, elementRegistry) {

      // given
      var element1 = elementRegistry.get('StartEvent_1'),
          element2 = elementRegistry.get('ExclusiveGateway_1');

      // when
      var connection = modeling.connect(element1, element2);

      // then
      expect(connection.label.x).to.be.equal(292);
      expect(connection.label.y).to.be.equal(219.5);
    }));
  });


  describe('dynamic label position', function() {

    var createEvent = require('../../util/MockEvents').createEvent;


    it('should move on vertical segment move', inject(function(modeling, elementRegistry, canvas, dragging, connectionSegmentMove) {

      // given
      var element1 = elementRegistry.get('StartEvent_1'),
          element2 = elementRegistry.get('ExclusiveGateway_2');

      // when
      var connection = modeling.connect(element1, element2),
          gfx = canvas.getGraphics(connection);

      var labelPositionY = connection.label.y,
          deltaY = 100;

      connection.label.businessObject.name = 'Hello World';
      connection.label.hidden = false;

      var pos = {
        x: ( connection.waypoints[0].x - connection.waypoints[1].x ) / 2,
        y: connection.waypoints[0].y
      };

      console.log(pos.x, pos.y);
      console.log(createEvent(gfx, pos));

      connectionSegmentMove.start(createEvent(gfx, pos), connection, 1);

      pos.y += deltaY;
      dragging.move(createEvent(gfx, pos));
      dragging.end();

      // then
      expect(connection.label.y).to.be.eql(labelPositionY + deltaY);

    }));

    it('should move on horizontal segment move', inject(function(modeling, elementRegistry, canvas, dragging, connectionSegmentMove) {

      // given
      var element1 = elementRegistry.get('StartEvent_1'),
          element2 = elementRegistry.get('ExclusiveGateway_1');

      // when
      var connection = modeling.connect(element1, element2),
          gfx = canvas.getGraphics(connection);

      var labelPositionX = connection.label.x,
          deltaX = 100;

      connection.label.businessObject.name = 'Hello World';
      connection.label.hidden = false;

      var pos = {
        x: connection.waypoints[0].x,
        y: ( connection.waypoints[0].y - connection.waypoints[1].y ) / 2,
      };

      connectionSegmentMove.start(createEvent(gfx, pos), connection, 1);

      pos.x += deltaX;
      dragging.move(createEvent(gfx, pos));
      dragging.end();

      // then
      expect(connection.label.x).to.be.eql(labelPositionX + deltaX);

    }));

    it('should not move on reconnection', inject(function(modeling, elementRegistry, canvas, dragging, connectionSegmentMove) {

      // given
      var element1 = elementRegistry.get('StartEvent_1'),
          element2 = elementRegistry.get('ExclusiveGateway_3'),
          element3 = elementRegistry.get('ExclusiveGateway_1');

      // when
      var connection = modeling.connect(element1, element2),
          gfx = canvas.getGraphics(connection);

      var labelPositionX = connection.label.x,
          deltaX = 100;

      connection.label.businessObject.name = 'Hello World';
      connection.label.hidden = false;

      modeling.reconnectStart(connection, element3, [
        connection.waypoints[0],
        connection.waypoints[connection.waypoints.length-1]
      ]);

      // then
      expect(connection.label.x).to.be.eql(labelPositionX);

    }));


  });


});

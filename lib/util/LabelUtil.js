'use strict';

var assign = require('lodash/object/assign');

var is = require('./ModelUtil').is;

var GeometricUtil = require('./GeometricUtil');

var DEFAULT_LABEL_SIZE = module.exports.DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20
};

var FLOW_LABEL_INDENT = module.exports.FLOW_LABEL_INDENT = 15;

var DISTANCE_THRES = 100;

/**
 * Returns true if the given semantic has an external label
 *
 * @param {BpmnElement} semantic
 * @return {Boolean} true if has label
 */
module.exports.hasExternalLabel = function(semantic) {
  return is(semantic, 'bpmn:Event') ||
         is(semantic, 'bpmn:Gateway') ||
         is(semantic, 'bpmn:DataStoreReference') ||
         is(semantic, 'bpmn:DataObjectReference') ||
         is(semantic, 'bpmn:SequenceFlow') ||
         is(semantic, 'bpmn:MessageFlow');
};


function getMinDistanceLineIndex(label, waypoints) {

  var minimum = null,
      newMinimum = null,
      minimumIndex = null;

  for (var i=0; i<waypoints.length-1; i++) {

    var p1 = waypoints[i],
        p2 = waypoints[i+1];

    var distance = GeometricUtil.getDistancePointLine(label, [ p1, p2 ]);

    if (!minimum) {
      minimum = distance;
      minimumIndex = i;
    }

    newMinimum = distance;

    if (newMinimum < minimum) {
      minimum = newMinimum;
      minimumIndex = i;
    }
  }

  return minimumIndex;
}

function getNewFlowLabelPosition(label, newWaypoints, oldWaypoints, hints) {

  var labelPosition = getExternalLabelMid(label);

  // the first index of the line which the label is nearest
  var oldLabelLineIndex = getMinDistanceLineIndex(labelPosition, oldWaypoints);

  var oldLabelLine = [ oldWaypoints[oldLabelLineIndex], oldWaypoints[oldLabelLineIndex+1] ],
      pfPoint = GeometricUtil.perpendicularFoot(labelPosition, oldLabelLine),
      distance = GeometricUtil.getDistancePointPoint(labelPosition, pfPoint);

  var x = 0, y = 0;

  // if a segment got moved
  // TODO(@janstuemmel): distance threshold
  if (hints.segmentMove) {

    var oldSegmentStartIndex = hints.segmentMove.segmentStartIndex,
        newSegmentStartIndex = hints.segmentMove.newSegmentStartIndex;

    var oldSegmentStart = oldWaypoints[oldSegmentStartIndex],
        newSegmentStart = newWaypoints[newSegmentStartIndex];

    var newSegmentOriginalStart = (newSegmentStart.original) ? newSegmentStart.original : newSegmentStart,
        oldSegmentOriginalStart = (oldSegmentStart.original) ? oldSegmentStart.original : oldSegmentStart;

    // if segment got moved with label on it
    if (oldLabelLineIndex == oldSegmentStartIndex) {
      y = newSegmentOriginalStart.y - oldSegmentOriginalStart.y;
      x = newSegmentOriginalStart.x - oldSegmentOriginalStart.x;
    }
  }

  return { y: y, x: x };
}

module.exports.getNewFlowLabelPosition = getNewFlowLabelPosition;

/**
 * Get the position for sequence flow labels
 *
 * @param  {Array<Point>} waypoints
 * @return {Point} the label position
 */
function getFlowLabelPosition(waypoints) {

  // get the waypoints mid
  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  // get position
  var position = getWaypointsMid(waypoints);

  // calculate angle
  var angle = Math.atan( (second.y - first.y) / (second.x - first.x) );

  var x = position.x,
      y = position.y;

  if ( Math.abs(angle) < Math.PI / 2 ) {
    y -= FLOW_LABEL_INDENT;
  } else {
    x += FLOW_LABEL_INDENT;
  }

  return { x: x, y: y };
}

module.exports.getFlowLabelPosition = getFlowLabelPosition;

/**
 * Get the middle of a number of waypoints
 *
 * @param  {Array<Point>} waypoints
 * @return {Point} the mid point
 */
function getWaypointsMid(waypoints) {

  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  };
}

module.exports.getWaypointsMid = getWaypointsMid;


function getExternalLabelMid(element) {

  if (element.waypoints) {
    return getFlowLabelPosition(element.waypoints);
  } else {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height + DEFAULT_LABEL_SIZE.height / 2
    };
  }
}

module.exports.getExternalLabelMid = getExternalLabelMid;


/**
 * Returns the bounds of an elements label, parsed from the elements DI or
 * generated from its bounds.
 *
 * @param {BpmnElement} semantic
 * @param {djs.model.Base} element
 */
module.exports.getExternalLabelBounds = function(semantic, element) {

  var mid,
      size,
      bounds,
      di = semantic.di,
      label = di.label;

  if (label && label.bounds) {
    bounds = label.bounds;

    size = {
      width: Math.max(DEFAULT_LABEL_SIZE.width, bounds.width),
      height: bounds.height
    };

    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
  } else {

    mid = getExternalLabelMid(element);

    size = DEFAULT_LABEL_SIZE;
  }

  return assign({
    x: mid.x - size.width / 2,
    y: mid.y - size.height / 2
  }, size);
};

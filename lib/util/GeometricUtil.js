'use strict';

/**
 * Solves a 2D equation system
 * a + r*b = c, where a,b,c are 2D vectors
 *
 * @param {Vector}
 * @param {Vector}
 * @param {Vector}
 * @return {Float}
 */
function solveLambaSystem(a, b, c) {

  // the 2d system
  var system = [
    { n: a[0] - c[0], lambda: b[0] },
    { n: a[1] - c[1], lambda: b[1] }
  ];

  // solve
  var n = system[0].n * b[0] + system[1].n * b[1],
      l = system[0].lambda * b[0] + system[1].lambda * b[1];

  return -n/l;
}

/**
 * Position of perpendicular foot
 *
 * @param {Point}
 * @param [ {Point}, {Point} ] line defined throug two points
 * @return {Point} the perpendicular foot position
 */
function perpendicularFoot(point, line) {

  var a = line[0],
      b = line[1];

  // relative position of b from a
  var bd = {
    x: b.x - a.x,
    y: b.y - a.y
  };

  // solve equation system to the parametrized vectors param real value
  var r = solveLambaSystem( [ a.x, a.y ], [ bd.x, bd.y ], [ point.x, point.y ] );

  return {
    x: a.x + r*bd.x,
    y: a.y + r*bd.y
  };

}

module.exports.perpendicularFoot = perpendicularFoot;

/**
 * Calculates the distance between a point and a line
 *
 * @param {Point}
 * @param [ {Point}, {Point} ] line defined throug two points
 * @return {Float} distance
 */
function getDistancePointLine(point, line) {

  var pfPoint = perpendicularFoot(point, line);

  // distance vector
  var connectionVector = {
    x: pfPoint.x - point.x,
    y: pfPoint.y - point.y
  }

  // calculate length of vector and return
  return Math.sqrt(
    Math.pow(connectionVector.x, 2) +
    Math.pow(connectionVector.y, 2)
  );
}

module.exports.getDistancePointLine = getDistancePointLine;

/**
 * Calculates the distance between two points
 *
 * @param {Point}
 * @param {Point}
 * @return {Float} distance
 */
function getDistancePointPoint(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2)
  );
}

module.exports.getDistancePointPoint = getDistancePointPoint;

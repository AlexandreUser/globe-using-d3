//
// Configuration
//

// ms to wait after dragging before auto-rotating
var rotationDelay = 3000
// scale of the globe (not the canvas element)
var scaleFactor = 0.9
// autorotation speed
var degPerSec = 6
// start angles
var angles = { x: -20, y: 40, z: 0}
// colors
var colorWater = '#237282'
var colorLand = '#124503'
var colorGraticule = '#808080'
var colorCountry = '#092401'
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
//
// Handler
//

function enter(country) {
  var country = countryList.find(function(c) {
    return parseInt(c.id, 10) === parseInt(country.id, 10)
  })
  current.text(country && country.name || '')
}

function leave(country) {
  current.text('')
}

//
// Variables
//

var current = d3.select('#current')
var canvas = d3.select('#globe')
var context = canvas.node().getContext('2d')
var water = {type: 'Sphere'}
var projection = d3.geoOrthographic().precision(0.1)
var graticule = d3.geoGraticule10()
var path = d3.geoPath(projection).context(context)
var v0 // Mouse position in Cartesian coordinates at start of drag gesture.
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width, height
var land, countries, marks
var countryList
var autorotate, now, diff, roation
var currentCountry

//
// Functions
//

function setAngles() {
  var rotation = projection.rotate()
  rotation[0] = angles.y
  rotation[1] = angles.x
  rotation[2] = angles.z
  projection.rotate(rotation)
}

function scale() {
  width = document.documentElement.clientWidth
  height = document.documentElement.clientHeight
  canvas.attr('width', width).attr('height', height)
  projection
    .scale((scaleFactor * Math.min(width, height)) / 2)
    .translate([width / 2, height / 2])
  render()
}

function startRotation(delay) {
  autorotate.restart(rotate, delay || 0)
}

function stopRotation() {
  autorotate.stop()
}

function dragstarted() {
  v0 = versor.cartesian(projection.invert(d3.mouse(this)))
  r0 = projection.rotate()
  q0 = versor(r0)
  stopRotation()
}

function dragged() {
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this)))
  var q1 = versor.multiply(q0, versor.delta(v0, v1))
  var r1 = versor.rotation(q1)
  projection.rotate(r1)
  render()
}

function dragended() {
  startRotation(rotationDelay)
}

function render() {
  context.clearRect(0, 0, width, height)
  fill(water, colorWater)
  fill(land, colorLand)

  if (currentCountry) {
    fill(currentCountry, colorCountry)
  }
  stroke(graticule, colorGraticule)

  fill(marks,"#7d0800")

}

function fill(obj, color) {
  context.beginPath()
  path(obj)
  context.fillStyle = color
  context.fill()
}

function stroke(obj, color) {
  context.beginPath()
  path(obj)
  context.strokeStyle = color
  context.stroke()
}

function rotate(elapsed) {
  now = d3.now()
  diff = now - lastTime
  if (diff < elapsed) {
    rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    render()
  }
  lastTime = now
}

function loadData(cb) {
  d3.json('https://unpkg.com/world-atlas@1/world/110m.json', function(error, world) {
    if (error) throw error
    d3.tsv('https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/world-country-names.tsv', function(error, countries) {
      if (error) throw error
      cb(world, countries)
    })
  })
}

// https://github.com/d3/d3-polygon
function polygonContains(polygon, point) {
  var n = polygon.length
  var p = polygon[n - 1]
  var x = point[0], y = point[1]
  var x0 = p[0], y0 = p[1]
  var x1, y1
  var inside = false
  for (var i = 0; i < n; ++i) {
    p = polygon[i], x1 = p[0], y1 = p[1]
    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
    x0 = x1, y0 = y1
  }
  return inside
}

function mousemove() {
  var c = getCountry(this)
  if (!c) {
    if (currentCountry) {
      leave(currentCountry)
      currentCountry = undefined
      render()
    }
    return
  }
  if (c === currentCountry) {
    return
  }
  currentCountry = c
  render()
  enter(c)
}

function getCountry(event) {
  var pos = projection.invert(d3.mouse(event))
  return countries.features.find(function(f) {
    return f.geometry.coordinates.find(function(c1) {
      return polygonContains(c1, pos) || c1.find(function(c2) {
        return polygonContains(c2, pos)
      })
    })
  })
}


//
// Initialization
//

setAngles()

canvas
  .call(d3.drag()
   )
  .on('mousemove', mousemove)

loadData(function(world, cList) {

  land = topojson.feature(world, world.objects.land)
  countries = topojson.feature(world, world.objects.countries)
   marks = {
    "type": "FeatureCollection",
                                                                                    
    "features": [
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Populated place", "name": "Los Angeles", "nameascii": "Los Angeles", "adm0name": "United States of America", "adm0_a3": "USA", "adm1name": "California", "iso_a2": "US", "note": null, "latitude": 33.989978250199997, "longitude": -118.179980511, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 12500000, "pop_min": 3694820, "pop_other": 142265, "rank_max": 14, "rank_min": 12, "geonameid": 5368361.0, "meganame": "Los Angeles-Long Beach-Santa Ana", "ls_name": "Los Angeles1", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ -118.181926369940413, 33.991924108765431 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Admin-0 capital", "name": "Washington, D.C.", "nameascii": "Washington, D.C.", "adm0name": "United States of America", "adm0_a3": "USA", "adm1name": "District of Columbia", "iso_a2": "US", "note": null, "latitude": 38.899549376499998, "longitude": -77.009418580800002, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 4338000, "pop_min": 552433, "pop_other": 2175991, "rank_max": 12, "rank_min": 11, "geonameid": 4140963.0, "meganame": "Washington, D.C.", "ls_name": "Washington, D.C.", "ls_match": 1, "checkme": 5 }, "geometry": { "type": "Point", "coordinates": [ -77.011364439437159, 38.901495235087054 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Populated place", "name": "New York", "nameascii": "New York", "adm0name": "United States of America", "adm0_a3": "USA", "adm1name": "New York", "iso_a2": "US", "note": null, "latitude": 40.749979064, "longitude": -73.980016928799998, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 19040000, "pop_min": 8008278, "pop_other": 9292603, "rank_max": 14, "rank_min": 13, "geonameid": 5128581.0, "meganame": "New York-Newark", "ls_name": "New York", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ -73.981962787406815, 40.75192492259464 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 2, "featurecla": "Admin-0 capital", "name": "Moscow", "nameascii": "Moscow", "adm0name": "Russia", "adm0_a3": "RUS", "adm1name": "Moskva", "iso_a2": "RU", "note": null, "latitude": 55.7521641226, "longitude": 37.615522825900001, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 10452000, "pop_min": 10452000, "pop_other": 10585385, "rank_max": 14, "rank_min": 14, "geonameid": 524901.0, "meganame": "Moskva", "ls_name": "Moscow", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 37.613576967271399, 55.754109981248178 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 2, "featurecla": "Admin-0 capital", "name": "Mexico City", "nameascii": "Mexico City", "adm0name": "Mexico", "adm0_a3": "MEX", "adm1name": "Distrito Federal", "iso_a2": "MX", "note": null, "latitude": 19.442442442800001, "longitude": -99.130988201700006, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 19028000, "pop_min": 10811002, "pop_other": 10018444, "rank_max": 14, "rank_min": 14, "geonameid": 3530597.0, "meganame": "Ciudad de México", "ls_name": "Mexico City", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ -99.132934060293906, 19.444388301415472 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 2, "featurecla": "Admin-0 capital alt", "name": "Lagos", "nameascii": "Lagos", "adm0name": "Nigeria", "adm0_a3": "NGA", "adm1name": "Lagos", "iso_a2": "NG", "note": null, "latitude": 6.44326165348, "longitude": 3.39153107121, "changed": 4.0, "namediff": 0, "diffnote": "Location adjusted. Changed scale rank.", "pop_max": 9466000, "pop_min": 1536, "pop_other": 6567892, "rank_max": 13, "rank_min": 3, "geonameid": 735497.0, "meganame": "Lagos", "ls_name": "Lagos", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 3.389585212598433, 6.445207512093191 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Admin-0 capital", "name": "Beijing", "nameascii": "Beijing", "adm0name": "China", "adm0_a3": "CHN", "adm1name": "Beijing", "iso_a2": "CN", "note": null, "latitude": 39.928892231299997, "longitude": 116.388285684, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 11106000, "pop_min": 7480601, "pop_other": 9033231, "rank_max": 14, "rank_min": 13, "geonameid": 1816670.0, "meganame": "Beijing", "ls_name": "Beijing", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 116.386339825659434, 39.930838089909059 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Admin-0 capital", "name": "Jakarta", "nameascii": "Jakarta", "adm0name": "Indonesia", "adm0_a3": "IDN", "adm1name": "Jakarta Raya", "iso_a2": "ID", "note": null, "latitude": -6.17441770541, "longitude": 106.829437621, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 9125000, "pop_min": 8540121, "pop_other": 9129613, "rank_max": 13, "rank_min": 13, "geonameid": 1642911.0, "meganame": "Jakarta", "ls_name": "Jakarta", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 106.827491762470117, -6.172471846798885 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Admin-1 capital", "name": "Shanghai", "nameascii": "Shanghai", "adm0name": "China", "adm0_a3": "CHN", "adm1name": "Shanghai", "iso_a2": "CN", "note": null, "latitude": 31.216452452599999, "longitude": 121.436504678, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 14987000, "pop_min": 14608512, "pop_other": 16803572, "rank_max": 14, "rank_min": 14, "geonameid": 1796236.0, "meganame": "Shanghai", "ls_name": "Shanghai", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 121.434558819820154, 31.218398311228327 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 2, "featurecla": "Admin-0 capital", "name": "Tokyo", "nameascii": "Tokyo", "adm0name": "Japan", "adm0_a3": "JPN", "adm1name": "Tokyo", "iso_a2": "JP", "note": null, "latitude": 35.685016905799998, "longitude": 139.751407429000011, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 35676000, "pop_min": 8336599, "pop_other": 12945252, "rank_max": 14, "rank_min": 13, "geonameid": 1850147.0, "meganame": "Tokyo", "ls_name": "Tokyo", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 139.749461570544668, 35.686962764371174 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Admin-1 capital", "name": "Mumbai", "nameascii": "Mumbai", "adm0name": "India", "adm0_a3": "IND", "adm1name": "Maharashtra", "iso_a2": "IN", "note": null, "latitude": 19.016990375700001, "longitude": 72.856989297400006, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 18978000, "pop_min": 12691836, "pop_other": 12426085, "rank_max": 14, "rank_min": 14, "geonameid": 1275339.0, "meganame": "Mumbai", "ls_name": "Mumbai", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 72.855043438766472, 19.018936234356602 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Admin-1 capital", "name": "Kolkata", "nameascii": "Kolkata", "adm0name": "India", "adm0_a3": "IND", "adm1name": "West Bengal", "iso_a2": "IN", "note": null, "latitude": 22.494969298299999, "longitude": 88.324675658100006, "changed": 4.0, "namediff": 1, "diffnote": "Name changed. Changed scale rank.", "pop_max": 14787000, "pop_min": 4631392, "pop_other": 7783716, "rank_max": 14, "rank_min": 12, "geonameid": 1275004.0, "meganame": "Kolkata", "ls_name": "Calcutta", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ 88.32272979950551, 22.496915156896421 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Populated place", "name": "Rio de Janeiro", "nameascii": "Rio de Janeiro", "adm0name": "Brazil", "adm0_a3": "BRA", "adm1name": "Rio de Janeiro", "iso_a2": "BR", "note": null, "latitude": -22.9250231742, "longitude": -43.225020794199999, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 11748000, "pop_min": 2010175, "pop_other": 1821489, "rank_max": 14, "rank_min": 12, "geonameid": 3451190.0, "meganame": "Rio de Janeiro", "ls_name": "Rio de Janeiro", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ -43.226966652843657, -22.923077315615956 ] } }
    ,
    { "type": "Feature", "properties": { "scalerank": 0, "labelrank": 1, "featurecla": "Admin-1 capital", "name": "Sao Paulo", "nameascii": "Sao Paulo", "adm0name": "Brazil", "adm0_a3": "BRA", "adm1name": "São Paulo", "iso_a2": "BR", "note": null, "latitude": -23.558679587, "longitude": -46.625019980399998, "changed": 0.0, "namediff": 0, "diffnote": null, "pop_max": 18845000, "pop_min": 10021295, "pop_other": 11522944, "rank_max": 14, "rank_min": 14, "geonameid": 3448439.0, "meganame": "São Paulo", "ls_name": "Sao Paolo", "ls_match": 1, "checkme": 0 }, "geometry": { "type": "Point", "coordinates": [ -46.626965839055231, -23.556733728378958 ] } }
  
    
    ]
    };
  countryList = cList
  marker = topojson.feature(world,marks)
  window.addEventListener('resize', scale)
  scale()
  autorotate = d3.timer(rotate)
  
})
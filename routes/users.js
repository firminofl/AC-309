var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.post("/validar", function(req, res, next) {
  files = req.files.importaContatos;

  if (!files) {
    return res.status(400).send({
      message: "Nenhum arquivo CSV."
    });
  }

  var allRows = null;

  //Converter arquivo csv para texto e fazer sua analise
  allRows = files.data.toString().split(/\r?\n|\r/);

  //Fazer update na tabela de campanha a quantidade de contatos
  qtdContatos = allRows.length.valueOf() - 1;

  //Construir query para multiplos parametros no insert
  var chunks = [];

  //Inicia a partir do dado e desconsidera o titulo das colunas no csv
  for (var singleRow = 1; singleRow <= qtdContatos; singleRow++) {
    var rowCells = allRows[singleRow].split(";");
    for (var rowCell = 2; rowCell < rowCells.length; rowCell++) {
      var valueClause = [];

      //Pegar Latitude
      var latitude = rowCells[rowCell];
      valueClause.push(latitude);
      rowCell++;

      //Pegar longitude
      var longitude = rowCells[rowCell];
      valueClause.push(longitude);

      //Construindo um array para insercao
      chunks.push(valueClause);
    }
  }

  var R = 6371; // km
  var latitude1 = null;
  var latitude2 = null;
  var longitude1 = null;
  var longitude2 = null;
  var matriz = []; //Armazena a distancia de todos para todos

  for (var j = 0; j < chunks.length; j++) {
    latitude1 = chunks[j][0];
    longitude1 = chunks[j][1];

    for (var i = 0; i < chunks.length; i++) {
      if (i >= chunks.length - 1) continue;
      var distancia = [];

      latitude2 = chunks[i + 1][0];
      longitude2 = chunks[i + 1][1];

      var variacaoLatitude = toRad(latitude2 - latitude1);
      var variacaoLongitude = toRad(longitude2 - longitude1);

      var a =
        Math.sin(variacaoLatitude / 2) * Math.sin(variacaoLatitude / 2) +
        Math.cos(latitude1) *
          Math.cos(latitude2) *
          Math.sin(variacaoLongitude / 2) *
          Math.sin(variacaoLongitude / 2);

      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      var d = (R * c).toFixed();

      distancia.push(d);

      matriz.push(distancia);
      //console.log(`j = ${j}, i = ${i} --- Distancia: ${d}`);
    }
  }

  imprimirGrafo(matriz);
  //warshall(matriz);
  res.status(200).send({ message: "Sucesso ao calcular distâncias", grafo: matriz });
});

function toRad(coordenadas) {
  /** Converts numeric degrees to radians */
  return (coordenadas * Math.PI) / 180;
}

function imprimirGrafo(graph) {
  var grafo = [];
  var fim = graph.length;
  var inicio = 0;

  for (var j = inicio; j <= fim; j++) {
    var valueClause = [];
    valueClause.push(graph[j]);

    grafo.push(valueClause);
    console.log("Distancia " + grafo);
  }
}

function init(graph) {
  var dist = [];
  var size = graph.length;
  for (var i = 0; i < size; i += 1) {
    dist[i] = [];
    for (var j = 0; j < size; j += 1) {
      if (i === j) {
        dist[i][j] = 0;
      } else if (!isFinite(graph[i][j])) {
        dist[i][j] = Infinity;
      } else {
        dist[i][j] = graph[i][j];
      }
    }
  }
  return dist;
}

function warshall(graph) {
  dist = init(graph);
  var size = graph.length;
  for (var k = 0; k < size; k += 1) {
    for (var i = 0; i < size; i += 1) {
      for (var j = 0; j < size; j += 1) {
        if (dist[i][j] > dist[i][k] + dist[k][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  console.log(`Distancia: ${dist}`);
}
module.exports = router;

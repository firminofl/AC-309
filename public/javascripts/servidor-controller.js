function validarArquivo() {
  const importaContatos = document.getElementById("importaContatosExterno");
  var formData = new FormData();

  var data = importaContatos.files[0];

  if (data) {
    formData.append("importaContatos", data, data.name);
  } else {
    console.log("Erro ao fazer upload");
  }

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/users/validar", true);


  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && (this.status == 200 || this.status == 304)) {
      alert(JSON.parse(this.response).message);
      downloadGrafo(JSON.parse(this.response).grafo);
    } else if (
      this.readyState == 4 &&
      (this.status != 200 || this.status != 304)
    ) {
      alert(JSON.parse(this.response).message);
    }
  };

  xhttp.send(formData);
}

function downloadGrafo(graph) {
    var csv = "Distancia\n";
  
    for (var j = 0; j < graph.length; j++) {
      csv += graph[j];
      csv += "\n";
    }
  
    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    hiddenElement.target = "_blank";
    hiddenElement.download = "distancias.csv";
    hiddenElement.click();
  }
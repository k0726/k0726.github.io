// Requirement 1
// Read in moves data from JSON file

fetch("movies-small.json")
  .then(response => response.json())
  .then(data => {
    //console.log(data);
    populateTable(data); 
    setGenre(data);
    setYear();
    update(data);
    document.getElementById("getAllYears").onclick = function() { selectAllYears(data); };
    document.getElementById("findMovie").onclick = function() { searchMovie(data); };
    document.getElementById("selectMax").onclick = function() { selectMaxRows(); };
    document.getElementById("nextPage").onclick = function() { showNextPage(); };
    document.getElementById("previousPage").onclick = function() { showPreviousPage(); };
  })
  .catch(error => {
    console.log(error);
    window.location.reload(1);
  })



// Requirement 2
// Populate table for each object in the JSON file

function populateTable(data) {
  var table = document.getElementById("movieTable");
  
  for(var i = 0; i < data.length; i++) {
    var row = table.insertRow(-1);
    
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    
    cell1.innerHTML = data[i].year;
    // Extension 5
    // Add links to IMDB entry for each film
    cell2.innerHTML = "<a href=\"https://www.imdb.com/find?q=" + data[i].title + "\">" + data[i].title + "</a>";
    cell3.innerHTML = data[i].genres;
    cell4.innerHTML = data[i].cast;

    cell3.innerHTML = cell3.innerHTML.replaceAll(",", ", ");
    cell4.innerHTML = cell4.innerHTML.replaceAll(",", ", ");
  }

  var total = document.getElementById("movieTable").rows.length -1;
  document.getElementById("warning").innerHTML = "";

  if (document.getElementById("movieTable").rows[1].cells[0].innerHTML == "") {
    document.getElementById("totalRows").innerHTML = 0;
    document.getElementById("warning").innerHTML = "<br>Sorry, no movies found.";
  } else {
    document.getElementById("totalRows").innerHTML = total;
  }
}



// Requirement 3 and 4
// Select genre

function setGenre(data) {
  // Genre
  var genre = [];
  for (var i = 0; i < data.length; i++) {
    genre = genre + data[i].genres + ",";
  }

  genre = genre.split(",");

  var genreUnique = [];
  for(var j = 0; j < genre.length; j++) {
    if(!genreUnique.includes(genre[j])) {
      genreUnique.push(genre[j]);
    }
  }
  genreUnique = genreUnique.filter(genreUnique => genreUnique.length > 0).sort();
  genreUnique.unshift("ALL"); 
  //console.log(genreUnique);

  function genreSelect() {
    var genreSelect = document.getElementById("selectGenre");
    var options = genreUnique;

    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      var o = document.createElement("option");
      o.textContent = opt;
      o.value = opt;
      genreSelect.appendChild(o);
    }
  }
  genreSelect();
}


// Select start year and end year

function setYear() {
  // Start year
  var yearStart = [];
  for (var i = 1900; i <= 2021; i++) {
    yearStart.push(i);
  }
  yearStart.unshift("START"); 
  
  function yearStartSelect() {
    var yearStartSelect = document.getElementById("selectYearStart");
    var options = yearStart;

    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      var o = document.createElement("option");
      o.textContent = opt;
      o.value = opt;
      yearStartSelect.appendChild(o);
    }
  }
  yearStartSelect();

  // End year
  var yearEnd = [];
  for (var i = 1900; i <= 2021; i++) {
    yearEnd.push(i);
  }
  yearEnd.unshift("END");
  
  function yearEndSelect() {
    var yearEndSelect = document.getElementById("selectYearEnd");
    var options = yearEnd;

    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      var o = document.createElement("option");
      o.textContent = opt;
      o.value = opt;
      yearEndSelect.appendChild(o);
    } 
  }
  yearEndSelect();
}


//Update table based on selected start/end year and genre

var noData = [{
  "title": "",
  "year": "",
  "cast": "",
  "genres": ""
}];


function update(data) {
  document.getElementById("selectGenre").addEventListener("change", changeTable);
  document.getElementById("selectYearStart").addEventListener("change", changeTable);
  document.getElementById("selectYearEnd").addEventListener("change", changeTable);

  function changeTable() {
    var table = document.getElementById('movieTable');
    var rowCount = table.rows.length;
    for (var i = 1; i < rowCount; i++) {
      table.deleteRow(1);
    }

    var genreText = document.getElementById("selectGenre").value;
    var yearStartText = document.getElementById("selectYearStart").value;
    var yearEndText = document.getElementById("selectYearEnd").value;
    
    if (yearStartText == "START") { yearStartText = "1900" };
    if (yearEndText == "END") { yearEndText = "2021" };
    yearStartText = parseInt(yearStartText);
    yearEndText = parseInt(yearEndText);
    //console.log(genreText);
    //console.log(yearStartText);
    //console.log(yearEndText);

    var newData = [];

    if (yearStartText > yearEndText) {
      // Extension 4
      // Add validation for the range of years
      document.getElementById("warning").innerHTML = "<br>Warning: Start Year > End Year<br>Please select the years again";
      document.getElementById("totalRows").innerHTML = "N/A";
    } else {
      for (var i = 0; i < data.length; i++) {
        if (data[i].genres.includes(genreText)) {
          if (data[i].year >= yearStartText && data[i].year <= yearEndText) {
            newData.push(data[i]);
          }
        } else if (genreText == "ALL") {
          if (data[i].year >= yearStartText && data[i].year <= yearEndText) {
            newData.push(data[i]);
          }
        }
      }
      if (newData != "") {
        populateTable(newData);
      } else {
        populateTable(noData);
      }
    }
  }
  changeTable();
}



// Extension 1
// Select all range of years

function selectAllYears(data) {
  document.getElementById("selectYearStart").value = "START";
  document.getElementById("selectYearEnd").value = "END";
  update(data);
}


// Extension 2
// Show a small number of films per page

var max = 0;

function selectMaxRows() {
  var table = document.getElementById("movieTable");
  var tr = table.getElementsByTagName("tr");
  max = document.getElementById("selectMax").value;
  
  if (max == "ALL") {
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      tr[i].style.display = "";
      document.getElementById("previousPage").hidden = "hidden";
      document.getElementById("nextPage").hidden = "hidden";
    }
  } else {
    for (i = 1; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (i < parseInt(max) +1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
    document.getElementById("previousPage").hidden = "";
    document.getElementById("nextPage").hidden = "";
  }
}

function showNextPage() {
  var table = document.getElementById("movieTable");
  var tr = table.getElementsByTagName("tr");
  var record = document.getElementById("selectMax").value;

  if (parseInt(max) <= 0) { max = parseInt(record) };
  if (parseInt(max) > tr.length - record) { max = tr.length - parseInt(record) -1};

  for (i = 1; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (parseInt(max) < tr.length) {
      if (i > parseInt(max) && i <= parseInt(max) + parseInt(record)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
  max = parseInt(max) + parseInt(record);
  
  if (tr[2].style.display == "") {
    document.getElementById("previousPage").hidden = "hidden";
  } else {
    document.getElementById("previousPage").hidden = "";
  }
  if (tr[tr.length-1].style.display == "") {
    document.getElementById("nextPage").hidden = "hidden";
  } else {
    document.getElementById("nextPage").hidden = "";
  }
}

function showPreviousPage() {
  var table = document.getElementById("movieTable");
  var tr = table.getElementsByTagName("tr");
  var record = document.getElementById("selectMax").value;

  for (i = 1; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (parseInt(max) - parseInt(record) >= parseInt(record)) {
      if (i > parseInt(max) - parseInt(record) - parseInt(record) && i <= parseInt(max) - parseInt(record)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    } else {
      if (i <=  parseInt(record)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
      max = parseInt(record);
    }
  }
  max = parseInt(max) - parseInt(record);
  
  if (tr[2].style.display == "") {
    document.getElementById("previousPage").hidden = "hidden";
  } else {
    document.getElementById("previousPage").hidden = "";
  }
  if (tr[tr.length-1].style.display == "") {
    document.getElementById("nextPage").hidden = "hidden";
  } else {
  document.getElementById("nextPage").hidden = "";
  }
}



// Extension 3
// Add search option

function searchMovie(data) {
  var table = document.getElementById('movieTable');
  var rowCount = table.rows.length;
  for (var i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }

  var text = document.getElementById("searchInput").value.toLowerCase();
  if (text == "") { populateTable(data) } else {
    var newData = [];
    var match = 0;
    
    for (i = 0; i < data.length; i++) {
      if (data[i].title.toLowerCase().includes(text) == true && match == 0) {
        newData.push(data[i]);
        match = 1;
      }
      for (j = 0; j < data[i].cast.length; j++) {
        if (data[i].cast[j].toLowerCase().includes(text) == true && match == 0) {
          newData.push(data[i]);
          match = 1;
        }
      }
      match = 0;
    }
    if (newData != "") {
      populateTable(newData);
    } else {
      populateTable(noData);
    }
  }
}
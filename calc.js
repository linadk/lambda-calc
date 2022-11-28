function Cell(id,order,input,output,type){
  this.id = id;
  this.order = order;
  this.input_element = input;
  this.output_element = output;
  this.type = type;
}

const CellType = {
  Math: "math",
  PlotMath: "plotmath",
  Script: "script",
  Markdown: "md",
}

// List of cells
const CellList = {
  cells: [],
  cell_container: null,

  // Inject dependencies for cell list to function
  Init: function( container_element ){
    this.cell_container = container_element;
  },

  Clear: function(){
    this.cells.forEach(element => {
      element.input_element.remove();
      element.output_element.remove();
      document.getElementById(element.id).remove();
    });
    this.cells.length = 0;
  },

  // Add cell to UI, hookup to events
  AddCell: function(type){
    currnum = this.cells.length;

    // Create containing div
    var container = document.createElement("div");
    container.id = "cell" + String(currnum);
    container.setAttribute("class","cell");

    // Create Input field
    var input_field = document.createElement("math-field");
    input_field.id = "fomula" + String(currnum);
    input_field.setAttribute("virtual-keyboard-mode","manual");

    // Create output field
    var output_field = document.createElement("div");
    output_field.id = "output" + String(currnum);
    output_field.setAttribute('class','noutput');

    // Attach
    container.appendChild(input_field);
    container.appendChild(output_field);
    cell_container.appendChild(container);
    input_field.addEventListener('keypress',(e) => {
      if (e.key === 'Enter'){ // Hook keypress/enter to get numpad return
        const ce = new ComputeEngine.ComputeEngine();
        output_field.innerHTML = ce.parse(input_field.value).N();
      }
    });
    input_field.addEventListener('change',(e)=>{ // We have to hook 'change' to get regular return
      const ce = new ComputeEngine.ComputeEngine();
      output_field.innerHTML = ce.parse(input_field.value).N();
    });

    // Insert into cell list
    var cell = new Cell(container.id,currnum,input_field,output_field,type);
    this.cells.push(cell);
  },
}

window.onload = function() {
  const add_cell_button = document.getElementById('add_cell');
  const clear_button = document.getElementById('clear');
  
  // List of cells
  const cells = Object.create(CellList);
  cells.Init(document.getElementById("cell_container"));
  cells.AddCell("math");

  // Prop values on load
  //latex.value = mf.value;

  // Listen for input on math field
  /*mf.addEventListener('input',(ev) => {
    latex.value = mf.value;
    output.value = ce.parse(latex.value).N().latex;
  });

  //  Listen for input on the latex field
  latex.addEventListener('input', (ev) => {
    mf.setValue(
      ev.target.value,
      {suppressChangeNotifications: true}
    );
    output.value = ce.parse(latex.value).N().latex;
  });*/

  add_cell_button.addEventListener('click', (ev)=> {
    newcell = cells.AddCell("math")
  });

  clear_button.addEventListener('click', (e) => {
    cells.Clear();
  });


}

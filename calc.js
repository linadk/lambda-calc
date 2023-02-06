// Cell class
function Cell(id,order,input,output,type, title){
  this.id = id;
  this.order = order;
  this.input_element = input;
  this.output_element = output;
  this.type = type;
  this.title = title;
}

// Available cell types
const CellType = {
  Math: "math",
  PlotMath: "plotmath",
  Script: "script",
  Markdown: "md",
}

// Parse markdown for a cell textarea, adds markdown html to md-output
function ParseMarkdown(container){
  var md = window.markdownit();
  var textarea = container.getElementsByClassName("md-input")[0];
  var output = container.getElementsByClassName("md-output")[0];
  var markdown = textarea.value;
  var html = md.render(markdown);
  output.innerHTML = html;
}

const EditableTitle = {
  title: "Untitled",
  title_container: null,
  title_element: null,
  is_in_edit_mode: false,

  // Create Editable Title
  Create: function(title,container){

    // Setup element inside container with edit mode false
    this.title = title;
    this.container = container;
    this.title_element = this.container.createElement("span");
    this.title_element.innerHTML = this.title;
    this.container.appendChild(title_element);
    this.title_element.setAttribute("class","editable-title");
    this.title_element.addEventListener('dblclick', (e)=>{
      console.log("It was double clicked!");
    });

    return this;
    
  },

  // Edit Event
  OnEdit: function(ev){

  }
}

// List of cells
const CellList = {
  cells: [],
  cell_container: null,

  // Inject dependencies for cell list to function
  Init: function( container_element ){
    this.cell_container = container_element;
  },

  // Clear all cells
  Clear: function(){
    this.cells.forEach(element => {
      element.input_element.remove();
      element.output_element.remove();
      document.getElementById(element.id).remove();
    });
    this.cells.length = 0;
  },

  // Add cell to UI
  AddCell: function(type){
    currnum = this.cells.length;

    // Create containing div
    var container = document.createElement("div");
    container.id = "cell" + String(currnum);
    container.setAttribute("class","cell");

    // Titlebar ( Title, collapse, drag )
    var titlebar = document.createElement("div");
    titlebar.id = "celltitle" + String(currnum);
    titlebar.setAttribute("class","cell-title");
    titlebar.setAttribute("contenteditable","true");
    titlebar.innerHTML = "Untitled Cell";
    container.appendChild(titlebar);

    // Content
    var content = document.createElement("div");
    content.id = "cellcontent" + String(currnum);
    content.setAttribute("class","cell-content");
    container.appendChild(content);

    switch(type){
      case CellType.Math:
        this.CreateMathCell(container);
        break;
      case CellType.Markdown:
        this.CreateMarkdownCell(container);
        break;
      default:
        break;
    }
  },

  // Create a math input cell in the bottom slot
  CreateMathCell: function(container){

    // Create Input field
    var input_field = document.createElement("math-field");
    input_field.id = "fomula" + String(currnum);
    input_field.setAttribute("virtual-keyboard-mode","manual");

    // Create output field
    var output_field = document.createElement("div");
    output_field.id = "output" + String(currnum);
    output_field.setAttribute('class','noutput');

    // Attach
    var content_container = container.getElementsByClassName("cell-content")[0];
    content_container.appendChild(input_field);
    content_container.appendChild(output_field);
    this.cell_container.appendChild(container);

    // Events
    input_field.addEventListener('keypress',(e) => {
      if (e.key === 'Enter'){ // Hook keypress/enter to get numpad return
        const ce = new ComputeEngine.ComputeEngine();
        output_field.innerHTML = ce.parse(input_field.value).N().valueOf();
      }
    });
    input_field.addEventListener('change',(e)=>{ // We have to hook 'change' to get regular return
      const ce = new ComputeEngine.ComputeEngine();
      output_field.innerHTML = ce.parse(input_field.value).N().valueOf();
    });

    // Insert into cell list
    var cell = new Cell(container.id,currnum,input_field,output_field,CellType.Math , "Untitled Cell");
    this.cells.push(cell);
  },

  // Create a markdown cell in the bottom slot
  CreateMarkdownCell: function(container){

    // Create Textarea Input
    var input_field = document.createElement("textarea");
    input_field.id = "markdown" + String(currnum);
    input_field.setAttribute("class","md-input");
    input_field.setAttribute("placeholder","Input Text Here...");

    // Output field for error messaging
    var output_field = document.createElement("div");
    output_field.id = "output" + String(currnum);
    output_field.setAttribute('class','md-output');

    // Attach
    var content_container = container.getElementsByClassName("cell-content")[0];
    content_container.appendChild(input_field);
    content_container.appendChild(output_field);
    this.cell_container.appendChild(container);

    // On Loss of Input Focus, Process MD to html
    input_field.addEventListener('blur',(e)=> {
      output_field.setAttribute("class","md-output");
      ParseMarkdown(container);
      input_field.setAttribute("class","md-input-hidden");

    });

    // On Input Change Grow Text Area
    input_field.addEventListener("input", (e)=> {
      var target = e.currentTarget;
      target.setAttribute("class","md-input");
      target.style.height = target.scrollHeight + "px";
      target.style.overflowY = "hidden"; // If we dont set this, height change causes scrollbar in some browsers
    });

    // Click Markdown Output To Return to Editing
    output_field.addEventListener("click", (e)=>{

      // Enable Input Field
      input_field.setAttribute("class","md-input");
      input_field.style.height = input_field.scrollHeight + "px";
      input_field.style.overflowY = "hidden";

      // Hide Output
      output_field.setAttribute("class","md-output-hidden");
    });

    // Insert into cell list
    var cell = new Cell(container.id,currnum,input_field,output_field,CellType.Markdown, "Untitled Cell");
    this.cells.push(cell);
  }
}

// Entry point
window.onload = function() {
  const add_cell_button = document.getElementById('add_cell');
  const add_md_cell_btn = document.getElementById('add_md_cell');
  const clear_button = document.getElementById('clear');

  // Get handle to markdown-it
  var md = window.markdownit();
  
  // Create Cell LIst
  const cells = Object.create(CellList);
  cells.Init(document.getElementById("cell_container"));
  cells.AddCell("math");

  // Attach base event listeners
  add_cell_button.addEventListener('click', (ev)=> {
    newcell = cells.AddCell("math")
  });

  clear_button.addEventListener('click', (e) => {
    cells.Clear();
  });

  add_md_cell_btn.addEventListener('click', (e)=>{
    newcell = cells.AddCell("md");
  });
}

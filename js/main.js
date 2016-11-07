(function() {
  var drawButton = document.querySelector(".btn-draw"),
      findPathButton = document.querySelector(".btn-find-path"),
      startSnakeButton = document.querySelector(".btn-start-snake"),
      maze;
  
  function Cell(options) {
    var elem;
    this.visited = false;
    this.type = options.type;
    
    this.getElem = function() {
      if (!elem) elem = document.createElement("div");
      return elem;
    }
        
    this.removeWall = function() {
      this.visited = true;
      this.type = Cell.SPACE_TYPE;
    }
    
    this.setPath = function() {
      elem.classList.remove("cell__space");
      elem.classList.add("cell__track");
    }
        
    this.setSnake = function(type, direction) {
      elem.className = "snake";
      if (type != "body") {
        elem.classList.add("snake__" + type);
        elem.classList.add("snake__" + type + "--" + direction);
      } 
    }
    
    this.setDefault = function() {
      elem.className = "cell";
      switch (this.type) {
        case "space":
           elem.classList.add("cell__space");
          break;
        case "wall":
          elem.classList.add("cell__wall");
          break;
      }
    }
  }
  
  Cell.SPACE_TYPE = "space";
  Cell.WALL_TYPE = "wall";
  Cell.WIDTH = 10;
  Cell.HEIGHT = 10;
  
  function Maze(options) {
    var elem,
        unvisitedCount = 0,
        steps = [],
        cells = [],
        track = [],
        timer;
    
    this.width = options.width;
    this.height = options.height;
        
    var self = this;
    
    this.getElem = function() {
      if (!elem) createElem();
      return elem;
    }
      
    function createElem() {
      elem = document.createElement("div");
      elem.className = "maze";
      self.updateSize();
    }
    
    this.updateSize = function() {
      elem.style.width = this.width * Cell.WIDTH + "px";
      elem.style.height = this.height * Cell.HEIGHT + "px";
    }
    
    this.clear = function() {
      var i;
      while (elem.hasChildNodes()) {
        elem.removeChild(elem.lastChild);
      }
    
      cells.length = 0;
      steps.length = 0;
      track.length = 0;   
      for (i = 0; i < this.height; i++) {
        cells[i] = new Array(this.width);
      }
    }
    
    function init() {
      var i, j;
      for (i = 0; i < self.height; i++) {
        for (j = 0; j < self.width; j++) {
          var cell;
          if ((i % 2 != 0 && j % 2 != 0) && (i < self.height - 1  && j < self.width - 1)) {
            cell = new Cell({
              type: Cell.SPACE_TYPE
            });
            unvisitedCount++;
          } else {
            cell = new Cell({
              type: Cell.WALL_TYPE
            });  
          }
          cells[i][j] = cell;
          elem.appendChild(cells[i][j].getElem());
        }
      }
    }
    
    function getNeighbors(x, y, distance) {
      var left = [x - distance, y],
          right = [x + distance, y],
          top = [x, y - distance],
          bottom = [x, y + distance],
          indexesAround = [left, right, top, bottom],
          neighborIndexes = [],
          i;

      for (i = 0; i < indexesAround.length; i++) {
        var neighborX = indexesAround[i][0],
            neighborY = indexesAround[i][1];

        if ((neighborX >= 0 && neighborX < self.width) && (neighborY >= 0 && neighborY < self.height)) {
            if (!cells[neighborY][neighborX].visited && cells[neighborY][neighborX].type != Cell.WALL_TYPE) {
              neighborIndexes.push(indexesAround[i]);
            }
        }
      }
      return neighborIndexes;
    }
    
    function setCellsUnvisited() {
      for (i = 0; i < self.height; i++) {
        for (var j = 0; j < self.width; j++) {
          cells[i][j].visited = false;
        }
      }
    }
    
    function updateVisitedCell(pos) {
      cells[pos.y][pos.x].visited = true;
      steps.push({
        x: pos.x,
        y: pos.y
      });
      unvisitedCount--;
    }
    
    function removeWallBetweenCells(first, second) {
      var xDiff = second.x - first.x,
          yDiff = second.y - first.y;

      var xStep = (!xDiff) ? 0 : (xDiff / Math.abs(xDiff)),
          yStep = (!yDiff) ? 0 : (yDiff / Math.abs(yDiff));

      cells[first.y + yStep][first.x + xStep].removeWall();
    }
    
    this.create = function() {
      init();
      var currentPos = {
        x: 1,
        y: 1
      };
      updateVisitedCell(currentPos);
      do {
        var neighbors = getNeighbors(currentPos.x, currentPos.y, 2);
        if (neighbors.length) {
          var neighbor = neighbors[randomInteger(0, neighbors.length - 1)];
          var newPos = {
            x:neighbor[0],
            y: neighbor[1]
          };
          removeWallBetweenCells(currentPos, newPos);
          currentPos.x = newPos.x;
          currentPos.y = newPos.y;
          updateVisitedCell(currentPos);
        } else if (steps.length) {
          currentPos = steps.pop();
        }
      } while (unvisitedCount)

      cells[this.height - 2][0].removeWall();
      cells[1][this.width - 1].removeWall();
      setDefault();
    }
    
    function setDefault(trackFlag) {
      var i, j;
      if (trackFlag) {
        for (i = 0; i < track.length; i++) {
          cells[track[i].y][track[i].x].setDefault();
        }
      } else {
        for (i = 0; i < self.height; i++) {
          for (j = 0; j < self.width; j++) {
            cells[i][j].setDefault();
          }
        }
      } 
    }
    
    function findPath() {
      setCellsUnvisited();
      var currentPos = {
        x: self.width - 1,
        y: 1
      };
            
      do {
        var neighbors = getNeighbors(currentPos.x, currentPos.y, 1);
        if (neighbors.length) {
          track.push({
            x: currentPos.x,
            y: currentPos.y
          });
          var neighbor = neighbors[randomInteger(0, neighbors.length - 1)];
          var newPos = {
            x: neighbor[0],
            y: neighbor[1]
          };
          currentPos.x = newPos.x;
          currentPos.y = newPos.y;
          cells[currentPos.y][currentPos.x].visited = true;
        } else if (track.length) {
          currentPos = track.pop();
        }
      } while (currentPos.x != 0 || currentPos.y != self.height - 2)
      
      track.push({
        x: 0,
        y: self.height - 2
      });      
    }
    
    this.drawPath = function() {
      var i;
      setDefault(true);
      if (timer) clearInterval(timer);
      if (!track.length) {
        findPath();
      }
      for (i = 0; i < track.length; i++) {
        cells[track[i].y][track[i].x].setPath();
      }
    }
    
    function getDirection(first, second) {
      if (first.x == second.x) {
        if (first.y > second.y) {
          return "top";
        } else {
          return "bottom";
        }
      } else {
        if (first.x > second.x) {
          return "left";
        } else {
          return "right";
        }
      }
    }
    
    this.animateEscape = function() {      
      var i = 0,
          headDirection = "left",
          tailDirection = "left",
          headIsVisible = false,
          firstBodyPartIsVisible = false,
          secondBodyPartIsVisible = false,
          tailIsVisible = false;
      
      setDefault(true);
      if (!track.length) {
        findPath();
      }
      if (timer) clearInterval(timer);

      timer = setInterval(function() {
        headIsVisible = i < track.length; 
        firstBodyPartIsVisible = i > 0 && i < track.length + 1;
        secondBodyPartIsVisible = i > 1 && i < track.length + 2;
        tailIsVisible = i > 2 && i < track.length + 3;
        
        if (headIsVisible) {
          if (i > 0) {
            headDirection = getDirection(track[i - 1], track[i]);
          }
          cells[track[i].y][track[i].x].setSnake("head", headDirection);
        }
        
        if (firstBodyPartIsVisible) {
          cells[track[i - 1].y][track[i - 1].x].setSnake("body"); 
        }
        
        if (secondBodyPartIsVisible) {
          cells[track[i - 2].y][track[i - 2].x].setSnake("body");
        }

        if (tailIsVisible) {
          if (i < track.length + 2) {
            if (i > 3) {
              tailDirection = getDirection(track[i - 3], track[i - 2]);       
            }
          } else {
            tailDirection = "left";
          }
          cells[track[i - 3].y][track[i - 3].x].setSnake("tail", tailDirection);
        }

        if (i > 3) {
          cells[track[i - 4].y][track[i - 4].x].setDefault();
        }
          
        if (i == track.length + 3) {
          clearInterval(timer);
        }
        
        i++;
      }, 80);
    }
  }
  
  function randomInteger(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
  }
  
  drawButton.onclick = function() {   
    var mazeHeight = parseInt(document.getElementById("field-height").value),
      mazeWidth = parseInt(document.getElementById("field-width").value);
    
    if (isNaN(mazeHeight) || isNaN(mazeWidth) || mazeHeight < 3 || mazeWidth < 3) {
      alert("Введено некорректное значение");
      return;
    } 
    
    if (!(mazeHeight % 2)) mazeHeight++;
    if (!(mazeWidth % 2)) mazeWidth++;
    
    if (!maze)  {
      maze = new Maze({
        width: mazeWidth,
        height: mazeHeight
      });
      document.body.appendChild(maze.getElem());
    } else {
      maze.width = mazeWidth;
      maze.height = mazeHeight;
      maze.updateSize();
    }
    maze.clear();
    maze.create();
  }
  
  findPathButton.onclick = function() {
    if (!maze) {
      alert("Лабиринт еще не создан");
      return;
    }
    maze.drawPath();
  }
  
  startSnakeButton.onclick = function() {
    if (!maze) {
      alert("Лабиринт еще не создан");
      return;
    }
    maze.animateEscape();
  }
})();

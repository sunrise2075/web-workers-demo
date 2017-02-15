(function(){
  // http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
  var original;
  var imageLoader = document.querySelector('#imageLoader');
  imageLoader.addEventListener('change', handleImage, false);
  var canvas = document.querySelector('#image');
  var ctx = canvas.getContext('2d');

  //add my worker
  var myWorker;
  if (window.Worker) {
    myWorker = new Worker('./scripts/worker.js');
  } ;
  //my worker definition done

  function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img,0,0);
        original = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  }

  // greys out the buttons while manipulation is happening
  // un-greys out the buttons when the manipulation is done
  function toggleButtonsAbledness() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].hasAttribute('disabled')) {
        buttons[i].removeAttribute('disabled')
      } else {
        buttons[i].setAttribute('disabled', null);
      }
    };
  }

  function manipulateImage(type) {
    var a, b, g, i, imageData, j, length, pixel, r, ref;
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    toggleButtonsAbledness();

  	myWorker.postMessage({
        "type":"invert",
        "imageData": imageData
  	});

    // Hint! This is where you should post messages to the web worker and
    // receive messages from the web worker.
    myWorker.onmessage = function(e){
    	
    	var imageData = e.data;
    	if (imageData) {
    		ctx.putImageData(imageData, 0, 0);
    	} 
    };

    myWorker.onerror = function(){
    	throw "Worker Exception";
    };

    toggleButtonsAbledness();
    return ctx.putImageData(imageData, 0, 0);
  };

  function revertImage() {
    return ctx.putImageData(original, 0, 0);
  }

  document.querySelector('#invert').onclick = function() {
  	  //post message to my worker
  	  manipulateImage("invert");
  };
  document.querySelector('#chroma').onclick = function() {
  	 //post message to my worker
  	  manipulateImage("chroma");  
  };
  document.querySelector('#greyscale').onclick = function() {
  	 //post message to my worker
  	 manipulateImage("greyscale");
  };
  document.querySelector('#vibrant').onclick = function() {
  	 //post message to my worker
  	 manipulateImage("vibrant");
  };
  document.querySelector('#revert').onclick = function() {
    revertImage();
  };
})();
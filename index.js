dialogName = '';  // last dialog name

onLoaded = function(){
  setTimeout(() => {
    document.getElementById('logo-slide').style.height='420px';
  },3000);
}

openDialog = function(tileName) {
  dialog = document.getElementById(tileName);
  dialogName = tileName;
  if (dialog){
    dialog.style.display = 'block';
    setTimeout(() => {
      dialog.style.opacity = 1;
      dialog.children[0].style.maxHeight = '100%';      
      ms.onResize();
    });
    setTimeout(() =>{
      ms.onResize();
    }, 10);
    
  }else{
    console.error('dialog ' + tileName + 'not found');
  }
}

closeDialog = function() {
  dialog = document.getElementById(dialogName);
  if (dialog){
    dialog.style.opacity = null;
    dialog.children[0].style.maxHeight = null;
    dialog.style.display = 'block';
    setTimeout(() => {
      dialog.style.display = 'none';
    }, 200);
    
  }else{
    console.error('dialog ' + tileName + 'not found');
  }
}








setTimeout(onLoaded);

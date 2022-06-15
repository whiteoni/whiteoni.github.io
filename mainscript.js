/** 11/01/2017  Bianconi Fabio
   Object oriented

*/
ms = {
   i18nLanguage: localStorage.getItem("i18nLanguage") || "it",
   i18nDictionary: JSON.parse(localStorage.getItem("i18n")) || {},
   i18nScope: [],  // lista oggetti da aggiornare
   i18nLoading: false,
   i18nDays: [],
   
   dateNow: new Date(),
   dateToday: null,
   dateTomorrow: null,

   viewMode: 'm', // d-esktop or m-obile
   canChangeView: false,
   topbarVueObject: null,

   userLogged: null, // {id, userName, firstName}
   idPopupLogin: 0,

   topbarColor: null,

   setTopbar: function(vueObject){
      this.topbarVueObject = vueObject;
   },

   /**
    * imposta il classlist invert-color-img a seconda che l'icona debba essere nera o bianca e il colore del testo
    * @param {*} el DOMElement
    * @param {*} bg il colore di sfondo
    * @returns il colore usato
    */
   setIconColorFromBg(el, bg = '#ff8c00'){
      let color = parseInt(bg.substr(1,2), 16)*0.2 + parseInt(bg.substr(3,2), 16)*0.8 + parseInt(bg.substr(5,2), 16)*0.114 < 186;
      if (color){
         color = '#ffffff';
         el.classList.add('invert-color-img');
      }else{
         color = '#0f0f0f';
         el.classList.remove('invert-color-img');
      }
      el.style.color = color;
   },
   /**
    * imposta il bgcolor di un elemento e imposta le scritte con il contrasto, chiama setIconColorFromBg
    * @param {*} el  DOMElement
    * @param {*} bg il colore di sfondo
    */
   setBgcolor(el, bg = '#ff8c00'){
      this.setIconColorFromBg(el, bg);
      el.style.background = bg;
   },
   setTopbarColor: function(bg = '#ff8c00'){
      console.log('topbar color: ', bg );
      this.topbarColor = bg;
      var cols = document.getElementsByClassName('topBarBackground');
      for(i = 0; i < cols.length; i++) {
         this.setBgcolor(cols[i], bg);
      }   
   },

   /* ITERATIONS */

   onResize(){
      if (window.innerWidth > 1200)  
         ms.viewMode = 'd';  // desktop
      else if(window.innerWidth > 800)
         ms.viewMode = 't';  // tablet
      else if(window.innerWidth > 400)
         ms.viewMode = 'm';  // mobile
      else
        ms.viewMode = 'c';   // clock
      
        var els = document.getElementsByClassName('view-scalable')
        for (var el of els){
          var scale = 1;
          switch (ms.viewMode){
            default:
            case 'd':
            case 't':     
              var scale = 1;               
              break;
            case 'm':
              var scale = 0.8;          
              break;  
            case 'c':          
              var scale = 0.5;
              break;
         }
         if (scale == 1){
            el.style.margin = '0px';
            el.style.transform = null;
         }else{
            el.style.transform = 'scale(' + scale + ', ' + scale + ')';
            el.style.margin = '-' + ((el.clientHeight - (el.clientHeight*scale))/2)  + 'px ' + 
                              '-' +  ((el.clientWidth  - (el.clientWidth*scale) )/2) + 'px';
         }          
      }
   },

   onScroll(){
      var els = document.getElementsByClassName('show-onscroll');
      var delay = 0;
      for (var el of els){
         if(el.getBoundingClientRect().top - 50 < window.innerHeight &&
            !el.classList.contains('show-scrolled')
         ){
            el.classList.add('show-scrolled');
            el.style.transitionDelay = delay + 'ms';
            delay += 100;            
         }
      }
   },
   

   /* API */

   /**
    * navigate to a new website page
    * @param url url of page
    * @param method as post(default) / get etc.
    * @param params an object
    */
   navigate: function(url, method = "post", params = null){   
      // The rest of this code assumes you are not using a library.
      // It can be made less wordy if you use one.
      var form = document.createElement("form");
      form.setAttribute("method", method);
      form.setAttribute("action", url);
      
      if(params){
         for(var key in params) {
            if(params.hasOwnProperty(key)) {
               var hiddenField = document.createElement("input");
               hiddenField.setAttribute("type", "hidden");
               hiddenField.setAttribute("name", key);
               hiddenField.setAttribute("value", params[key]);

               form.appendChild(hiddenField);
            }
         }
      }


      document.body.appendChild(form);
      form.submit();
   },



   /* Toast */

   showErrorToast: function(code, message){
      div = document.createElement('div');
      div.className = "toast-error";
      div.innerHTML = '<span class="fw-600"> ERROR ' + code + ' </span> ' + message;
      document.getElementById("main").appendChild(div);
   },

   stringToDate: function(value){
      if (value){
         var date = new Date(value);
         date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
         return date;
      }else{
         return null;
      }
   },

   /**
    * 
    * @param {*} date La data
    * @param {*} format il formato con tipi 'YYYY-MM-DD' p.e.
    * tipi ammessi:
    * 'Y' | 'y' : year as is
    * 'YY' | 'yy' : last 2 digits
    * 'YYYY' | 'yyyy' : at least 4 digits for year
    * 'M' : month
    * 'MM' : month at least 2 digits
    * 'MMM' : month name 3 char abrevation
    * 'MMMM' : full month name 
    * 'D' | 'd' : day  
    * 'DD' | 'dd' : day with 2 digits
    * 'DDD' | 'ddd' : day of week abrevation
    * 'DDDD' | 'dddd' : full day of week 
    * 'h' : hour
    * 'hh' : hour at least 2 digits
    * 'm' : minutes
    * 'mm' : minutes at least 2 digits
    * 's': seconds
    * 'ss' : seconds at least 2 digits
    */
   dateToString: function(date, format){
      date = date || ms.dateNow;
      var outputString = '';
      var indexFormat = 0;
      var currentType = null;
      while(indexFormat < format.length+1){
         if (currentType){
            if (indexFormat < format.length && format[indexFormat] == currentType[0]){  
               currentType += currentType[0];
            }else{  // trovato il type
               switch (currentType){
                  case 'Y': case 'y': // year as is
                     outputString += date.getYear();
                     break;
                  case 'YY': case 'yy': // last 2 digits
                     var num = '0' + date.getYear();
                     num = num.substring(num.length-2);
                     outputString += num;
                     break;
                  case 'YYYY': case 'yyyy': // at least 4 digits for year
                     var num = 1900 + date.getYear();
                     outputString += num;
                     break;
                  case 'M': // month
                     outputString += (date.getMonth()+1);
                     break;
                  case 'MM': // month at least 2 digits
                     var num = '0' + (date.getMonth()+1);
                     num = num.substring(num.length-2);
                     outputString += num;
                     break;
                  case 'MMM': // month name 3 char abrevation
                     outputString += 'XXX';
                     break;
                  case 'MMMM': // full month name 
                     outputString += 'Xxxx';
                     break;
                  case 'D': case 'd': // day  
                     outputString += date.getDate();
                     break;
                  case 'DD': case 'dd': // day with 2 digits
                     var num = '0' + date.getDate();
                     num = num.substring(num.length-2);
                     outputString += num;
                     break;
                  case 'DDD': case 'ddd': // day of week abrevation
                  case 'DDDD': case 'dddd': // full day of week 
                     if (ms.i18nDictionary[ms.i18nLanguage]['SUNDAY'] != ms.i18nDays[0]){
                        ms.i18nDays = [ms.i18n('SUNDAY'), ms.i18n('MONDAY'), ms.i18n('TUESDAY'), ms.i18n('WEDNESDAY'), ms.i18n('THURSDAY'), ms.i18n('FRIDAY'), ms.i18n('SATURDAY')];
                     }
                     var dayString = ms.i18nDays[date.getDay()];
                     if (currentType.length === 3){
                        outputString += dayString.substring(0, 3);
                     }else{
                        outputString += dayString;
                     }
                     break;
                  case 'h' : // hour
                     outputString += date.getHours();
                     break;
                  case 'hh' : // hour at least 2 digits
                     var num = '0' + date.getHours();
                     num = num.substring(num.length-2);
                     outputString += num;
                     break;
                  case 'm' : // minutes
                     outputString += date.getMinutes()
                     break;
                  case 'mm' : // minutes at least 2 digits
                     var num = '0' + date.getMinutes();
                     num = num.substring(num.length-2);
                     outputString += num;
                     break;
                  case 's': // seconds
                     outputString += date.getSeconds()
                     break;
                  case 'ss' : // seconds at least 2 digits
                     var num = '0' + date.getSeconds();
                     num = num.substring(num.length-2);
                     outputString += num;
                     break;
                  default:
                     console.error('Code not valid: ' + currentType);
               }
               indexFormat --;
               currentType = null;
            }
         }else if (indexFormat < format.length){  // nuovo current type 'M' 'D'
            currentType = format[indexFormat];
            if (currentType != 'Y' && currentType != 'y'
             && currentType != 'M'
             && currentType != 'D' && currentType != 'd'
             && currentType != 'h'
             && currentType != 'm'
             && currentType != 's'){
               outputString += currentType;
               currentType = null;
            }
         }
         indexFormat ++;
      }
      return outputString;
   }
}

/*ms.i18nSetLanguage(ms.i18nLanguage);
ms.i18nDays[ms.i18n('SUNDAY'), ms.i18n('MONDAY'), ms.i18n('TUESDAY'), ms.i18n('WEDNESDAY'), ms.i18n('THURSDAY'), ms.i18n('FRIDAY'), ms.i18n('SATURDAY')];
*/
ms.dateToday = new Date(ms.dateNow.getYear()+1900, ms.dateNow.getMonth(), ms.dateNow.getDate());
ms.dateTomorrow = new Date(ms.dateNow.getYear()+1900, ms.dateNow.getMonth(), ms.dateNow.getDate()+1);
Date.prototype.toJSON = function(){ var string = this.toISOString().replace('T', ' '); return string.substring(0,string.length-1); }

ms.viewMode = localStorage.getItem('viewMode');
window.addEventListener("resize", ms.onResize);
window.addEventListener("scroll", ms.onScroll);

setTimeout(() => {
   ms.onResize();
   ms.onScroll();
}, 500)


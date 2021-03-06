define(['dojo/_base/declare',
"jimu/WidgetManager",
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'jimu/BaseWidget',
  'esri/graphic',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  "esri/SpatialReference",
  'esri/layers/GraphicsLayer',
  'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
  'jimu/loaderplugins/jquery-loader!https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js'],
function(declare, WidgetManager,lang, html, array, on, BaseWidget, Graphic,Query, QueryTask,SpatialReference,GraphicsLayer,Vue,$) {
  return declare([BaseWidget], {

    baseClass: 'jimu-widget-dsp',
    ServiceUrl: 'http://services.arcgis.com/XTtANUDT8Va4DLwI/ArcGIS/rest/services/NZBrewLocation/FeatureServer/0',
    graphic_layer:null,
    initExtent:null,
    vueInstance:null,

    startup: function() {
        
    },
    onOpen: function(){
      console.log('onOpen');
      // this.graphic_layer = new GraphicsLayer();
      // this.map.addLayer(this.graphic_layer);

      this.vueInstance = this.createAndBindingVue();
      var btnNode = document.getElementById('searchBtn');
      this.own(on(btnNode, 'click', lang.hitch(this, this.querybeerhander, null)));
    },
    querybeerhander:function () {      
      var arr = [];
      var searchOpt = "Brewery like '%" + $("#searchInput").val() + "%'";

      var queryTask = new QueryTask(this.ServiceUrl);
      var query = new Query();

      query.where = "Brewery like '%" + 'Brewery' + "%'";
      query.returnGeometry = true;
      query.outFields = ["*"];
      
      queryTask.execute(query).then(function(results){  
        
        var res = results.features;
        var symbol_ = {
          type: "simple-marker", 
          style: "square",
          color: "red",
          size: "12px",
          outline: { 
              color: [ 245, 249, 0,0.8 ],
              width: 0
          }
        };

        $.each(res,function(idx,val){
            var gra = new Graphic({
                geometry:val.geometry,
                symbol:symbol_,
                attributes: val.attributes
            });                        
            arr.push(gra);        
                      
        });    
        
        var widget =  WidgetManager.getInstance();
        var vue_ = widget.activeWidget.vueInstance;
        vue_.collection = arr;
      });
    },
    
    createAndBindingVue:function(){
      return new Vue({
        el:'#app',
        data:{
          collection:[],
          page:{
              total:0,
              current:1,
              perpagecount:8
          },
          mouse:{
              mouseonitem:false,
          },
          item:{
              listStyle:'none',
              cursor: 'pointer',
              height: '50px',
              lineHeight: '50px',
              margin: '0px',
              textAlign: 'center',
              fontSize:'15px'
          },
          pageitem:{
              display: 'inline-box',
              listStyle: 'none',
              margin: '0px',
              float: 'left',
              backgroundColor:'#0059ff',
              color:'#e6eeed',
              width:'20px',
              textAlign:'center',
              cursor:'pointer',
              textDecoration:'underline',
              fontWeight:'bold',
              marginRight:'5px'

          },
          signal:'signal',
          double:'double'
        },
        methods:{
          cleariconhander:function(){
            var widget =  WidgetManager.getInstance().activeWidget;
            var vue_ = widget.vueInstance;
            var map_ = widget.map;
            // map_.graphics.clear();
            vue_.collection = [];
          },
          locateposition:function(event){
              var gra = {};
              var name = $.trim(event.currentTarget.innerHTML);

              for(var i = 0;i < this.collection.length;i++){
                  if(this.collection[i].attributes.Brewery == name){
                      gra = this.collection[i];                       
                  }
              }

              var center = gra.geometry;
              var map_ = WidgetManager.getInstance().map;
              map_.centerAndZoom(center, 7);
          },
          pagejump:function(event){
              var page = parseInt($.trim(event.currentTarget.innerHTML));
              var par = {
                  graphicArr:this.collection,
                  from: (this.page.perpagecount * (page - 1) + 1),
                  count: this.page.perpagecount
              };

              var widget =  WidgetManager.getInstance();
              var vue_ = widget.activeWidget.vueInstance;
              // vue_.DrawFeature(par.graphicArr,par.from,par.count);
              vue_.page.current = page;
          },
          symbolpoint:function(event){
              var gra = {};
              var li_ = event.currentTarget;
              var name = $.trim(li_.innerHTML);

              for(var i = 0;i < this.collection.length;i++){
                  if(this.collection[i].attributes.Brewery == name){
                      gra = this.collection[i];
                      
                  }else{
                      this.collection[i].symbol = {
                        type: "simple-marker", 
                        style: "square",
                        color: "red",
                        size: "12px",
                        outline: { 
                            color: [ 245, 249, 0,0.8 ],
                            width: 0
                        }
                    }
                  }
              }
              gra.symbol = {
                type: "simple-marker", 
                style: "square",
                color: "red",
                size: "12px",
                outline: { 
                    color: [ 245, 249, 0,0.8 ],
                    width: 3
                }
              };
              
              li_.style.opacity = "0.7";  
          },
          mouseOnItemHander:function(event){              
              var li_ = event.currentTarget;
              li_.style.opacity = "0.7";             
          },
          mouseOutItemHander:function(event){
              var li_ = event.currentTarget;
              li_.style.opacity = "1";
          },
          DrawFeature:function(graphicArr,from,count){
            var widget =  WidgetManager.getInstance().activeWidget;
            var map_ = widget.map;
            map_.graphics.clear();
            var arr_ = graphicArr.slice(from,from + count);
            $(arr_).each(function(idx,gra){
              map_.graphics.add(gra);
            });
          }
        },
        watch:{
          collection:function(arr){
            var widget =  WidgetManager.getInstance();
            var vue_ = widget.activeWidget.vueInstance;
            if(vue_.collection.length > 0){
              vue_.page.total = parseInt(vue_.collection.length / vue_.page.perpagecount) + 1;
              vue_.page.current = 1;
                
              // vue_.DrawFeature(vue_.collection,0,vue_.page.perpagecount);
            }else{
              vue_.page.total = 0;
              vue_.page.current = 0;
            }
          }
        }
      });
    },
  });
});
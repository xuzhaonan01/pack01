/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";
import MapView = require("esri/views/MapView");
import Extent = require("esri/geometry/Extent");
import Graphic = require("esri/Graphic");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");



const CSS = {
    custom1:''
};

@subclass("esri.widgets.FindBeerWidget")
class FindBeerWidget extends declared(Widget){
    @property()
    @renderable()
    view: MapView = new MapView();

    @property()
    @renderable()
    extent!: Extent ;

    @property()
    @renderable()
    graphicsLayer!: GraphicsLayer;

    @property()
    @renderable()
    simpleMarkerSymbol!: SimpleMarkerSymbol;

    @property()
    @renderable()
    identifyMarkerSymbol!: SimpleMarkerSymbol;

    @property()
    @renderable()
    searchUrl:string = "";

    @property()
    @renderable()
    searchTxt:string ="Brewery";

    @property()
    @renderable()
    itemList:Array<Graphic> = [];

    constructor(){
        super();
        //binding widget object instance on buttton
        this.searchBtnCilckHandler = this.searchBtnCilckHandler.bind(this);
    }

    //search button click handle
    public searchBtnCilckHandler(){
        var ele = document.getElementById('searchInput') as HTMLInputElement;
        var olElement = document.getElementById('list') as HTMLOListElement;
        olElement.innerHTML = '';
        this.itemList = [];
        this.graphicsLayer.graphics.removeAll();

        var searchTxt = ele.value;
        var instance_ = this;
        var sms = this.simpleMarkerSymbol;
        this.view.extent = new Extent(this.extent);
        this.view.zoom = 2;
        var searchOpt = "UPPER(Brewery) like UPPER('%" + searchTxt + "%')";

        var queryTask = new QueryTask({
            url: this.searchUrl
        });

        var query = new Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = searchOpt; 

        queryTask.execute(query).then(function(results){
            
            var features = results.features;
            var symbol_ = sms;


            for(var i = 0; i < features.length; i++){
                var f = features[i];
                var gra = new Graphic({
                    geometry:f.geometry,
                    symbol:symbol_,
                    attributes: f.attributes
                });                        
                instance_.itemList.push(gra);   
                instance_.graphicsLayer.add(gra);
            }     
            instance_.AddItemToList();           
        });
    }
    
    //add element to the list of result table
    public AddItemToList(){
        var features = this.itemList;
        var olElement = document.getElementById('list') as HTMLOListElement;
        var instance_ = this;
        var add = (nodeValue:string,idx:number) =>{
            var styleStr = "";
            styleStr = i % 2 == 0? 'signal' : 'double';
            var li = document.createElement("li");
            li.setAttribute("class",styleStr);
            li.innerHTML = nodeValue;
            li.addEventListener("click",function(evt){
                var ele = evt.currentTarget as HTMLLIElement;
                var gra_;
                var name = instance_.trim(ele.innerHTML);

                var locate = (view:MapView,gra:Graphic,lvl:number) =>{
                    var center = gra.geometry;
                    view.zoom = lvl;
                    view.goTo(center);
                };

                for(var i = 0; i < instance_.itemList.length;i++){
                    if(instance_.itemList[i].attributes.Brewery == name){
                        gra_ = instance_.itemList[i];
                        gra_.symbol = instance_.identifyMarkerSymbol;
                        locate(instance_.view,gra_,7);
                    }else{
                        instance_.itemList[i].symbol = instance_.simpleMarkerSymbol;
                    }
                }
            });

            li.addEventListener("mouseover",function(evt){
                var li_ = evt.currentTarget as HTMLLIElement;
                var name = instance_.trim(li_.innerHTML);
                var renderPoint = (str:string) =>{
                    for(var i = 0; i < instance_.itemList.length;i++){
                        if(instance_.itemList[i].attributes.Brewery == str){
                            instance_.itemList[i].symbol = instance_.identifyMarkerSymbol;
                        }else{
                            instance_.itemList[i].symbol = instance_.simpleMarkerSymbol;
                        }
                    }
                };
                renderPoint(name);
                li_.style.opacity = "0.7";   
            });

            li.addEventListener("mouseout",function(evt){
                var li_ = evt.currentTarget as HTMLLIElement;
                li_.style.opacity = "1";   
            });
            olElement.append(li);
        };
        for(var i = 0; i < features.length;i++){
            add(features[i].attributes.Brewery,i);
        }
    }
    //trim left and right whitespace and tab option
    private trim(str:string){  
        return this.trimRight(this.trimLeft(str));  
    }  
    //trim left
    private trimLeft(s:string){  
        if(s == null) {  
            return "";  
        }  
        var whitespace = " \t\n\r";
        var str = s;
        if (whitespace.indexOf(str.charAt(0)) != -1) {  
            var j=0, i = str.length;  
            while (j < i && whitespace.indexOf(str.charAt(j)) != -1){  
                j++;  
            }  
            str = str.substring(j, i);  
        }  
        return str;  
    }  
    
    //trim right
    private trimRight(s:string){  
        if(s == null) return "";  
        var whitespace = " \t\n\r";
        var str = s;
        if (whitespace.indexOf(str.charAt(str.length-1)) != -1){  
            var i = str.length - 1;  
            while (i >= 0 && whitespace.indexOf(str.charAt(i)) != -1){  
               i--;  
            }  
            str = str.substring(0, i+1);  
        }  
        return str;  
    }    

    render() {
        return (  
            <div id='controlPanel' class="esri-widget">
                <div id="searchDiv">
                    <p style="font:15px solid">search by Brewery Name</p>
                    <input id="searchInput" style="width:200px"  value="Brewery"></input>
                    <button id="searchBtn" onclick={this.searchBtnCilckHandler}>Find</button>
                </div>
                <div id='list' style="height:480px;width:100%;background-color: rgb(230, 219, 219);overflow-y: auto">

                </div>
            </div>
        );
    }
    //dynamic map service url setting
    public BindUrl(url:string){
        this.searchUrl = url;
    }
}

export = FindBeerWidget;
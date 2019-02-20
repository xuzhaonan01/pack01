/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/views/MapView", "esri/geometry/Extent", "esri/Graphic", "esri/tasks/QueryTask", "esri/tasks/support/Query"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, MapView, Extent, Graphic, QueryTask, Query) {
    "use strict";
    var CSS = {
        custom1: ''
    };
    var FindBeerWidget = /** @class */ (function (_super) {
        __extends(FindBeerWidget, _super);
        function FindBeerWidget() {
            var _this = _super.call(this) || this;
            _this.view = new MapView();
            _this.searchUrl = "";
            _this.searchTxt = "Brewery";
            _this.itemList = [];
            //binding widget object instance on buttton
            _this.searchBtnCilckHandler = _this.searchBtnCilckHandler.bind(_this);
            return _this;
        }
        //search button click handle
        FindBeerWidget.prototype.searchBtnCilckHandler = function () {
            var ele = document.getElementById('searchInput');
            var olElement = document.getElementById('list');
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
            queryTask.execute(query).then(function (results) {
                var features = results.features;
                var symbol_ = sms;
                for (var i = 0; i < features.length; i++) {
                    var f = features[i];
                    var gra = new Graphic({
                        geometry: f.geometry,
                        symbol: symbol_,
                        attributes: f.attributes
                    });
                    instance_.itemList.push(gra);
                    instance_.graphicsLayer.add(gra);
                }
                instance_.AddItemToList();
            });
        };
        //add element to the list of result table
        FindBeerWidget.prototype.AddItemToList = function () {
            var features = this.itemList;
            var olElement = document.getElementById('list');
            var instance_ = this;
            var add = function (nodeValue, idx) {
                var styleStr = "";
                styleStr = i % 2 == 0 ? 'signal' : 'double';
                var li = document.createElement("li");
                li.setAttribute("class", styleStr);
                li.innerHTML = nodeValue;
                li.addEventListener("click", function (evt) {
                    var ele = evt.currentTarget;
                    var gra_;
                    var name = instance_.trim(ele.innerHTML);
                    var locate = function (view, gra, lvl) {
                        var center = gra.geometry;
                        view.zoom = lvl;
                        view.goTo(center);
                    };
                    for (var i = 0; i < instance_.itemList.length; i++) {
                        if (instance_.itemList[i].attributes.Brewery == name) {
                            gra_ = instance_.itemList[i];
                            gra_.symbol = instance_.identifyMarkerSymbol;
                            locate(instance_.view, gra_, 7);
                        }
                        else {
                            instance_.itemList[i].symbol = instance_.simpleMarkerSymbol;
                        }
                    }
                });
                li.addEventListener("mouseover", function (evt) {
                    var li_ = evt.currentTarget;
                    var name = instance_.trim(li_.innerHTML);
                    var renderPoint = function (str) {
                        for (var i = 0; i < instance_.itemList.length; i++) {
                            if (instance_.itemList[i].attributes.Brewery == str) {
                                instance_.itemList[i].symbol = instance_.identifyMarkerSymbol;
                            }
                            else {
                                instance_.itemList[i].symbol = instance_.simpleMarkerSymbol;
                            }
                        }
                    };
                    renderPoint(name);
                    li_.style.opacity = "0.7";
                });
                li.addEventListener("mouseout", function (evt) {
                    var li_ = evt.currentTarget;
                    li_.style.opacity = "1";
                });
                olElement.append(li);
            };
            for (var i = 0; i < features.length; i++) {
                add(features[i].attributes.Brewery, i);
            }
        };
        //trim left and right whitespace and tab option
        FindBeerWidget.prototype.trim = function (str) {
            return this.trimRight(this.trimLeft(str));
        };
        //trim left
        FindBeerWidget.prototype.trimLeft = function (s) {
            if (s == null) {
                return "";
            }
            var whitespace = " \t\n\r";
            var str = s;
            if (whitespace.indexOf(str.charAt(0)) != -1) {
                var j = 0, i = str.length;
                while (j < i && whitespace.indexOf(str.charAt(j)) != -1) {
                    j++;
                }
                str = str.substring(j, i);
            }
            return str;
        };
        //trim right
        FindBeerWidget.prototype.trimRight = function (s) {
            if (s == null)
                return "";
            var whitespace = " \t\n\r";
            var str = s;
            if (whitespace.indexOf(str.charAt(str.length - 1)) != -1) {
                var i = str.length - 1;
                while (i >= 0 && whitespace.indexOf(str.charAt(i)) != -1) {
                    i--;
                }
                str = str.substring(0, i + 1);
            }
            return str;
        };
        FindBeerWidget.prototype.render = function () {
            return (widget_1.tsx("div", { id: 'controlPanel', class: "esri-widget" },
                widget_1.tsx("div", { id: "searchDiv" },
                    widget_1.tsx("p", { style: "font:15px solid" }, "search by Brewery Name"),
                    widget_1.tsx("input", { id: "searchInput", style: "width:200px", value: "Brewery" }),
                    widget_1.tsx("button", { id: "searchBtn", onclick: this.searchBtnCilckHandler }, "Find")),
                widget_1.tsx("div", { id: 'list', style: "height:480px;width:100%;background-color: rgb(230, 219, 219);overflow-y: auto" })));
        };
        //dynamic map service url setting
        FindBeerWidget.prototype.BindUrl = function (url) {
            this.searchUrl = url;
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "view", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "extent", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "graphicsLayer", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "simpleMarkerSymbol", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "identifyMarkerSymbol", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "searchUrl", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "searchTxt", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FindBeerWidget.prototype, "itemList", void 0);
        FindBeerWidget = __decorate([
            decorators_1.subclass("esri.widgets.FindBeerWidget")
        ], FindBeerWidget);
        return FindBeerWidget;
    }(decorators_1.declared(Widget)));
    return FindBeerWidget;
});
//# sourceMappingURL=FindBeerWidget.js.map
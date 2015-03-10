//    	xiNET Interaction Viewer
//    	Copyright 2013 Rappsilber Laboratory
//
//    	This product includes software developed at
//    	the Rappsilber Laboratory (http://www.rappsilberlab.org/).
//		
//		RNA.js		
//
//		authors: Colin Combe

"use strict";

var Interactor = require('./Interactor');
var Config = require('../../controller/Config');

RNA.prototype = new Interactor();

function RNA(id, xlvController, json, name) {
    this.id = id; // id may not be accession (multiple Segments with same accesssion)
    this.controller = xlvController;
    this.json = json;  
    //links
    this.naryLinks = d3.map();
    this.binaryLinks = d3.map();
    this.selfLink = null;
    this.sequenceLinks = d3.map();

    this.name = name;
    // layout info
    this.x = 40;
    this.y = 40;
    this.rotation = 0;
    this.previousRotation = this.rotation;
    this.stickZoom = 1;
    this.form = 0;//null; // 0 = blob, 1 = stick
    this.isParked = false;
    this.isSelected = false;
    
    this.size = 10;//hack, layout is using this
       
     /*
     * Upper group
     * svg group for elements that appear above links
	 */
     
    this.upperGroup = document.createElementNS(Config.svgns, "g");
    this.upperGroup.setAttribute("class", "protein upperGroup");
    
    //for polygon
 	var points = "0, -10  10, 0 0, 10 -10, 0";
 	//make highlight
    this.highlight = document.createElementNS(Config.svgns, "polygon");
    this.highlight.setAttribute("points", points);
    this.highlight.setAttribute("stroke", Config.highlightColour);
	this.highlight.setAttribute("stroke-width", "5");   
    this.highlight.setAttribute("fill", "none");   
    //this.highlight.setAttribute("fill-opacity", 1);   
    //attributes that may change
    d3.select(this.highlight).attr("stroke-opacity", 0);
	this.upperGroup.appendChild(this.highlight);   

    //svg groups for self links
//    this.intraLinksHighlights = document.createElementNS(Config.svgns, "g");
//    this.intraLinks = document.createElementNS(Config.svgns, "g");
//    this.upperGroup.appendChild(this.intraLinksHighlights);
//	this.upperGroup.appendChild(this.intraLinks);    
    
    //create label - we will move this svg element around when protein form changes
    this.labelSVG = document.createElementNS(Config.svgns, "text");
    this.labelSVG.setAttribute("text-anchor", "end");
    this.labelSVG.setAttribute("fill", "black")
    this.labelSVG.setAttribute("x", 0);
    this.labelSVG.setAttribute("y", 10);
    this.labelSVG.setAttribute("class", "protein xlv_text proteinLabel");
    this.labelSVG.setAttribute('font-family', 'Arial');
    this.labelSVG.setAttribute('font-size', '16');
    
    this.labelText = this.name;
    this.labelTextNode = document.createTextNode(this.labelText);
    this.labelSVG.appendChild(this.labelTextNode);
    d3.select(this.labelSVG).attr("transform", 
		"translate( -" + (15) + " " + Interactor.labelY + ")");
    this.upperGroup.appendChild(this.labelSVG);
   	 
	//make blob
	this.outline = document.createElementNS(Config.svgns, "polygon");
	this.outline.setAttribute("points", points);
   
    this.outline.setAttribute("stroke", "black");
    this.outline.setAttribute("stroke-width", "1");
    d3.select(this.outline).attr("stroke-opacity", 1).attr("fill-opacity", 1)
			.attr("fill", "#ffffff");
    //append outline
    this.upperGroup.appendChild(this.outline);

    // events
    var self = this;
    //    this.upperGroup.setAttribute('pointer-events','all');
    this.upperGroup.onmousedown = function(evt) {
		self.mouseDown(evt);
    };
    this.upperGroup.onmouseover = function(evt) {
		self.mouseOver(evt);
    };
    this.upperGroup.onmouseout = function(evt) {
		self.mouseOut(evt);
    };
     
    this.upperGroup.ontouchstart = function(evt) {
		self.controller.message("protein touch start");
		self.touchStart(evt);
    };
    this.isSelected = false;
};

RNA.prototype.setForm = function(form, svgP) {
};

module.exports = RNA;

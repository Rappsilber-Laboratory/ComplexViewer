import {Interactor} from "./interactor";
import {svgns, highlightColour, LABEL_Y} from "../../config";

RNA.prototype = new Interactor();

export function RNA(id, app, json, name) {
    this.id = id; // id may not be accession (multiple Segments with same accession)
    this.app = app;
    this.json = json;
    //links
    this.naryLinks = new Map();
    this.binaryLinks = new Map();
    this.selfLink = null;
    this.sequenceLinks = new Map();

    this.name = name;
    // layout info
    this.cx = 40;
    this.cy = 40;

    /*
     * Upper group
     * svg group for elements that appear above links
     */

    this.upperGroup = document.createElementNS(svgns, "g");
    this.upperGroup.setAttribute("class", "upperGroup");

    //for polygon
    const points = "0, -10  10, 0 0, 10 -10, 0";
    //make highlight
    this.highlight = document.createElementNS(svgns, "polygon");
    this.highlight.setAttribute("points", points);
    this.highlight.setAttribute("stroke", highlightColour);
    this.highlight.setAttribute("stroke-width", "5");
    this.highlight.setAttribute("fill", "none");
    //this.highlight.setAttribute("fill-opacity", 1);
    //attributes that may change
    this.highlight.setAttribute("stroke-opacity", 0);
    this.upperGroup.appendChild(this.highlight);

    //create label - we will move this svg element around when protein form changes
    this.labelSVG = document.createElementNS(svgns, "text");
    this.labelSVG.setAttribute("text-anchor", "end");
    this.labelSVG.setAttribute("fill", "black");
    this.labelSVG.setAttribute("x", "0");
    this.labelSVG.setAttribute("y", "10");
    this.labelSVG.setAttribute("class", "xlv_text proteinLabel");
    this.labelSVG.setAttribute("font-family", "Arial");
    this.labelSVG.setAttribute("font-size", "16");

    this.labelText = this.name;
    this.labelTextNode = document.createTextNode(this.labelText);
    this.labelSVG.appendChild(this.labelTextNode);
    this.labelSVG.setAttribute("transform",
        "translate( -" + (15) + " " + LABEL_Y + ")");
    this.upperGroup.appendChild(this.labelSVG);

    //make blob
    this.outline = document.createElementNS(svgns, "polygon");
    this.outline.setAttribute("points", points);

    this.outline.setAttribute("stroke", "black");
    this.outline.setAttribute("stroke-width", "1");
    this.outline.setAttribute("stroke-opacity", "1");
    this.outline.setAttribute("fill-opacity", "1");
    this.outline.setAttribute("fill", "#ffffff");
    //append outline
    this.upperGroup.appendChild(this.outline);

    // events
    const self = this;
    //    this.upperGroup.setAttribute('pointer-events','all');
    this.upperGroup.onmousedown = function (evt) {
        self.mouseDown(evt);
    };
    this.upperGroup.onmouseover = function (evt) {
        self.mouseOver(evt);
    };
    this.upperGroup.onmouseout = function (evt) {
        self.mouseOut(evt);
    };
    this.upperGroup.ontouchstart = function (evt) {
        self.touchStart(evt);
    };

}

/*
RNA.prototype.showData = function(evt) {
    const url = "http://rnacentral.org/rna/" + this.json.identifier.id;
    window.open(url, '_blank');
}
*/
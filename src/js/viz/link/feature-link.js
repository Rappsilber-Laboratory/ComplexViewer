import {Link} from "./link";
import {svgns, highlightColour} from "../../config";

export function FeatureLink(id, fromFeatPos, toFeatPos, app) {
    this.init(id, fromFeatPos, toFeatPos, app);
}

FeatureLink.prototype = new Link();

FeatureLink.prototype.init = function (id, fromFeatPos, toFeatPos, app) {
    this.id = id;
    this.app = app;
    this.fromSequenceData = fromFeatPos;
    this.toSequenceData = toFeatPos;

    this.participants = [this.fromSequenceData[0].participant, this.toSequenceData[0].participant]; //*
    // *potentially, this over simplifies the situation,
    // but there is a workaround in way ReadMiJson init's links so OK for now

    this.glyph = document.createElementNS(svgns, "path");
    this.uncertainGlyph = document.createElementNS(svgns, "path");
    // this.highlightGlyph = document.createElementNS(svgns, "path");
    this.glyph.setAttribute("stroke-linecap", "round");
    this.uncertainGlyph.setAttribute("stroke-linecap", "round");
    // this.highlightGlyph.setAttribute("stroke-linecap", "round");
    this.glyph.setAttribute("class", "link");
    this.glyph.setAttribute("fill", "black");//"#E08214");
    this.glyph.setAttribute("opacity", "0.6");
    this.glyph.setAttribute("stroke", "black");//""#A08214");// // TODO: will look better with this line partly removed
    this.glyph.setAttribute("stroke-opacity", "0.6");
    this.glyph.setAttribute("stroke-width", "1");
    this.uncertainGlyph.setAttribute("class", "link");
    this.uncertainGlyph.setAttribute("fill", "black");//url('#checkers_uncertain')");//"#A01284");
    this.uncertainGlyph.setAttribute("stroke", "black");//"none");//"#A01284");
    this.uncertainGlyph.setAttribute("stroke-opacity", "0.2");
    this.uncertainGlyph.setAttribute("fill-opacity", "0.2");
    // this.highlightGlyph.setAttribute("class", "link");
    // this.highlightGlyph.setAttribute("fill", "none");
    // this.highlightGlyph.setAttribute("stroke", highlightColour);
    // this.highlightGlyph.setAttribute("stroke-width", "10");
    // this.highlightGlyph.setAttribute("stroke-opacity", "0");

    //set the events for it
    const self = this;
    this.uncertainGlyph.onmousedown = function (evt) {
        self.mouseDown(evt);
    };
    this.uncertainGlyph.onmouseover = function (evt) {
        self.mouseOver(evt);
    };
    this.uncertainGlyph.onmouseout = function (evt) {
        self.mouseOut(evt);
    };
    this.glyph.onmousedown = function (evt) {
        self.mouseDown(evt);
    };
    this.glyph.onmouseover = function (evt) {
        self.mouseOver(evt);
    };
    this.glyph.onmouseout = function (evt) {
        self.mouseOut(evt);
    };
    // this.highlightGlyph.onmousedown = function (evt) {
    //     self.mouseDown(evt);
    // };
    // this.highlightGlyph.onmouseover = function (evt) {
    //     self.mouseOver(evt);
    // };
    // this.highlightGlyph.onmouseout = function (evt) {
    //     self.mouseOut(evt);
    // };
};

//andAlternatives means highlight alternative links in case of site ambiguity
// FeatureLink.prototype.showHighlight = function (show) {
//     if (show) {
//         this.highlightGlyph.setAttribute("stroke-opacity", "1");
//     } else {
//         this.highlightGlyph.setAttribute("stroke-opacity", "0");
//     }
// };

//used when filter changed
FeatureLink.prototype.check = function () {
    if (this.anyParticipantIsBar() === true) {
        this.show();
        return true;
    } else {
        this.hide();
        return false;
    }
};

FeatureLink.prototype.anyParticipantIsBar = function () {
    const ic = this.participants.length;
    for (let i = 0; i < ic; i++) {
        if (this.participants[i].form === 1) {
            return true;
        }
    }
    return false;
};

FeatureLink.prototype.show = function () {
    // //this.glyph.setAttribute("stroke-width", this.util.z * xiNET.linkWidth);
    // this.uncertainGlyph.setAttribute("stroke-width", this.util.z * 10);
    // this.highlightGlyph.setAttribute("stroke-width", this.util.z * 10);
    this.setLinkCoordinates();
    let containingGroup = this.app.res_resLinks;
    if (this.participants[0] === this.participants[1]) {
        containingGroup = this.app.selfRes_resLinks;
    }
    // containingGroup.appendChild(this.highlightGlyph);
    containingGroup.appendChild(this.glyph);
    containingGroup.appendChild(this.uncertainGlyph);
};

FeatureLink.prototype.hide = function () {
    // let containingGroup = this.app.res_resLinks;
    // if (this.participants[0] === this.participants[1]) {
    //     containingGroup = this.app.selfRes_resLinks;
    // }
    //
    // const groupChildren = [];
    //
    // for (let i = 0; i < containingGroup.childNodes.length; i++) {
    //     groupChildren[i] = containingGroup.childNodes[i];
    // }
    //
    // if (groupChildren.indexOf(this.glyph) > -1) {
    //     containingGroup.removeChild(this.glyph);
    //     containingGroup.removeChild(this.uncertainGlyph);
    //     // containingGroup.removeChild(this.highlightGlyph);
    // }
    this.glyph.remove();
    this.uncertainGlyph.remove();
};

// update the links(polygons/lines) to fit to the protein
FeatureLink.prototype.setLinkCoordinates = function () {
    function isNumber(thing) {
        return (!isNaN(parseFloat(thing)) && isFinite(thing));
    }

    function getPathSegments(midPoint, controlPoint, startRes, endRes, participant, yOffset) {
        let startPoint, endPoint;
        if (!participant.form) { // tests if form = undefined or 0 //TODO: maybe change this, its confusing
            startPoint = participant.getPosition();
            endPoint = startPoint;
        } else {
            startPoint = participant.getResidueCoordinates(startRes, yOffset);
            endPoint = participant.getResidueCoordinates(endRes, yOffset);

        }
        return " Q" + controlPoint[0] + "," + controlPoint[1] + " " + startPoint[0] + "," + startPoint[1] +
            " L" + endPoint[0] + "," + endPoint[1] +
            " Q" + controlPoint[0] + "," + controlPoint[1] + " " + midPoint[0] + "," + midPoint[1];
    }

    function sequenceDataMidPoint(sequenceData, participant) {
        //get the smallest start and the biggest end
        let lowestLinkedRes = null,
            highestLinkedRes = null;
        const sdCount = sequenceData.length;
        for (let s = 0; s < sdCount; s++) {
            const seqDatum = sequenceData[s];
            if (!isNaN(parseFloat(seqDatum.begin)) && isFinite(seqDatum.begin)) {
                // noinspection PointlessArithmeticExpressionJS
                const start = seqDatum.begin * 1; // the * 1 is necessary (type conversion)
                if (lowestLinkedRes === null || start < lowestLinkedRes) {
                    lowestLinkedRes = start;
                }
            }
            if (!isNaN(parseFloat(seqDatum.uncertainBegin)) && isFinite(seqDatum.uncertainBegin)) {
                const uncertainBegin = seqDatum.uncertainBegin * 1;
                if (lowestLinkedRes === null || uncertainBegin < lowestLinkedRes) {
                    lowestLinkedRes = uncertainBegin;
                }
            }
            if (!isNaN(parseFloat(seqDatum.end)) && isFinite(seqDatum.end)) {
                const end = seqDatum.end * 1;
                if (highestLinkedRes === null || end > highestLinkedRes) {
                    highestLinkedRes = end;
                }
            }
            if (!isNaN(parseFloat(seqDatum.uncertainEnd)) && isFinite(seqDatum.uncertainEnd)) {
                const uncertainEnd = seqDatum.uncertainEnd * 1;
                if (highestLinkedRes === null || uncertainEnd > highestLinkedRes) {
                    highestLinkedRes = uncertainEnd;
                }
            }
        }
        return participant.getResidueCoordinates((lowestLinkedRes + highestLinkedRes) / 2, 0);
    }

    const fromParticipant = this.fromSequenceData[0].participant;
    const toParticipant = this.toSequenceData[0].participant;
    //calculate mid points of from and to sequence data
    let fMid, tMid;
    if (!fromParticipant.form) { // if not (undefined or 0)
        fMid = fromParticipant.getPosition();
    } else {
        fMid = sequenceDataMidPoint(this.fromSequenceData, fromParticipant);
    }
    if (!toParticipant.form) {// if not (undefined or 0)
        tMid = toParticipant.getPosition();
    } else {
        tMid = sequenceDataMidPoint(this.toSequenceData, toParticipant);
    }

    //calculate angle from fromParticipant mid point to toParticipant mid point
    const deltaX = fMid[0] - tMid[0];
    const deltaY = fMid[1] - tMid[1];
    const angleBetweenMidPoints = Math.atan2(deltaY, deltaX);
    //todo: tidy up trig code so everything is always in radian
    let abmpDeg = angleBetweenMidPoints / (2 * Math.PI) * 360;
    if (abmpDeg < 0) {
        abmpDeg += 360;
    }

    //out is value we use to decide which side of bar the link glyph is drawn
    //first for 'from' participant
    let out = (abmpDeg - fromParticipant.rotation);
    if (out < 0) {
        out += 360;
    }
    let fyOffset = 10;
    if (out < 180) {
        fyOffset = -10;
    }
    let fRotRad = (fromParticipant.rotation / 360) * Math.PI * 2;
    if (out > 180) {
        fRotRad -= Math.PI;
    }
    //now for 'to' participant
    out = (abmpDeg - toParticipant.rotation);
    if (out < 0) {
        out += 360;
    }
    let tyOffset = 10;
    if (out > 180) {
        tyOffset = -10;
    }
    let tRotRad = (toParticipant.rotation / 360) * Math.PI * 2;
    if (out < 180) {
        tRotRad -= Math.PI;
    }

    let ftMid = [fMid[0] + (30 * Math.sin(fRotRad) * this.app.z),
        fMid[1] - (30 * Math.cos(fRotRad) * this.app.z)
    ];
    if (!fromParticipant.form) { // if not (undefined or 0)
        ftMid = fMid;
    }

    let ttMid = [tMid[0] + (30 * Math.sin(tRotRad) * this.app.z),
        tMid[1] - (30 * Math.cos(tRotRad) * this.app.z)
    ];
    if (!toParticipant.form) { // if not (undefined or 0)
        ttMid = tMid;
    }

    const triPointMid = [(ftMid[0] + ttMid[0]) / 2, (ftMid[1] + ttMid[1]) / 2];
    const fSDCount = this.fromSequenceData.length;
    const tSDCount = this.toSequenceData.length;
    let seqDatum;//, highlightStartRes, highlightEndRes;
    let glyphPath = "M" + triPointMid[0] + "," + triPointMid[1];
    let uncertainGlyphPath = "M" + triPointMid[0] + "," + triPointMid[1];
    // let highlightGlyphPath = "M" + triPointMid[0] + "," + triPointMid[1];
    for (let f = 0; f < fSDCount; f++) {
        seqDatum = this.fromSequenceData[f];
        if (isNumber(seqDatum.begin)  && isNumber(seqDatum.end)) {
            glyphPath += getPathSegments(triPointMid, ftMid, seqDatum.begin, seqDatum.end, fromParticipant, fyOffset);
        }
        // highlightStartRes = seqDatum.begin;
        // highlightEndRes = seqDatum.end;
        if (isNumber(seqDatum.uncertainBegin)) {
            uncertainGlyphPath += getPathSegments(triPointMid, ftMid,
                seqDatum.uncertainBegin, seqDatum.begin, fromParticipant, fyOffset);
            // highlightStartRes = seqDatum.uncertainBegin;
        }
        if (isNumber(seqDatum.uncertainEnd)) {
            uncertainGlyphPath += getPathSegments(triPointMid, ftMid,
                seqDatum.end, seqDatum.uncertainEnd, fromParticipant, fyOffset);
            // highlightEndRes = seqDatum.uncertainEnd;
        }
        // highlightGlyphPath += getPathSegments(triPointMid, ftMid,
        //     highlightStartRes, highlightEndRes, fromParticipant, fyOffset);
    }
    for (let t = 0; t < tSDCount; t++) {
        seqDatum = this.toSequenceData[t];
        if (isNumber(seqDatum.begin) && isNumber(seqDatum.end)) {
            glyphPath += getPathSegments(triPointMid, ttMid, seqDatum.begin, seqDatum.end, toParticipant, tyOffset);
        }
        // highlightStartRes = seqDatum.begin;
        // highlightEndRes = seqDatum.end;
        if (isNumber(seqDatum.uncertainBegin)) {
            uncertainGlyphPath += getPathSegments(triPointMid, ttMid,
                seqDatum.uncertainBegin, seqDatum.begin, toParticipant, tyOffset);
            // highlightStartRes = seqDatum.uncertainBegin;
        }
        if (isNumber(seqDatum.uncertainEnd)) {
            uncertainGlyphPath += getPathSegments(triPointMid, ttMid,
                seqDatum.end, seqDatum.uncertainEnd, toParticipant, tyOffset);
            // highlightEndRes = seqDatum.uncertainEnd;
        }
        // highlightGlyphPath += getPathSegments(triPointMid, ttMid,
        //     highlightStartRes, highlightEndRes, toParticipant, tyOffset);
    }

    if (!this.glyph) {
        this.initSVG();
    }

    this.glyph.setAttribute("d", glyphPath);
    this.uncertainGlyph.setAttribute("d", uncertainGlyphPath);
    // this.highlightGlyph.setAttribute("d", highlightGlyphPath);
};

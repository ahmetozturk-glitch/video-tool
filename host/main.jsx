function aett_getContext() {
    var comp = app.project && app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        return "{" + '"comp":"No active comp","layer":"No layer selected"' + "}";
    }

    var layerName = "No layer selected";
    if (comp.selectedLayers && comp.selectedLayers.length > 0) {
        layerName = comp.selectedLayers[0].name + " (" + comp.selectedLayers[0].matchName + ")";
    }

    return "{" + '"comp":"' + comp.name + '","layer":"' + layerName + '"' + "}";
}

function aett_applyTextPreset(presetName) {
    app.beginUndoGroup("AE Team Tool - Text Preset");
    try {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            return "Hata: aktif comp yok.";
        }
        if (!comp.selectedLayers || comp.selectedLayers.length === 0) {
            return "Hata: layer secili degil.";
        }

        var layer = comp.selectedLayers[0];
        var inPoint = comp.time;
        var outPoint = inPoint + 0.6;

        var scale = layer.property("ADBE Transform Group").property("ADBE Scale");
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");

        scale.setValueAtTime(inPoint, [80, 80]);
        scale.setValueAtTime(outPoint, [100, 100]);
        opacity.setValueAtTime(inPoint, 0);
        opacity.setValueAtTime(outPoint, 100);

        return "Uygulandi: " + presetName;
    } catch (e) {
        return "Hata: " + e.toString();
    } finally {
        app.endUndoGroup();
    }
}

function aett_applyAssetAnimation(styleName, duration, autoAnchor, autoFit) {
    app.beginUndoGroup("AE Team Tool - Asset Animation");
    try {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            return "Hata: aktif comp yok.";
        }
        if (!comp.selectedLayers || comp.selectedLayers.length === 0) {
            return "Hata: layer secili degil.";
        }

        var layer = comp.selectedLayers[0];
        var inPoint = comp.time;
        var outPoint = inPoint + Number(duration || 0.6);

        var pos = layer.property("ADBE Transform Group").property("ADBE Position");
        var scale = layer.property("ADBE Transform Group").property("ADBE Scale");
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");

        if (styleName === "Fade + Slide") {
            var p = pos.value;
            pos.setValueAtTime(inPoint, [p[0], p[1] + 80]);
            pos.setValueAtTime(outPoint, [p[0], p[1]]);
            opacity.setValueAtTime(inPoint, 0);
            opacity.setValueAtTime(outPoint, 100);
        } else if (styleName === "Scale In") {
            scale.setValueAtTime(inPoint, [60, 60]);
            scale.setValueAtTime(outPoint, [100, 100]);
            opacity.setValueAtTime(inPoint, 0);
            opacity.setValueAtTime(outPoint, 100);
        } else {
            scale.setValueAtTime(inPoint, [85, 85]);
            scale.setValueAtTime(outPoint, [100, 100]);
        }

        if (autoAnchor) {
            layer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([layer.width / 2, layer.height / 2]);
        }

        return "Asset animasyonu uygulandi. AutoFit=" + autoFit;
    } catch (e) {
        return "Hata: " + e.toString();
    } finally {
        app.endUndoGroup();
    }
}

function aett_generateLegalCrawl(rawText, direction, speedPx) {
    app.beginUndoGroup("AE Team Tool - Legal Crawl");
    try {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            return "Hata: aktif comp yok.";
        }

        var legalText = rawText.replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\t/g, " ");
        var textLayer = comp.layers.addText(legalText);
        textLayer.name = "LEGAL_CRAWL";

        var textDoc = textLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
        textDoc.fontSize = 34;
        textDoc.fillColor = [1, 1, 1];
        textLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(textDoc);

        var pos = textLayer.property("ADBE Transform Group").property("ADBE Position");
        var t0 = comp.time;
        var t1 = t0 + 8;

        var y = comp.height - 40;
        var xStart = direction === "rtl" ? comp.width + 400 : -400;
        var xEnd = direction === "rtl" ? -400 : comp.width + 400;

        pos.setValueAtTime(t0, [xStart, y]);
        pos.setValueAtTime(t1, [xEnd, y]);

        return "Legal olusturuldu. Hiz=" + speedPx + " px/sn";
    } catch (e) {
        return "Hata: " + e.toString();
    } finally {
        app.endUndoGroup();
    }
}

function aett_queueRender(profileName, namingTemplate) {
    try {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            return "Hata: aktif comp yok.";
        }
        app.project.renderQueue.items.add(comp);
        return "Render queue'ya eklendi: " + profileName + " | " + namingTemplate;
    } catch (e) {
        return "Hata: " + e.toString();
    }
}

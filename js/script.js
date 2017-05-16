window.onload = function() {
    var selectYear = d3.select('#yearSelection');
    if (selectYear.addEventListener) {
        selectYear.addEventListener("onchange", yearChanged, false);
    } else if(selectYear.attachEvent) {
        selectYear.attachEvent("onchange", yearChanged);
    } else {
        selectYear.onchange = yearChanged;
    }
}
var yearChanged = function() {
    alert("ayy");
    yearValue = this.value;
    drawStructure();
}

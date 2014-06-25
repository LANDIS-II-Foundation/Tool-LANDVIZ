
;(function($) {
    $.landisCharts = function() { 
        this.set = function() {
            this.init = true;

            this.charts = [];
            return this;
        };

        this.checkChartCandidates = function(chartCandidates){
            //Compare current Charts with chartCandidates
            //if Candidate is part of currentCharts > do nothing
            //if Candidate is not part of currentCharts > add it
            //Check left overs > currentCharts not a candidate > delete chart
           
            var i, seen, chartsToDelete = [];
            for(c in this.charts) {
                seen = -1;
                for (cc in chartCandidates) {
                    if(chartCandidates[cc].extension == this.charts[c].extension && 
                       chartCandidates[cc].output == this.charts[c].output &&
                       chartCandidates[cc].field == this.charts[c].field){
                        seen = cc;
                        break;
                    }
                }

                if(seen === -1){
                    chartsToDelete.push(c);
                }
            }
            //console.log('currentcharts:', this.charts);
            chartsToDelete.sort();
            chartsToDelete.reverse(); 
            //console.log('chartsToDelete:', chartsToDelete);

            for(chart in chartsToDelete){
                //console.log(chartsToDelete[chart]);
                this.charts[chartsToDelete[chart]].chartVis.chart('destroy');
                this.charts.splice(chartsToDelete[chart],1);
            }


            for(c in chartCandidates) {
                //check if chartCandidate is in charts
                seen = -1;
                for (i = 0; i < this.charts.length; i++){
                    if(chartCandidates[c].extension == this.charts[i].extension && 
                       chartCandidates[c].output == this.charts[i].output &&
                       chartCandidates[c].field == this.charts[i].field){
                        seen = i;
                        break;
                    }
                }
               // console.log(seen);
                if(seen > -1){
                    //update updateChartData
                    this.charts[seen].chartVis.chart('updateChartData', chartCandidates[c].scenarios);
                } else {
                    //create Chart Flot instance 
                    this.charts.push(chartCandidates[c]);

                    this.charts[this.charts.length-1].chartVis = $('<div>').chart({
                         chartId: this.charts[this.charts.length-1].extension+'-'+this.charts[this.charts.length-1].output+'-'+this.charts[this.charts.length-1].field,
                         extensionName: landisMetadata.getExtensionAttributeById(this.charts[this.charts.length-1].extension, 'extensionName'),
                         outputName: landisMetadata.getOutputAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, 'outputName'),
                         fieldName: landisMetadata.getFieldAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, this.charts[this.charts.length-1].field, 'name'),
                         fieldDescription: landisMetadata.getFieldAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, this.charts[this.charts.length-1].field, 'description'),
                         extensionId: landisMetadata.getExtensionAttributeById(this.charts[this.charts.length-1].extension, 'extensionId'),
                         outputId: landisMetadata.getOutputAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, 'outputId'),
                         unit: landisMetadata.getFieldAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, this.charts[this.charts.length-1].field, 'unit'),
                         scenarios: this.charts[this.charts.length-1].scenarios,
                         minX: $('#TimeControl').timeControl('option','timeMin'),
                         maxX: $('#TimeControl').timeControl('option','timeMax'),
                         hiddenUIContainer: '#HiddenUIContainer'
                    }).appendTo('#ChartContainer');

                    arrangeApplicationData();
                    this.charts[this.charts.length-1].chartVis.chart('loadData');
                }

            }
            arrangeApplicationData();
        };

        this.addChartGroup = function(map) {
            
        };

        this.updateTime = function(){
            var i;
            for (i = 0; i < this.charts.length; i++){
                this.charts[i].chartVis.chart('updateTime');
            }
        };
        
        this.addChart = function(map) {
            
        };
        
        if(this.init) {
            return new $.landisCharts();
        } else {
            this.set();
            return this;
        }
    };
})(jQuery);
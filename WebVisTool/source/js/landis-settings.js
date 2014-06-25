
;(function($) {
    $.landisSettings = function() { 
        this.set = function() {
            this.init = true;

            var settingId;
            if(!((settingId = getUrlParameter('s')) && (this.settings = loadJson('config/' + settingId + '.json')))) {
                this.settings = loadJson('config/default_settings.json');
                if(!this.settings) {
                    alert("bad settings file");
                }
            }

            /* EXPERIMENTAL
            $('#exportSettingsLink')
                .attr('download', "export.json")
                .attr('href', '#')
                .attr('textContent', "Download export.json")
                .click(function(){
                    var data = {a:1, b:2, c:3};
                    var json = JSON.stringify(data);
                    var blob = new Blob([json], {type: "application/json"});
                    var url  = URL.createObjectURL(blob);
                    $(this).attr('href', url);
            });*/

            return this;
        };

        this.setProjectName = function() {
            if(this.settings.hasOwnProperty('projectname')) {
                $('#ProjectName > h1').text(this.settings.projectname);
            }
        };
        
        if(this.init) {
            return new $.landisSettings();
        } else {
            this.set();
            return this;
        }


    };
})(jQuery);
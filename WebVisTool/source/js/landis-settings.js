
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
            return this;
        };

        this.setProjectName = function() {
            if(this.settings.hasOwnProperty('projectname')) {
                $('#ProjectName > h1').text(this.settings.projectname);
            }
        };
        /*
        this.writeCurrentStateToJson = function() {
            var uploadPath = location.href.substring(0, location.href.lastIndexOf('/')) + "/config/export.json";
            $.ajax({
                type: "PUT",
                url: uploadPath,
                dataType: 'json',
                async: false,
                data: JSON.stringify({ "value": 45 })
            });
        };*/
        
        if(this.init) {
            return new $.landisSettings();
        } else {
            this.set();
            return this;
        }


    };
})(jQuery);
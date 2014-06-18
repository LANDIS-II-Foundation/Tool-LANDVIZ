
;(function($) {
    $.landisMetadata = function() { 
        this.set = function() {
            this.init = true;

            //FIXME ... Not Hardcoded but FromConfigFile
            // load landis-model-data/metadata/metadata.scenarios.json
            var path = landisSettings.settings.landisdata.path + "/" + landisSettings.settings.landisdata.metadata;
            this.scenarios = loadJson(path + "/metadata.scenarios.json");
            // load landis-model-data/metadata/metadata.extensions.json
            this.extensions = loadJson(path + "/metadata.extensions.json");
            //console.log(this.extensions);
            return this;
        };
        this.publishScenarios = function(scenarioAttributes) {
            var publish = {};
            if(scenarioAttributes){
                for(scenario in this.scenarios.scenarios) {
                    publish[scenario] = {};
                    for(attr in scenarioAttributes){
                        if(this.scenarios.scenarios[scenario][scenarioAttributes[attr]]){
                            publish[scenario][scenarioAttributes[attr]] = this.scenarios.scenarios[scenario][scenarioAttributes[attr]];
                        }
                    } 
                }
                return publish;
            } else {
                return this.scenarios.scenarios;
            }
        };
        this.getScenarioAttributeById = function(id, scenarioAttribute){
            return this.scenarios.scenarios[id][scenarioAttribute];
        };

        this.getExtensionAttributeById = function(id, extensionAttribute){
            return this.extensions[id][extensionAttribute];
        }

        this.getExtensionAttributesById = function(id){
            //var publish = {};
            console.log(this.extensions[id]);
            //return publish
        }

        this.getOutputAttributeById = function(eId, oId, outputAttribute){
            return this.extensions[eId].outputs[oId][outputAttribute];
        }

        this.getFieldAttributeById = function(eId, oId, fId, outputAttribute){
            return this.extensions[eId].outputs[oId].fields[fId][outputAttribute];
        }

        this.publishExtensions = function() {
            console.log(this.extensions);
            return this;
        };
        this.publishMapOutputs = function() { //FIXME: publish by attributes
            var extension, publish = {};
            for(extension in this.extensions) {
                //console.log(extension ,this.extensions[extension]);
                publish[extension] = {};
                publish[extension].extensionId = this.extensions[extension].extensionId;
                publish[extension].extensionName = this.extensions[extension].extensionName;
                publish[extension].outputs = {};
                 for(output in this.extensions[extension].outputs) {
                    if((this.extensions[extension].outputs[output].outputType).toLowerCase() === "map") {
                        publish[extension].outputs[output] = {}
                        publish[extension].outputs[output].outputId = this.extensions[extension].outputs[output].outputId;
                        publish[extension].outputs[output].outputName = this.extensions[extension].outputs[output].outputName;
                        //publish[extension].outputs[output].scenarioIdExceptions = this.extensions[extension].outputs[output].scenarioIdExceptions;

                    }
                    
                 }
                 if($.isEmptyObject(publish[extension].outputs)){
                    delete publish[extension];
                }
            }
            //console.log(publish);
            return publish;
        };
        this.publishTableOutputs = function() { //FIXME: publish by attributes
            var extension, publish = {};
            for(extension in this.extensions) {
                //console.log(extension ,this.extensions[extension]);
                publish[extension] = {};
                publish[extension].extensionId = this.extensions[extension].extensionId;
                publish[extension].extensionName = this.extensions[extension].extensionName;
                publish[extension].outputs = {};
                 for(output in this.extensions[extension].outputs) {
                    if((this.extensions[extension].outputs[output].outputType).toLowerCase() === "table") {
                        publish[extension].outputs[output] = {}
                        publish[extension].outputs[output].outputId = this.extensions[extension].outputs[output].outputId;
                        publish[extension].outputs[output].outputName = this.extensions[extension].outputs[output].outputName;
                        publish[extension].outputs[output].fields = this.extensions[extension].outputs[output].fields;

                    }
                 }
                if($.isEmptyObject(publish[extension].outputs)){
                    delete publish[extension];
                }
            }
            //console.log(publish);
            return publish;
        };
        
        if(this.init) {
            return new $.landisMetadata();
        } else {
            this.set();
            return this;
        }
    };
})(jQuery);
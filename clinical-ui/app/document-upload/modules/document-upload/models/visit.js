Bahmni.Opd.DocumentUpload.Visit = function () {

    var DocumentImage = Bahmni.Opd.DocumentUpload.DocumentImage;
    this.startDatetime = "";
    this.stopDatetime = "";
    this.visitType = null;
    this.changed = false;
    this.savedImages = [];
    this.images = [];
    this.encounters = [];
    var androidDateFormat = "yyyy-mm-dd";

    this._sortSavedImages = function(savedImages) {
        savedImages.sort(function(image1, image2){
            return image1.id - image2.id
        });
        return savedImages;
    };

    this.initSavedImages = function (encounterTypeUuid) {
        this.savedImages = [];
        this.images = [];

        var savedImages = this.savedImages;

        this.encounters.forEach(function (encounter) {
            encounter.encounterType.uuid == encounterTypeUuid && encounter.obs && encounter.obs.forEach(function (observation) {
                observation.groupMembers && observation.groupMembers.forEach(function (member) {
                    if (member.concept.name.name == 'Document') {
                        var conceptName = observation.concept.name.name;
                        savedImages.push(new DocumentImage({"id": observation.id, "encodedValue": member.value, "obsUuid": observation.uuid, concept: {uuid: observation.concept.uuid, editableName: conceptName, name: conceptName}}));
                    }
                });
            });
        });

        this.savedImages = this._sortSavedImages(savedImages);
    };

    this.isNew = function () {
        return this.uuid == null;
    };

    this.startDate = function () {
        if(!this.isNew()) return moment(this.startDatetime).toDate();
        return this.parseDate(this.startDatetime);
    };
    
    this.endDate = function () {
        var endDateTime = this.stopDatetime ? this.parseDate(this.stopDatetime) : this.startDate();
        endDateTime.setHours(23,59,59,000);
        return endDateTime;
    };

    this.parseDate = function (date) {
        if(date instanceof Date) return date;
        var dateFormat = (date && date.indexOf('-') !== -1) ? androidDateFormat : Bahmni.Common.Constants.dateFormat;
        return  moment(date, dateFormat.toUpperCase()).toDate();
    };

    this.addImage = function (image) {
        var savedImage = null;
        var alreadyPresent = this.images.filter(function (img) {
            return img.encodedValue === image;
        });
        if (alreadyPresent.length == 0) {
            savedImage = new DocumentImage({"encodedValue": image, "new": true});
            this.images.push(savedImage);
        }
        this.markAsUpdated();
        return savedImage;
    };

    this.markAsUpdated = function () {
        var savedImagesChanged = this.savedImages.some(function(image) { return image.changed; });
        this.changed = savedImagesChanged || (this.images && this.images.length > 0);
    };

    this.removeNewAddedImage = function (image) {
        var i = this.images.indexOf(image);
        this.images.splice(i, 1);
        this.markAsUpdated();
    };

    this.toggleVoidingOfImage = function (image) {
        image.voided = !image.voided;
        image.changed = true;
        this.markAsUpdated();
    };
};
